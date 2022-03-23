# CHANGELOG
----------------------
 * feat: generate changelog
 * feat(Timetable Validation): Fix timetable previous stop time checks from checking text columns.
 * feat(valhalla): allow graphhopper to avoid road classes
 * feat(config.js): Add "includes" to allow pl to match "pl-PL" lang code
 * fix(PatternStopCard): Display null continuous_pickup as 1 (no continuous pickup)
 * feat(RouteTypeSelect): Add route type selector with new extended GTFS route types.
 * fix(TimetableEditor): Add continuousPickup and Dropoff values to StopTimes object
 * test(SnapshotModal): fix e2e test
 * fix(CreateFeedSource): Initialize autoPublish state (suppress un/controlled input warning).
 * chore(CreateSnapshotModal): fix import order
 * fix(FeedSourceSettings): Fix unresponsive tab selection.
 * fix(editor/util/gtfs): include route_desc in entity name
 * chore(TransformationsViewer): pr fixes
 * refactor(editor): PR fixes pt 2
 * feature(FeedVersionViewer): Add summary of transformations applied to feed version.
 * feature(editor): confirmation box in save snapshot dialog for unapproved routes
 * feature(editor): set route status to in progress on edit
 * feat(auto-publish): Add auto-publish support (MTC ext. req'd)
 * feature(FeedVersionViewer): Add summary of transformations applied to feed version.
 * fix(gtfsplus): trim extra spaces from fields
 * feature(editor): confirmation box in save snapshot dialog for unapproved routes
 * feature(editor): set route status to in progress on edit
 * feat(i18n): add polish langauge
 * feat(pelias): move webhook URL to project
 * feat(PeliasPanel): support dropping pelias db
 * fix(EntityListButton): Fix `New Exception` button formatting
 * fix(PeliasPanel): support windows csv mime type
 * fix(saveEntity, saveTripsForCalendar): Resolve missing defaults with GTFS spec change
 * fix(actions/manager/deployments): Suggest zip name based on deployment name.
 * fix(LabelEditor): show admin-only checkbox to project admins
 * revert: remove project webhook assistance feature
 * refactor(NoteForm): fix issue with checkbox interference
 * feat(notes): add optional admin-only visibility for notes
 * refactor: fix flow types
 * refactor: fix flow
 * refactor(PeliasPanel): clean up and fix project default url feature
 * refactor: type fixes, update tests
 * refactor(FeedLabel): fix flexbox weirdness, improve html syntax
 * test: fix tests
 * feat(DeploymentViewer): add custom geocoder settings panel
 * refactor: fix flow
 * fix(index.js): Add status=500 context
 * feat(ProjectFeedListToolbar): allow user to and/or filter labels
 * feat(ProjectFeedListToolbar): allow filtering by label
 * fix(FeedLabel): further permission checks
 * refactor: add/fix flow types
 * feat(FeedSourceTableRow): add label assigner to feed sources
 * feat(ProjectSettingsForm): add project labels
 * feat(Labels): add label assigner
 * fix(feeds.js): format labels to be supported by server
 * feat(Labels): create new labels
 * feat(Labels): add label descriptions
 * feat(Labels): add label editor
 * feat(Label): add edit and delete button to labels
 * feat(FeedLabel): denote admin-only label
 * feat(FeedSourceTableRow): show labels of feed source
 * feat(ProjectViewer): show labels in project
 * fix(editor/util/validation): Fix stop name validation.
 * fix(EditorInput.js): Refactored the argument to compare a number with a number
 * fix(lib/types/index.js): Replaced the gtfs field option type from value: syring to value : string |
 * fix(FeedTransformRules): Remove version clone trigger, add gtfs+ trigger.
 * fix(validation.js): Remove ES lint waiver
 * fix(PatternStopCard.js): Attempt to fox flow issue 3
 * fix(PatternStopCard.js): Attempt to fix flow issue again
 * fix(PatternStopCard.js): Attempt to fix flow error
 * fix(PatternSTopCard.js): Fixed prop bug
 * refactor(validation): fix bad invocation of validationIssue
 * refactor(validation): fix stop name message
 * fix(PatternStopCard.js): Fix flow issue
 * fix(NormalizeField): Adjust for changes from backend.
 * fix(SubstitutionRow): Add feedback for invalid substitution patterns.
 * refactor(status): fix inconsistent spacing
 * refactor: fix message quotation
 * refactor(DeploymentTableRow): fix style, use versionCount field
 * fix(FeedTransformation): Revalidate errors if user selects a table for transform.
 * test: fix mock data w type changes
 * refactor(DeploymentTableRow): fix edit permissions
 * feat(gtfs.yml): Added fields to feed_info.txt
 * fix(deps): bump deps in scripts/package.json
 * feat(deployment): add a few things to enable auto-deployments
 * feat(gtfs.yml and validation.js): Updated GTFS Spec for stops.txt and agency.txt
 * fix(deployment): fix type def for tripPlannerVersion
 * fix(deployment): grab deployment that is actively deployed
 * refactor(HomeProjectDropdown.js): Refactor to fix clear error
 * fix(EditorInput.js gtfs.yml): Added missing GTFS Extended Route Types
 * feat(FeedTransformation): Add normalize field transformation
 * test(e2e): fix pattern stop button test id
 * fix(manager/actions/status): Navigate to latest feed ver. after processing complete.
 * ci: fix remaining github env variables
 * refactor: fix broken snapshots/flow
 * ci(gh-actions): fix aws credentials script
 * refactor(DeploymentsPanel): fix imports
 * refactor(deployment): fix broken imports
 * ci(gh-actions): fix pip install of mkdocs
 * ci(gh-actions): fix e2e check script name
 * ci(e2e-check): rename file, fix permissioins
 * refactor(gh-actions): fix syntax error
 * feat: add ability to add custom files for deployments
 * feat(auto-deploy): Add OTP auto-deploy project setting
 * refactor(compare-versions): refactor compare versions feature
 * test(flow): fix data reducer flow type for trip patterns
 * refactor(reducers/data): fix processing of shapes_as_polylines
 * fix(actions/editor.js): request base GTFS with no limits on tables
 * fix(editor-map): handle new gtfs-lib response for encoded polylines
 * fix(EditorMapLayersControl): remove show routes on map
 * feat(feed-fetch): add feed fetch frequency form elements
 * feat(UserList): add users per page selector
 * fix(UserRow): show project permissions summary in label
 * feat(FeedVersionSpanChart): Add chart to compare feed calendar spans.
 * fix(MTC): make SERVICE_WITHOUT_DAYS_OF_WEEK a blocking issue
 * fix(pattern-editor): handle uncaught error and improve add stop by name
 * fix(feedVersion): correctly show all modes in ServicePerModeChart
 * docs: fix bold -> backticks
 * chore: fix lint
 * fix(JobMonitor): replace conveyal support email w/ config value
 * refactor: fix flow def
 * refactor: fix flow typing
 * test(e2e): fix isolated test skipping
 * refactor: fix lint/flow
 * feat(alerts): Add 2 alert effects (MTC)
 * refactor: fix lint
 * fix(pattern-editor): fix computation of pattern stop projection onto shape
 * feat(gtfs-transform): add feed transformation settings
 * fix(user-update): fix user update error introduced in #577
 * refactor: fix lint
 * fix(mapbox-url): update URL for deprecating service
 * test(snapshots): update snapshots, fix lint
 * fix(Deployment): refactor Deployment fields to fix perf issues
 * refactor: fix misspelling
 * fix(PatternEditor): fix pattern name editor bug
 * fix(graphhopper): fix graphhopper handling into segments
 * fix(gtfs+): change rider_category_id from Adult -> Regular
 * fix(editor): fetch exception dates in main GraphQL query
 * fix(EditableCell): Change behavior to save cell contents when losing focus, clicking away etc.
 * test: fix snapshots
 * refactor: fix lint, add latest/oldest buttons
 * refactor: fix merge conflict
 * feat(ApplicationStatus): add admin app status page to view requests/jobs
 * refactor(css): fix extract URL css, add change button
 * refactor: fix lint
 * feat(deployment): add OSM extract settings
 * fix(getGtfsPlusSpec): Move sorting from GtfsPlusVersionSummary to getGtfsPlusSpec().
 * fix(GtfsPlusVersionSummary): Address PR comments
 * fix(GtfsPlusVersionSummary): Tame down changes
 * feat(GtfsPlusVersionSummary): Add GTFS+ validation issue details.
 * fix(gtfs.yml): add more currency types for fares
 * fix(Footer): replace Conveyal with IBI Group
 * refactor: fix flow
 * fix(gtfs+): change rider_category_id from Adult -> Regular
 * refactor: fix lint
 * refactor: fix lint
 * fix(FeedVersionNavigator): reverse version sort; add retrieval method filtering
 * fix(ShowAllRoutesOnMap): fix show all routes; add limit for perf
 * refactor(project): fix func name misspelling and use async/await
 * refactor: fix flow
 * refactor: fix lint
 * feat(snapshot): add option to auto-publish new snapshot as version
 * feat(deploy): add ability to recreate build image
 * feat(deploy): include download link for graph build reports
 * feat(deploy): add fields for deployment customization
 * refactor: fix lint
 * fix(FeedVersionNavigator): ensure version index is set
 * refactor: fix some lint/flow errors
 * fix(FeedVersionTabs): Fix github lint checks
 * fix: Fix issues from PR lint.
 * fix: Remove instances of BsLabel in FeedVersionViewer; bump react-bootstrap to 0.33.
 * feat(version): sort by and show validation error priority
 * fix(editor): re-enable autofocus of editable cell inputs
 * fix: Remove extra space...
 * fix(ServerSettings): add AWS role field to OtpServer
 * feat(Select compared version): User can pick another (older) feed version to compare stats to the se
 * refactor: update to mastarm 5.3.1 and fix resulting linting errors
 * fix(otp-server): make subnet/security group fields optional
 * refactor: fix flow/lint and refactor a bit
 * refactor(flow): fix flow issues
 * Setting up the main document for OTP deployment, featuring a link to another md document and an embedded picture.
 * fix(user-admin): refactor/clean up permission/feed selection
 * test(e2e): add ability to debug isolated tests, fix update project
 * fix(flow): add flow typing to user permission types
 * fix(lint): fix lint and remove + from editor new button
 * fix(watch): makes sure a user's email address is verified before watching
 * refactor(deploy): fix undefined deployJob bug
 * refactor: fix lint
 * fix(FeedSourceSettings): change update to pass the full FeedSource JSON object, fix form
 * test: remove flow fix me; update snapshot
 * refactor: fix lint
 * feat(patch-table): update all rows with a set of fields
 * test(flow): fix some flow errors
 * fix(feed_info): add feed_id to editor
 * refactor(lint): fix whitespace
 * fix(user-admin): remove eTID; filter permissions on module
 * fix(GTFS+): always require GTFS+ yml on config init
 * ci: fix some e2e configuration for Travis environment
 * fix(auth0): ensure user_id is set in user profile
 * test(fix e2e for deploy-to-ec2):
 * test: fix flow, lint, and jest tests
 * fix(app-info): wait for fetch app info until checking user login
 * refactor: fix lint
 * refactor(flow): fix flow type for config
 * refactor(flow): add info to flowfixme
 * refactor: fix lint
 * refactor(PageNotFound): fix default props
 * fix(trips-per-hour): fix frequency processing for trips per hour histograms
 * refactor(flow): fix type def for PageNotFound props
 * fix(project): use common bounds parser and fix DeploymentSettings bounds
 * refactor(flow): fix flow type for PageNotFound
 * refactor: fix lint
 * feat(config): Use the config provided by the back end server
 * refactor(lint): fix lint issues
 * refactor(ServerSettings): fix up server form CRUD
 * test: fix lint/flow errors
 * test: fix lint and update snapshot
 * refactor(gtfs+): minor fixes for GTFS+
 * refactor(branding): fix IBI url
 * test(flow): fix flow issues
 * fix(alerts): fix issue with alert ID type mismatch
 * test(flow): fix flow def for FeedVersion
 * fix(deps): update auth0 in script dependencies for lodash fix
 * test(flow): fix flow errors
 * refactor(flow): add fixme for flow react-redux issues
 * ci(e2e): fix aws logs link
 * ci(e2e): some fixes for environment variable possibilities with MS Teams
 * test(flow): fix flow errors
 * fix(gtfs+): clear gtfs+ state on version change
 * fix bad merge flow types
 * feat(gtfs+): block publication if GTFS+ errors exist
 * fix(GTFS+): add warnings about table- and column-level issues
 * fix(FeedVersionDetails): only show publication message for MTC
 * fix(flow): fix flow issues following merge
 * fix(lint): fix lint issues resulting from merge
 * fix(status): handle clearing of status modal content on close
 * refactor(publish-feed): fix block feed publication
 * fix(status): clear status modal details on mount
 * refactor(publish-feed): fix block feed publication
 * fix(merge-feeds): fix success message for modal
 * fix(validation-issues): fix fetch issues with validation issue count
 * fix(version-publish): fix checks for blocking publication
 * fix(alerts): fix css for stop popup to prevent overflow issues
 * fix: fix lint and flow
 * feat(export-gis): add shapefile export for feed versions
 * feat(project): add ability to download csv of feed source table
 * refactor(merge-feeds): comment out start date check and fix styling
 * feat(merge-feed-versions): add MTC merge feeds type
 * fix(normalize-stop-times): add missing files
 * test(pattern-editor): clean up fixtures/snapshots
 * test(fixtures): replace mapzen fixtures w graphhopper
 * fix(lint): fix lint errors (indentations, unused imports)
 * fix(lint):
 * fix: use route_type to set follow streets
 * build(yarn): bump bootstrap to fix xss vulnerability
 * feat(project): add ability to pin a deployment
 * feat(pattern): add normalize stop times feature
 * fix(lint): remove unused import
 * fix(flow): fix flow typing for project to match server type def
 * fix(lint):
 * feat(alert child stops): add option to add parent station's children
 * feat(project): refactor FeedSourceTable rows to display more relevant info
 * fix(editor): prevent an infinite loop when sorting trips
 * feat(project): add filter buttongroup to ProjectFeedListToolbar
 * feat(project): refactor ProjectFeedListToolbar to allow sorting of feeds
 * test(lint): fix mastarm lint and resulting linting errors
 * fix(lint): fix unused import for create alert button
 * refactor(flow): fix flow typing
 * fix(editor): fix undo button
 * fix(editor): disable sidebar items if base gtfs not fetched
 * fix(flow): fix failing flow
 * fix(pattern-editor): clear out duplicate shape points
 * refactor(pattern-editor): fix shape_id span overflow
 * fix(react): silence react warning about onDeselect prop
 * fix(editor): fix undo button
 * ci: fix check of forked pull requests
 * fix(admin): make sure the status message is cleared when updating users
 * fix(editor): disable sidebar items if base gtfs not fetched
 * test(flow): fix flow errors
 * fix(pattern-editor): fix changing edit mode
 * fix: various flow fixes and refactors for pattern editor
 * fix(pattern-editor): flow fixes and clean up pattern shape splitting
 * feat(pattern-direction): replace arrow icons with svg text path
 * fix(editor): zoom to pattern extents if no shape exists
 * fix(pattern-editor): fix add control point to empty shape
 * refactor: remove fixme comment
 * fix(login): change redirectOnSuccess to string
 * refactor(e2e): fix security issue when killing processes
 * fix: fix editor lock and pattern geom issue
 * ci: fix start-instrumented command
 * refactor: move test-utils back to original spot, some ci fixes
 * fix(gtfs-plus): fix visibility filter
 * fix(gtfs-plus): fix route and stop search for GTFS+ entities
 * fix(gtfs-map): fix error when feeds list for bounds calc is empty
 * fix(gtfsplus): fix GTFS+ route/stop queries to use GraphQL
 * fix(new-alert): fix createAlert call
 * fix(alerts): fix updateActiveEntity func signature
 * fix(deployments): only fetch feed deployments if module enabled
 * fix(home): make homepage load first project on mount
 * fix(version): fix selection of routes and patterns
 * fix(deployments): only fetch feed deployments if module enabled
 * fix(home): make homepage load first project on mount
 * fix(version): fix selection of routes and patterns
 * fix(alerts): fix add/remove agency to gtfs filter
 * test(lint-messages): fix user settings project access messages
 * style(lint): fix lint
 * fix(mtc-feed-publication): use published date to indicate whether a feed is awaiting publication
 * refactor(test): fix e2e tests and update to puppeteer v1.11
 * refactor(various): fix a bunch of stuff that went wrong with a merge
 * refactor(various): fix some things that were causing the e2e tests to fail
 * test(flow): fix flow typing for selector
 * refactor(project-access-settings): rename user project settings component and fix messages
 * fix(alerts): fix alert start/end time validation
 * style(lint): fix lint (unused import)
 * refactor(admin): fix action flow typing in admin components
 * fix(job-monitor): only start continuous job fetch if jobs exist
 * test(flow): fix action imports for some editor actions
 * fix(editor): fix undo button
 * fix(fares): add fare_attributes#agency_id field to match gtfs-lib
 * fix(editor): add validation for POSITIVE_INT and POSITIVE_NUM
 * test(flow): fix a bunch of flow typing
 * chore(fix lint errors):
 * fix(editor): add route_sort_order field to route in gtfs spec
 * fix(gtfs-filter): fix check for toggling a feed on/off
 * fix(alerts): fix visibility filter action
 * fix(alerts): handle bad response for GTFS stops and routes
 * fix(deployments): only fetch feed source deployments if module enabled
 * fix(messages): make messages work with minified builds
 * test(lint): fix lint
 * fix(frequencies): validate frequency fields
 * fix(frequencies): sort trips with frequencies by Frequency#startTime values
 * fix(trip-validation): prevent trip update http requests if trip data is invalid
 * fix(job-monitor): fix removeRetiredJob action in props
 * refactor(flow): fix flow errors
 * test(flow): fix flow type for Loading component props
 * fix(css): use leaflet cdn css (due to marker icon url issue)
 * feature(server-mgmt): manage OTP servers at the application level
 * refactor(project): fix project update
 * feat(feed): add cancel buttons to create project/feed forms
 * refactor(deployment): fix deployment messages
 * test(e2e): fix e2e tests after mastarm update
 * test(etc): fix failing tests after merge
 * fix(auth0): check scoped field for app_metadata if not found in profile
 * refactor(sidebar): fix border on active sidebar item
 * refactor(lint-messages): fix comment about linting for language message differences
 * fix(messages): add some missing messages
 * fix(charts): only show first 500 days of service in charts
 * feat(about): add about app section that includes version info
 * refactor(flow): fix a bunch of stuff so that the e2e tests work again
 * test(lint): fix linting so it actually lints all files
 * fix(leaflet): update leaflet
 * feat(job-status): check for pre-existing server jobs when sidebar mounts
 * fix(user-admin): fix create user bug introduced during flow refactor
 * test(flow): add flow typing to manager actions and fix stuff that broke
 * fix(feeds): handle missing project when fetching project's feed sources
 * test(flow): add flow to remaining components, fix issues introduced by flow
 * refactor(flow): fix some flow typings that broke in reducer typing refactor
 * refactor(misc): fix NPE bug introduced on missing activeProject
 * test(flow): fix lint and add flow to final admin/editor components
 * test(flow): update to latest flow-typings and fix resulting flow errors
 * test(end-to-end): fix remaining inconsistent outcomes with puppeteer
 * test(end-to-end): fix end to end tests
 * test(lint): fix function signature formatting
 * test(flow): fix some flow errors
 * refactor(components): fix a bunch of tag indentation lint errors
 * test(flow): fix flow type for newControlPoint method
 * test(lint): fix lint (and a few flow) issues
 * test(flow): update to flow-bin 0.77 and fix all errors
 * test(flow): fix UserPermissions flow typing
 * fix(timetable): disable special keys while typing text
 * fix(gtfs): fix shape fetch action type in reducer
 * fix(flow): don't ignore auth0-lock module
 * fix(auth0): refactor auth0 to cache profile data to avoid auth0 429 errors
 * refactor(alerts): improve flow coverage, fix style, add comments
 * fix(alerts): fix date validity check bug using moment#isValid
 * style(lint): fix lint
 * fix(timetable): always default to pattern stop index for trip stop sequences
 * build(yarn): fix yarn file so it installs expected packages
 * style(lint): fix some linting errors
 * fix(watch-button): store updated user in state if logged in user is updated
 * style(lint): fix lint (remove unused imports)
 * fix(graphql): use POST-based fetchGraphQL for feed entity fetching
 * fix(pattern-editor): add missing shape ID to pattern on save
 * test(flow): reimport flow separately from mastarm to fix errors
 * fix(deployment): fix target name matching and settings edits check
 * refactor(auth): fix bad import
 * refactor(qc-view): add/fix legends for feed summary histograms
 * test(flow): fix flow typing
 * test(etc): add a missing import, fix lint error
 * fix(qc-view): bump active page if offset is out of sync with page increments
 * fix(qc-view): check bounds validity before updating map state
 * test(qc-view): fix failing tests, update timetable snapshots
 * fix(settings): fix default state and updating state on next props
 * fix(qc-view): clear route/pattern filters on feed version change
 * fix(deployment): only render deployment button if deployment is deployed to server
 * style(settings): fix white-space formatting
 * feat(qc-view): add conditional cell formatting in qc timetable view
 * test(flow): fix obsure flow error
 * feat(feed): add ability to show all routes on map
 * feat(qc): add service hours per mode histogram
 * fix(deployments): add clear button for deployment settings
 * fix(lint): fix flow and unused vars
 * feat(deployment): add deployment subscriptions management
 * refactor(deployment): fix destructuring into versions
 * fix(editor): use distance scale factor to calculated default travel time
 * feat(deployment): add deployment review map, optional config override, and confirm modal
 * test(flow): fix a flow error
 * feat(feed): make trip histogram for pattern list
 * feat(feed): add pagination to route viewer
 * feat(feed): show graph of trips per hour in route list
 * fix(timetable): ensure pattern stops and stop times have zero-based stop_sequence
 * feat(deployment): add watch button for OTP deployments
 * fix(deployment): handle invalid bounds in preview button; add tooltip
 * fix(graphql): use auth for GTFS GraphQL requests
 * fix(download): fix other instances of s3 downloads
 * fix(download): use presigned URL for file downloads
 * feat(feed): add timetable viewer to feed validation
 * fix(region): remove deprecated/erroring regions API call
 * fix(user): Fix bug with saving UI preferences to user metadata
 * fix(pattern): update distance and travel times when pattern is reversed
 * fix(timetable): add arrival/departure times + trip_id to trips sorting
 * feat(timetable): enhance timetable editor keyboard shortcuts + help modal
 * fix(timetable): set trip's shapeId based on pattern shapeId
 * fix(pattern): add deselect function for setting direction_id to null
 * fix(build): replace camel- and snake-case keys libs with custom code
 * fix(timetable): fix multiple fetches for calendar trips bug
 * fix(editor): remove trip patterns from cloned route
 * fix(editor): add min height for entity details header
 * fix(manager): handle invalid bounds in feed version map
 * fix(pattern): improve styling of pattern stop list and scroll bars
 * fix(editor): add missing updatePatternStops function
 * fix(pattern): fix add pattern stop when shape is missing
 * fix(pattern): fix add stop to pattern after fresh fetch
 * style(lint): fix lint
 * fix(manager): restrict view entity details to issues with entity IDs
 * fix(manager): abbreviate project name on user home page
 * fix(editor): only check entity validity if it is not a new entity
 * fix(deployment): fix default value for rt updater
 * fix(timetable): refetch trip counts on trip add/delete
 * fix(timetable): fix calendar selector label/title
 * fix(timetable): update placeholder to show frequency in seconds
 * fix(editor): refetch entities on snapshot restore
 * fix(user): Fix big with saving UI preferences to user metadata
 * fix(accessibility): Fix bug with tab reverting to "summary" on map marker drag
 * fix(notes): use note creator's email in note item
 * fix(validation): indicate entity type for table level validation issues
 * fix(manager): if file arg is null/undefined it cannot be a valid zip file
 * style(lint): fix linting/formatting
 * fix(pattern): major pattern editor fix/refactor
 * fix(manager): Fix "recent activity" styling
 * feat(manager): Fix and expand "recent activity" display
 * fix(manager): Fix console errors on logout
 * feat(manager): Refactor user action buttons to common component
 * feat(manager): Clean up manage-subscription page
 * fix(deployment): temporarily remove elevation bucket field; remove branding url
 * fix(pattern): actually fixes pattern edit undos
 * fix(pattern): always get a new set of control points if there are no shape points
 * fix(pattern): get new set of control points if there are more pattern stops
 * fix(pattern): fix undo pattern editing history and make control point keys unique-er
 * fix(pattern): fix update edit geometry flag when changing patterns for redux-undo
 * feat(manager): Remove dummy notification methods box on Manage Account screen
 * feat(manager): Make username (email address) non-editable in Manage Account screen
 * fix(manager): Fix "recent activity" styling
 * feat(manager): Fix and expand "recent activity" display
 * fix(pattern): do not include unsaved stop as addable stop for patterns
 * fix(manager): refetch validation issues if they are overwritten in next props
 * fix(manager): permit repairing issues in editor in only some cases
 * fix(pattern): do not attempt rendering pattern if each coordinate is not valid
 * fix(pattern): fix height/scroll issue for addable stop dropdown
 * fix(pattern): fix adding stops to pattern behavior
 * fix(editor): fix undo for URL fields that initialize as null
 * fix(pattern): scale shape dist traveled when calc. pattern shape slices
 * fix(editor): fix react error that does not allow tooltip prop on <a>
 * fix(pattern): fix GraphHopper point chunking
 * fix(feed viewer): Reset Feed Viewer to "summary" tab when FeedVersion changes
 * fix(editor): fixes re-initialization of editor when snapshot imported
 * fix(editor): add default route type and color to feed info
 * fix(editor): remove unused default lat/lon feed info fields
 * fix(manager): check ref exists before invoking leaflet methods
 * fix(editor): fix undo for fields with null values
 * style(manager): lint fixes
 * fix(editor): default new stop location to center of bounds (rather than 0,0)
 * fix(editor): handle bad entity and pattern IDs in editor URL
 * fix(editor): fix feed info reset/undo
 * fix(editor): clone exceptions to avoid mutation of store
 * feat(feed viewer): Add various enhancements to feed viewer, including consistency in selected route/
 * fix(validation viewer): Don't show "no validation errors" until we actually get a response
 * fix(feed viewer): Add limit=-1 to show all routes/stops/patterns/shape pts
 * style(lint): fix lint/formatting
 * style(lint): fix lint
 * style(lint): fix lint
 * fix(patterns): fix add stop at click and interval; refactor utils
 * fix(editor): prevent reversing pattern if pattern has trips
 * fix(manager): Fix error with FeedVersion viewer and map. Should fix #86/#87/#88
 * fix(timetable): add pattern/route/calendar grouped trip counts
 * feat(snapshots): Remove concept of "active" snapshot from UI. Fixes #90, #102
 * fix(editor): handle travel time calc for patterns without shapes
 * feat(common): Clean up JobMonitor display and functionality. Addresses #85
 * fix(editor): update pattern geometry when shape is deleted
 * style(lint): fix whitespace on ternaries
 * fix(snapshot): refetch base GTFS if namespace changes (when snapshot restored)
 * fix(editor): fix stop/route select input
 * fix(editor): request zone_id with stops table
 * fix(editor): reset trip pattern edits after error on save
 * fix(editor): fix "scheduleexception" text in delete/duplicate button
 * fix(editor): fix pattern direction icons/text
 * fix(editor): fixes "scheduleexception" misspelling and create stop bug
 * fix(manager): fix note count update for feed source and versions
 * style(lint): fix whitespace and camel_case var names
 * style(lint): fix lint
 * fix(editor): fix view all route alignments on editor map
 * style(lint): fix indentation; remove log statement
 * fix(editor): fix schedule exceptions swap type
 * fix(manager): use file-saver for file downloads
 * fix(editor): fix route#wheelchair_accessible field name/values
 * test(auth0): fix failing auth tests
 * fix(auth): fix auth silent renewal
 * test(auth): fix auth test error with testURL and mock function update
 * fix(auth0): route to '/login' for single callback log on
 * fix(auth0): WIP auth0 update to lock 11, auth0 9
 * fix(editor): fix timepoint checkbox
 * fix(editor): fix entity type checks using field typeof
 * fix(editor): formatting + fix monday selection in exceptions
 * fix(gtfs): fix wheelchair boarding values
 * fix(import): fix capitalization for turf-linestring
 * fix(import): fix capitalization for turf-linestring
 * ci(travis): update python version to fix ssl issue
 * fix(jest): temporarily disable mapzen pattern shape tests
 * style(lint): fix lint and flow
 * fix(patterns): fix pattern geometry update on anchor drag
 * fix(patterns): ensure that control point drag ends in correct loc.
 * fix(editor): fix shape point snapping
 * fix(r5): handle r5 build network job correctly
 * fix(manager): fix on load feed version for editing
 * fix(deployment): disable feed deployment if no versions exist
 * fix(status): fix handling of completed snapshot-related jobs
 * fix(editor): export receiveFeedSource action
 * fix(editor): fetch only required fields for feed info
 * fix(editor): fix fare transfers default value
 * fix(patterns): fix reverse pattern and calculate default travel time
 * fix(patterns): log warning if pattern stop not draggable
 * fix(patterns): fix pattern stop removal segment splice
 * fix(editor): clear editor state on component mount
 * fix(editor): add refetch option to create GTFS entity method
 * fix(editor): update store when gtfs entity saved successfully
 * fix(flow): update control point flow def
 * fix(editor lock): add session id query param to write operations
 * fix(editor): fix new calendar writes
 * fix(editor): fix trip writes for non-frequency based trips
 * fix(editor): fix message on first snapshot creation
 * fix(editor lock): clear GTFS content after lock removal
 * fix(misc): misc sql-editor bug fixes
 * fix(deployments): fix alignment of button dropdown
 * fix(editor): fix start from scratch
 * fix(editor lock): fix locking functionality
 * feat(status): add reload action to status modal
 * fix(messages): fix deployment settings messages
 * add fixme
 * fix(validation): fix check for fatal exception on validation result
 * feat(editor): restrict editing for a feed to a single session
 * fix(editor): fix frequency trip editing for SQL editor
 * fix(editor): fix schedule exceptions for sql editor
 * fix(timetable): check that a time cell isn't a frequency start/end time
 * fix(editor): fix avg speed travel time calculation for pattern stops
 * fix(editor): misc. editor fixes for SQL editor
 * fix(routing): Use GraphHopper for follow streets routing
 * fix(project): fix bounding box project settings form
 * fix(editor): refactor generic actions and fix feed info
 * fix(editor): recalculateSegment -> recalculateShape for tests
 * style(flow): WIP flow fixes
 * fix(editor): update sequence on pattern stop resequencing
 * fix(editor): fix add stops mode
 * style(lint): fix lint
 * style(lint): fix lint
 * feat(patterns): edit pattern geometry segment by segment
 * fix(status): handle create snapshot job finish
 * fix(graphql): fix graphql reducers, more createAction updates
 * feat(validation): render validation errors and referenced entities
 * fix(semantic-release): fix git url to point to catalogueglobal repo (#51)
 * docs(graphql): comments about queries that need fixing in v3.0.x
 * fix(lint): remove unused moment
 * fix(upload-file): add contentType
 * fix(flow): add flow declaration
 * fix(reducer): clean up reducer, changes for feed validation issues
 * fix(manager): update validation errors to use graphql
 * fix(graphql): update graphql queries to use namespace
 * fix(manager): do not request project after fetch
 * fix(manager): do not request feedsource after fetch
 * fix(graphql): update graphql to match new gtfs-api
 * fix(file-upload): Place file uploads directly in request body
 * docs(deployment): fix message about editor/r5 modules
 * fix(editor): allow editing of null stop times
 * feat(app): add google analytics
 * fix(feed-summary): remove flow from trips chart
 * fix(feed-summary): fix tripsPerDate chart to use new validationResult
 * fix(timetables): fix null stoptime in trip sorter
 * test(map): fix failing test
 * feat(timetable): allow ctrl/cmd + up/down to go to top or bottom
 * feat(timetable): allow ctrl or cmd right/left to go to end of sheet
 * fix(gtfsplus): fix rowIndex for new row in new table (0-based, not 1-based)
 * feat(timetable): allow 24+hr HHmm input format
 * feat(editor): better tab handling in timetable grid
 * style(flow): fix return type for constructNewGtfsPlusRow util
 * refactor(lint): fix a small lint error
 * feat(editor): allow tabbing between stop times
 * feat(editor): better left / right keypress behavior
 * fix(gtfsplus): fix rowIndex field name on added row
 * fix(gtfsplus): check for null tableData
 * fix(gtfsplus): fix multiple page rendering/pageCount update and use versionId for GTFS entities
 * fix(gtfs-search): set autoload to false, formatting fixes
 * chore(build): update mastarm and fix lint errors
 * fix(util): fix toSentenceCase imports
 * refactor(flow): fix some flow errors
 * refactor(util): introduce more flow errors and fix em
 * fix(project-settings): fix type for default location lat/lng
 * fix(messages): use messages for FeedInfoPanel
 * refactor(editor): fixes for deleting the last stop...
 * fix(editor): improve pattern shape editing
 * fix(editor): improve pattern shape editing
 * refactor(editor): fixes for deleting the last stop...
 * fix(editor): fix upload of route shapefile for use as visual aid
 * fix(manager): change confirmUpload to arrow func to fix uploading feed
 * refactor(auth): fix root redirect for realz
 * fix(editor): update pattern direction values to reflect A/B values in Java enum
 * fix(fix download merged project feed to use job monitoring):
 * refactor(auth): fix redirect to home after successful login
 * fix(alerts): check for undefined alert description on save
 * fix alerts declaration
 * fix(alerts): ensure no alerts with TRAMS filter are ever encountered
 * fix(alerts): set title and desc to empty strings in case they are null
 * fix(alerts): check for null description before performing find and replace
 * test(jest): fix failing test and linting warning
 * fix(deployments): fix message display
 * fix(FeedSourceTable): fix calendar expiration
 * fix(editor): improve pattern shape editing
 * fix(editor): improve pattern shape editing
 * refactor(login): fix failing test
 * refactor(manager): fix lint error
 * refactor(lodash): hopefully last lodash fix
 * refactor(project): fix lint errors
 * fix(status): add second arg for error message action
 * fix(deployment-settings): fix check for edits, remove console.log
 * fix(deployment-settings): add updater file, gbfs, and sort sourceTypes
 * feat(deployment-settings): refactor + add elevationBucket and updaters
 * fix(editor-stops): fix deletion of pattern stop when shape is null
 * feat(alerts-reducer): filter out TRAMS alerts for MTC
 * fix(modules): use objectPath when accessing MTC props to avoid undefined erros
 * feat(StatusModal): add optional action handler/prop for status modal
 * feat(JobMonitor): add clear completed button
 * fix(EditShapePanel): fix drawing pattern geometry when not following streets
 * fix(editor fields): fix wheelchairBoarding for stops and routes
 * fix(gtfs-api): use post method for long variable lists in graphql queries
 * fix(EditorFeedSourcePanel): disable buttons based on user permissions
 * fix(settings): disable feed source settings tab for non-managers
 * fix(user-mgmt): if datatools permissions not found, set error message
 * fix(settings): prevent access to settings for non-managers
 * fix(follw-streets): fix add extendPatternToPoint to account for followStreets bool
 * fix(ProjectsList): fix project creation/name change
 * feat(alerts): add character limit to alert title and description fields
 * fix(TimetableHeader): move offsetRows to action/reducer; initial work on saveNewTrip
 * fix(PatternStopsLayer): fix undefined patternStop
 * fix(DeploymentsPanel): re-add updateDeployment func for name change in list view
 * fix(DeploymentViewer): fix deployment name change
 * feat(GtfsPlusField): remove case sensitivity for GTFS+ fields
 * fix(gtfs-plus-actions): fix version fetch after publish
 * fix(gtfs-search): fix bad filtering of gtfs-api results due to stop_code mismatch
 * fix(gtfs-filter): fix bug where feeds are not registered in API on first call
 * style(TimetableGrid): fix lint
 * fix(TimetableGrid): fix updating of row header cells when toggle all clicked
 * fix(HeaderCell): fix upating of active status
 * fix(Pattern): fix new pattern bug, fix issue with drag/drop and stop card performance
 * fix(EditorMap): clean up console logs, add tooltip to patterns overlay
 * fix(tripPattern): fix new trip pattern reducer (missing dot)
 * fix(trips): fix editor api url for delete trips
 * fix(agency): add agency_email field
 * fix(ExternalPropertiesTable): fix action parameters and props for updateExternalProperty
 * refactor(FeedVersionViewer): fix text on feed version button
 * fix(package.json): add immutable
 * fix(EntityList): fix proptypes, add Immutable import
 * style(lint): fix linting errors
 * fix hanging line
 * refactor(FeedVersion): fix inline funcs and hanging lines
 * refactor(FeedSource): fix inline funcs and hanging lines
 * fix(FeedVersionDetails): fix date label to use moment for new start/end date format
 * style(TripPatternListControls): fix lint
 * fix(FeedInfoPanel): fix gtfsIcons var name
 * fix(FeedVersionDetails): fix off by one error on feed dates
 * fix(fixes for schedule exception validation):
 * refactor(ScheduleExceptionForm): fix validation for selector use, add validation state
 * refactor(editor-components): fix icons variable name change, more updates for selector usage, style
 * refactor(pattern-editor): change panel style, fix inline functions
 * fix(editor): set status fields on create new route
 * fix(trip): change delete to bulk delete by joined IDs
 * fix(EditorInput): fix format of date field in EditorInput and ExceptionDate to match serialization,
 * fix(snapshot): add feedId to all action URLs
 * fix(feed-download): use aws api to download feeds directly from s3
 * fix(EditSchedulePanel): use OptionButton
 * fix(EditorInput): fix validation state for dropdown
 * fix(EditorInput): fix react warnings on unknown inputType prop
 * fix(editor-validation): fix dropdown, date, day of week validation
 * style(FeedSource): fix lint, fix arrow func
 * fix(FeedSourceSettings): fix missing tab in FeedSourceViewer
 * style(EntityList): fix lint
 * Revert "style(EntityList): fix lint"
 * style(EntityList): fix lint
 * fix(UserAccount): fix map func
 * style(alerts): fix lint
 * fix(app): fix inline functions (and keep routes from being re-rendered)
 * feat(editor-map): add tooltips, refactor inline functions
 * refactor(editor-components): fix inline functions
 * refactor(components): fix inline functions
 * fix(secureFetch): do not throw generic error on 3** status
 * refactor(components): fix inline functions
 * fix(ActiveGtfsEditor): fix removeControlPoint, simplify dispatchToProps
 * fix(project-reducer): check isochrone features before mapping
 * fix(ControlPoint): fix remove control point and remove stop bug
 * fix(actions): fix path for common actions
 * fix(actions): fix bad find/replace for secureFetch
 * style(lint): fix build
 * style(lint): fix build
 * refactor(pattern-editor): fix anon functions, clean up component appearance
 * fix(editor-reducer): sort trip patterns on receive
 * refactor(FeedInfoPanel): anon func fixes
 * fix(style): refactor GtfsFilter so that dropdown scrolls, and add additional style fixes
 * fix(gtfsFilter): check for null feedIds response, clean up mapDispatch
 * feat(editor validation): enhance validation report for editor entities
 * fix(config): add useS3Storage prop to config (for handling feed download action)
 * fix(gtfs.yml): clean up route helpContent
 * feat(secureFetch): handle bad server responses with error message
 * fix(FeedVersionReport): fix momentjs display of minutes
 * fix(AlertsList): make sort and feed filter controlled components
 * fix(i18n): update messages for EditorFeedSourcePanel
 * fix(FeedVersionViewer): fix key warning on version list and size of buttons
 * fix(EditorFeedSourcePanel): fix dom nesting warnings, resort snapshots, use confirmation modals
 * fix(EditorMap): fix tripPatterns for display of route alignments
 * style(lint): fix lint
 * fix(reducer): add revoke_token action case for testing
 * fix(reducer): check project is not null before setting active proejct id
 * fix(FeedVersion): disable edit buttons and alphabetize props
 * fix(status): add missing cases for signs/alerts
 * fix(reducer): check feedSource is not null before setting id
 * fix(signs): fix reducer for signs; refactor so that sign creation disabled until received RTD signs
 * fix(alerts): prevent user from creating new alert until alerts loaded
 * fix(FeedVersionNavigator): hide management functions on public view
 * fix(FareRulesForm): allow fare rules to have route, from/to, and/or contains
 * fix(GtfsFilter): improve labeling of feeds in filter that have not been published
 * fix(EditorMap): fix zoom to feed bounds
 * fix(GtfsPlusTable): add default blank option to GtfsPlus dropdown
 * fix(StopsLayer): remove rbush spatial index in favor of filtering stop lat/lng by bounds
 * fix(autofocus): fix components that need autofocus
 * fix(css): fix leaflet marker images bug
 * fix(GtfsValidationViewer): hide experimental edit button
 * fix(remove strip-bom, minor tweaks):
 * fix(clean file content of any BOMs):
 * fix(gtfsplus): fix react warnings (key, proptypes)
 * fix(reducer-gtfsplus): fix column parsing for gtfsplus csv
 * fix(GtfsPlusVersionSummary): add missing key
 * fix(ExternalProperties): only project admins should be able to modify sensitive AgencyId prop
 * fix(GeneralSettings): warn user before deleting project
 * fix(GtfsFilter): filter searched feeds based on alert/signs privileges
 * fix(ScheduleExceptionForm): better name for "swap"
 * fix(EntityDetails): add right border for cleaner look
 * fix(FareRulesForm): fix bug where route was cleared if checked radio clicked
 * fix(AlertEditor): prevent publish toggle before affectedEntities are added
 * feat(FeedVersion): show loading spinner when version validating
 * fix(gtfs): change order of route types so that most common (bus) is first in dropdown
 * fix(permissions): fix hasFeedPermission bug (missing orgId)
 * fix(StopLayer): fix tile creation
 * fix(ControlPointsLayer): fix toggling of control points
 * refactor(jsx-a11y): Refactor to fix the rest of the jsx errors
 * fix(ControlPoint): fix draggable behavior for leaflet 1.0.x
 * refactor(jsx-a11y): Create a click outside component to simplify colorpicker and fix a a11y warning.
 * fix(leaflet): more leaflet 1.0 fixes
 * fix(leaflet): leaflet 1.0 fixes
 * fix(ProjectViewer): request feeds after third party sync
 * refactor(lint): Run mastarm lint --fix
 * style(EditorInput): fix up propTypes
 * fix(ActiveEntityList): add enterTimetableEditor prop
 * fix(validation): validate lat/lng max/min values in editor
 * fix(EntityDetailsHeader): fix overflow text in entity name
 * feat(EntityList): add Edit Schedules button on calendar list view
 * fix(gtfs.yml): add labels for stop attributes; re-order route types
 * fix(PatternStopPopup): prevent stop from appearing consecutively by disabling all entries where stop
 * fix(PatternStopPopup): fix bug preventing users from adding stops to a pattern in certain non-adjace
 * use semantic-release, fix repo URL
 * fix travis and config
 * remaining fixes for ui-refactor
 * feat(AlertEditor): add more detail to alert editor for mtc
 * fix path for osm storage
 * lint fixes
 * style(client): lint fixes (prefer consts, a11y)
 * fix bad merge
 * fix misc permissions
 * feat(Client): Added concept of organizations to data manager
 * fix reducer import
 * fix(TimetableEditor): fix copy/paste from excel and (now) google sheets
 * fix(TimetableEditor): fix delete trips for unsaved trips
 * fix(PatternStopsPanel): fallback to straight line if valhalla routing fails on snap to street
 * feat(DeploymentViewer): add preview button for testing deployed feeds
 * fix bug with click stop strategy
 * fix(PatternStopCard): fix timepoint saving bug
 * fix lint issue
 * fix create account button showing on enterprise instances
 * fix icon
 * fix validation
 * fix(TimetableEditor): scroll to end when duplicating rows
 * fix(FeedVersionController): fix hashing on upload
 * fix(TransportNetwork): add r5 version into cached transport network name
 * really fix trip saving issue, closes #28
 * feat(DeploymentSettings): add requestLogFile setting to OTP router config
 * fix(Datastore): fix for issue when multiple trip saves are attempted
 * fix(ErrorMessage): inform users when calendars fail to delete, baseline for more improvements to req
 * fix(GTFSEditor): trip pattern undo change button has been fixed
 * fix(DeploymentSettings): add back in deployment config labels
 * add project id folder prefix to saved deployment bundles
 * feat(Deployments): deploy bundles to s3
 * fix(GTFSEditor): change publiclyVisible route field values from 0/1 to true/false
 * feat(TimetableEditor): enhance/clarify trip add/clone/offset behavior
 * fix(TimetableEditor): fix offset for new trips
 * fix(MakePublicJob): remove unused velocity imports
 * feat(Project): publish public feeds to s3 static page
 * fix(PatternsLayer): fix issue with pattern shape rendering
 * fix(TripPatternController): **actually** delete trips for trip pattern when userFreqency value chang
 * fix(TripPatternController): **actually** delete trips for trip pattern when userFreqency value chang
 * style(client): fix linting issues
 * fix(PatternStopCard): partial fix for issue with setting default dwell/travel time
 * fix(EntityDetails): fix bug where component did not update on activePattern change
 * fix(EditorMap): fix entityEdited prop for PatternStopPopup
 * fix(EditorMap): added missing addStopToPattern function to AddableStopsLayer
 * fix(bootstrap-table): bumped version of react-bootstrap-table to fix pagination issue
 * fix(FeedVersionController): fixes issue with uploading feeds
 * style(lint): fix linting issues in js
 * ci(travis): fix node version with nvm
 * fixes to reflect changes in r5
 * fix(auth): fix check login bug where app logs out if token expired
 * fix bug where addRoute button not shown
 * fix deployment creation
 * fix grid width and login handler
 * fix link to project
 * fix faulty login cases
 * fix bs table width issue
 * fix width issue
 * fix sidebar width issue
 * fix floating footer issue
 * bug fix for error fetching alerts
 * fix greater than 24 hr time formatting
 * fix stopTree stop insertion
 * fixed null url bug
 * fix isochrone action import
 * fix TransferPerformance
 * fix s3 missing object errors on metadata props and fixed name of tempFile
 * fix for too-wide icon
 * fix undefined map value
 * fix width for panel
 * fixes for refactor of editor map
 * various refactor/reformatting fixes
 * fixed merged feed export
 * fix log class
 * fix check for s3 on gtfsFile and clean up datastore
 * style(linting, style): major fix towards clean lint
 * fix(manager): move deployment viewer to nest under projectviewer
 * fix(manager): typo in search placeholder on home page
 * fix: fix icon for editabletextfield
 * fix(editor, timetable): allow null input in timetable cell
 * fix(css, timepicker): fixed issue with timepicker being cut off by side pane
 * fix timestamp and user email for feed version
 * final fixes for mastarmify
 * fix(html): Fix index.html to load assets with absolute paths.
 * fix new commits for mastarm
 * fix active snapshot
 * fix null publish of feedsource
 * fix popups
 * various fixes for editor
 * fix save stop and new trip actions
 * fix duplicate log in prompt
 * fix(sidebar): Fix the icon in the sidebar and refactor to use CSS.
 * fix(icons): Fix icon references
 * fix(client): Fix errors caused by migration
 * build(yarn): Add yarn, fix install warnings, and remove npm-shrinkwrap.
 * fix enterprise hidden features
 * fix units for project scheduler
 * fix feedsourceId
 * fix check on upload hash, add publish to external route
 * add publishedVersionId, fix status update for validate, and clean up getLatest
 * refactor, fix proptypes and warnings
 * fix up status update
 * fix gtfs-api for mtc
 * fix deactivate snapshot on process snapshot merge
 * fixed proptype
 * fix halts on feed fetch
 * fix storing latest
 * fix halt code for waiting to deploy
 * fix halts on transport network build
 * fix npe
 * fix feed storage
 * fix validate force skip
 * fix hover issue with modal
 * clean up imports and fix auth0
 * fix page load issues (load feeds on demand)
 * fix code style, only fetch feeds for active project
 * fix up gtfs api to use s3 directory
 * fix NPE in sched exception
 * fix null values in email notification
 * fix user email link to point to gravatar
 * fix clientside exception date validation
 * hide non-enterprise features
 * log/return value fix
 * fix error printing and add sample validate curl request
 * fixed feed filtering on home page and project viewer
 * fix feed upload issue
 * fixed issue with saving active trip pattern
 * fix zip upload issue, thanks @evansiroky
 * fix config get
 * fix feed loading for gtfs api
 * fix issues table
 * package updates for new features
 * add upload shapefile feature
 * fix up offsets and row manipulation in timetable editor
 * fix returns/halts when error encountered for feed fetch
 * use retina and fix route color issue when editing
 * fix gtfsfilter placement
 * fix up formatting
 * fix bug with dropdownbutton (react-bs bump)
 * fixed feed file size/timestamp
 * add getMessage function to fix bad message gets
 * fix issue with eventbus double value
 * fix up permissions checks in controllers
 * fix up user permissions checks
 * fix duplicate trip pattern
 * fix transport network build to use get gtfsfeed
 * formatting fix
 * fix gtfs_api load on fetch bug
 * performance fixes for project viewer
 * fixed sticky footer
 * fix ui sidebar in user metadata
 * fix missing label
 * fix long feed source name
 * fix null name in snapshot
 * fix up load vs from scratch if no snapshots
 * fix up timetable editor to handle frequencies and swap css for cdn src
 * fix lingering JSON.parse bug
 * fix nested sparkpost
 * Bump react-select version (fixes console warning)
 * style fixes, initial hideDepartureTimes
 * update to feedInfo, stopTree building, and other fixes
 * fix up feedinfopanel setactive
 * disabled tabs for non admins and fix up feed source actions
 * use rBush for stopTreeMap and improve performance, feature zooming
 * fix shouldcomponentupdate and disable nav items if feedinfo not found
 * fix up feedId undefined and modify update map state action
 * fix up editor css
 * add react-color shrinkwrap to fix react version issue, along with new packages
 * add confirm modal and fix width bug for EntityDetails
 * fix active entity bug
 * add uploadRoute action; fix missing action bug
 * fixed auth0 app_metadata
 * fixed up public user creation bugs
 * fix formcontrol textareas
 * fixed width prop
 * fixed remaining bootstrap Input issues
 * fixed up EntityList to be dumb component and use react-virtualized FlexTable
 * formatting fix
 * fix bug with marker select
 * fix bootstrap formcontrols for updated bs
 * attempt to fix react-router error messages
 * css fix for select zIndex
 * fix for missing previous/nextVersionId
 * fixed gtfsplus field name capitalization issue
 * fixed incorrect assignment on mtc feed resource
 * fixed edited flag in store
 * fixed set entity action
 * fixed missing components
 * major updates to timetable and pattern editing, map container width fix, updates to bring in scenario editor components
 * fixed fare controller and model
 * schedule exception actions and newGtfsEntity bug fix
 * fixed datatools version, actually bumped gtfs-lib version
 * fixed active alerts to show only published
 * fixed issue with stop_id, cmponent mount optimization
 * fix up fetchProject
 * fix NaN error with leaflet markers
 * fix version index missing bug
 * add s3Prefix for s3 feed storage
 * fix NPE on feed load if feed doesn't exist
 * fix up extension enabled func to check for extensions obj
 * fix up internationalization ui and auto selection
 * fixed gtfs plus new line parsing and added unknown vals for optional fields
 * fix bug with number of versions after deletion
 * fix feed version index to start with 1
 * fix compile issue from snapshot
 * fix snapshot controller migration
 * updates for feed validation, fixes #16
 * a few lingering fixes for editor merge
 * fix subscriptions update for new datatools array
 * fixed Input issue related to react-bootstrap version bump
 * logout/in fixes for login from any url path + logout redirection
 * fixed fitbounds on region select
 * fix public feeds bug (missing mtc config)
 * fixed parsehash for new lock
 * fixed issue with auth0 sso
 * fix validator flag issue
 * fixed update button permissions
 * fixes for MTC including newEntityId additional prop
 * fix redirect issue with login; remove explore page
 * removed blur to fix checkbox bug
 * update webpack to fix chrome warning logs
 * fixed up isochrones and transportnetwork creation
 * fix a number of bugs with pattern and stop searching
 * fix chaining async action
 * fix up project actions returns
 * fixed up fetch projects bug
 * fixes for spark req.body()
 * fixed up fetch actions
 * bug fix for keypress
 * fixed input types for gtfs table editor; added edit gtfs button; enhanced editable text field
 * fixed bad find/replace
 * fix config and imports
 * mass import of files, swap out logging, fix imports
 * final bounds fix
 * fix feedsmap bounds issue
 * fixed null pointer in proje controller
 * fix for nullpointer in projects controller?
 * Manager/Editor integration fixes
 * fix async chaining
 * fixed nullpointer bug in getAllProjects
 * fix number of feeds method
 * fixed no feeds bug and initial bounds setting
 * fix etid permission name
 * fixes for display association
 * added select active project feature
 * fixes to distinguish actions from signs
 * fix use s3 storage conditional
 * fix up project reducer for active
 * fixed up user admin
 * fixed global json for api
 * fixed page reloading with auth
 * quick fix for user admin link
 * fixed ref to manager page
 * fix status message
 * fixed up config
 * Edit project names; fix unstable IDs bug
