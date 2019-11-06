# Deploying GTFS Feeds to OTP

Assumptions:

* [X] You have loaded a GTFS feed into a project.
* [X] You have a deployment server available.

To deploy or update GTFS feeds to OTP:

1. Open a project.
2. Click on the `Deployments` tab.
3. (Optional) To create a new deployment, click `+ New Deployment`, enter a name, then press or click Enter.
4. Click the name of the deployment to execute. A summary of feeds and existing deployments (if available) are shown for your review.
5. Remove the feeds you don't need from the deployment. For the remaining feeds, select the correct feed version.
6. In the `OTP Configuration` pane:
 * Select the latest OTP version (the first one in the list).
 * Check `Build graph only` to only generate and output a graph file on EC2 to the S3 server (no OTP server will be running after the graph is generated).
 * `Use R5`: Remove from UI.
7. If you select `Custom` under `Build configuration` or `Router configuration`, enter the desired configuration settings.
8. Click the `Deploy` dropdown at the top of the main pane, then pick the server on which to perform the deployment. Existing deployments on that server will be discarded.
