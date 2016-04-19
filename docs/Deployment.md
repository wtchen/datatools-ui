# Deployment

## Prerequisites

The application features a Spark-powered Java backend and a Javascript frontend written with React and Redux. To install and deploy the application, you will need Java 8, Maven, Node/npm, and Webpack.

User athentication is done via [Auth0](http://auth0.com). You will need an Auth0 account and application to use the Data Manager.

## Installation and Basic Configuration

Clone the repo and change to the project directory:

```bash
$ git clone https://github.com/conveyal/datatools-manager.git
$ cd datatools-manager
```

Copy the included configuration templates:

```bash
$ cp config.yml.template config.yml
$ cp config_server.yml.template config_server.yml
```

Create directories on your local machine to store the MapDB database, GTFS feeds, and GeoJSON data. Update the following properties in `config.yml` to reflect these locations:

```yaml
application:
  data:
    mapdb: /path/to/mapdb
    gtfs: /path/to/gtfs
    regions: /path/to/regions/geojson
```

Update the following properties in `config.yml` to reflect the public Auth0 settings:

```yaml
auth0:
  domain: your-auth0-domain
  client_id: your-auth0-client-id
```

Update the following properties in `config_server.yml` to reflect the secure Auth0 settings:

```yaml
auth0:
  client_secret: your-auth0-client-secret
  api_token: your-auth0-api-token
```

## Building and Running the Application

Install the Javascript dependencies using npm:

```bash
$ npm install
```

Build the frontend using webpack:

```bash
$ webpack
```

Package the application using Maven:

```bash
$ mvn package
```

Deploy the application with Java:

```bash
$ java -jar target/datatools.jar
```

The application should now be accessible at `http://localhost:9000` (or whatever port you specified in `application.conf`).

## Configuring Extensions

The application supports integration with several third-party resources for retrieving feeds.

### Integration with [transit.land](https://transit.land/)

Ensure that the `extensions:transitland:enabled` flag is set to `true` in `config.yml`:

```yaml
extensions:
  transitland:
    enabled: true
    api: https://transit.land/api/v1/feeds
```

### Integration with [TransitFeeds](http://transitfeeds.com/)

Ensure that the `extensions:transitfeeds:enabled` flag is set to `true` in `config.yml`, and provide your API key:

```yaml
extensions:
  transitfeeds:
    enabled: true
    api: http://api.transitfeeds.com/v1/getFeeds
    key: your-api-key
```
