# Merging Feeds

## Merging active and future Feed Versions
For a given feed source/agency, it is possible to merge two feed versions that represent different service periods during the calendar year, e.g., a feed that contains summer service and a feed that contains fall service. This feature provides a convenient way for agencies to publish a feed version that spans a longer service period without interrupting downstream services (e.g., trip planners) that rely on that data day in and day out.

To begin a feed merge, navigate to one of the feed versions to be merged (it does not matter whether this is the current or future version). Next, click the 'Merge with version' dropdown button and select the version with which to merge.
<div class="img-center">
  ![merge feed versions](../img/merge-feeds-button.png)
</div>

### Merge rules
There are a set of rules that govern the requirements for input feed versions and how different tables are merged in the output feed version:

1. Merging will be based on `route_short_name` in the current and future datasets. All matching
  `route_short_names` between the datasets shall be considered same route. Any `route_short_name`
  in active data not present in the future will be appended to the future routes file.
1. Future `feed_info.txt` file should get priority over active feed file when difference is
  identified.
1. When difference is found in `agency.txt` file between active and future feeds, the future
  `agency.txt` file data should be used. Possible issue with missing `agency_id` referenced by routes
1. Stops will be merged on `stop_code` or `stop_id` if `stop_code` is missing. However, some restrictions apply on
  when missing stop_code values are permitted:
    1. Stops with `location_type` greater than `0` (i.e., anything but `0` or `empty`) are permitted
       to have empty `stop_codes` (even if there are other stops in the feed that have
       `stop_code` values). This is because these location_types represent special entries
       that are either stations, entrances/exits, or generic nodes (e.g., for
       `pathways.txt`). The merge will happen on `stop_code` if provided, or fallback on stop_id.
    2. For regular stops (`location_type = 0` or empty), all or none of the stops must
       contain `stop_codes`. Otherwise, the merge feeds job will be failed.
1. If any `service_id` in the active feed matches with the future feed, it should be modified
  and all associated trip records must also be changed with the modified `service_id`.
  If a `service_id` from the active calendar has both the `start_date` and `end_date` in the
  future, the service shall not be appended to the merged file. Records in trips,
  `calendar_dates`, and `calendar_attributes` referencing this `service_id` shall also be
  removed/ignored. `stop_time` records for the ignored trips shall also be removed.
  If a `service_id` from the active calendar has only the `end_date` in the future, the `end_date`
  shall be set to one day prior to the earliest `start_date` in future dataset before appending
  the calendar record to the merged file.
  `trip_ids` between active and future datasets must not match. If any `trip_id` is found to be
  matching, the merge should fail with appropriate notification to user with the cause of the
  failure. Notification should include all matched `trip_ids`.
1. New `shape_ids` in the future datasets should be appended in the merged feed.
1. Merging `fare_attributes` will be based on `fare_id` in the current and future datasets. All
  matching `fare_ids` between the datasets shall be considered same fare. Any `fare_id` in active
  data not present in the future will be appended to the future `fare_attributes` file.
1. All fare rules from the future dataset will be included. Any identical fare rules from
  the current dataset will be discarded. Any fare rules unique to the current dataset will be
  appended to the future file.
1. All `transfers.txt` entries with unique stop pairs (from - to) from both the future and
  current datasets will be included in the merged file. Entries with duplicate stop pairs from
  the current dataset will be discarded.
1. All GTFS+ files should be merged based on how the associated base GTFS file is merged. For
  example, directions for routes that are not in the future `routes.txt` file should be appended
  to the future `directions.txt` file in the merged feed.

###

### Merge Feed Versions Result
Once the merge feeds task has been completed, a notification window will appear describing the results of the merge process. If the feeds did not meet the rules for input datasets, the merge will fail and you will see a message describing the reason for failure and any offending records (e.g., duplicate `trip_ids` shared between the feeds). Otherwise, you will see a success message, with a list of any IDs that were modified for the output feeds (note: the input feeds will never be modified). Upon success, a new Feed Version will be created as the latest version for the feed source.
<div class="img-center">
  ![merge feed versions result](../img/merge-feeds-result.png)
</div>

## Merging a Project's Feed Versions
Another feed merge type supported by the application is to merge the latest version for all feed sources in a project. This process only supports a basic "dumb" merge, where all unique identifiers from the input feeds will be feed-scoped. In other words, a `stop_id` value of `12345` in an AC Transit input feed, will appear as `AC_12345` in the output feed (this prefix may differ in practice). Also, the regional merge currently makes no attempt to merge stop entities from different feeds based on location.

A regional merge can be performed by clicking `Actions > Merge all` on the project view (list of feed sources). This may take some time depending on the number and size of feeds in the project and is not recommended for projects with a large number of very large feeds.
