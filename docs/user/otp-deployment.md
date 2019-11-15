# OTP Deployment Guide

In this guide:

1. [Overview](#overview)
2. [OTP Deployment Archtecture](#otp-deployment-architecture)
3. [Performing an OTP Deployment](#performing-an-otp-deployment)

## Overview

This guide describes how to configure and deploy OTP servers using OTP Data Tools, and is for intermediate to advanced OTP Data Tools administrators. The deployment architecture diagram below depicts how OTP servers are managed by Data Tools and can be used with elastic load balancers, and how Amazon S3 servers are mirrored by CloudFront high-bandwidth content delivery.

The steps to perform an OTP deployment describe how to set up and link OTP servers to load balancers, S3 servers to CloudFront, and Amazon Web Services to Data Tools. Administrators can also find how to configure optional subdomains (i.e. friendly, public URLs) for OTP servers.

## OTP Deployment Architecture

The figure below depicts the OTP deployment architecture.

![OTP Deployment Diagram](../img/otp-deployment-diagram.png)
[Source link](https://ibigroup-my.sharepoint.com/:p:/p/binh_dam/EV_e-3qGZzxIgxJy06StsuIB8TW1A50D_DeKF-aV99jIVQ?e=GMjMh7)

## Performing an OTP Deployment

1. [Setting up OTP UI and backend servers on AWS](./setting-up-aws-servers.md)
2. [Adding a deployment server from Data Tools](./add-deployment-server.md)
3. [Deploying GTFS feeds to OTP](./deploying-feeds.md)
