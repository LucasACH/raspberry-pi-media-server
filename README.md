<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

<br />
<p align="center">
  <a href="https://github.com/LucasACH">
    <img src="https://avatars3.githubusercontent.com/u/73149577?s=460&u=1baa1defb9904624d7aad76ec37dc76d2b230c0a&v=4" alt="Logo" width="100" height="100">
  </a>

  <h3 align="center">Raspberry Pi</h3>

  <p align="center">
    Raspberry Pi home server project.
    <br />
    <a href="https://github.com/LucasACH/raspberry-pi"><strong>Explore the docs »</strong></a>
  </p>
</p>

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### Table of Contents
- [Getting started](#getting-started)
  - [Hardware](#hardware)
  - [Software](#software)
  - [Installing the OS](#installing-the-os)
  - [Connecting to the Raspberry Pi](#connecting-to-the-raspberry-pi)
  - [Raspbian setup](#raspbian-setup)
- [Docker engine](#docker-engine)
  - [Install using the convenience script](#install-using-the-convenience-script)
  - [Install Compose](#install-compose)
  - [Manage Docker as a non-root user](#manage-docker-as-a-non-root-user)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Getting started
The main reason of this project is to create a Raspberry Pi 4 multi purpose home server, with the least setup possible. Everything is containerized using Docker and written into multiple docker-compose files for easy building. The project is separated into three stages. Raspberry setup, Docker installation and services deployment.

## Hardware

For this project I used a [Raspberry Pi 4](https://www.raspberrypi.org/products/raspberry-pi-4-model-b/) with 4Gb of memory and a 64Gb MicroSD card for external storage. I also bought an [aluminium case](https://www.argon40.com/argon-neo-raspberry-pi-4-case.html) with dedicated passive heatsinks for preventing overheats. In terms of connectivity I used a wired connection (Ethernet) to the Pi´s, but you can use a USB Wi-Fi adapter if you don't have access to one.

## Software

The main idea of this project was to create a home server. That is why I used the Raspberry Pi OS Lite image, which is lightweight and has no GUI. I used [SSH](https://en.wikipedia.org/wiki/Secure_Shell_Protocol) to access my Pi through my desktop computer.

## Installing the OS

This step consists of getting the OS image flashed into your SD card. I personally like to use a tool called balenaEtcher, which is basically used for writing image files such as .iso and .img, onto storage media to create live SD cards and USB flash drives.

1. Download [balenaEtcher](https://www.balena.io/etcher/).
2. Run the program.
3. Go to [Raspberry´s software](https://www.raspberrypi.org/software/operating-systems/) section and search for the Raspberry Pi OS Lite download button.
4. Copy link address by right clicking over it.
5. Go back to the balenaEtchher app and click on Flash from URL.
6. Paster the OS link andress.
7. Select your SD card as target.
8. Click on Flash.
9. Wait till it finishes writing the card.

Before inserting the card into the Pi, go to your file explorer and navigate to the SD card boot partition. Once there, create a file named **_ssh_**, without any extension. This will enable SSH when the computer is first booted.

Now you can insert the card into the Raspberry Pi, connect the ethernet cable and the power supply.

## Connecting to the Raspberry Pi

Wait a couple of minutes till the Pi finishes booting. Once ready, go to your main computer and open your terminal (Powershell for Windows users) and run

`ssh pi@<RASPBERRY_IP>`
_you can find its IP in your Router’s DHCP lease allocation table_

Type yes to establish connection and enter the default Raspberry´s password which is raspberry.

You are now connected to the Pi.

## Raspbian setup

The first thing that I recommend doing is changing the default password that we previously entered. Simply run

`sudo raspi-config`

to enter the configuration menu. Once there navigate to **_System Options > Password_** and press Enter. Type your new password when asked.

You can now update and upgrade your packages. To do that, run

```sudo apt update && sudo apt full-upgrade```

Another convenient thing to do is configure your Raspberry Pi to allow access from another computer without needing to provide a password each time you connect. To do this, you need to use an SSH key instead of a password. To generate an SSH key:

Log out from the current SSH session by running ```logout```. On your local machine run ```ssh-keygen```.

Upon entering this command, you will be asked where to save the key. Just press Enter to save it on its default location.

Append the public key to your _authorized_keys_ file on the Raspberry Pi by sending it over SSH:

```ssh-copy-id pi@<RASPBERRY_IP>```

Done. Try reconnecting to your Pi and see if it works. If you are having trouble make sure to follow the original [documentation](https://www.raspberrypi.org/documentation/remote-access/ssh/passwordless.md).

One last thing to do, which is optional, is to update the ssh configuration to increase linux security. On your Raspberry open the **_/etc/ssh/sshd_config_** file with your favorite text editor.

```sudo nano /etc/ssh/sshd_config```

Once in, update the following configuration:

```
# SSH protocol uses port 22 by default, so it will be convenient to change it to something else. If you do so, don't forget to add the -p <NEW-PORT> flag when trying to ssh after configuration changes.
Port <NEW-PORT>

#IPV4 only
AddressFamily inet

PermitRootLogin no
PasswordAuthentication no
PermitEmptyPasswords no
```

Save the file and run the following command to restart the sshd server.

```sudo systemctl restart sshd```


Before logging out from the current session, try reconnecting to your Pi using another terminal tab on your local machine. If you get an error make sure you don't misspelled anything when changing the config file. Otherwise you are good to go!


# Docker engine
Docker is a set of platform as a service (PaaS) products that use OS-level virtualization to deliver software in packages called containers. Containers are isolated from one another and bundle their own software, libraries and configuration files; they can communicate with each other through well-defined channels.

If you are having trouble running the following commands, go and check the original docker documentation.

1. [Install using the convenience script](https://docs.docker.com/engine/install/debian/#install-using-the-convenience-script)
2. [Install Compose](https://docs.docker.com/compose/install/#install-compose-on-linux-systems)
3. [Manage Docker as a non-root user](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user)

Just copied and pasted the necessary parts for easy access.

## Install using the convenience script
Docker provides a convenience script at get.docker.com to install Docker into development environments quickly and non-interactively.

This example downloads the script from get.docker.com and runs it to install the latest stable release of Docker on Linux:

```
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```
Docker is installed. The docker service starts automatically on Debian based distributions.

## Install Compose
On Linux, you can download the Docker Compose binary from the Compose repository release page on GitHub. Follow the instructions from the link, which involve running the curl command in your terminal to download the binaries. These step-by-step instructions are also included below.

1. Run this command to download the current stable release of Docker Compose:

``` curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose```

2. Apply executable permissions to the binary:

```sudo chmod +x /usr/local/bin/docker-compose```

## Manage Docker as a non-root user
The Docker daemon binds to a Unix socket instead of a TCP port. By default that Unix socket is owned by the user root and other users can only access it using sudo. The Docker daemon always runs as the root user.

If you don’t want to preface the docker command with sudo, create a Unix group called docker and add users to it. When the Docker daemon starts, it creates a Unix socket accessible by members of the docker group.

To create the docker group and add your user:

1. ate the docker group.

```sudo groupadd docker```

2.  your user to the docker group.

```sudo usermod -aG docker pi```
