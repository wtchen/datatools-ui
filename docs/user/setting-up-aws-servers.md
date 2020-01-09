# Setting Up OTP Deployment Servers on Amazon Web Services (AWS)

This document describes how to:

1. [Create an OTP UI server (AWS S3 and CloudFront)](#ui-server-s3-bucket-and-cloudfront)
2. [Create an OTP backend load balancer (AWS EC2)](#backend-server-load-balancer)

Assumptions for IBI-hosted deployments:

1. You are logged into an IBI Group AWS environment.
2. You have selected a region (e.g. [US East (N. Virginia)](https://console.aws.amazon.com/console/home?region=us-east-1)).
3. A Virtual Private Cloud (VPC) with two subnets exists in that AWS environment.

## UI Server: S3 Bucket and CloudFront

The OTP user interface is delivered using a plain HTTP file server that does not perform any computations. The file server consists of one S3 bucket. For fast high-bandwidth file delivery, we mirror the S3 bucket using CloudFront.

### Create an S3 Bucket

1. From [AWS S3](https://console.aws.amazon.com/s3/home), click `Create Bucket`. Each deployment uses its own bucket.
2. Specify a name (write down the name for use in Data Tools later).
3. When specifying options, uncheck `Block All Public Access`.

### Create a CloudFront instance

1. From [AWS CloudFront Home](https://console.aws.amazon.com/cloudfront/home), click `Create Distribution` [(direct link)](https://console.aws.amazon.com/cloudfront/home?#create-distribution:).
2. Select `Web Distribution`, then click `Next`.
3. Under `Origin Settings > Origin Domain Name`, select the `DNS name` of the S3 bucket you created above.
4. Under `Default Cache Behavior Settings`:
   1. Select `Redirect HTTP to HTTPS`.
   2. Select `Yes` to `Compress Objects Automatically` (this reduces download sizes by up to 60-70%).   
5. Under `Distribution Settings`, select `Custom SSL certificate`, and select the `*.ibi-transit.com` certificate.
6. Under `Distribution Settings`, set the `Default Root Object` value to be `index.html`.
7. (Optional) Enter a comment to make the distribution easy to search. Leave other parameters as is, and click `Create Distribution`.
8.  Open the properties of this CloudFront instance, and copy the `Domain Name` value (e.g. `abcdef0123456789.cloudfront.net`).

### Create a CNAME (i.e. subdomain) for CloudFront

1. Go to the [AWS hosted zone for ibi-transit.com](https://console.aws.amazon.com/route53/home#resource-record-sets:Z37ATQUY9Y96RY).  
   (It should be under [AWS Route 53](https://console.aws.amazon.com/route53/home), [Hosted Zones](https://console.aws.amazon.com/route53/home#hosted-zones:).)
2. Select `Create Record Set`. Fill in the subdmain (e.g. `otp-mod-ui.ibi-transit.com`). The OTP UI will be available at this URL. Set the `Record Type` to `CNAME`.
3. In the value field, paste the `Domain Name` value of the CloudFront instance above.
4. Click `Create`.
5. Return to [AWS CloudFront Home](https://console.aws.amazon.com/cloudfront/home).
6. Edit the properties of the CloudFront instance you created:
   * In `Alternate Domain Names (CNAMEs)`, paste the CNAME created above.

### Upload files for OTP UI

Upload the files [referenced here](https://github.com/ibi-group/trimet-mod-otp#to-build-a-production-bundle-for-deployment) to the S3 bucket created above.

If updating the UI files, remember to invalidate the CloudFront instance (this forces an update of the files on CloudFront).

## Backend server: Load balancer

We recommend using an elastic load balancer (ELB) for deploying/upgrading an OTP server instance without interrupting the current one. In doing so, a new server is set up in the background, and when ready (preprocessing done), the new server is added to the load balancer, and the old server removed and destroyed.

The load balancer also allows instantiating multiple OTP servers on large deployments. (You can start, add, or remove more than one OTP server to the load balancer.)

### Create the load balancer in AWS

1. Go to [Create Application Load Balancer](https://console.aws.amazon.com/ec2/home#V2CreateELBWizard:type=application:)  
   (Under [AWS EC2 Load Balancers view](https://console.aws.amazon.com/ec2/home#LoadBalancers:), click `Create Load Balancer` then `Application Load Balancer`.)
2. Enter a name, add a listener for HTTPS (443), pick a VPC with two subnets/availability zones available, and select two of the subnets. (Leave other params as is, the HTTP(80) listener should be there by default). Click `Next`.
3. Choose a certificate in ACM, pick the IBI Group certificate. (Leave other params as is). Click `Next`.
4. Create a new security group, or use an existing one that supports HTTP, HTTPS, SSH. (Leave other params as is). Click `Next`.
5. Create a new target group (pick a name). Click `Next`.
6.  Do not register any targets. Click `Finish`.
7.  From the [Load Balancer view](https://console.aws.amazon.com/ec2/home?#LoadBalancers:), select the row corresponding to your new load balancer.
8.  Under the `Listeners` tab, there should be two listeners, one for HTTP and one for HTTPS. Add the HTTPS listener if it is not there.
9.  Open the load balancer properties, and, under the `Description` tab, copy the load balancer's `DNS name` (e.g. `ibi-dev-otp-1234567890.us-east-1.elb.amazonaws.com`).

### Create a CNAME (i.e. subdomain) for the load balancer

1. Go to the [AWS hosted zone for ibi-transit.com](https://console.aws.amazon.com/route53/home#resource-record-sets:Z37ATQUY9Y96RY).\
   (It should be under [AWS Route 53](https://console.aws.amazon.com/route53/home), [Hosted Zones](https://console.aws.amazon.com/route53/home#hosted-zones:).)
2. Select `Create Record Set`. Fill in the subdmain (e.g. `otp-mod-dev.ibi-transit.com`). Set the `Record Type` to `CNAME`.
3. In the value field, paste the `DNS Name` of the load balancer instance above.
4. Click `Create`.
