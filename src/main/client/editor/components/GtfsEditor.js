import React, {Component, PropTypes} from 'react'
import Helmet from 'react-helmet'
import { shallowEqual } from 'react-pure-render'

import CurrentStatusMessage from '../../common/containers/CurrentStatusMessage'
import ConfirmModal from '../../common/components/ConfirmModal.js'
import CurrentStatusModal from '../../common/containers/CurrentStatusModal'
import EditorMap from './map/EditorMap'
import EditorHelpModal from './EditorHelpModal'
import EditorSidebar from './EditorSidebar'
import ActiveEntityList from '../containers/ActiveEntityList'
import EntityDetails from './EntityDetails'
import ActiveTimetableEditor from '../containers/ActiveTimetableEditor'
import ActiveFeedInfoPanel from '../containers/ActiveFeedInfoPanel'

import { getConfigProperty } from '../../common/util/config'

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
    getGtfsTable: PropTypes.func,
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
    activeEntityId: PropTypes.string,
    subEntityId: PropTypes.string,
    activeSubSubEntity: PropTypes.string,
    activeComponent: PropTypes.string,
    subSubComponent: PropTypes.string
  }
  constructor (props) {
    super(props)

    this.state = {
      activeTableId: this.props.currentTable
    }
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  componentDidUpdate (prevProps) {
    // handles back button
    this.props.onComponentUpdate(prevProps, this.props)
  }
  componentWillReceiveProps (nextProps) {
    // clear GTFS content if feedSource changes (i.e., user switches feed sources)
    if (nextProps.feedSourceId !== this.props.feedSourceId) {
      this.props.clearGtfsContent()
      this.props.onComponentMount(nextProps)
      this.props.getGtfsTable('calendar', this.props.feedSourceId)
    }
    // fetch table if it doesn't exist already and user changes tabs
    if (nextProps.activeComponent && nextProps.activeComponent !== this.props.activeComponent && !nextProps.tableData[nextProps.activeComponent]) {
      this.props.getGtfsTable(nextProps.activeComponent, nextProps.feedSource.id)
    }
    // fetch sub components of active entity on active entity switch (e.g., fetch trip patterns when route changed)
    if (nextProps.activeComponent === 'route' && nextProps.feedSource && nextProps.activeEntity && (!this.props.activeEntity || nextProps.activeEntity.id !== this.props.activeEntity.id)) {
      this.props.fetchTripPatternsForRoute(nextProps.feedSource.id, nextProps.activeEntity.id)
    }
    // fetch required sub sub component entities if active sub entity changes
    if (nextProps.subSubComponent && nextProps.activeSubSubEntity && !shallowEqual(nextProps.activeSubSubEntity, this.props.activeSubSubEntity)) {
      switch (nextProps.subSubComponent) {
        case 'timetable':
          let pattern = nextProps.activeEntity.tripPatterns.find(p => p.id === nextProps.subEntityId)
          // fetch trips if they haven't been fetched
          if (!pattern[nextProps.activeSubSubEntity]) {
            this.props.fetchTripsForCalendar(nextProps.feedSource.id, pattern, nextProps.activeSubSubEntity)
          }
          break
      }
    }
  }

  showConfirmModal (props) {
    this.refs.confirmModal.open(props)
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
  render () {
    const {
      feedSource,
      user,
      activeEntityId,
      tableData,
      entities,
      activeComponent,
      sidebarExpanded,
      feedInfo,
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
      setTutorialHidden,
      project
    } = this.props
    const editingIsDisabled = feedSource ? !user.permissions.hasFeedPermission(feedSource.projectId, feedSource.id, 'edit-gtfs') : true
    if (feedSource && editingIsDisabled) {
      console.log('editing disabled')
      // browserHistory.push(`/feed/${feedSource.id}`)
    }
    let LIST_WIDTH = 220
    let DETAILS_WIDTH = 300
    let entityDetails = activeEntityId
      ? <EntityDetails
        width={DETAILS_WIDTH}
        key='entity-details'
        offset={LIST_WIDTH}
        stops={tableData.stop}
        showConfirmModal={(props) => this.showConfirmModal(props)}
        {...this.props}
        getGtfsEntity={(type, id) => {
          return entities.find(ent => ent.id === id)
        }}
        getGtfsEntityIndex={(type, id) => {
          return entities.findIndex(ent => ent.id === id)
        }} />
      : null
    const defaultTitle = `${getConfigProperty('application.title')}: GTFS Editor`
    return (
      <div>
        <Helmet
          defaultTitle={defaultTitle}
          titleTemplate={`${defaultTitle} - %s`} />
        <EditorSidebar
          activeComponent={activeComponent}
          expanded={sidebarExpanded}
          feedSource={feedSource}
          feedInfo={feedInfo}
          setActiveEntity={setActiveEntity} />
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
              showConfirmModal={(props) => this.showConfirmModal(props)}
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
                showConfirmModal={(props) => this.showConfirmModal(props)}
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
            stops={tableData.stop || []}
            showConfirmModal={(props) => this.showConfirmModal(props)}
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
            showConfirmModal={(props) => this.showConfirmModal(props)}
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
