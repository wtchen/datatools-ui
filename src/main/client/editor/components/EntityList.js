import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, ListGroupItem, Button, ButtonToolbar, Nav, NavItem } from 'react-bootstrap'
import {Icon} from 'react-fa'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'

import EditableTextField from '../../common/components/EditableTextField'
import EntityDetails from './EntityDetails'
import GtfsTable from './GtfsTable'

export default class EntityList extends Component {

  constructor (props) {
    super(props)
  }

  componentWillReceiveProps (nextProps) {
    // console.log('next entity list props', nextProps.activeComponent)
  }
  render () {
    const feedSource = this.props.feedSource
    const sidePadding = '5px'
    const rowHeight = '37px'
    let panelWidth = !this.props.tableView ? '200px' : '100%'
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
    let entId = 'id' // this.props.activeComponent === 'agency'
      // ? 'agency_id'
      // : this.props.activeComponent === 'route'
      // ? 'route_id'
      // : this.props.activeComponent === 'stop'
      // ? 'stop_id'// 'stop_id'
      // : null
    let entName = this.props.activeComponent === 'agency'
      ? 'agency_name'
      : this.props.activeComponent === 'route'
      ? 'route_short_name'
      : this.props.activeComponent === 'stop'
      ? 'stop_name'
      : this.props.activeComponent === 'calendar'
      ? 'description'
      : null
    const getEntityName = (component, entity) => {
      switch (component) {
        case 'route':
          return entity.route_short_name && entity.route_long_name
          ? `${entity.route_short_name} - ${entity.route_long_name}`
          : entity.route_short_name
          ? entity.route_short_name
          : entity.route_long_name
          ? entity.route_long_name
          : entity.route_id
        default:
          return entity[entName]
      }
    }
    const sortedEntities = this.props.entities && this.props.entities.sort((a, b) => {
      var aName = getEntityName(this.props.activeComponent, a)
      var bName = getEntityName(this.props.activeComponent, b)
      if(a.isCreating && !b.isCreating) return -1
      if(!a.isCreating && b.isCreating) return 1
      if(aName < bName) return -1
      if(aName > bName) return 1
      return 0
    })
    const activeEntity = this.props.entity // sortedEntities ? sortedEntities.find(entity => entity.id === this.props.entity) : null
    const entityList = (
      <div
        style={{height: '85%', overflowY: 'scroll',}}
      >
      <Table
        hover
      >
        <thead></thead>
        <tbody>
        {sortedEntities ? sortedEntities.map(entity => {
          const entityName = getEntityName(this.props.activeComponent, entity) || '[Unnamed]'
          const rowStyle = {
            paddingTop: 2,
            paddingBottom: 2,
            cursor: 'pointer',
          }
          const activeRowStyle = {
            backgroundColor: activeColor,
            paddingTop: 2,
            paddingBottom: 2,
            cursor: 'pointer',
          }
          return (
            <tr
              href='#'
              //key={entity.id ? `${this.props.activeComponent}-list-${entity.id}`}
              onMouseDown={(e) => console.log(e)}
              style={rowStyle}
              onClick={() => {
                if (activeEntity && entity.id === activeEntity.id) this.props.setActiveEntity(feedSource.id, this.props.activeComponent)
                else this.props.setActiveEntity(feedSource.id, this.props.activeComponent, entity)
              }}
            >
              <td
                /*className={activeEntity && entity.id === activeEntity.id ? 'success' : ''}*/
                style={activeEntity && entity.id === activeEntity.id ? activeRowStyle : rowStyle}
              >
              <small title={entityName}>{`${entityName && entityName.length > 23 ? entityName.substr(0, 23) + '...' : entityName}`}</small>
              </td>
            </tr>
          )
        })
        : <tr><td className='text-center'><Icon spin name='refresh' /></td></tr>
      }
        </tbody>
      </Table>
      </div>
    )

    const activeTable = DT_CONFIG.modules.editor.spec
      .find(t => t.id === this.props.activeComponent)
    const entityTable = (
      <GtfsTable
        ref="activeTable"
        feedSource={this.props.feedSource}
        table={activeTable}
        tableData={sortedEntities || []}
        newRowClicked={this.props.newRowClicked}
        saveRowClicked={this.props.saveRowClicked}
        deleteRowClicked={this.props.deleteRowClicked}
        fieldEdited={this.props.fieldEdited}
        gtfsEntitySelected={(type, entity) => {
          this.props.gtfsEntitySelected(type, entity)
        }}
        getGtfsEntity={(type, id) => {
          return sortedEntities.find(ent => ent[entId] === id)
          // return this.props.gtfsEntityLookup[`${type}_${id}`]
        }}
        showHelpClicked={(tableId, fieldName) => {
          const helpContent = fieldName
            ? DT_CONFIG.modules.editor.spec
                .find(t => t.id === tableId).fields
                  .find(f => f.name === fieldName).helpContent
            : DT_CONFIG.modules.editor.spec
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
          activeSubEntity={this.props.activeSubEntity}
          activeSubSubEntity={this.props.activeSubSubEntity}
          feedSource={this.props.feedSource}
          activeComponent={this.props.activeComponent}
          subComponent={this.props.subComponent}
          subSubComponent={this.props.subSubComponent}
          setActiveEntity={this.props.setActiveEntity}
          updateActiveEntity={this.props.updateActiveEntity}
          newEntityClicked={this.props.newEntityClicked}
          entityEdited={this.props.entityEdited}
          saveActiveEntity={this.props.saveActiveEntity}
          deleteEntity={this.props.deleteEntity}
          stops={this.props.stops}
          tableData={this.props.tableData}
          // newRowClicked={this.props.newRowClicked}
          // setActiveEntity={this.props.setActiveEntity}
          // saveRowClicked={this.props.saveRowClicked}
          // deleteRowClicked={this.props.deleteRowClicked}
          // fieldEdited={this.props.fieldEdited}
          // gtfsEntitySelected={(type, entity) => {
          //   this.props.gtfsEntitySelected(type, entity)
          // }}
          getGtfsEntity={(type, id) => {
            return sortedEntities.find(ent => ent[entId] === id)
            // return this.props.gtfsEntityLookup[`${type}_${id}`]
          }}
          // showHelpClicked={(tableId, fieldName) => {
          //   const helpContent = fieldName
          //     ? DT_CONFIG.modules.editor.spec
          //         .find(t => t.id === tableId).fields
          //           .find(f => f.name === fieldName).helpContent
          //     : DT_CONFIG.modules.editor.spec
          //         .find(t => t.id === tableId).helpContent
          //   this.refs.page.showInfoModal({
          //     title: `Help for ${tableId}.txt` + (fieldName ? `: ${fieldName}` : ''),
          //     body: helpContent || '(No help content found for this field)'
          //   })
          // }}
        />
    )
    return (
      <div
        style={panelStyle}
      >
        <div
            style={{paddingRight: sidePadding, marginBottom: '5px', height: '80px', paddingTop: sidePadding}}
        >
          <p>
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
                onClick={() => {
                  this.props.deleteEntity(this.props.feedSource.id, this.props.activeComponent, activeEntity)
                }}
              >
                <Icon name='trash'/>
              </Button>
            </ButtonToolbar>
            {// Create new entity
              this.props.activeComponent === 'stop'
              ? <span className='small'>Right-click map for new stop</span>
              : <Button
                bsSize='small'
                disabled={this.props.entities && this.props.entities.findIndex(e => e.id === 'new') !== -1}
                onClick={() => {
                  this.props.newEntityClicked(this.props.feedSource.id, this.props.activeComponent)
                }}
              >
                <Icon name='plus'/> New {this.props.activeComponent === 'scheduleexception' ? 'exception' : this.props.activeComponent}
              </Button>
            }
          </p>
          <Button
            bsSize='xsmall'
            onClick={() => {!this.props.tableView
              ? browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}?table=true`)
              : browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}`)
            }}
          >
            {!this.props.tableView
              ? <span><Icon name='table'/> Table view</span>
              : <span><Icon name='list'/> List view</span>
            }
          </Button>
        </div>
        {this.props.activeComponent === 'calendar' || this.props.activeComponent === 'scheduleexception'
          ? <Nav style={{marginBottom: '5px'}} bsStyle='pills' justified activeKey={this.props.activeComponent} onSelect={this.handleSelect}>
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
                Exceptions
              </NavItem>
            </Nav>
          : null
        }
        {!this.props.tableView
          ? entityList
          : entityTable
        }

        {this.props.entity
          ? entityDetails
          : null
        }
      </div>
    )
  }
}
