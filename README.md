<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

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

## Hardware

For this project I used a Raspberry Pi 4 with 4Gb of memory and a 64Gb MicroSD card for external storage. I also bought an aluminium case with dedicated passive heatsinks for preventing overheats. In terms of connectivity I used a wired connection (Ethernet) to the Pi´s, but you can use a USB Wi-Fi adapter if you don't have access to one.

## Software

The main purpose of this project was to create a home server. That is why I used the Raspberry Pi OS Lite image, which is lightweight and has no GUI. I used SSH to access my Pi through my desktop computer.

## Installing the OS

This step consists of getting the OS image flashed into your SD card. I personally like to use a tool called balenaEtcher, which is basically used for writing image files such as .iso and .img, onto storage media to create live SD cards and USB flash drives.

1. Download balenaEtcher.
2. Run the program.
3. Go to Raspberry´s software section and search for the Raspberry Pi OS Lite download button.
4. Copy link address by right clicking over it.
5. Go back to the balenaEtchher app and click on Flash from URL.
6. Paster the OS link andress.
7. Select your SD card as target.
8. Click on Flash.
9. Wait till it finishes writing the card.

Before inserting the card into the Pi, go to your file explorer and navigate to the SD card boot partition. Once there, create a file named ssh, without any extension. This will enable SSH when the computer is first booted.

Now you can insert the card into the Raspberry Pi, connect the ethernet cable and the power supply.

## Connecting to the Raspberry Pi

Wait a couple of minutes till the Pi finishes booting. Once ready, go to your main computer and open your terminal (Powershell for Windows users) and type

`ssh pi@<RASPBERRY_IP>`
_you can find its IP in your Router’s DHCP lease allocation table_

Type yes to establish connection and enter the default Raspberry´s password which is raspberry.

You are now connected to the Pi.

## Raspbian setup

The first thing that I recommend doing is changing the default password that we previously entered. Simply type

`sudo raspi-config`

to enter the configuration menu. Once there navigate to **_System Options > Password_** and press Enter. Type your new password when asked.

You can now update and upgrade your packages. To do that, type
sudo apt update && sudo apt full-upgrade

Great. You just finished setting up your Raspberry Pi. Let's start adding some stuff.

# Docker engine

## Install using the convenience script

## Install Compose

## Manage Docker as a non-root user
