import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, ListGroupItem, Button, ButtonToolbar, Nav, NavItem } from 'react-bootstrap'
import {Icon} from 'react-fa'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import { Grid } from 'react-virtualized'
import VirtualizedSelect from 'react-virtualized-select'
import Select from 'react-select'

import EditableTextField from '../../common/components/EditableTextField'
import EntityDetails from './EntityDetails'
import GtfsTable from './GtfsTable'

export default class EntityList extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.activeComponent){
      if (nextProps.entity) {
        let entity = nextProps.entity
        this.setState({selectValue: {value: entity.id, label: this._getEntityName(nextProps.activeComponent, entity), entity}})
      }
      else {
        this.setState({selectValue: null})
      }
    }
  }
  _getEntityName = (component, entity) => {
    let entName = this.props.activeComponent === 'agency'
      ? 'agency_name'
      : this.props.activeComponent === 'route'
      ? 'route_short_name'
      : this.props.activeComponent === 'stop'
      ? 'stop_name'
      : this.props.activeComponent === 'calendar'
      ? 'description'
      : this.props.activeComponent === 'fare'
      ? 'gtfsFareId'
      : null
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
      : this.props.activeComponent === 'fare'
      ? 'gtfsFareId'
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
    const rowStyle = {
      paddingTop: 2,
      height: '20px',
      paddingBottom: 2,
      cursor: 'pointer',
    }
    const activeRowStyle = {
      backgroundColor: activeColor,
      paddingTop: 2,
      height: '20px',
      paddingBottom: 2,
      cursor: 'pointer',
    }
    const list = sortedEntities ? sortedEntities.map(entity =>
      {
        const entityName = getEntityName(this.props.activeComponent, entity) || '[Unnamed]'
        return [entityName]
      }
    )
    : [[]]

    // const list = [
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   ['Brian Vaughn', 'Software Engineer', 'San Jose', 'CA', 95125 ],
    //   // And so on...
    // ]
    const entityList =  this.props.activeComponent === 'stop'
    ? (
        <Grid
          width={200}
          height={530}
          columnWidth={100}
          rowHeight={30}
          columnCount={list[0].length}
          rowCount={list.length}
          cellRenderer={({ columnIndex, isScrolling, rowIndex }) => list[rowIndex][columnIndex]}
        />
      )
    : (
        <div
          style={{height: '85%', overflowY: 'scroll',}}
        >
        <Table
          hover
        >
          <thead></thead>
          <tbody>
            {sortedEntities
              ? sortedEntities.map(entity => {
                  const entityName = getEntityName(this.props.activeComponent, entity) || '[Unnamed]'
                  return (
                    <tr
                      href='#'
                      key={entity.id}
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
                      <small title={entityName}>
                        {
                          // entityName
                          `${entityName && entityName.length > 23 ? entityName.substr(0, 23) + '...' : entityName}`
                        }
                      </small>
                      </td>
                    </tr>
                  )
                }
              )
            : <tr><td className='text-center'><Icon spin name='refresh' /></td></tr>
          }
          </tbody>
        </Table>
        </div>
      )

    const activeTable = DT_CONFIG.modules.editor.spec
      .find(t => t.id === this.props.activeComponent)
    const entityTable = this.props.tableView
      ? (
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
      : null
    let entityDetails = this.props.entity
      ? (
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
      : null
    return (
      <div
        style={panelStyle}
      >
        <div
            style={{paddingRight: sidePadding, marginBottom: '5px', height: '80px', paddingTop: sidePadding}}
        >
          <div>
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
                  this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent)
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
          </div>
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
          : this.props.activeComponent === 'stop' || this.props.activeComponent === 'route'
          ? <VirtualizedSelect
              // maxHeight={500}
              placeholder={`Select ${this.props.activeComponent}...`}
              options={sortedEntities ? sortedEntities.map(entity => ({value: entity.id, label: getEntityName(this.props.activeComponent, entity) || '[Unnamed]', entity})) : []}
              searchable
              onChange={(selectValue) => {
                this.setState({ selectValue })
                if (!selectValue) {
                  this.props.setActiveEntity(feedSource.id, this.props.activeComponent)
                }
                else {
                  this.props.setActiveEntity(feedSource.id, this.props.activeComponent, selectValue.entity)
                }
              }}
              value={this.state.selectValue}
            />
          : null
        }
        {!this.props.tableView
          ? entityList
          : entityTable
        }

        {entityDetails}
      </div>
    )
  }
}
