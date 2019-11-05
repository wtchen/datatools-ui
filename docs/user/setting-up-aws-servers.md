# Setting Up OTP Deployment Servers on Amazon Web Services (AWS)

This document describes how to:

1. [Create an OTP UI server (AWS S3 and CloudFront)](#ui-server-s3-bucket-and-cloudfront)
2. [Create an OTP backend load balancer (AWS EC2)](#backend-server-load-balancer)

Assumptions for IBI-hosted deployments:

1. You have access to an IBI Group Amazon Web Services (AWS) environment.
2. A Virtual Private Cloud (VPC) with two subnets exists in that AWS environment.

## UI Server: S3 Bucket and CloudFront

The OTP user interface is delivered using a plain HTTP file server that does not perform any computations. The file server consists of one S3 bucket. For fast high-bandwidth file delivery, we mirror the S3 bucket using CloudFront.

### Create an S3 Bucket

Select `AWS Console > Storage > S3 > Create Bucket`. Each deployment uses its own bucket.
Specify a name (write down the name for use in Data Tools later), and when specifying options, uncheck `Block All Public Access`.

### Create a CloudFront instance

1. Select `AWS Console > Networking & Content Delivery > CloudFront > Create Distribution`.
2. Select `Web Distribution`, then click `Next`.
3. Under `Origin Settings`, select the `DNS name` of the S3 bucket you created above.
4. Under `Cache Behavior`, select `Redirect HTTP to HTTPS`.
5. Under `Distribution Settings`, select `Custom SSL certificate`, and select the `*.ibi-transit.com` certificate.
6. Under `Distribution Settings`, set the `Default Root Object` value to be `index.html`.
7. (Optional) Enter a comment to make the distribution easy to search. Leave other parameters as is, and click `Create Distribution`.
8. Open the properties of this CloudFront instance, and copy the `Domain Name` value (e.g. `abcdef0123456789.cloudfront.net`).

### Create a CNAME (i.e. subdomain) for CloudFront

1. Select `AWS Console > Networking & Content Delivery > Route 53 > Hosted Zones`.
2. Select `ibi-transit.com`.
3. Select `Create Record Set`. Fill in the subdmain (e.g. `otp-mod-ui.ibi-transit.com`). The OTP UI will be available at this URL. Set the `Record Type` to `CNAME`.
4. In the value field, paste the `Domain Name` value of the CloudFront instance above.
5. Click `Create`.


## Backend server: Load balancer

We recommend using an elastic load balancer (ELB) for deploying/upgrading an OTP server instance without interrupting the current one. In doing so, a new server is set up in the background, and when ready (preprocessing done), the new server is added to the load balancer, and the old server removed and destroyed.

The load balancer also allows instantiating multiple OTP servers on large deployments. (You can start, add, or remove more than one OTP server to the load balancer.)

### Create the load balancer in AWS

1. Open the EC2 Dashboard (`AWS Home > Services > Compute > EC2`, or from the AWS History pane).
2. Open the Load Balancers view (`Resources > Load Balancers`, or from `Left Pane > Load Balancing > Load Balancers`).
3. Click `Create Load Balancer`, then select `Application Load Balancer`.
4. Enter a name, add a listener for HTTPS (443), pick a VPC with two subnets/availability zones available, and select two of the subnets. (Leave other params as is). Click `Next`.
5. Choose a certificate in ACM, pick the IBI Group certificate. (Leave other params as is). Click `Next`.
6. Create a new security group, or use an existing one that supports HTTP, HTTPS, SSH. (Leave other params as is). Click `Next`.
7. Create a new target group (pick a name). Click `Next`.
8. Do not register any targets. Click `Finish` to return to the `Load Balancer` view.
9. Click on the row corresponding to your new load balancer.
10. Under the `Listeners` tab, there should be two listeners, one for HTTP and one for HTTPS. Add the HTTPS listener if it is not there.
11. Open the load balancer properties, and, under the `Description` tab, copy the load balancer's `DNS name` (e.g. `ibi-dev-otp-1234567890.us-east-1.elb.amazonaws.com`).

### Create a CNAME (i.e. subdomain) for the load balancer

1. Select `AWS Console > Networking & Content Delivery > Route 53 > Hosted Zones`.
2. Select `ibi-transit.com`.
3. Select `Create Record Set`. Fill in the subdmain (e.g. `otp-mod-dev.ibi-transit.com`). Set the `Record Type` to `CNAME`.
4. In the value field, paste the `DNS Name` of the load balancer instance above.
5. Click `Create`.
