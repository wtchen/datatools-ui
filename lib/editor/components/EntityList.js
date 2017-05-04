import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import Button from 'react-bootstrap/lib/Button'
import {Table, Column} from 'react-virtualized/dist/commonjs/Table'

import EntityListButtons from './EntityListButtons'
import EntityListSecondaryActions from './EntityListSecondaryActions'

export default class EntityList extends Component {
  static propTypes = {
    activeComponent: PropTypes.string.isRequired,
    activeEntity: PropTypes.object,
    activeEntityId: PropTypes.string,
    deleteEntity: PropTypes.func.isRequired,
    enterTimetableEditor: PropTypes.func,
    entities: PropTypes.array,
    feedSource: PropTypes.object,
    list: PropTypes.array,
    newGtfsEntity: PropTypes.func.isRequired,
    setActiveEntity: PropTypes.func.isRequired,
    updateActiveEntity: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired
  }

  state = {}

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
    // set state indexes to undefined when active table (component) changes
    if (nextProps.activeComponent !== this.props.activeComponent) {
      this.setState({fromIndex, toIndex})
    }
  }

  _getRowStyle = ({index}) => {
    const {list} = this.props
    const {fromIndex, toIndex} = this.state
    const activeColor = '#F2F2F2'
    const rowStyle = {
      borderBottom: 'solid 1px #ddd',
      cursor: 'pointer',
      outline: 'none'
    }
    const isSelected = typeof fromIndex !== 'undefined' &&
      typeof toIndex !== 'undefined' &&
      index >= fromIndex &&
      index <= toIndex
    if (list[index] && (list[index].isActive || isSelected)) {
      rowStyle.backgroundColor = activeColor
    }
    return rowStyle
  }

  updateIndexes = (fromIndex, toIndex) => {
    this.setState({fromIndex, toIndex})
  }

  _getRow = ({index}) => this.props.list[index]

  _onClickTimetableEditor = () => this.props.enterTimetableEditor()

  _onClickNew = () => this.props.newGtfsEntity(this.props.feedSource.id, this.props.activeComponent)

  _onRowClick = ({event, index}) => {
    const {shiftKey} = event
    const {activeComponent, activeEntity, feedSource, list, setActiveEntity} = this.props
    let fromIndex, toIndex

    // handle selection of multiple items (for multiple delete, merge, etc.)
    if (shiftKey && activeEntity && !list[index].isActive) {
      const selectedIndex = list.findIndex(e => e.id === activeEntity.id)
      fromIndex = selectedIndex > index ? index : selectedIndex
      toIndex = selectedIndex < index ? index : selectedIndex
      setActiveEntity(feedSource.id, activeComponent)
    } else if (list[index].isActive) {
      setActiveEntity(feedSource.id, activeComponent)
    } else {
      setActiveEntity(feedSource.id, activeComponent, list[index])
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
      list
    } = this.props
    const createDisabled = list.findIndex(e => e.id === 'new') !== -1
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
    if (activeEntity) {
      activeIndex = list.findIndex(e => e.id === activeEntity.id)
    }
    const entityList = list.length
    ? <Table
      width={width - 5}
      height={560}
      key={`${feedSource.id}-${activeComponent}-table`}
      disableHeader
      headerHeight={20}
      rowHeight={25}
      scrollToIndex={activeIndex}
      rowClassName='noselect'
      rowStyle={this._getRowStyle}
      rowCount={list.length}
      onRowClick={this._onRowClick}
      rowGetter={this._getRow}>
      <Column
        label='Name'
        dataKey='name'
        className='small entity-list-row'
        style={{outline: 'none'}}
        width={width - 5} />
    </Table>
      : <div style={{marginTop: '20px'}} className='text-center'>
        <Button
          bsSize='small'
          disabled={createDisabled}
          onClick={this._onClickNew}>
          <Icon type='plus' /> Create first {activeComponent === 'scheduleexception' ? 'exception' : activeComponent}
        </Button>
      </div>
    return (
      <div style={panelStyle}>
        <div
          style={{paddingRight: sidePadding, marginBottom: '5px', height: '80px', paddingTop: sidePadding}}>
          <EntityListButtons
            fromIndex={this.state.fromIndex}
            toIndex={this.state.toIndex}
            list={list}
            updateIndexes={this.updateIndexes}
            {...this.props} />
          {activeComponent === 'calendar' || activeComponent === 'scheduleexception'
            ? <Button
              style={{marginTop: '10px'}}
              block
              disabled={!hasRoutes}
              onClick={this._onClickTimetableEditor}>
              <Icon type='calendar' /> Edit schedules
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
