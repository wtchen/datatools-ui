import React, {Component, PropTypes} from 'react'
import Sidebar from 'react-sidebar'
import { Grid, Row, Col, Button, Glyphicon, PageHeader, Nav, NavItem } from 'react-bootstrap'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import {Icon} from 'react-fa'

import ManagerPage from '../../common/components/ManagerPage'
import GtfsTable from './GtfsTable'
import EditorMap from './EditorMap'
import RouteEditor from './RouteEditor'
import AgencyEditor from './AgencyEditor'
// import StopEditor from './StopEditor'
// import CalendarEditor from './CalendarEditor'
// import FareEditor from './FareEditor'

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
    console.log(nextProps.activeComponent)
    if (nextProps.activeComponent !== this.props.activeComponent) {
      this.props.getGtfsTable(nextProps.activeComponent, this.props.feedSource.id)
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
    if(!this.props.feedSource) return null
    const feedSource = this.props.feedSource
    const activeComponent = this.props.activeComponent
    const editingIsDisabled = !this.props.user.permissions.hasFeedPermission(this.props.feedSource.projectId, this.props.feedSource.id, 'edit-gtfs')

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
    let sidebarContent = <Nav stacked bsStyle='pills' activeKey={this.props.activeComponent}>
                            <NavItem
                              className='text-center'
                              style={navLinkStyle}
                              onClick={(e) => {
                                e.preventDefault()
                                browserHistory.push(`/feed/${feedSource.id}`)
                              }}
                            ><Icon name='reply' size='lg' /></NavItem>
                            <NavItem
                              active={this.props.activeComponent === 'agency'}
                              href='agency'
                              key='agency'
                              className='text-center'
                              style={navLinkStyle}
                              onClick={(e) => {
                                e.preventDefault()
                                if (this.props.activeComponent === 'agency') {
                                  browserHistory.push(`/feed/${feedSource.id}/edit/`)
                                }
                                else {
                                  browserHistory.push(`/feed/${feedSource.id}/edit/agency`)
                                }
                              }}
                            ><Icon name='building' size='lg' /></NavItem>
                            <NavItem
                              active={this.props.activeComponent === 'routes'}
                              href='routes'
                              key='routes'
                              className='text-center'
                              style={navLinkStyle}
                              onClick={(e) => {
                                e.preventDefault()
                                if (this.props.activeComponent === 'routes') {
                                  browserHistory.push(`/feed/${feedSource.id}/edit/`)
                                }
                                else {
                                  browserHistory.push(`/feed/${feedSource.id}/edit/routes`)
                                }
                              }}
                            ><Icon name='bus' size='lg' /></NavItem>
                            <NavItem
                              active={this.props.activeComponent === 'stops'}
                              href='stops'
                              key='stops'
                              className='text-center'
                              style={navLinkStyle}
                              onClick={(e) => {
                                e.preventDefault()
                                if (this.props.activeComponent === 'stops') {
                                  browserHistory.push(`/feed/${feedSource.id}/edit/`)
                                }
                                else {
                                  browserHistory.push(`/feed/${feedSource.id}/edit/stops`)
                                }
                              }}
                            ><Icon name='map-marker' size='lg' /></NavItem>
                            <NavItem
                              active={this.props.activeComponent === 'calendars'}
                              href='calendars'
                              key='calendars'
                              className='text-center'
                              style={navLinkStyle}
                              onClick={(e) => {
                                e.preventDefault()
                                if (this.props.activeComponent === 'calendars') {
                                  browserHistory.push(`/feed/${feedSource.id}/edit/`)
                                }
                                else {
                                  browserHistory.push(`/feed/${feedSource.id}/edit/calendars`)
                                }
                              }}
                            ><Icon name='calendar' size='lg' /></NavItem>
                            <NavItem
                              active={this.props.activeComponent === 'fares'}
                              href='fares'
                              key='fares'
                              className='text-center'
                              style={navLinkStyle}
                              onClick={(e) => {
                                e.preventDefault()
                                if (this.props.activeComponent === 'fares') {
                                  browserHistory.push(`/feed/${feedSource.id}/edit/`)
                                }
                                else {
                                  browserHistory.push(`/feed/${feedSource.id}/edit/fares`)
                                }
                              }}
                            ><Icon name='usd' size='lg' /></NavItem>
                        </Nav>
    return (
      <div>
      <Sidebar
        sidebar={sidebarContent}
        docked={true}
        shadow={false}
      >
        {this.props.activeComponent === 'agency'
          ? <AgencyEditor
              tableView={this.props.tableView}
              entity={this.props.activeEntity}
              agencies={this.props.tableData.agency}
              feedSource={feedSource}
              newRowsDisplayed={this.props.newRowsDisplayed}
            />
          : this.props.activeComponent === 'routes'
          ? <RouteEditor feedSource={feedSource}/>
          : this.props.activeComponent === 'stops'
          ? <div style={primaryPanelStyle}><h3>{this.props.activeComponent}</h3></div>
          : this.props.activeComponent === 'calendars'
          ? <div style={primaryPanelStyle}><h3>{this.props.activeComponent}</h3></div>
          : this.props.activeComponent === 'fares'
          ? <div style={primaryPanelStyle}><h3>{this.props.activeComponent}</h3></div>
          : null
        }
        <EditorMap
          feedSource={feedSource}
        />
      </Sidebar>
      </div>
    )
  }
}
