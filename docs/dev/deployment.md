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

Create directories on your local machine to store the MapDB databases, GTFS feeds, and GeoJSON data. Update the following properties in `config.yml` to reflect these locations:

```yaml
application:
  data:
    mapdb: /path/to/mapdb
    gtfs: /path/to/gtfs
    editor_mapdb: /path/to/editor
    regions: /path/to/regions/geojson
```
### Setting up Auth0

#### Creating account and application (client)
1. Create an Auth0 account (free).
2. Once you've created an Auth0 account, create an application (client) in Auth0 to use with the Data Manager with the following settings:
    - enable only `Username-Password-Authentication` connections (i.e., turn off Google)
    - set `Use Auth0 instead of the IdP to do Single Sign On` to true
    - update the following application- and account-level settings to include `http://localhost:9000` (or the domain where the application will be hosted):
        - Account level
            - Allowed logout URLs
        - Application level
            - Allowed Callback URLs
            - Allowed Origins (CORS)

#### Creating your first user
Create your first Auth0 user through Auth0 web console. You'll need to supply the user with the following default application admin `app_metadata`:

```json
{
  "datatools": [{
    "permissions": [
      {
        "type": "administer-application"
      }
    ],
    "subscriptions": [],
    "projects": [],
    "client_id": "your-auth0-client-id"
  }]
}
```

#### Update `config.yml` and `config_server.yml`
Update the following properties in `config.yml` to reflect the public Auth0 application settings:

```yaml
auth0:
  domain: your-auth0-domain.auth.com
  client_id: your-auth0-client-id
```

Update the following properties in `config_server.yml` to reflect the secure Auth0 application settings:

```yaml
auth0:
  client_secret: your-auth0-client-secret
  api_token: your-auth0-api-token
```

**Note**: to generate the `api_token`, go to Documentation > Management API, and use the token generator for the following scopes:

- **users**:
    - read, update, create and delete
- **users_app_metadata**:
    - read, update, create and delete`

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

The application should now be accessible at `http://localhost:9000` (or whatever port you specified in `config.yml`).

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
