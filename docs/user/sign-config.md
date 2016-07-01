# eTID Configuration Manager

## Overview

The eTID Configuration Manager allows for the creation and management of eTID Configurations. An eTID Configuration contains a list of stops and routes to be displayed on a given set of associated electronic transit information screens (eTIDs).

## Configurations Viewer

The Configurations Viewer allows users to view, search for, and filter all draft and published configurations.  A user may choose to edit one of the configurations in the list (if she has the appropriate permissions) or create a new configuration.

![Configurations Viewer](/img/configurations-viewer.png "Configurations Viewer")

### Editing a Configuration

A user may edit an existing configuration by clicking button with the pencil icon for the given configuration.  This button may be disabled for a few permissions-related reasons:

1. if the user does not have permission to edit configurations for agencies contained within the configuration OR
2. if the configuration has been published, but the user does not have the **Approve eTID** privilege.

### Filtering Configurations

The list of configurations may be filtered in a couple of ways:

1. Searching the title by text, e.g. "Embarcadero"  ![Search by title](/img/filter-configurations.png "Search by title")  
2. Clicking one of the following filters:
    - **All** - shows all configurations
    - **Published** - shows all published configurations (configurations that are live)
    - **Draft** - shows all draft configurations (configurations that have not yet been published/approved)

### Creating a New Configuration

On the main Configurations Viewer page, a user may create a new configuration a few different ways.

1. Clicking the **New Configuration** button.
2. Zooming into the map, selecting a stop feature and then clicking **Create Sign for XXX**.
3. Begin typing the name of a stop in the search bar above the map, selecting a stop from the list and then clicking **Create Sign for XXX**.

**Note**: Users may not create a new configuration *directly* from a route.  Because eTID configurations are primarily organized by stops (and then by the stops' associated routes), users first must add a stop and then select from a list of routes the stop serves.

![Search for routes/stops by name or on the map](/img/gtfs-map-search-config.png "Search for routes/stops by name or on the map")  

For more info on route/stop search, see [Searching for Routes and Stops](user/searching-routes-stops/).

## Configuration Editor

Upon creating a new or editing an existing eTID Configuration, a user will see the Configuration Editor view. Here you can specify all of the eTID Configuration properties.

![Configuration Editor](/img/configuration-editor.png "Configuration Editor")  

### List of eTID Configuration Properties

1. **Configuration Name** (required)
2. **Associated Displays for Sign Configuration** (optional) - the list of displays that are associated with this eTID Configuration. Clicking a display will toggle its state. The available states for displays are:
    - **Unassigned** - those displays that have neither a published nor draft configuration. When adding an Unassigned display to a configuration, you must click once to toggle it to Unpublished.
    - **Unpublished** - displays assigned to current *draft* configuration
    - **Published** - displays assigned to current *published* configuration
    - **Assigned here** - indicates that display is assigned to current *draft* configuration, but is assigned to another *published* configuration
    - **Assigned to XX** - displays assigned to another *draft* configuration (XX = Configuration ID)
    - **Published to XX** - displays assigned to another *published* configuration (XX = Configuration ID)
3. **Stops/Routes for Sign Configuration** (required) - one or more stops (along with one or more associated routes) to be included on the eTID Configuration.

### Associating Displays to a eTID Configuration

Associating a given display to an eTID Configuration depends on a few conditions, broken down by the scenarios below:

#### Associating an Unassigned Display

1. The current eTID Configuration must be in **draft** mode.
2. The display may then be toggled to **unpublished** state.

#### Publishing an Unpublished Display

1. The display must already be Assigned/Unpublished to the current configuration.
2. The display **must not** be Published to another configuration.
3. The current eTID Configuration must be toggled to **published** mode.
4. The display may then be toggled to **published** state.

#### Re-associating an Unpublished Display

1. The display may be assigned to any other configuration (published or unpublished).
2. The current eTID Configuration must be in **draft** mode.
4. The display may then be toggled to **unpublished** state.

### Adding Stops/Routes to a eTID Configuration

Adding affected service to a eTID Configuration can be done through searching for and selecting a stop in the Stops/Routes for Configuration panel. Users may also add a stop by searching for stops through the map/search interface on the right side of the Configuration Editor (similarly to creating a eTID Configuration for a stop).

Once a new stop has been added, it will appear in the Affected Service panel. Clicking the newly added item will allow the user to change the selected stop and add associated routes.

![Adding Stops/Routes to a eTID Configuration](/img/stops-routes-configuration.png "Adding Stops/Routes to a eTID Configuration")

### Publishing, Saving and Deleting Configurations

Once finished, editing an configuration, a user can save the configuration by clicking the **Save** button in the upper righthand corner of the Configuration Editor. After saving, the user will be redirected to the full list of configurations.

If the user has the **Approve eTID** permission, she may toggle the configuration between unpublished (draft) and published states by clicking the green **Publish** button or (if already published) the yellow **Unpublish** button.

To delete the configuration, click the red **Delete** button.  You will be asked to confirm this decision.  You may also delete configurations by clicking the **X** button for a given configuration in the Configurations Viewer.
