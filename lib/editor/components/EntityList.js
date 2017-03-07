import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import Button from 'react-bootstrap/lib/Button'
import {Table, Column} from 'react-virtualized/dist/commonjs/Table'
import {shallowEqual} from 'react-pure-render'

import EntityListButtons from './EntityListButtons'
import EntityListSecondaryActions from './EntityListSecondaryActions'
import {getEntityName} from '../util/gtfs'

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
  _onResize = () => {
    this.setState({width: window.innerWidth, height: window.innerHeight})
  }
  componentWillMount () {
    this._onResize()
  }
  componentDidMount () {
    window.addEventListener('resize', this._onResize)
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this._onResize)
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
    !shallowEqual(nextProps.activeEntity, this.props.activeEntity) ||
    !shallowEqual(nextProps.activeEntityId, this.props.activeEntityId) ||
    !shallowEqual(nextProps.activeComponent, this.props.activeComponent) ||
    !shallowEqual(nextProps.feedSource, this.props.feedSource)
  }
  _optionRenderer = ({ focusedOption, focusedOptionIndex, focusOption, key, labelKey, option, options, selectValue, style, valueArray }) => {
    const className = ['VirtualizedSelectOption']
    if (option === focusedOption) {
      className.push('VirtualizedSelectFocusedOption')
    }
    if (option.disabled) {
      className.push('VirtualizedSelectDisabledOption')
    }
    const events = option.disabled
      ? {}
      : {
        onClick: () => selectValue(option),
        onMouseOver: () => focusOption(option)
      }
    return (
      <div
        key={key}
        className={className.join(' ')}
        style={{
          cursor: 'pointer',
          ...style
        }}
        {...events}
      >
        <span
          title={option.label}
          style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            width: this.props.width,
            overflow: 'hidden'
          }}
        >
          {option.label}
        </span>
      </div>
    )
  }
  _getRowStyle (index, list) {
    const activeColor = '#F2F2F2'
    const rowStyle = {
      borderBottom: 'solid 1px #ddd',
      cursor: 'pointer',
      outline: 'none'
    }
    if (list[index] && (list[index].isActive || list[index].isSelected)) {
      rowStyle.backgroundColor = activeColor
    }
    return rowStyle
  }
  updateIndexes = (fromIndex, toIndex) => {
    this.setState({fromIndex, toIndex})
  }
  _onRowClick (index, list, shiftKey) {
    let fromIndex, toIndex
    if (shiftKey && this.props.activeEntity && !list[index].isActive) {
      const selectedIndex = list.findIndex(e => e.id === this.props.activeEntity.id)
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
    const {
      tableView,
      width,
      activeEntity,
      activeComponent,
      hasRoutes,
      feedSource,
      entities,
      newGtfsEntity,
      enterTimetableEditor
    } = this.props
    const sidePadding = '5px'
    const panelWidth = !tableView ? `${width}px` : '100%'
    const panelStyle = {
      width: panelWidth,
      height: '100%',
      position: 'absolute',
      left: '0px',
      zIndex: 1,
      backgroundColor: 'white',
      paddingRight: '0px',
      paddingLeft: sidePadding
    }
    let activeIndex
    const list = entities && entities.length
      ? entities.map((entity, index) => {
        if (activeEntity && entity.id === activeEntity.id) {
          activeIndex = index
        }
        const isActive = activeEntity && entity.id === activeEntity.id
        const isSelected = typeof this.state.fromIndex !== 'undefined' && typeof this.state.toIndex !== 'undefined' && index >= this.state.fromIndex && index <= this.state.toIndex
        const name = getEntityName(activeComponent, entity) || '[Unnamed]'
        return {name, id: entity.id, isActive, isSelected}
      }
    )
    : []
    let shiftKey
    const entityList = list.length
    ? <div
      onClick={(e) => {
        console.log(e)
        shiftKey = e.shiftKey
      }}
      style={{outline: 'none'}}
      >
      <Table
        width={width - 5}
        height={560}
        key={`${feedSource.id}-${activeComponent}-table`}
        disableHeader
        headerHeight={20}
        rowHeight={25}
        scrollToIndex={activeIndex}
        rowClassName='noselect'
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
        <Column
          label='Name'
          dataKey='name'
          className='small entity-list-row'
          style={{outline: 'none'}}
          width={width - 5}
        />
      </Table>
    </div>
      : <div style={{marginTop: '20px'}} className='text-center'>
        <Button
          bsSize='small'
          disabled={entities && entities.findIndex(e => e.id === 'new') !== -1}
          onClick={() => {
            newGtfsEntity(feedSource.id, activeComponent)
          }}
        >
          <Icon type='plus' /> Create first {activeComponent === 'scheduleexception' ? 'exception' : activeComponent}
        </Button>
      </div>
    return (
      <div style={panelStyle}>
        <div
          style={{paddingRight: sidePadding, marginBottom: '5px', height: '80px', paddingTop: sidePadding}}
        >
          <EntityListButtons
            fromIndex={this.state.fromIndex}
            toIndex={this.state.toIndex}
            list={list}
            updateIndexes={this.updateIndexes}
            {...this.props}
          />
          {activeComponent === 'calendar' || activeComponent === 'scheduleexception'
            ? <Button
              style={{marginTop: '10px'}}
              block
              disabled={!hasRoutes}
              onClick={() => enterTimetableEditor()}
            >
              <Icon type='pencil' /> Edit schedules
            </Button>
            : null
          }
          {/* Table view button */}
        </div>
        <EntityListSecondaryActions {...this.props} />
        {!tableView
          ? entityList
          : null // GtfsTable fully removed from repo, last available at fe29528569f5f64c23a49d2af0bd224f3d63d010
        }
      </div>
    )
  }
}
