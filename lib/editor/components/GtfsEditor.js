import React, {Component, PropTypes} from 'react'

import CurrentStatusMessage from '../../common/containers/CurrentStatusMessage'
import ConfirmModal from '../../common/components/ConfirmModal'
import Title from '../../common/components/Title'
import CurrentStatusModal from '../../common/containers/CurrentStatusModal'
import EditorMap from './map/EditorMap'
import EditorHelpModal from './EditorHelpModal'
import EditorSidebar from './EditorSidebar'
import ActiveEntityList from '../containers/ActiveEntityList'
import EntityDetails from './EntityDetails'
import ActiveTimetableEditor from '../containers/ActiveTimetableEditor'
import ActiveFeedInfoPanel from '../containers/ActiveFeedInfoPanel'

import {getConfigProperty} from '../../common/util/config'
import {getEntityName, getTableById} from '../util/gtfs'
import {GTFS_ICONS} from '../util/ui'

export default class GtfsEditor extends Component {
  static propTypes = {
    currentTable: PropTypes.string,
    feedSourceId: PropTypes.string,
    feedSource: PropTypes.object,
    project: PropTypes.object,
    user: PropTypes.object,
    tableData: PropTypes.object,
    feedInfo: PropTypes.object,
    mapState: PropTypes.object,

    entities: PropTypes.array,

    onComponentMount: PropTypes.func,
    onComponentUpdate: PropTypes.func,
    clearGtfsContent: PropTypes.func,
    fetchTripPatternsForRoute: PropTypes.func,
    fetchTripsForCalendar: PropTypes.func,
    saveTripsForCalendar: PropTypes.func,
    deleteTripsForCalendar: PropTypes.func,
    setActiveEntity: PropTypes.func,
    updateActiveEntity: PropTypes.func,
    saveActiveEntity: PropTypes.func,
    resetActiveEntity: PropTypes.func,
    deleteEntity: PropTypes.func,
    cloneEntity: PropTypes.func,
    newGtfsEntity: PropTypes.func,
    setTutorialHidden: PropTypes.func,

    sidebarExpanded: PropTypes.bool,

    activeEntity: PropTypes.object,
    activeEntityId: PropTypes.number,
    subEntity: PropTypes.number,
    activeSubSubEntity: PropTypes.string,
    activeComponent: PropTypes.string,
    subSubComponent: PropTypes.string
  }

  state = {
    activeTableId: this.props.currentTable
  }

  componentWillMount () {
    // Wipe any leftover state that may exist for other feed sources in editor.
    // NOTE: Clear GTFS content happens outside of onComponentMount function so
    // that it is only ever called on mount (onComponentMount is called after
    // a successful snapshot/import when starting from scratch).
    this.props.clearGtfsContent()
    this.props.onComponentMount(this.props)
  }

  componentCleanUp = () => {
    // When the user exits the editor, remove the lock on the editor feed resource.
    this.props.removeEditorLock(this.props.feedSourceId)
  }

  componentDidMount () {
    // If the browser window/tab is closed, the componnent does not have a chance
    // to run componentWillUnmount. This event listener runs clean up in those
    // cases.
    window.addEventListener('beforeunload', this.componentCleanUp)
  }

  componentWillUnmount () {
    // Run component clean-up
    // console.log('componnent is unmounting')
    this.componentCleanUp()
    // And remove the event handler for normal unmounting
    window.removeEventListener('beforeunload', this.componentCleanUp)
  }

  componentDidUpdate (prevProps) {
    // handles back button
    this.props.onComponentUpdate(prevProps, this.props)
  }

  // FIXME: needs to be updated for GraphQL
  componentWillReceiveProps (nextProps) {
    // clear GTFS content if feedSource changes (i.e., user switches feed sources)
    if (nextProps.feedSourceId !== this.props.feedSourceId) {
      this.props.clearGtfsContent()
      this.props.onComponentMount(nextProps)
    }
    if (
      nextProps.subSubComponent && // timetable is active
      nextProps.activeEntity && // a pattern is active
      nextProps.activeSubSubEntity && // a calendar is selected
      !nextProps.timetableStatus.fetched && !nextProps.timetableStatus.fetching // trips have not been fetched
    ) {
      // If timetable is active and a calendar is selected and the calendar ID
      // does not match the previous ID, fetch trips.
      switch (nextProps.subSubComponent) {
        case 'timetable':
          // FIXME: Fix multiple requests issue
          const pattern = nextProps.activeEntity.tripPatterns && nextProps.activeEntity.tripPatterns.find(p => p.id === +nextProps.subEntityId)
          // fetch trips if they haven't been fetched
          if (pattern && !pattern[nextProps.activeSubSubEntity]) {
            this.props.fetchTripsForCalendar(nextProps.feedSource.id, pattern, nextProps.activeSubSubEntity)
          }
          break
      }
    }
  }

  showConfirmModal = (props) => {
    this.refs.confirmModal.open(props)
  }

  getEditorTitle () {
    const {activeComponent, activeEntity} = this.props
    let title = `${getConfigProperty('application.title')} - GTFS Editor`
    if (activeEntity) {
      title += ` - ${getEntityName(activeEntity)}`
    } else if (activeComponent) {
      const icon = GTFS_ICONS.find(i => i.id === activeComponent)
      title += ` - ${icon ? icon.label : 'unknown'}`
    }
    return title
  }

  getMapOffset (activeComponent, dWidth, activeEntityId, lWidth) {
    return activeComponent === 'feedinfo'
      ? dWidth
      : activeEntityId
      ? lWidth + dWidth
      : activeComponent
      ? lWidth
      : 0
  }

  _getGtfsEntity = (type, id) => {
    return this.props.entities.find(ent => ent.id === id)
  }

  _getGtfsEntityIndex = (type, id) => {
    return this.props.entities.findIndex(ent => ent.id === id)
  }

  render () {
    const {
      feedSource,
      user,
      createSnapshot,
      loadFeedVersionForEditing,
      activeEntityId,
      tableData,
      entities,
      activeComponent,
      sidebarExpanded,
      feedInfo,
      feedIsLocked,
      setActiveEntity,
      subSubComponent,
      activeEntity,
      subEntityId,
      activeSubSubEntity,
      deleteEntity,
      updateActiveEntity,
      resetActiveEntity,
      saveActiveEntity,
      fetchTripsForCalendar,
      updateCellValue,
      cloneEntity,
      newGtfsEntity,
      mapState,
      hideTutorial,
      status,
      setTutorialHidden,
      project
    } = this.props
    let editingIsDisabled = true
    if (feedSource) {
      // FIXME: warn user if they don't have edit privileges
      const {id, name, projectId, organizationId} = feedSource
      editingIsDisabled = !user.permissions.hasFeedPermission(organizationId, projectId, id, 'edit-gtfs') ||
        feedIsLocked
      editingIsDisabled && console.warn(`User does not have permission to edit GTFS for ${name}.`)
    }
    const LIST_WIDTH = 220
    const stops = getTableById(tableData, 'stop')
    const DETAILS_WIDTH = 300
    const entityDetails = activeEntityId
      ? <EntityDetails
        width={DETAILS_WIDTH}
        key='entity-details'
        offset={LIST_WIDTH}
        stops={stops}
        showConfirmModal={this.showConfirmModal}
        {...this.props}
        getGtfsEntity={this._getGtfsEntity}
        getGtfsEntityIndex={this._getGtfsEntityIndex} />
      : null
    return (
      <div>
        <Title>{this.getEditorTitle()}</Title>
        <EditorSidebar
          activeComponent={activeComponent}
          editingIsDisabled={editingIsDisabled}
          expanded={sidebarExpanded}
          feedSource={feedSource}
          setActiveEntity={setActiveEntity} />
        {status.showEditorModal
          ? <EditorHelpModal
            show
            isNewFeed
            feedSource={feedSource}
            status={status}
            loadFeedVersionForEditing={loadFeedVersionForEditing}
            onComponentMount={this.props.onComponentMount}
            createSnapshot={createSnapshot}
            setTutorialHidden={setTutorialHidden} />
          : null
        }
        <div style={{
          position: 'fixed',
          left: sidebarExpanded ? 130 : 50,
          bottom: 0,
          right: 0,
          minHeight: '500px',
          top: 0}}>
          {subSubComponent === 'timetable' // && activeEntity
            ? <ActiveTimetableEditor
              feedSource={feedSource}
              route={activeEntity}
              showConfirmModal={this.showConfirmModal}
              activePatternId={subEntityId}
              activeScheduleId={activeSubSubEntity}
              setActiveEntity={setActiveEntity}
              tableData={tableData}
              deleteEntity={deleteEntity}
              updateActiveEntity={updateActiveEntity}
              resetActiveEntity={resetActiveEntity}
              saveActiveEntity={saveActiveEntity}
              fetchTripsForCalendar={fetchTripsForCalendar}
              sidebarExpanded={sidebarExpanded}
              updateCellValue={updateCellValue} />
            : activeComponent === 'feedinfo'
            ? <EntityDetails
              width={DETAILS_WIDTH}
              {...this.props} />
            : activeComponent
            ? [
              <ActiveEntityList
                width={LIST_WIDTH}
                setActiveEntity={setActiveEntity}
                cloneEntity={cloneEntity}
                updateActiveEntity={updateActiveEntity}
                deleteEntity={deleteEntity}
                newGtfsEntity={newGtfsEntity}
                showConfirmModal={this.showConfirmModal}
                // FIXME: remove entities because list of entities is determined
                // in selector
                entities={entities}
                activeEntityId={activeEntityId}
                activeComponent={activeComponent}
                feedSource={feedSource}
                key='entity-list' />,
              entityDetails
            ]
            : null
          }
          <EditorMap
            offset={this.getMapOffset(activeComponent, DETAILS_WIDTH, activeEntityId, LIST_WIDTH)}
            hidden={subSubComponent === 'timetable'}
            stops={stops}
            showConfirmModal={this.showConfirmModal}
            drawStops={mapState.zoom > 14}
            zoomToTarget={mapState.target}
            sidebarExpanded={sidebarExpanded}
            {...this.props} />
          {!activeComponent && !hideTutorial && getConfigProperty('application.dev')
            ? <EditorHelpModal
              show
              setTutorialHidden={setTutorialHidden} />
            : null
          }
          <ActiveFeedInfoPanel
            feedSource={feedSource}
            project={project}
            showConfirmModal={this.showConfirmModal}
            setActiveEntity={setActiveEntity}
            feedInfo={feedInfo} />
        </div>
        <CurrentStatusMessage />
        <ConfirmModal ref='confirmModal' />
        <CurrentStatusModal ref='statusModal' />
      </div>
    )
  }
}
