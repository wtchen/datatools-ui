// @flow

import React, {Component} from 'react'
import {Grid, Row, Col, Button, Glyphicon, PageHeader} from 'react-bootstrap'
import JSZip from 'jszip'
import {Link} from 'react-router'

import ManagerPage from '../../common/components/ManagerPage'
import OptionButton from '../../common/components/OptionButton'
import * as editorActions from '../../editor/actions/editor'
import * as gtfsPlusActions from '../actions/gtfsplus'
import {getGtfsPlusSpec} from '../../common/util/config'
import * as feedsActions from '../../manager/actions/feeds'
import type {Props as ContainerProps} from '../containers/ActiveGtfsPlusEditor'
import type {Feed, FeedVersionSummary, GtfsPlusValidation, Project} from '../../types'
import type {ManagerUserState, StatusState} from '../../types/reducers'

import GtfsPlusTable from './GtfsPlusTable'

export type Props = ContainerProps & {
  activeTableId: string,
  addGtfsPlusRow: typeof gtfsPlusActions.addGtfsPlusRow,
  checkLockStatus: typeof editorActions.checkLockStatus,
  currentPage: number,
  deleteGtfsPlusRow: typeof gtfsPlusActions.deleteGtfsPlusRow,
  downloadGtfsPlusFeed: typeof gtfsPlusActions.downloadGtfsPlusFeed,
  errorStatus: StatusState,
  feedIsLocked: boolean,
  feedSource: Feed,
  feedSourceId: string,
  feedVersionId: string,
  feedVersionSummary: FeedVersionSummary,
  fetchFeedSourceAndProject: typeof feedsActions.fetchFeedSourceAndProject,
  gtfsEntityLookup: Object,
  loadGtfsEntities: typeof gtfsPlusActions.loadGtfsEntities,
  lockEditorFeedSource: typeof editorActions.lockEditorFeedSource,
  pageCount: number,
  project: Project,
  receiveGtfsEntities: typeof gtfsPlusActions.receiveGtfsEntities,
  recordsPerPage: number,
  removeEditorLock: typeof editorActions.removeEditorLock,
  removeEditorLockLastGasp: typeof editorActions.removeEditorLockLastGasp,
  setActiveTable: typeof gtfsPlusActions.setActiveTable,
  setCurrentPage: typeof gtfsPlusActions.setCurrentPage,
  setVisibilityFilter: typeof gtfsPlusActions.setVisibilityFilter,
  stopLockTimer: typeof editorActions.stopLockTimer,
  tableData: null | any,
  updateGtfsPlusField: typeof gtfsPlusActions.updateGtfsPlusField,
  uploadGtfsPlusFeed: typeof gtfsPlusActions.uploadGtfsPlusFeed,
  user: ManagerUserState,
  validation: GtfsPlusValidation,
  visibility: string,
  visibleRows: Array<any>
}

/**
 * Figures out the correct event name to use.
 */
function getNormalizedEvent (eventName: string) {
  return window.attachEvent ? `on${eventName}` : eventName
}

export default class GtfsPlusEditor extends Component<Props> {
  GTFS_PLUS_SPEC = getGtfsPlusSpec()

  componentWillMount () {
    const {
      downloadGtfsPlusFeed,
      feedSource,
      feedSourceId,
      feedVersionId,
      fetchFeedSourceAndProject,
      tableData
    } = this.props
    // Fetch feed source (which will also fetch version summaries) and containing project.
    if (!feedSource) fetchFeedSourceAndProject(feedSourceId)
    if (!tableData) downloadGtfsPlusFeed(feedVersionId)
  }

  // USE_FOR_GTFSPLUS_LOCK
  componentCleanUp = () => {
    // When the user exits the editor, as a last-gasp action, remove the editor lock on the feed.
    const { feedSourceId, removeEditorLockLastGasp, stopLockTimer } = this.props
    stopLockTimer()
    removeEditorLockLastGasp(feedSourceId)
  }

  // USE_FOR_GTFSPLUS_LOCK
  onFocus = () => {
    const { checkLockStatus, feedSourceId } = this.props
    // Only claim (back) an editor lock if an editor session (i.e. namespace) has been created.
    checkLockStatus(feedSourceId)
  }

  // USE_FOR_GTFSPLUS_LOCK
  onVisibilityChange = () => {
    const {
      errorStatus,
      feedSourceId,
      lockEditorFeedSource,
      stopLockTimer
    } = this.props
    if (document.visibilityState === 'visible') {
      // If the page is visible/activated again, resume lock check-in,
      // unless a modal prompt is shown or no editor was loaded for this feed.
      if (!errorStatus.modal) {
        lockEditorFeedSource(feedSourceId)
      }
    } else {
      // When the user exits the editor (i.e. switches, closes, or reloads the tab/window,
      // or navigates away using the browser buttons),
      // stop the editor lock timer (don't remove the lock in case the page gets activated again).
      // Note: this case does not cover the user navigating to other datatool views using regular links from the ui,
      //   see componentWillUnmount for that.
      stopLockTimer()
    }
  }

  // USE_FOR_GTFSPLUS_LOCK
  componentDidMount () {
    // If the browser window/tab is closed, the component does not have a chance
    // to run componentWillUnmount. This event listener runs clean up in those
    // cases.
    window.addEventListener(getNormalizedEvent('pagehide'), this.componentCleanUp)

    // Listen to the window focus event so we can check for things like editor lock status right away.
    window.addEventListener(getNormalizedEvent('focus'), this.onFocus)

    // Listen to the page visibilityChange event so we can check for things like editor lock status
    // or pause/resume lock timers right away.
    window.addEventListener(getNormalizedEvent('visibilitychange'), this.onVisibilityChange)
  }

  // USE_FOR_GTFSPLUS_LOCK
  componentWillUnmount () {
    // Run component clean-up
    this.componentCleanUp()
    // And remove the event handlers for normal unmounting
    window.removeEventListener(getNormalizedEvent('pagehide'), this.componentCleanUp)
    window.removeEventListener(getNormalizedEvent('focus'), this.onFocus)
    window.removeEventListener(getNormalizedEvent('visibilitychange'), this.onVisibilityChange)
  }

  // FIXME: needs to be updated for GraphQL
  // USE_FOR_GTFSPLUS_LOCK
  componentWillReceiveProps (nextProps: Props) {
    const {
      feedSourceId,
      removeEditorLock,
      stopLockTimer
    } = this.props
    if (nextProps.feedSourceId !== feedSourceId) {
      // Clear GTFS content if feedSource changes (i.e., user switches feed sources).
      // Remove editor lock.
      removeEditorLock(feedSourceId, false)
      // clearGtfsContent()
      // Re-establish lock for new feed source and fetch GTFS.
      // this._refreshBaseEditorData(nextProps)
    } else if (this.props.feedIsLocked) {
      // The actions below apply if content has been loaded into the GTFS editor.
      if (!nextProps.feedIsLocked) {
        // If user clicked "Re-lock feed",
        // re-establish lock for the feed source and fetch GTFS to resume editing.
        // this._refreshBaseEditorData(nextProps)
      } else {
        // If the user dismissed the "Relock feed" dialog, stop the lock timer and leave the UI disabled.
        // The "Relock feed" modal will reappear next time the user switches back to the tab.
        stopLockTimer()
      }
    }
  }

  save = () => {
    const {
      downloadGtfsPlusFeed,
      feedVersionId,
      tableData,
      uploadGtfsPlusFeed
    } = this.props
    if (!tableData) return
    const zip = new JSZip()

    for (const table of this.GTFS_PLUS_SPEC) {
      if (!(table.id in tableData) || tableData[table.id].length === 0) continue

      let fileContent = ''
      // white the header line
      const fieldNameArr = table.fields.map(field => field['name'])
      fileContent += fieldNameArr.join(',') + '\n'

      // write the data rows
      tableData[table.id].map(rowData => {
        const rowText = fieldNameArr.map(fieldName => {
          return rowData[fieldName] || ''
        }).join(',')
        fileContent += rowText + '\n'
      })

      // add to the zip archive
      zip.file(table.name, fileContent)
    }

    zip.generateAsync({type: 'blob'})
      .then(content => uploadGtfsPlusFeed(feedVersionId, content))
      .then(() => downloadGtfsPlusFeed(feedVersionId))
  }

  _getGtfsEntity = (type: string, id: string) => this.props.gtfsEntityLookup[`${type}_${id}`]

  _newRowsDisplayed = (rows: Array<any>) => {
    const {activeTableId, feedVersionSummary, loadGtfsEntities, validation} = this.props
    if (feedVersionSummary) loadGtfsEntities(activeTableId, rows, feedVersionSummary, validation)
  }

  _selectTable = (activeTableId: string) => this.props.setActiveTable({activeTableId})

  _showHelpClicked = (tableId: string, fieldName: ?string) => {
    const activeTable = this.GTFS_PLUS_SPEC.find(t => t.id === tableId)
    if (!activeTable) {
      console.warn(`Could not locate GTFS+ table with id=${tableId}`)
      return
    }
    const field = activeTable.fields
      .find(f => f.name === fieldName)
    const helpContent = fieldName
      ? field && field.helpContent
      : activeTable.helpContent
    this.refs.page.showInfoModal({
      title: `Help for ${tableId}.txt` + (fieldName ? `: ${fieldName}` : ''),
      body: helpContent || '(No help content found for this field)'
    })
  }

  render () {
    const {
      activeTableId,
      feedSource,
      feedVersionSummary,
      project,
      tableData,
      user,
      validation,
      visibleRows
    } = this.props
    if (!feedSource) return null
    const editingIsDisabled = !user.permissions ||
      !user.permissions.hasFeedPermission(
        feedSource.organizationId,
        feedSource.projectId,
        feedSource.id,
        'edit-gtfs'
      )
    const activeTable = this.GTFS_PLUS_SPEC.find(t => t.id === activeTableId)
    if (!activeTable) {
      console.warn(`Could not locate GTFS+ table with id=${activeTableId}`)
      return null
    }

    return (
      <ManagerPage ref='page'>
        <Grid>
          <Row>
            <Col xs={12}>
              <ul className='breadcrumb'>
                <li><Link to='/'>Explore</Link></li>
                <li><Link to='/project'>Projects</Link></li>
                <li><Link to={`/project/${project.id}`}>{project.name}</Link></li>
                <li><Link to={`/feed/${feedSource.id}/version/${feedVersionSummary.version}/gtfsplus`}>{feedSource.name}</Link></li>
                <li className='active'>Edit GTFS+</li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <PageHeader>Editing GTFS+ for {feedSource.name}
                <Button
                  bsStyle='primary'
                  bsSize='large'
                  disabled={editingIsDisabled}
                  className='pull-right'
                  onClick={this.save}>
                  <Glyphicon glyph='save' /> Save & Revalidate
                </Button>
              </PageHeader>
            </Col>
          </Row>

          <Row>
            <Col xs={2}>
              {tableData && this.GTFS_PLUS_SPEC.map((table, index) => {
                const tableLength = tableData[table.id] && tableData[table.id].length
                return (<p key={index}>
                  <OptionButton
                    active={table.id === activeTableId}
                    key={table.id}
                    className={'gtfsplus-table-button'}
                    style={{color: tableLength ? 'black' : 'grey'}}
                    title={table.id}
                    value={table.id}
                    onClick={this._selectTable}>
                    {validation && (table.id in validation)
                      ? <Glyphicon glyph='alert' style={{ color: 'red', marginRight: '8px' }} />
                      : null
                    }
                    {table.id}
                  </OptionButton>
                </p>)
              })}
            </Col>
            <Col xs={10}>
              <GtfsPlusTable
                {...this.props}
                getGtfsEntity={this._getGtfsEntity}
                newRowsDisplayed={this._newRowsDisplayed}
                ref='activeTable'
                rows={visibleRows}
                showHelpClicked={this._showHelpClicked}
                table={activeTable}
                tableValidation={validation[activeTable.id] || []} />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
