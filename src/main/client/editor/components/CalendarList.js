import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, ListGroupItem, Button, ButtonToolbar, Nav, NavItem } from 'react-bootstrap'
import {Icon} from '@conveyal/woonerf'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'

import EditableTextField from '../../common/components/EditableTextField'
import { getConfigProperty } from '../../common/util/config'
import EntityDetails from './EntityDetails'
import GtfsTable from './GtfsTable'

export default class CalendarList extends Component {

  constructor (props) {
    super(props)
  }

  render () {
    // const routes = ['test', 'Route 123', 'Route 456', 'Route 1', 'Route 10']
    console.log('table view', this.props.tableView)
    console.log('entity: ', this.props.entity)
    console.log('component: ', this.props.activeComponent)
    const feedSource = this.props.feedSource
    const sidePadding = '5px'
    const rowHeight = '37px'
    let panelWidth = !this.props.tableView ? '300px' : '100%'
    let panelStyle = {
      width: panelWidth,
      height: '100%',
      position: 'absolute',
      left: '0px',
      // overflowY: 'scroll',
      zIndex: 99,
      backgroundColor: 'white',
      paddingRight: '0px',
      paddingLeft: sidePadding
    }
    const rowStyle = {
      cursor: 'pointer'
    }
    const activeColor = '#F2F2F2'
    let entId = this.props.activeComponent === 'calendar'
      ? 'service_id'
      : this.props.activeComponent === 'route'
      ? 'route_id'
      : this.props.activeComponent === 'stop'
      ? 'stop_id'
      : null
    let entName = this.props.activeComponent === 'calendar'
      ? 'description'
      : this.props.activeComponent === 'route'
      ? 'route_short_name'
      : this.props.activeComponent === 'stop'
      ? 'stop_name'
      : null
    const activeEntity = this.props.entities ? this.props.entities.find(entity => entity.id === this.props.entity) : null
    const agencyList = (
      <div
        style={{height: '75%', overflowY: 'scroll',}}
      >
      <Table
        hover
      >
        <thead></thead>
        <tbody>
        {this.props.entities
          ? this.props.entities.map(entity => {
          return (
            <tr
              href='#'
              key={entity.id}
              onMouseDown={(e) => console.log(e)}
              style={rowStyle}
              onClick={() => {
                if (this.props.entity && this.props.entity === entity.id) browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}`)
                else browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}/${entity.id}`)
              }}
            >
              <td
                /*className={activeEntity && entity.id === activeEntity.id ? 'success' : ''}*/
                style={activeEntity && entity.id === activeEntity.id ? {backgroundColor: activeColor} : {}}
              >
              <small>{this.props.activeComponent !== 'route'
                ? entity[entName]
                : entity.route_short_name && entity.route_long_name
                ? `${entity.route_short_name} - ${entity.route_long_name}`
                : entity.route_short_name
                ? entity.route_short_name
                : entity.route_long_name
                ? entity.route_long_name
                : entity.route_id
              }</small>
              </td>
            </tr>
          )
        })
        : <tr><td><Icon spin name='refresh' /></td></tr>
      }
        </tbody>
      </Table>
      </div>
    )

    const activeTable = getConfigProperty('modules.editor.spec')
      .find(t => t.id === this.props.activeComponent)
    const agencyTable = (
      <GtfsTable
        ref="activeTable"
        feedSource={this.props.feedSource}
        table={activeTable}
        tableData={this.props.entities || []}
        newRowClicked={this.props.newRowClicked}
        saveRowClicked={this.props.saveRowClicked}
        deleteRowClicked={this.props.deleteRowClicked}
        fieldEdited={this.props.fieldEdited}
        gtfsEntitySelected={(type, entity) => {
          this.props.gtfsEntitySelected(type, entity)
        }}
        getGtfsEntity={(type, id) => {
          return this.props.entities.find(ent => ent[entId] === id)
          // return this.props.gtfsEntityLookup[`${type}_${id}`]
        }}
        showHelpClicked={(tableId, fieldName) => {
          const helpContent = fieldName
            ? getConfigProperty('modules.editor.spec')
                .find(t => t.id === tableId).fields
                  .find(f => f.name === fieldName).helpContent
            : getConfigProperty('modules.editor.spec')
                .find(t => t.id === tableId).helpContent
          this.refs.page.showInfoModal({
            title: `Help for ${tableId}.txt` + (fieldName ? `: ${fieldName}` : ''),
            body: helpContent || '(No help content found for this field)'
          })
        }}
        newRowsDisplayed={(rows) => {
          this.props.newRowsDisplayed(activeTable.id, rows, this.props.feedSource)
        }}
      />
    )
    let entityDetails = (
      <EntityDetails
          offset={panelWidth}
          entity={activeEntity}
          activeComponent={this.props.activeComponent}
          newRowClicked={this.props.newRowClicked}
          saveRowClicked={this.props.saveRowClicked}
          deleteRowClicked={this.props.deleteRowClicked}
          fieldEdited={this.props.fieldEdited}
          gtfsEntitySelected={(type, entity) => {
            this.props.gtfsEntitySelected(type, entity)
          }}
          getGtfsEntity={(type, id) => {
            return this.props.entities.find(ent => ent[entId] === id)
            // return this.props.gtfsEntityLookup[`${type}_${id}`]
          }}
          showHelpClicked={(tableId, fieldName) => {
            const helpContent = fieldName
              ? getConfigProperty('modules.editor.spec')
                  .find(t => t.id === tableId).fields
                    .find(f => f.name === fieldName).helpContent
              : getConfigProperty('modules.editor.spec')
                  .find(t => t.id === tableId).helpContent
            this.refs.page.showInfoModal({
              title: `Help for ${tableId}.txt` + (fieldName ? `: ${fieldName}` : ''),
              body: helpContent || '(No help content found for this field)'
            })
          }}
        />
    )
    let tableViewButton = (
      <Button
        bsSize='xsmall'
        onClick={() => {!this.props.tableView
          ? browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}?table=true`)
          : browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}`)
        }}
      >
        {!this.props.tableView
          ? <span><Icon name='table'/> Switch to table view</span>
          : <span><Icon name='list'/> Switch to list view</span>
        }
      </Button>
    )
    return (
      <div
        style={panelStyle}
      >
        <div
          style={{paddingRight: sidePadding, marginBottom: '5px', height: '10%'}}
        >
          <h3>
            <ButtonToolbar
              className='pull-right'
            >
              <Button
                bsSize='small'
                disabled={!activeEntity}
              >
                <Icon name='clone'/>
              </Button>
              <Button
                bsSize='small'
                disabled={!activeEntity}
                bsStyle='danger'
              >
                <Icon name='trash'/>
              </Button>
            </ButtonToolbar>
            <Button
              bsSize='small'
            >
              <Icon name='plus'/> New {this.props.activeComponent}
            </Button>
          </h3>
          {/*tableViewButton*/}
        </div>
        <Nav style={{marginBottom: '5px'}} bsStyle='pills' justified activeKey={this.props.activeComponent} onSelect={this.handleSelect}>
          <NavItem
            eventKey={'calendar'}
            onClick={() => {
              if (this.props.activeComponent !== 'calendar') {
                browserHistory.push(`/feed/${this.props.feedSource.id}/edit/calendar`)
              }
            }}
          >
            Calendars
          </NavItem>
          <NavItem
            eventKey={'scheduleexception'}
            onClick={() => {
              if (this.props.activeComponent !== 'scheduleexception') {
                browserHistory.push(`/feed/${this.props.feedSource.id}/edit/scheduleexception`)
              }
            }}
          >
            Exception
          </NavItem>
        </Nav>
        {!this.props.tableView
          ? agencyList
          : agencyTable
        }

        {this.props.entity
          ? entityDetails
          : null
        }
      </div>
    )
  }
}
