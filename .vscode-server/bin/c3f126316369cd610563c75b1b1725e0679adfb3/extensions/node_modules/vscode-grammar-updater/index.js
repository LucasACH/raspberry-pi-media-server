/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

var path = require('path');
var fs = require('fs');
var plist = require('fast-plist');
var cson = require('cson-parser');
var https = require('https');
var url = require('url');

let commitDate = '0000-00-00';

/**
 * @param {string} urlString
 */
function getOptions(urlString) {
	var _url = url.parse(urlString);
	var headers = {
		'User-Agent': 'VSCode'
	};
	var token = process.env['GITHUB_TOKEN'];
	if (token) {
		headers['Authorization'] = 'token ' + token;
	}
	return {
		protocol: _url.protocol,
		host: _url.host,
		port: _url.port,
		path: _url.path,
		headers: headers
	};
}

/**
 * @param {string} url
 * @param {number} redirectCount
 */
function download(url, redirectCount) {
	return new Promise((c, e) => {
		var content = '';
		https.get(getOptions(url), function (response) {
			response.setEncoding('utf8');
			response.on('data', function (data) {
				content += data;
			}).on('end', function () {
				if (response.statusCode === 403 && response.headers['x-ratelimit-remaining'] === '0') {
					e('GitHub API rate exceeded. Set GITHUB_TOKEN environment variable to increase rate limit.');
					return;
				}
				let count = redirectCount || 0;
				if (count < 5 && response.statusCode >= 300 && response.statusCode <= 303 || response.statusCode === 307) {
					let location = response.headers['location'];
					if (location) {
						console.log("Redirected " + url + " to " + location);
						download(location, count + 1).then(c, e);
						return;
					}
				}
				c(content);
			});
		}).on('error', function (err) {
			e(err.message);
		});
	});
}

function getCommitSha(repoId, repoPath) {
	var commitInfo = 'https://api.github.com/repos/' + repoId + '/commits?path=' + repoPath;
	return download(commitInfo).then(function (content) {
		try {
			let lastCommit = JSON.parse(content)[0];
			return Promise.resolve({
				commitSha: lastCommit.sha,
				commitDate: lastCommit.commit.author.date
			});
		} catch (e) {
			return Promise.reject(new Error("Failed extracting the SHA: " + content));
		}
	});
}

exports.update = function (repoId, repoPath, dest, modifyGrammar, version = 'master', packageJsonPathOverride = '') {
	var contentPath = 'https://raw.githubusercontent.com/' + repoId + `/${version}/` + repoPath;
	console.log('Reading from ' + contentPath);
	return download(contentPath).then(function (content) {
		var ext = path.extname(repoPath);
		var grammar;
		if (ext === '.tmLanguage' || ext === '.plist') {
			grammar = plist.parse(content);
		} else if (ext === '.cson') {
			grammar = cson.parse(content);
		} else if (ext === '.json' || ext === '.JSON-tmLanguage') {
			grammar = JSON.parse(content);
		} else {
			return Promise.reject(new Error('Unknown file extension: ' + ext));
		}
		if (modifyGrammar) {
			modifyGrammar(grammar);
		}
		return getCommitSha(repoId, repoPath).then(function (info) {
			let result = {
				information_for_contributors: [
					'This file has been converted from https://github.com/' + repoId + '/blob/master/' + repoPath,
					'If you want to provide a fix or improvement, please create a pull request against the original repository.',
					'Once accepted there, we are happy to receive an update request.'
				]
			};

			if (info) {
				result.version = 'https://github.com/' + repoId + '/commit/' + info.commitSha;
			}

			let keys = ['name', 'scopeName', 'comment', 'injections', 'patterns', 'repository'];
			for (let key of keys) {
				if (grammar.hasOwnProperty(key)) {
					result[key] = grammar[key];
				}
			}

			try {
				const eol = getEOLFromPath(dest);
				fs.writeFileSync(dest, JSON.stringify(result, null, '\t').replace(/\n/g, eol));
				let cgmanifestContent = fs.readFileSync('./cgmanifest.json').toString();
				let cgmanifestRead = JSON.parse(cgmanifestContent);
				let promises = new Array();
				const currentCommitDate = info.commitDate.substr(0, 10);

				// Add commit sha to cgmanifest.
				if (currentCommitDate > commitDate) {
					let packageJsonPath = 'https://raw.githubusercontent.com/' + repoId + `/${info.commitSha}/`;
					if (packageJsonPathOverride) {
						packageJsonPath += packageJsonPathOverride;
					}
					packageJsonPath += 'package.json';
					for (let i = 0; i < cgmanifestRead.registrations.length; i++) {
						if (cgmanifestRead.registrations[i].component.git.repositoryUrl.substr(cgmanifestRead.registrations[i].component.git.repositoryUrl.length - repoId.length, repoId.length) === repoId) {
							cgmanifestRead.registrations[i].component.git.commitHash = info.commitSha;
							commitDate = currentCommitDate;
							promises.push(download(packageJsonPath).then(function (packageJson) {
								if (packageJson) {
									try {
										cgmanifestRead.registrations[i].version = JSON.parse(packageJson).version;
									} catch (e) {
										console.log('Cannot get version. File does not exist at ' + packageJsonPath);
									}
								}
							}));
							break;
						}
					}
				}

				Promise.all(promises).then(function (allResult) {
					const eol = getExistingEOL(cgmanifestContent);
					fs.writeFileSync('./cgmanifest.json', JSON.stringify(cgmanifestRead, null, '\t').replace(/\n/g, eol));
				});
				if (info) {
					console.log('Updated ' + path.basename(dest) + ' to ' + repoId + '@' + info.commitSha.substr(0, 7) + ' (' + currentCommitDate + ')');
				} else {
					console.log('Updated ' + path.basename(dest));
				}
			} catch (e) {
				return Promise.reject(e);
			}
		});

	}, console.error).catch(e => {
		console.error(e);
		process.exit(1);
	});
};

const CharCode_LF = 10;
const CharCode_CR = 13;

const DEFAULT_EOL = '\r\n';

function getExistingEOL(content) {
	for (let i = 0; i < content.length; i++) {
		const ch = content.charCodeAt(i);
		if (ch === CharCode_CR) {
			if (i + 1 < content.length && content.charCodeAt(i + 1) == CharCode_LF) {
				return '\r\n';
			}
			return '\r';
		} else if (ch === CharCode_LF) {
			return '\n';
		}
	}
	return DEFAULT_EOL;
}

function getEOLFromPath(dest) {
	try {
		return getExistingEOL(fs.readFileSync(dest).toString());
	} catch (e) {
		return DEFAULT_EOL;
	}
}