import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import { Table, Collapse } from 'react-bootstrap'

import Loading from '../../../common/components/Loading'
import TripPatternViewer from './TripPatternViewer'
import TripPatternListControls from './TripPatternListControls'

export default class TripPatternList extends Component {
  static propTypes = {
    stops: PropTypes.array,

    updateActiveEntity: PropTypes.func.isRequired,
    saveActiveEntity: PropTypes.func.isRequired,
    updateEditSetting: PropTypes.func.isRequired,
    resetActiveEntity: PropTypes.func.isRequired,
    setActiveEntity: PropTypes.func.isRequired,
    cloneEntity: PropTypes.func.isRequired,
    deleteEntity: PropTypes.func.isRequired,
    newGtfsEntity: PropTypes.func.isRequired,
    undoActiveTripPatternEdits: PropTypes.func,

    showConfirmModal: PropTypes.func,

    editSettings: PropTypes.object,
    entity: PropTypes.object,
    activeEntity: PropTypes.object,
    feedSource: PropTypes.object,
    mapState: PropTypes.object,

    // activeComponent: PropTypes.string.isRequired,
    // subSubComponent: PropTypes.string,
    subEntityId: PropTypes.string,
    currentPattern: PropTypes.object
  }
  shouldComponentUpdate (nextProps) {
    return true
  }
  renderPatternRow (pattern, patternId, route) {
    const rowStyle = {
      paddingTop: 5,
      paddingBottom: 5
    }
    const activeColor = '#fff'
    const activeRowStyle = {
      backgroundColor: activeColor,
      paddingTop: 5,
      paddingBottom: 5
    }
    const isActive = patternId && pattern.id === patternId
    const patternName = `${`${pattern.name.length > 35 ? pattern.name.substr(0, 35) + '...' : pattern.name}`} ${pattern.patternStops ? `(${pattern.patternStops.length} stops)` : ''}`
    return (
      <tr
        key={pattern.id}
        style={rowStyle}>
        <td style={isActive ? activeRowStyle : rowStyle}>
          <p
            title={pattern.name}
            className='small'
            style={{width: '100%', margin: '0px', cursor: 'pointer'}}
            onClick={() => this._selectRow(isActive, route, pattern)}>
            <Icon type={isActive ? 'caret-down' : 'caret-right'} />
            {' '}
            {pattern.name ? patternName : '[Unnamed]'}
          </p>
          <Collapse in={isActive} style={{borderRight: '1px solid #ddd'}}>
            {isActive
              ? <TripPatternViewer {...this.props} />
              : <div />
            }
          </Collapse>
        </td>
      </tr>
    )
  }
  _selectRow (isActive, route, pattern) {
    if (isActive) this.props.setActiveEntity(this.props.feedSource.id, 'route', route, 'trippattern')
    else this.props.setActiveEntity(this.props.feedSource.id, 'route', route, 'trippattern', pattern)
  }
  render () {
    const { activeEntity, activePatternId } = this.props
    if (!activeEntity.tripPatterns) {
      return <Loading />
    }
    const sidePadding = '5px'
    const panelWidth = '300px'
    const panelStyle = {
      width: panelWidth,
      height: '85%',
      position: 'absolute',
      left: '0px',
      overflowY: 'scroll',
      zIndex: 99,
      paddingRight: '1px',
      paddingLeft: sidePadding
    }
    return (
      <div style={panelStyle}>
        <TripPatternListControls {...this.props} />
        <div
          style={{
            height: '100%',
            overflowY: 'scroll'
          }}>
          <Table
            hover>
            <tbody>
              {activeEntity.tripPatterns
                ? activeEntity.tripPatterns.map(pattern => this.renderPatternRow(pattern, activePatternId, activeEntity))
                : <tr><td><Icon className='fa-spin' type='refresh' /></td></tr>
              }
            </tbody>
          </Table>
        </div>
      </div>
    )
  }
}
