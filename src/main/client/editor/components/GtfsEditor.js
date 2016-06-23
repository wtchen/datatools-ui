import React, {Component, PropTypes} from 'react'
import Sidebar from 'react-sidebar'
import { Grid, Row, Col, Button, Glyphicon, PageHeader, Nav, NavItem } from 'react-bootstrap'
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
// import StopEditor from './StopEditor'
import CalendarList from './CalendarList'
// import FareEditor from './FareEditor'
import TimetableEditor from './TimetableEditor'

import FeedInfoPanel from './FeedInfoPanel'

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

  componentWillReceiveProps (nextProps) {
    console.log(this.props)
    console.log(nextProps)
    // clear GTFS content if feedSource changes (i.e., user switches feed sources)
    if (nextProps.feedSourceId !== this.props.feedSourceId) {
      this.props.clearGtfsContent()
      this.props.onComponentMount(nextProps)
      dispatch(getGtfsTable('calendar', feedSourceId))
    }
    // fetch table if it doesn't exist already and user changes tabs
    if (nextProps.activeComponent !== this.props.activeComponent && !nextProps.tableData[nextProps.activeComponent]) {
      console.log('getting table: ' + nextProps.activeComponent)
      console.log(nextProps.feedSource, this.props.feedSource)
      this.props.getGtfsTable(nextProps.activeComponent, nextProps.feedSource.id)
    }
    // fetch sub components of active entity on active entity switch (e.g., fetch trip patterns when route changed)
    if (nextProps.feedSource && nextProps.activeEntity && (!this.props.activeEntity || nextProps.activeEntity.id !== this.props.activeEntity.id)) {
      console.log('getting trip patterns')
      if (nextProps.activeComponent === 'route') {
        this.props.fetchTripPatternsForRoute(nextProps.feedSource.id, nextProps.activeEntity.id)
      }
    }
    // fetch sub component if sub component changes
    if (nextProps.subComponent && nextProps.subComponent !== this.props.subComponent) {
      console.log('getting subComponent: ' + nextProps.subComponent)
      console.log(nextProps.feedSource, this.props.feedSource)
      switch (nextProps.subComponent) {
        case 'trippattern':
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
          this.props.fetchTripsForCalendar(nextProps.feedSource.id, pattern, nextProps.activeSubSubEntity)
          break
      }
    }
  }

  save () {
    const zip = new JSZip()

    for(const table of DT_CONFIG.modules.editor.spec) {
      if(!(table.id in this.props.tableData) || this.props.tableData[table.id].length === 0) continue

      let fileContent = ''
      // white the header line
      const fieldNameArr = table.fields.map(field => field['name'])
      fileContent += fieldNameArr.join(',') + '\n'

      // write the data rows
      var dataRows = this.props.tableData[table.id].map(rowData => {
        const rowText = fieldNameArr.map(fieldName => {
          return rowData[fieldName] || ''
        }).join(',')
        fileContent += rowText + '\n'
      })

      // add to the zip archive
      zip.file(table.name, fileContent)
    }

    zip.generateAsync({type:"blob"}).then((content) => {
      this.props.feedSaved(content)
    })
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
    let navWidth = '49px'
    let navLinkStyle = {
      width: navWidth,
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
        id: 'agency',
        icon: 'building',
        title: 'Edit agencies'
      },
      {
        id: 'route',
        icon: 'bus',
        title: 'Edit routes'
      },
      {
        id: 'stop',
        icon: 'map-marker',
        title: 'Edit stops'
      },
      {
        id: 'calendar',
        icon: 'calendar',
        title: 'Edit calendars'
      },
      {
        id: 'fare',
        icon: 'usd',
        title: 'Edit fares'
      },
      // {
      //   id: 'timetable',
      //   icon: 'table',
      //   title: 'Edit timetables'
      // },
    ]
    let sidebarContent = <Nav stacked bsStyle='pills' activeKey={this.props.activeComponent}>
                            <NavItem
                              className='text-center'
                              style={navLinkStyle}
                              title={`Back to feed source`}
                              onClick={(e) => {
                                e.preventDefault()
                                browserHistory.push(`/feed/${feedSource.id}`)
                              }}
                            ><Icon name='reply' size='lg' /></NavItem>
                            {sidebarItems.map(item => (
                              <NavItem
                                active={this.props.activeComponent === item.id || this.props.activeComponent === 'scheduleexception' && item.id === 'calendar'}
                                href={item.id}
                                key={item.id}
                                className='text-center'
                                style={navLinkStyle}
                                title={item.title}
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (this.props.activeComponent === item.id) {
                                    browserHistory.push(`/feed/${feedSource.id}/edit/`)
                                  }
                                  else {
                                    this.props.setActiveEntity(feedSource.id, item.id)
                                    // browserHistory.push(`/feed/${feedSource.id}/edit/${item.id}`)
                                  }
                                }}
                              ><Icon name={item.icon} size='lg' /></NavItem>
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
            />
          // : this.props.activeComponent === 'calendar' || this.props.activeComponent === 'scheduleexception'
          // ? <CalendarList
          //     tableView={this.props.tableView}
          //     activeComponent={this.props.activeComponent}
          //     subComponent={this.props.subComponent}
          //     subSubComponent={this.props.subSubComponent}
          //     activeSubEntity={this.props.activeSubEntity}
          //     activeSubSubEntity={this.props.activeSubSubEntity}
          //     entity={this.props.activeEntity}
          //     entities={this.props.tableData[this.props.activeComponent]}
          //     setActiveEntity={this.props.setActiveEntity}
          //     newEntityClicked={this.props.newEntityClicked}
          //     deleteEntity={this.props.deleteEntity}
          //     updateActiveEntity={this.props.updateActiveEntity}
          //     saveActiveEntity={this.props.saveActiveEntity}
          //     entityEdited={this.props.entityEdited}
          //     feedSource={feedSource}
          //     newRowsDisplayed={this.props.newRowsDisplayed}
          //     stops={this.props.tableData.stop || []}
          //     tableData={this.props.tableData}
          //   />
          // : this.props.activeComponent === 'timetable'
          // ? <TimetableEditor
          //     tableView={this.props.tableView}
          //     activeComponent={this.props.activeComponent}
          //     subComponent={this.props.subComponent}
          //     subSubComponent={this.props.subSubComponent}
          //     activeSubEntity={this.props.activeSubEntity}
          //     activeSubSubEntity={this.props.activeSubSubEntity}
          //     entity={this.props.activeEntity}
          //     entities={this.props.tableData[this.props.activeComponent]}
          //     setActiveEntity={this.props.setActiveEntity}
          //     newEntityClicked={this.props.newEntityClicked}
          //     deleteEntity={this.props.deleteEntity}
          //     updateActiveEntity={this.props.updateActiveEntity}
          //     saveActiveEntity={this.props.saveActiveEntity}
          //     entityEdited={this.props.entityEdited}
          //     feedSource={feedSource}
          //     newRowsDisplayed={this.props.newRowsDisplayed}
          //     stops={this.props.tableData.stop || []}
          //     tableData={this.props.tableData}
          //   />
          : this.props.activeComponent
          ? <EntityList
              tableView={this.props.tableView}
              activeComponent={this.props.activeComponent}
              subComponent={this.props.subComponent}
              subSubComponent={this.props.subSubComponent}
              activeSubEntity={this.props.activeSubEntity}
              activeSubSubEntity={this.props.activeSubSubEntity}
              entity={this.props.activeEntity}
              entities={this.props.tableData[this.props.activeComponent]}
              setActiveEntity={this.props.setActiveEntity}
              newEntityClicked={this.props.newEntityClicked}
              deleteEntity={this.props.deleteEntity}
              updateActiveEntity={this.props.updateActiveEntity}
              saveActiveEntity={this.props.saveActiveEntity}
              entityEdited={this.props.entityEdited}
              feedSource={feedSource}
              newRowsDisplayed={this.props.newRowsDisplayed}
              stops={this.props.tableData.stop || []}
              tableData={this.props.tableData}
            />
          : null
        }
        <EditorMap
          feedSource={feedSource}
          feedInfo={this.props.feedInfo}
          activeComponent={this.props.activeComponent}
          subComponent={this.props.subComponent}
          subSubComponent={this.props.subSubComponent}
          activeSubEntity={this.props.activeSubEntity}
          activeSubSubEntity={this.props.activeSubSubEntity}
          setActiveEntity={this.props.setActiveEntity}
          newEntityClicked={this.props.newEntityClicked}
          deleteEntity={this.props.deleteEntity}
          updateActiveEntity={this.props.updateActiveEntity}
          saveActiveEntity={this.props.saveActiveEntity}
          entityEdited={this.props.entityEdited}
          entity={this.props.activeEntity}
          entities={this.props.tableData[this.props.activeComponent]}
          stops={this.props.tableData.stop || []}
          tableData={this.props.tableData}
        />
        <FeedInfoPanel
          feedSource={this.props.feedSource}
          feedInfo={this.props.feedInfo}
        />
      </Sidebar>
      <CurrentStatusMessage />
      </div>
    )
  }
}
