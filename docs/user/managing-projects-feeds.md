# Managing Projects and Feeds

## Creating Projects

Projects are created from the main Project listing page. Click the "New Project" button to create a new Project; a row for the new Project will appear in the table. Type a name and click the check button (or hit Enter/Return) to finish creating the Project.

![screenshot](../img/create-project.png)

## Managing Projects

Clicking on a project in the main project listing will take you to the detailed project profile page:

![screenshot](../img/project-profile.png)

At the top of the page is the **Project Settings** panel which can be expanded to reveal optional properties that can be specified for the project. These include the location of the project's geographic coverage area (specified either as a single coordinate or a rectangular region), the default time zone, and default language. These values, when provided, are used to populate the corresponding feed-level properties when creating new feeds within this project.

Below the Project Settings panel is the **Feed Sources** panel. Feed Sources are the core of a project, and are documented in more detail below.

## Creating a Feed Source

Feed Sources are created from a Project's main profile page. Click the "New Feed" button to create a new feed; a row for the new Feed Source will appear in the table. Type a name and click the check button (or hit Enter/Return) to finish creating the Feed Source.

## Managing Feed Sources

After a Feed Source has been created, it will appear in the Project's table of Feed Sources. From this table, a basic summary of information for the feed is presented (including if the latest version has expired and how many validation issues it has).

To access all settings for this Feed Source, click on the its name to access the full Feed Source profile page:

![screenshot](../img/feed-profile.png)

At the top of the page is a set of tabs, which include:

- **GTFS** - main point of entry for Feed Source
    - Feed Version Navigator (covered in more detail below)
    - Feed Version Summary - view feed info and discover information about routes, patterns and stops
    - Validation issues - view and filter list of validation issues
    - Version comments - leave and view comments specific to a Feed Version
- **Snapshots** - list of Editor snapshots (or save points)
- **Comments** - where users can leave and view comments specific to this Feed Source
- **Settings** - access to Feed Source settings
    - Editing basic Feed Source properties such as name, fetch URL, and public visibility
    - Viewing/editing settings provided by custom extensions
    - Deleting a Feed Source (for users with sufficient permissions) in the **Danger zone** properties.

## Creating Feed Versions

Feed Versions are created from the main Feed Source profile page. There are three methods for creating new versions:

1. **Manually Upload a File**: Select "Manually Uploaded" from the `+ Create new version` dropdown. The button next the the dropdown should now say "Upload." Click the "Upload" button to select a GTFS file from your local machine.

2. **Fetch From A Remote URL**: Select "Fetch" from the `+ Create new version` dropdown. **Note:** to fetch a new version, the "Feed source fetch URL" property must be set to a valid GTFS URL under `Feed Source > Settings`.

3. **Import From the GTFS Editor**: Select "From snapshot" from the `+ Create new version` dropdown. The list of snapshots should now be visible showing any available snapshots of the feed in the Editor. Select the desired snapshot by clicking the "Publish" button to publish the snapshot as a new version.

**Note:** when uploading or fetching a feed, and the file being uploaded or fetched is not different from the latest version, no new Feed Version will be created.

## Loading Feed Versions into Editor



## Viewing and Managing Feed Versions

The Feed Version navigator allows you to navigate through all available versions of a given feed using the `←` and `→` buttons (or view a list of all versions). You can also use this interface to:

- download a Feed Version to your local machine as a GTFS data file,
- load a version into the Editor, and
- delete a Feed Version from the Data Manager. (Note: deleting a Feed Version cannot be undone.)

![screenshot](../img/feed-version-navigator.png)

To the left of the navigator is a list of views available for to the currently active version. These include basic feed statistics, the detailed feed validation report, and any user comments specific to this feed. See [Feed Version Summary](./feed-version-summary) for more.
