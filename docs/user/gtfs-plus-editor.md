# GTFS+ Editor

## Overview

The GTFS+ Editor provides an interface for viewing and editing the additional data tables defined by the GTFS+ extension to the GTFS format.

Any GTFS feed managed in the Data Manager may optionally include GTFS+ data. GTFS+ tables, when present, are included in the same Zip file as the primary GTFS tables; the Data Manager will automatically recognize and process GTFS+ data for any feed where such data is included. The application also allows users to create new GTFS+ tables from scratch for any feed in the system.

## Viewing GTFS+ Status for a Feed Version

Within the main Feed Source page, the Feed Version navigator includes an expandable "GTFS+" panel showing the status of any GTFS+ for that Feed Version:

![screenshot](../img/gtfsplus-summary.png)

In the above example, the loaded Feed Version includes GTFS+ data for 5 of the 11 possible GTFS+ tables. The table labeled *Feed Validation Summary* provides an overview of which GTFS+ tables are included, and for those that are, the total number of records and how many records have known validation issues. A second section, *General Validation Issues*, includes other issues that are not specific to individual table records. These can include missing required columns or other structural problems detected within the GTFS+ data.

## Editing GTFS+ Data for a Feed Version

Within the GTFS+ panel of the Feed Version viewer described above there an "Edit GTFS+" button. Clicking this will open the main GTFS+ Editor interface:

![screenshot](../img/gtfsplus-editor.png)

Major elements of the editor interface include:

* The *main table view* is where a single GTFS+ table is displayed for editing. The user can interact directly with any field; depending on the field type, it will be editable as either a dropdown selector, an interactive GTFS search field (for selecting known stops and routes), or as a plain text input. Fields that are required are marked as an asterisk in the column header.
* The *table selector column* on the left-hand side lists all possible GTFS+ tables, and is used to select which table is currently being edited. Tables that include records with known validation issues are marked with a red 'X'.
* The *table navigator* immediately above the main table view allows users to navigate through longer tables as a series of pages (at most 25 records are shown on one page). Also included is a dropdown selector that allows filtering of the displayed records by validation status.
* The *"New Row" button* at the bottom of the main table view is used to add a new empty record to the end of the current table.
* *Help icons*, marked with the '?' sign, can be clicked to display a description of individual tables and table columns.

After making changes to the data, the "Save and Revalidate" button can be used to save changes to the server and re-run the validation process. The saved changes overwrite any previous GTFS+ data stored for the given Feed Version. The GTFS+ summary table in the main Feed Version viewer (described above) will be updated to reflect the latest changes.

## Exporting GTFS+ to a New Version

Once the GTFS+ data for a given Feed Version is to a point where it is complete and ready for external use, it may be exported as a new Feed Version in the main Data Manager using the "Export as New Version" button within the GTFS+ summary panel (note that this button does not appear until the GTFS+ for a given Feed Version has been edited and saved at least once). In addition to the updated GTFS+ data, any standard GTFS data from the original Feed Version will be retained and included in the newly created version.
