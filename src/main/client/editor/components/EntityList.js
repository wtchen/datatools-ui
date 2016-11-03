import React, {Component, PropTypes} from 'react'
import { Button, ButtonToolbar, Nav, NavItem, Tooltip, OverlayTrigger } from 'react-bootstrap'
import {Icon} from '@conveyal/woonerf'
import { FlexTable, FlexColumn } from 'react-virtualized'
import { shallowEqual } from 'react-pure-render'

import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import GtfsTable from './GtfsTable'
import { getEntityName } from '../util/gtfs'
import { getConfigProperty } from '../../common/util/config'

export default class EntityList extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    entities: PropTypes.array,
    activeEntity: PropTypes.object,
    activeEntityId: PropTypes.string,
    width: PropTypes.number.isRequired,
    setActiveEntity: PropTypes.func.isRequired,
    updateActiveEntity: PropTypes.func.isRequired,
    deleteEntity: PropTypes.func.isRequired,
    newGtfsEntity: PropTypes.func.isRequired,
    activeComponent: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentWillReceiveProps (nextProps) {
    let fromIndex, toIndex
    if (nextProps.activeComponent !== this.props.activeComponent) {
      this.setState({fromIndex, toIndex})
    }
  }
  shouldComponentUpdate (nextProps) {
    // simply running shallowEqual on all props does not give us the performance we need here
    // (especially with many, many stops)
    return !shallowEqual(nextProps.entities, this.props.entities) ||
    !shallowEqual(nextProps.activeEntityId, this.props.activeEntityId) ||
    !shallowEqual(nextProps.activeComponent, this.props.activeComponent) ||
    !shallowEqual(nextProps.feedSource, this.props.feedSource)
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
  // TODO: add hover to row rendering
  // _rowRenderer (props) {
  //
  // }
  render () {
    // console.log(this.props)
    const sidePadding = '5px'
    let panelWidth = !this.props.tableView ? `${this.props.width}px` : '100%'
    let panelStyle = {
      width: panelWidth,
      height: '100%',
      position: 'absolute',
      left: '0px',
      zIndex: 1,
      backgroundColor: 'white',
      paddingRight: '0px',
      paddingLeft: sidePadding
    }
    const entArray = this.props.entities
    const activeEntity = this.props.activeEntity
    let activeIndex
    const list = entArray && entArray.length
      ? entArray.map((entity, index) => {
        if (activeEntity && entity.id === activeEntity.id) {
          activeIndex = index
        }
        const isActive = activeEntity && entity.id === activeEntity.id
        const isSelected = typeof this.state.fromIndex !== 'undefined' && typeof this.state.toIndex !== 'undefined' && index >= this.state.fromIndex && index <= this.state.toIndex
        const name = getEntityName(this.props.activeComponent, entity) || '[Unnamed]'
        return {name, id: entity.id, isActive, isSelected}
      }
    )
    : []
    let shiftKey
    const entityList = list.length
    ? (
        <div
          onClick={(e) => {
            console.log(e)
            shiftKey = e.shiftKey
          }}
        >
          <FlexTable
            width={this.props.width - 5}
            height={560}
            key={`${this.props.activeComponent}-table`}
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
              width={this.props.width - 5}
            />
          </FlexTable>
          </div>
        )
      : <div style={{marginTop: '20px'}} className='text-center'>
        <Button
          bsSize='small'
          disabled={this.props.entities && this.props.entities.findIndex(e => e.id === 'new') !== -1}
          onClick={() => {
            this.props.newGtfsEntity(this.props.feedSource.id, this.props.activeComponent)
          }}
        >
          <Icon type='plus'/> Create first {this.props.activeComponent === 'scheduleexception' ? 'exception' : this.props.activeComponent}
        </Button>
        </div>

    const activeTable = getConfigProperty('modules.editor.spec')
      .find(t => t.id === this.props.activeComponent)
    const entityTable = this.props.tableView
      ? (
        <GtfsTable
          ref="activeTable"
          feedSource={this.props.feedSource}
          table={activeTable}
          tableData={entArray || []}
          newRowClicked={this.props.newRowClicked}
          saveRowClicked={this.props.saveRowClicked}
          deleteRowClicked={this.props.deleteRowClicked}
          fieldEdited={this.props.fieldEdited}
          gtfsEntitySelected={(type, entity) => {
            this.props.gtfsEntitySelected(type, entity)
          }}
          getGtfsEntity={(type, id) => {
            return entArray.find(ent => ent.id === id)
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
                    <Icon type='compress' />
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
                <Icon type='clone' />
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
                    this.props.showConfirmModal({
                      title: `Delete ${this.props.activeComponent}?`,
                      body: `Are you sure you want to delete this ${this.props.activeComponent}?`,
                      onConfirm: () => {
                        this.props.deleteEntity(this.props.feedSource.id, this.props.activeComponent, activeEntity.id)
                        this.setState({fromIndex, toIndex})
                        this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent)
                      }
                    })
                    // this.props.deleteEntity(this.props.feedSource.id, this.props.activeComponent, activeEntity.id)
                  }
                  else {
                    this.props.showConfirmModal({
                      title: `Delete ${+this.state.toIndex - +this.state.fromindex} ${this.props.activeComponent}s?`,
                      body: `Are you sure you want to delete these ${this.state.toIndex - this.state.fromindex} ${this.props.activeComponent}s?`,
                      onConfirm: () => {
                        for (var i = 0; i < list.length; i++) {
                          if (list[i].isSelected) {
                            this.props.deleteEntity(this.props.feedSource.id, this.props.activeComponent, list[i].id)
                          }
                        }
                        this.setState({fromIndex, toIndex})
                        this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent)
                      }
                    })
                  }
                }}
              >
                <Icon type='trash' />
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
                    this.props.newGtfsEntity(this.props.feedSource.id, this.props.activeComponent)
                  }}
                >
                  <Icon type='plus' /> New {this.props.activeComponent === 'scheduleexception' ? 'exception' : this.props.activeComponent}
                </Button>
            }
          </div>
          {/* Table view button */}
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
              entities={entArray}
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
