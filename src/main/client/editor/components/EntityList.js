import React, {Component, PropTypes} from 'react'
import { Table, Button, ButtonToolbar, Nav, NavItem, Tooltip, OverlayTrigger } from 'react-bootstrap'
import {Icon} from 'react-fa'
import { FlexTable, FlexColumn } from 'react-virtualized'
import { PureComponent, shallowEqual } from 'react-pure-render'
import 'react-virtualized/styles.css'

import EntityDetails from './EntityDetails'
import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import GtfsTable from './GtfsTable'
import { getEntityName } from '../util/gtfs'

export default class EntityList extends Component {

  static propTypes = {
    feedSource: PropTypes.object.isRequired,
    entities: PropTypes.array.isRequired,
    activeEntity: PropTypes.object.isRequired,
    activeEntityId: PropTypes.string.isRequired,
    listWidth: PropTypes.number.isRequired,
    setActiveEntity: PropTypes.func.isRequired,
    updateActiveEntity: PropTypes.func.isRequired,
    deleteEntity: PropTypes.func.isRequired,
    newEntityClicked: PropTypes.func.isRequired,
    activeComponent: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.activeComponent){
      if (nextProps.entity) {
        let entity = nextProps.entity
        this.setState({selectValue: {value: entity.id, label: getEntityName(nextProps.activeComponent, entity), entity}})
      }
      else {
        this.setState({selectValue: null})
      }
    }
  }
  shouldComponentUpdate (nextProps) {
    return !shallowEqual(nextProps, this.props)
  }
  _getRowStyle (index, list) {
    const activeColor = '#F2F2F2'
    const rowStyle = {
      borderBottom: 'solid 1px #ddd',
      cursor: 'pointer',
    }
    const activeRowStyle = {
      backgroundColor: activeColor,
      borderBottom: 'solid 1px #ddd',
      cursor: 'pointer',
    }
    if (list[index] && (list[index].isActive || list[index].isSelected)) {
      return activeRowStyle
    }
    else {
      return rowStyle
    }
  }
  _onRowClick (index, list, shiftKey) {
    let fromIndex, toIndex
    if (shiftKey && this.props.activeEntity && !list[index].isActive) {
      let selectedIndex = list.findIndex(e => e.id === this.props.activeEntity.id)
      fromIndex = selectedIndex > index ? index : selectedIndex
      toIndex = selectedIndex < index ? index : selectedIndex
      console.log(`select multiple from ${fromIndex} to ${toIndex}`)
      this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent)
    } else
    if (list[index].isActive) {
      this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent)
    } else {
      this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, list[index])
    }
    this.setState({fromIndex, toIndex})
  }
  render () {
    const sidePadding = '5px'
    let panelWidth = !this.props.tableView ? `${this.props.listWidth}px` : '100%'
    let panelStyle = {
      width: panelWidth,
      height: '100%',
      position: 'absolute',
      left: '0px',
      backgroundColor: 'white',
      paddingRight: '0px',
      paddingLeft: sidePadding
    }
    const sortedEntities = this.props.entities && this.props.entities.sort((a, b) => {
      var aName = getEntityName(this.props.activeComponent, a)
      var bName = getEntityName(this.props.activeComponent, b)
      if (a.isCreating && !b.isCreating) return -1
      if (!a.isCreating && b.isCreating) return 1
      if (!isNaN(parseInt(aName)) && !isNaN(parseInt(bName))) {
        if (parseInt(aName) < parseInt(bName)) return -1
        if (parseInt(aName) > parseInt(bName)) return 1
        return 0
      }
      if (aName.toLowerCase() < bName.toLowerCase()) return -1
      if (aName.toLowerCase() > bName.toLowerCase()) return 1
      return 0
    })
    const activeEntity = this.props.activeEntity
    let activeIndex
    const list = sortedEntities && sortedEntities.length ? sortedEntities.map((entity, index) =>
      {
        if (activeEntity && entity.id === activeEntity.id) {
          activeIndex = index
        }
        const isActive = activeEntity && entity.id === activeEntity.id
        const isSelected = index >= this.state.fromIndex && index <= this.state.toIndex
        const name = getEntityName(this.props.activeComponent, entity) || '[Unnamed]'
        return {name, id: entity.id, isActive, isSelected}
      }
    )
    : []
    let shiftKey
    const entityList = (
      <div
        onClick={(e) => {
          console.log(e)
          shiftKey = e.shiftKey
        }}
      >
        <FlexTable
          width={this.props.listWidth - 5}
          height={560}
          disableHeader={true}
          headerHeight={20}
          rowHeight={25}
          scrollToIndex={activeIndex}
          rowClassName='entity-list-row noselect'
          rowStyle={({ index }) => this._getRowStyle(index, list)}
          rowCount={list.length}
          onRowClick={({ index }) => {
            // timeout set in order to get shiftkey from div event listener
            setTimeout(() => {
              this._onRowClick(index, list, shiftKey)
            }, 15)
          }}
          rowGetter={({ index }) => list[index]}
        >
          <FlexColumn
            label='Name'
            dataKey='name'
            className='small entity-list-row'
            width={this.props.listWidth - 5}
          />
        </FlexTable>
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
            return sortedEntities.find(ent => ent.id === id)
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
              {this.props.activeComponent === 'route'
                ? <OverlayTrigger placement='bottom' overlay={<Tooltip id={`merge-route`}>Merge routes</Tooltip>}>
                  <Button
                    bsSize='small'
                    disabled={this.state.toIndex - this.state.fromIndex !== 1}
                    onClick={() => {
                      // this.props.cloneEntity(this.props.feedSource.id, this.props.activeComponent, activeEntity.id)
                    }}
                  >
                    <Icon name='compress'/>
                  </Button>
                  </OverlayTrigger>
                : null
              }
              <OverlayTrigger placement='bottom' overlay={<Tooltip id={`duplicate-${this.props.activeComponent}`}>Duplicate {this.props.activeComponent}</Tooltip>}>
              <Button
                bsSize='small'
                disabled={!activeEntity}
                onClick={() => {
                  this.props.cloneEntity(this.props.feedSource.id, this.props.activeComponent, activeEntity.id)
                }}
              >
                <Icon name='clone'/>
              </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id={`delete-${this.props.activeComponent}`}>Delete {this.props.activeComponent}</Tooltip>}>
              <Button
                bsSize='small'
                disabled={!activeEntity && typeof this.state.fromIndex === 'undefined'}
                bsStyle='danger'
                onClick={() => {
                  let fromIndex, toIndex
                  if (activeEntity) {
                    this.props.deleteEntity(this.props.feedSource.id, this.props.activeComponent, activeEntity.id)
                  }
                  else {
                    for (var i = this.state.fromIndex; i <= this.state.toIndex; i++) {
                      this.props.deleteEntity(this.props.feedSource.id, this.props.activeComponent, sortedEntities[i].id)
                    }
                  }
                  this.setState({fromIndex, toIndex})
                  this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent)
                }}
              >
                <Icon name='trash'/>
              </Button>
              </OverlayTrigger>
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
          {/* Table view button */}
          {
            // <Button
            //   bsSize='xsmall'
            //   onClick={() => {!this.props.tableView
            //     ? browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}?table=true`)
            //     : browserHistory.push(`/feed/${feedSource.id}/edit/${this.props.activeComponent}`)
            //   }}
            // >
            //   {!this.props.tableView
            //     ? <span><Icon name='table'/> Table view</span>
            //     : <span><Icon name='list'/> List view</span>
            //   }
            // </Button>
          }

        </div>
        {this.props.activeComponent === 'calendar' || this.props.activeComponent === 'scheduleexception'
          ? <Nav style={{marginBottom: '5px'}} bsStyle='pills' justified activeKey={this.props.activeComponent} onSelect={this.handleSelect}>
              <NavItem
                eventKey={'calendar'}
                onClick={() => {
                  if (this.props.activeComponent !== 'calendar') {
                    // browserHistory.push(`/feed/${this.props.feedSource.id}/edit/calendar`)
                    this.props.setActiveEntity(this.props.feedSource.id, 'calendar')
                  }
                }}
              >
                Calendars
              </NavItem>
              <NavItem
                eventKey={'scheduleexception'}
                onClick={() => {
                  if (this.props.activeComponent !== 'scheduleexception') {
                    // browserHistory.push(`/feed/${this.props.feedSource.id}/edit/scheduleexception`)
                    this.props.setActiveEntity(this.props.feedSource.id, 'scheduleexception')
                  }
                }}
              >
                Exceptions
              </NavItem>
            </Nav>
          : this.props.activeComponent === 'stop' || this.props.activeComponent === 'route'
          ? <VirtualizedEntitySelect
              value={this.props.activeEntity && this.props.activeEntity.id}
              component={this.props.activeComponent}
              entities={sortedEntities}
              onChange={(value) => {
                if (!value) {
                  this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent)
                }
                else {
                  this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, value.entity)
                }
              }}
            />
          : null
        }
        {!this.props.tableView
          ? entityList
          : entityTable
        }

      </div>
    )
  }
}
