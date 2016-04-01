# Transit Data Manager

The core application for Conveyal's transit data tools suite.

## Prerequisites

The application features a Spark-powered Java backend and a Javascript frontend written with React and Redux. To install and deploy the application, you will need Java 8, Maven, Node/npm, and Webpack.

User athentication is done via [Auth0](http://auth0.com). You will need an Auth0 account and application to use the Data Manager.

## Installation and Basic Configuration

Clone the repo and change to the project directory:

```bash
$ git clone https://github.com/conveyal/datatools-manager.git
$ cd datatools-manager
```

Copy the included configuration template to `application.conf`:

```bash
$ cp application.conf.template application.conf
```

Create directories on your local machine to store the MapDB database and the GTFS feeds. Update the following lines in `application.conf` to reflect these locations:

```
application.data.mapdb=/path/to/mapdb
application.data.gtfs=/path/to/gtfs
```

Update the following lines in `application.conf` to reflect your Auth0 settings:

```
application.auth0.domain=your-auth0-domain
application.auth0.client_id=your-auth0-client-id
application.auth0.client_secret=your-auth0-client-secret
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

Uncomment the following lines in `application.conf`:

```
application.extensions.transitland.enabled=true
application.extensions.transitland.api=https://transit.land/api/v1/feeds
```

### Integration with [TransitFeeds](http://transitfeeds.com/)

Uncomment the following lines in `application.conf` and provide your API key:

```
application.extensions.transitfeeds.enabled=true
application.extensions.transitfeeds.api=http://api.transitfeeds.com/v1/getFeeds
application.extensions.transitfeeds.key=your-api-key
```

## Development

Spark does not hot-reload static web files, i.e. the application frontend. To make life easier when doing frontend development, we recommend using [combine-serve](https://github.com/conveyal/combine-serve) to serve both the backend and frontend as a unified service. Used in conjunction with `webpack --watch`, this will eliminate the need to constantly rebuild/reload the frontend for testing.

For example, if running the Java backend on port 9000 (typically via an IDE such as IntelliJ), and you want to serve the combined application on port 9001 for development purposes, use:

```
combine-serve --serve / src/main/resources/public/ --proxy / http://localhost:9000 --port 9001
```
