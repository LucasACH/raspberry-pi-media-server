#!/usr/bin/env node

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const grammarUpdater = require('./');

if (process.argv.length <= 2) {
    console.log('Usage: vscode-grammar-updater repoName (repoPath destinationPath)+');
    return;
}
for (var i = 3; i < process.argv.length; i += 2) {
    grammarUpdater.update(process.argv[2], process.argv[i], process.argv[i + 1]);
}
