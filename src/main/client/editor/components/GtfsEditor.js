import React, {Component, PropTypes} from 'react'
import Sidebar from 'react-sidebar'
import { Grid, Row, Col, Button, Glyphicon, PageHeader, Nav, NavItem, Tooltip, OverlayTrigger } from 'react-bootstrap'
import { browserHistory, Link } from 'react-router'
import CurrentStatusMessage from '../../common/containers/CurrentStatusMessage'
import { shallowEqual } from 'react-pure-render'
import { LinkContainer } from 'react-router-bootstrap'
import {Icon} from 'react-fa'

import ManagerPage from '../../common/components/ManagerPage'
import GtfsTable from './GtfsTable'
import EditorMap from './EditorMap'
import RouteEditor from './RouteEditor'
import EntityList from './EntityList'
import EntityDetails from './EntityDetails'
// import StopEditor from './StopEditor'
import CalendarList from './CalendarList'
// import FareEditor from './FareEditor'
import TimetableEditor from './TimetableEditor'
import { gtfsIcons } from '../util/gtfs'

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
  // shouldComponentUpdate (nextProps) {
  //   return true
  // }
  componentDidUpdate (prevProps) {
    // console.log(prevProps, this.props)
    this.props.onComponentUpdate(prevProps, this.props)
  }
  componentWillReceiveProps (nextProps) {
    // clear GTFS content if feedSource changes (i.e., user switches feed sources)
    if (nextProps.feedSourceId !== this.props.feedSourceId) {
      this.props.clearGtfsContent()
      this.props.onComponentMount(nextProps)
      dispatch(getGtfsTable('calendar', feedSourceId))
    }
    // fetch table if it doesn't exist already and user changes tabs
    if (nextProps.activeComponent !== this.props.activeComponent && !nextProps.tableData[nextProps.activeComponent]) {
      // console.log('getting table: ' + nextProps.activeComponent)
      // console.log(nextProps.feedSource, this.props.feedSource)
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
    // fetch sub component if sub component changes
    if (nextProps.subComponent && nextProps.subComponent !== this.props.subComponent) {
      // console.log('getting subComponent: ' + nextProps.subComponent)
      // console.log(nextProps.feedSource, this.props.feedSource)
      switch (nextProps.subComponent) {
        case 'trippattern':
          if (nextProps.activeEntity)
            this.props.fetchTripPatternsForRoute(nextProps.feedSource.id, nextProps.activeEntity.id)
          // .then((tripPatterns) => {
          //   if
          // })
          break
      }
    }
    // fetch required sub component entities if active sub entity changes
    if (nextProps.subComponent && nextProps.activeSubEntity && !shallowEqual(nextProps.activeSubEntity, this.props.activeSubEntity)) {
      switch (nextProps.subComponent) {
        case 'trippattern':
          this.props.fetchStopsForTripPattern(nextProps.feedSource.id, nextProps.activeSubEntity)
          break
      }
    }
    // fetch sub component if sub sub component changes
    if (nextProps.subSubComponent && nextProps.subSubComponent !== this.props.subSubComponent) {
      console.log('getting subSubComponent: ' + nextProps.subSubComponent)
      console.log(nextProps.feedSource, this.props.feedSource)
      switch (nextProps.subSubComponent) {
        case 'timetable':
          // TODO: fetch calendars?
          // this.props.fetchTripPatternsForRoute(nextProps.feedSource.id, nextProps.activeEntity.id)
          // .then((tripPatterns) => {
          //   if
          // })
          break
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

  render () {
    // if(!this.props.feedSource) return null
    const feedSource = this.props.feedSource
    const activeComponent = this.props.activeComponent
    const editingIsDisabled = this.props.feedSource ? !this.props.user.permissions.hasFeedPermission(this.props.feedSource.projectId, this.props.feedSource.id, 'edit-gtfs') : true

    // const buttonStyle = {
    //   display: 'block',
    //   width: '100%'
    // }

    let navItemStyle = {

    }
    let navWidth = 54
    let navLinkStyle = {
      color: 'black'
    }
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
    let sidebarItems = [
      {
        id: 'back',
        icon: 'reply',
        title: 'Back to feed source'
      },
      ...gtfsIcons
    ]
    let listWidth = 200
    let detailsWidth = 300
    let sidebarContent = <Nav stacked bsStyle='pills' activeKey={this.props.activeComponent}>
                            {sidebarItems.map(item => (
                              <OverlayTrigger placement='right' overlay={<Tooltip id={`${item.id}-tooltip`}>{item.title}</Tooltip>}>
                                <NavItem
                                  active={this.props.activeComponent === item.id || this.props.activeComponent === 'scheduleexception' && item.id === 'calendar'}
                                  href={item.id}
                                  key={item.id}
                                  className='text-center'
                                  style={navLinkStyle}
                                  title={item.title}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    if (item.id === 'back') {
                                      browserHistory.push(`/feed/${feedSource.id}`)
                                    }
                                    else if (this.props.activeComponent === item.id) {
                                      browserHistory.push(`/feed/${feedSource.id}/edit/`)
                                    }
                                    else {
                                      this.props.setActiveEntity(feedSource.id, item.id)
                                      // browserHistory.push(`/feed/${feedSource.id}/edit/${item.id}`)
                                    }
                                  }}
                                >
                                  <Icon name={item.icon} fixedWidth={true} size='lg' />
                                </NavItem>
                              </OverlayTrigger>
                            ))}
                        </Nav>
    return (
      <div>
      <Sidebar
        sidebar={sidebarContent}
        docked={true}
        shadow={false}
      >
        {this.props.subSubComponent === 'timetable'
          ? <TimetableEditor
              feedSource={feedSource}
              route={this.props.activeEntity}
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
              detailsWidth={detailsWidth}
              {...this.props}
            />
          : this.props.activeComponent
          ? <EntityList
              listWidth={listWidth}
              stops={this.props.tableData.stop}
              {...this.props}
            />
          : null
        }
        <EditorMap
          offset={this.props.activeComponent === 'feedinfo'
            ? detailsWidth
            : this.props.activeEntity
            ? listWidth + detailsWidth
            : this.props.activeComponent
            ? listWidth
            : 0
          }
          hidden={this.props.subSubComponent === 'timetable'}
          stops={this.props.tableData.stop || []}
          {...this.props}
        />
        <ActiveFeedInfoPanel
          feedSource={this.props.feedSource}
          feedInfo={this.props.feedInfo}
        />
      </Sidebar>
      <CurrentStatusMessage />
      </div>
    )
  }
}
