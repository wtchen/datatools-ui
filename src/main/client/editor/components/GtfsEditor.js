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
import EntityList from './EntityList'
// import StopEditor from './StopEditor'
import CalendarEditor from './CalendarEditor'
// import FareEditor from './FareEditor'

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
    if (nextProps.activeComponent !== this.props.activeComponent && !nextProps.tableData[nextProps.activeComponent]) {
      console.log('getting table: ' + nextProps.activeComponent)
      this.props.getGtfsTable(nextProps.activeComponent, nextProps.feedSource.id)
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
    let sidebarItems = [
      {
        id: 'agency',
        icon: 'building'
      },
      {
        id: 'route',
        icon: 'bus'
      },
      {
        id: 'stop',
        icon: 'map-marker'
      },
      {
        id: 'calendar',
        icon: 'calendar'
      },
      {
        id: 'fare',
        icon: 'usd'
      },
    ]
    let sidebarContent = <Nav stacked bsStyle='pills' activeKey={this.props.activeComponent}>
                            <NavItem
                              className='text-center'
                              style={navLinkStyle}
                              onClick={(e) => {
                                e.preventDefault()
                                browserHistory.push(`/feed/${feedSource.id}`)
                              }}
                            ><Icon name='reply' size='lg' /></NavItem>
                            {sidebarItems.map(item => (
                              <NavItem
                                active={this.props.activeComponent === item.id}
                                href={item.id}
                                key={item.id}
                                className='text-center'
                                style={navLinkStyle}
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (this.props.activeComponent === item.id) {
                                    browserHistory.push(`/feed/${feedSource.id}/edit/`)
                                  }
                                  else {
                                    browserHistory.push(`/feed/${feedSource.id}/edit/${item.id}`)
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
        {this.props.activeComponent === 'agency'
          ? <EntityList
              tableView={this.props.tableView}
              activeComponent={this.props.activeComponent}
              entity={this.props.activeEntity}
              entities={this.props.tableData[this.props.activeComponent]}
              feedSource={feedSource}
              newRowsDisplayed={this.props.newRowsDisplayed}
            />
          : this.props.activeComponent === 'route'
          ? <EntityList
              tableView={this.props.tableView}
              activeComponent={this.props.activeComponent}
              entity={this.props.activeEntity}
              entities={this.props.tableData[this.props.activeComponent]}
              feedSource={feedSource}
              newRowsDisplayed={this.props.newRowsDisplayed}
            />
          : this.props.activeComponent === 'stop'
          ? <EntityList
              tableView={this.props.tableView}
              activeComponent={this.props.activeComponent}
              entity={this.props.activeEntity}
              entities={this.props.tableData[this.props.activeComponent]}
              feedSource={feedSource}
              newRowsDisplayed={this.props.newRowsDisplayed}
            />
          : this.props.activeComponent === 'calendar'
          ? <CalendarEditor
              tableView={this.props.tableView}
              activeComponent={this.props.activeComponent}
              entity={this.props.activeEntity}
              entities={this.props.tableData[this.props.activeComponent]}
              feedSource={feedSource}
              newRowsDisplayed={this.props.newRowsDisplayed}
            />
          : this.props.activeComponent === 'fare'
          ? <div style={primaryPanelStyle}><h3>{this.props.activeComponent}</h3></div>
          : null
        }
        <EditorMap
          feedSource={feedSource}
          feedInfo={this.props.feedInfo}
          activeComponent={this.props.activeComponent}
          entity={this.props.activeEntity}
          entities={this.props.tableData[this.props.activeComponent]}
        />
        <FeedInfoPanel
          feedSource={this.props.feedSource}
          feedInfo={this.props.feedInfo}
        />
      </Sidebar>
      </div>
    )
  }
}
