# Setting Up OTP Deployment Servers on Amazon Web Services (AWS)

This document describes how to setup a load balancer server and an UI server for deployment using OTP DataTools, versions prior to Pull Request #506.

Steps:

1. Create the UI server (AWS S3 and CloudFront)
2. Create the backend load balancer (AWS EC2).

Assumptions for IBI-hosted deployments:

1. You have access to an IBI Group Amazon Web Services (AWS) environment.
2. Server instance types exist on AWS.
3. A "key file name" exists.
4. A Virtual Private Cloud (VPC) with two subnets exists on AWS.
5. You are an admin for DataTools.

## UI "Server": S3 Buckets and CloudFront

### Create an S3 bucket

Select AWS Console > Storage > S3 > Create bucket. Each deployment has its own bucket.
When specifying options, uncheck 'Block All Public Access'.

### Create a CloudFront instance

1. Select AWS Console > Networking & Content Delivery > CloudFront > Create Ditribution. 
2. Select Web Distribution, then click Next.
3. Under Origin Settings, select the S3 bucket DNS name you created above.
4. Under Cache Behavior, select 'Redirect HTTP to HTTPS'.
5. Under Distribution Settings, select Custom SSL certificate, and select the ibi-transit.com certificate.
6. Under Distribution Settings, set the Default Root Object value to be index.html.
7. (Optional) Enter a comment to make the distribution easy to search. Leave other parameters as is, and click Create Distribution.
8. Open the properties of this CloudFront instance, and copy the Domain Name value (e.g. **abcdef0123456789.cloudfront.net**).

### Create a CNAME (i.e. subdomain) for CloudFront

1. Select AWS Console > Networking & Content Delivery > Route 53 > Hosted Zones.
2. Select ibi-transit.com.
3. Select Create Record Set. Fill in the subdmain (e.g. **otp-mod-ui**.ibi-transit.com), and set the record type to **CNAME**.
4. In the value field, paste the Domain Name value of the CloudFront instance above.
5. Click Create.

Once deployed, the OTP UI will be available at the URL configured in this section.

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
11. Open the load balancer properties, and, under the Description tab, copy the load balancer's DNS name (e.g. **ibi-dev-otp-1234567890.us-east-1.elb.amazonaws.com**).

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
9. Proceed to save the deployment server.

The new load balancer will appear in the list of deployment servers in the Data Tools project page.

### Create a CNAME (i.e. subdomain) for the load balancer

1. Select AWS Console > Networking & Content Delivery > Route 53 > Hosted Zones.
2. Select ibi-transit.com.
3. Select Create Record Set. Fill in the name, and set the type to be a CNAME.
4. In the value field, paste the DNS name of the load balancer instance above.
5. Click Create.

