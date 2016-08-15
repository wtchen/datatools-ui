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
1. Create an [Auth0](https://auth0.com) account (free).
2. Once you've created an Auth0 account, create an application (client) in Auth0 to use with the Data Manager with the following settings:
    - enable only `Username-Password-Authentication` connections (i.e., turn off Google)
    - set `Use Auth0 instead of the IdP to do Single Sign On` to true
    - update the following application- and account-level settings to include `http://localhost:9000` (or the domain where the application will be hosted):
        - Account level (Account Settings > Advanced)
            - Allowed logout URLs
        - Application level
            - Allowed Callback URLs
            - Allowed Origins (CORS)
    - keep all other default settings

#### Creating your first user
Create your first Auth0 user through Auth0 web console (Users > Create User). In addition to an email and password, you'll need to supply the user with the following default application admin `app_metadata` (`user_metadata` should remain empty):

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

**Note**: to generate the `api_token`, go to Documentation > Management API. After adding scopes, your token will appear in the input field.

![Auth0 token generator](/img/auth0-token-generator.png =50x)

To allow for the creation, deletion and editing of users you must generate a token for the following scopes:

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

## Configuring Modules

The application contains a number of optional modules that each require their own configuration settings and resources. At minimum, each module must be set to `enabled: true` and may require additional configuration.

### Editor

Enables the GTFS Editor module.

#### List of configuration settings

- `MAPZEN_TURN_BY_TURN_KEY`
- `mapbox`
  - `access_token`
  - `map_id`

### Validator

While the application handles basic validation even without the validator module enabled, the validator allows for enhanced accessibility- and map-based validation.

#### List of configuration settings

- `application.osm_vex` -  the validator requires the URL of a running instance of the [OSM vex server](https://github.com/conveyal/vanilla-extract).

### Sign Configurations

Enables the sign configuration module.

#### List of configuration settings

- `use_extension` - extension to use for sign configuration
- `url`
- Requires `gtfsapi` module

### Alerts

Enables the real-time alerts module.

#### List of configuration settings

- `use_extension` - extension to use for sign configuration
- `url`
- Requires `gtfsapi` module

### GTFS+ (`gtfsplus`)

Enables the GTFS+ module.

### Deployment

Enables the OTP automated deployments module.

#### List of configuration settings

- `application.osm_vex` -  the validator requires the URL of a running instance of the [OSM vex server](https://github.com/conveyal/vanilla-extract).

### GTFS API

Supports other modules with API endpoints for getting GTFS entities (routes, stops, etc.)

#### List of configuration settings

- `load_on_fetch` - whether to load GTFS feeds when new feed is detected
- `load_on_startup` - whether to load GTFS feeds on application startup
- `use_extension` - which extension to connect to
- `update_frequency` - update frequency for GTFA API (in seconds)

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
