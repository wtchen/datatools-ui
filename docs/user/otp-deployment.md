# OTP Deployment using DataTools

This document describes how to deploy OTP with a load balancer, using DataTools, prior to Pull Request #506.

Steps:

1. Create a load balancer in AWS.
2. Configure a load balancer in DataTools.

Assumptions:

1. You have access to an IBI Group Amazon Web Services (AWS) environment.
2. Server instance types exist on AWS.
3. A "key file name" exists.
4. A Virtual Private Cloud (VPC) with two subnets exists on AWS.
5. You are an admin for DataTools.

## UI "Server": Buckets and CloudFront

### Create an S3 bucket

To be completed.

### Create a CloudFront instance

To be completed.

### Create a CNAME for CloudFront

To be completed.

## Backend server: Create a load balancer, and copy properties to DataTools

We recommend using an elastic load balancer (ELB) for deploying/upgrading an OTP server instance without interrupting the current one. In doing so, a new server is set up in the background, and when ready (preprocessing done), the new server is added to the load balancer, and the old server removed and destroyed.

### Create the load balancer in AWS

1. Open the EC2 Dashboarad (AWS Home > Services > Compute > EC2, or from recents).
2. Open the Load Balancers view (from Resources > Load Balancers, or from Left Pane > Load Balancing > Load Balancers).
3. Click Create Load Balancer, then select Application Load Balancer.
4. Enter a name, add a listener for HTTPS(443), pick a VPC with two subnets/availability zones available, and select two of the subnets. (Leave other params as is). Click Next.
5. Choose a certificate in ACM, pick the IBI Group certificate. (Leave other params as is). Click Next.
6. Create a new security group, or use an existing one that supports HTTP, HTTPS, SSH. (Leave other params as is). Click Next.
7. Create a new target group (pick a name). Click Next. 
8. Do not register any targets. Click Finish to return to the Load Balancer view.
9. Click on th row for your new load balancer.
10. Under the Listeners tab, there should be two listeners. If not, add the HTTPS listener.

### Configure a load balancer in DataTools

1. Login to DataTools > Home > Admin > Deployment Servers, and add a new deployment server with the ELB option checked.
2. From the AWS load balancer view, select the load balancer to use for deployment, and look at values under the Description tab.
3. Fill the DataTools properties with the following values from above: 
* For **Subnet ID**, enter the first portion of the first AWS availability zone, e.g. if the zone value is **subnet-0123456789 - us-east-xx**, only enter **subnet-0123456789**. 
* For **Security Group ID**, enter the security group of the AWS load balancer that supports HTTP, HTTPS, and SSH, e.g. **sg-0123456789abcdef**.
4. From the AWS IAM Dashboard > Roles, pick a role to assign to the deployment servers. Open the role details in AWS.
5. In DataTools **IAM Instance Profile ARN**, enter the Instance Profile ARNs value from the above details, e.g. **arn:aws:iam::0123456789:instance-profile/example-role**.
6. From the AWS Target Groups view (EC2 > Left Pane > Load Balancing > Target Groups), select the target group of the load balancer to use, and look at values under the Description tab.
7. In DataTools **Target Group ARN (load balancer)**, enter the ARN value of the group selected above.
8. Enter a valid value **Key File Name** (copy value from another deployment server).

### Create a CNAME for the load balancer

To be completed

## CNAMES and other settings

## Executing the deployment

To be completed.


