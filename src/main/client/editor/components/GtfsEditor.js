import React, {Component, PropTypes} from 'react'
import Sidebar from 'react-sidebar'
import { Grid, Row, Col, Button, Glyphicon, PageHeader, Nav, NavItem, Tooltip, OverlayTrigger } from 'react-bootstrap'
import CurrentStatusMessage from '../../common/containers/CurrentStatusMessage'
import { shallowEqual } from 'react-pure-render'
import { LinkContainer } from 'react-router-bootstrap'
import ManagerPage from '../../common/components/ManagerPage'
import GtfsTable from './GtfsTable'
import ConfirmModal from '../../common/components/ConfirmModal.js'
import EditorMap from './EditorMap'
import EditorSidebar from './EditorSidebar'
import RouteEditor from './RouteEditor'
import ActiveEntityList from '../containers/ActiveEntityList'
import EntityDetails from './EntityDetails'
// import StopEditor from './StopEditor'
import CalendarList from './CalendarList'
// import FareEditor from './FareEditor'
import TimetableEditor from './TimetableEditor'

import ActiveFeedInfoPanel from '../containers/ActiveFeedInfoPanel'

export default class GtfsEditor extends Component {

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
    // console.log(prevProps, this.props)
    this.props.onComponentUpdate(prevProps, this.props)
  }
  componentWillReceiveProps (nextProps) {
    // clear GTFS content if feedSource changes (i.e., user switches feed sources)
    if (nextProps.feedSourceId !== this.props.feedSourceId) {
      this.props.clearGtfsContent()
      this.props.onComponentMount(nextProps)
      this.props.getGtfsTable('calendar', feedSourceId)
    }
    // fetch table if it doesn't exist already and user changes tabs
    if (nextProps.activeComponent && nextProps.activeComponent !== this.props.activeComponent && !nextProps.tableData[nextProps.activeComponent]) {
      this.props.getGtfsTable(nextProps.activeComponent, nextProps.feedSource.id)
    }
    // fetch sub components of active entity on active entity switch (e.g., fetch trip patterns when route changed)
    if (nextProps.feedSource && nextProps.activeEntity && (!this.props.activeEntity || nextProps.activeEntity.id !== this.props.activeEntity.id)) {
      // console.log(nextProps.activeComponent)
      // console.log(nextProps.activeEntity, nextProps.activeEntityId)
      if (nextProps.activeComponent === 'route') {
        console.log('getting trip patterns')
        this.props.fetchTripPatternsForRoute(nextProps.feedSource.id, nextProps.activeEntity.id)
      }
    }
    // fetch required sub sub component entities if active sub entity changes
    if (nextProps.subSubComponent && nextProps.activeSubSubEntity && !shallowEqual(nextProps.activeSubSubEntity, this.props.activeSubSubEntity)) {
      switch (nextProps.subSubComponent) {
        case 'timetable':
          console.log(nextProps.activeSubEntity)
          console.log(nextProps.activeSubSubEntity)
          let pattern = nextProps.activeEntity.tripPatterns.find(p => p.id === nextProps.activeSubEntity)
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

  render () {
    // if(!this.props.feedSource) return null
    const feedSource = this.props.feedSource
    const activeComponent = this.props.activeComponent
    const editingIsDisabled = this.props.feedSource ? !this.props.user.permissions.hasFeedPermission(this.props.feedSource.projectId, this.props.feedSource.id, 'edit-gtfs') : true

    let primaryPanelStyle = {
      width: '300px',
      height: '100%',
      position: 'absolute',
      left: '0px',
      zIndex: 99,
      backgroundColor: 'white',
      paddingRight: '5px',
      paddingLeft: '5px'
    }

    let listWidth = 220
    let detailsWidth = 300
    let entityDetails = this.props.activeEntityId
      ? (
          <EntityDetails
            width={detailsWidth}
            key='entity-details'
            offset={listWidth}
            stops={this.props.tableData.stop}
            showConfirmModal={(props) => this.showConfirmModal(props)}
            {...this.props}
            getGtfsEntity={(type, id) => {
              return this.props.entities.find(ent => ent.id === id)
            }}
            getGtfsEntityIndex={(type, id) => {
              return this.props.entities.findIndex(ent => ent.id === id)
            }}
          />
        )
      : null
    return (
      <div>
      <Sidebar
        sidebar={
          <EditorSidebar
            activeComponent={this.props.activeComponent}
            feedSource={this.props.feedSource}
            feedInfo={this.props.feedInfo}
            setActiveEntity={this.props.setActiveEntity}
          />
        }
        styles={{content: {overflow: 'hidden'}}}
        docked={true}
        shadow={false}
      >
        {this.props.subSubComponent === 'timetable'
          ? <TimetableEditor
              feedSource={feedSource}
              route={this.props.activeEntity}
              showConfirmModal={(props) => this.showConfirmModal(props)}
              activePatternId={this.props.activeSubEntity}
              activeScheduleId={this.props.activeSubSubEntity}
              setActiveEntity={this.props.setActiveEntity}
              tableData={this.props.tableData}
              deleteEntity={this.props.deleteEntity}
              updateActiveEntity={this.props.updateActiveEntity}
              resetActiveEntity={this.props.resetActiveEntity}
              saveActiveEntity={this.props.saveActiveEntity}
              saveTripsForCalendar={this.props.saveTripsForCalendar}
              deleteTripsForCalendar={this.props.deleteTripsForCalendar}
            />
          : this.props.activeComponent === 'feedinfo'
          ? <EntityDetails
              width={detailsWidth}
              {...this.props}
            />
          : this.props.activeComponent
          ? [
              <ActiveEntityList
                width={listWidth}
                setActiveEntity={this.props.setActiveEntity}
                cloneEntity={this.props.cloneEntity}
                updateActiveEntity={this.props.updateActiveEntity}
                deleteEntity={this.props.deleteEntity}
                newEntityClicked={this.props.newEntityClicked}
                entities={this.props.entities}
                showConfirmModal={(props) => this.showConfirmModal(props)}
                activeEntityId={this.props.activeEntityId}
                activeComponent={this.props.activeComponent}
                feedSource={this.props.feedSource}
                key='entity-list'
              />
              ,
              entityDetails
            ]
          : null
        }
        <EditorMap
          offset={this.props.activeComponent === 'feedinfo'
            ? detailsWidth
            : this.props.activeEntityId
            ? listWidth + detailsWidth
            : this.props.activeComponent
            ? listWidth
            : 0
          }
          hidden={this.props.subSubComponent === 'timetable'}
          stops={this.props.tableData.stop || []}
          showConfirmModal={(props) => this.showConfirmModal(props)}
          drawStops={this.props.mapState.zoom > 14}
          zoomToTarget={this.props.mapState.target}
          {...this.props}
        />
        <ActiveFeedInfoPanel
          feedSource={this.props.feedSource}
          project={this.props.project}
          setActiveEntity={this.props.setActiveEntity}
          feedInfo={this.props.feedInfo}
        />
      </Sidebar>
      <CurrentStatusMessage />
      <ConfirmModal ref='confirmModal'/>
      </div>
    )
  }
}
