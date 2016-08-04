import React, {Component, PropTypes} from 'react'
import { Table, Button } from 'react-bootstrap'
import {Icon} from 'react-fa'
// import { DropTarget } from 'react-dnd'

import { getEntityName } from '../util/gtfs'
import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import PatternStopRow from './PatternStopRow'
import { polyline as getPolyline, getSegment } from '../../scenario-editor/utils/valhalla'
import ll from 'lonlng'

export default class PatternStopsTable extends Component {
  static propTypes = {
    stops: PropTypes.array,
    pattern: PropTypes.object,
    updateActiveEntity: PropTypes.func.isRequired,
    saveActiveEntity: PropTypes.func.isRequired,
    toggleEditSetting: PropTypes.func.isRequired,
    editSettings: PropTypes.object,
    entity: PropTypes.object,
    activeComponent: PropTypes.string.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {}
  }
  async extendPatternToStop (pattern, endPoint, stop) {
    let newShape = await getPolyline([endPoint, stop])
    if (newShape) {
      this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: [...pattern.shape.coordinates, ...newShape]}})
      this.props.saveActiveEntity('trippattern')
      return true
    } else {
      this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: [...pattern.shape.coordinates, ll.toCoordinates(stop)]}})
      this.props.saveActiveEntity('trippattern')
      return false
    }
  }
  render () {
    let { stops,
          pattern,
          updateActiveEntity,
          saveActiveEntity,
          editSettings,
          entity,
          activeComponent,
          toggleEditSetting
        } = this.props

    if (!pattern) return null

    let cumulativeTravelTime = 0
    const stopRowStyle = {
      cursor: 'pointer',
      paddingTop: 2,
      paddingBottom: 2
    }
    return (
      <Table
        hover
        style={{marginTop: '5px'}}
        // onDrop={onDrop}
      >
        <thead>
          <tr>
            <th>Stop sequence</th>
            <th className='text-right'>Travel time</th>
          </tr>
        </thead>
        <tbody>
          {stops && pattern.patternStops && pattern.patternStops.length
            ? pattern.patternStops.map((s, index) => {
              cumulativeTravelTime += s.defaultDwellTime + s.defaultTravelTime
              return (
                <PatternStopRow
                  patternStop={s}
                  activePattern={pattern}
                  rowStyle={stopRowStyle}
                  cumulativeTravelTime={cumulativeTravelTime}
                  key={s.stopId}
                  activeStop={this.state.activeStop}
                  setActiveStop={(stop) => this.setState({activeStop: stop})}
                  index={index}
                  {...this.props}
                />
              )
            })
            : !stops
            ? <tr><td className='text-center'><Icon spin name='refresh' /></td></tr>
            : <tr><td className='text-center' colSpan='2'>No stops</td></tr>
          }
          <tr
            style={stopRowStyle}
            className='add-stop-row'
          >
              {editSettings.addStops
                ? [
                    <td
                      key='stop-selector-cell'
                    >
                      <VirtualizedEntitySelect
                        value={entity ? {value: entity.id, label: getEntityName(activeComponent, entity), entity: entity} : null}
                        component={'stop'}
                        entities={stops}
                        onChange={(input) => {
                          let patternStops = [...pattern.patternStops]
                          let stop = input.entity
                          let coordinates = pattern.shape && pattern.shape.coordinates
                          let newStop = {stopId: stop.id, defaultDwellTime: 0, defaultTravelTime: 0}
                          // if adding stop to end
                          if (typeof index === 'undefined') {
                            // if shape coordinates already exist, just extend them
                            if (coordinates) {
                              let endPoint = ll.toLatlng(coordinates[coordinates.length - 1])
                              this.extendPatternToStop(pattern, endPoint, {lng: stop.stop_lon, lat: stop.stop_lat})
                              .then(() => {
                                patternStops.push(newStop)
                                updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
                                saveActiveEntity('trippattern')
                              })
                            }
                            // if shape coordinates do not exist, add pattern stop and get shape between stops (if multiple stops exist)
                            else {
                              patternStops.push(newStop)
                              if (patternStops.length > 1) {
                                let previousStop = stops.find(s => s.id === patternStops[patternStops.length - 2].stopId)
                                getSegment([[previousStop.stop_lon, previousStop.stop_lat], [stop.stop_lon, stop.stop_lat]], editSettings.followStreets)
                                .then(geojson => {
                                  updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: geojson.coordinates}})
                                  saveActiveEntity('trippattern')
                                })
                              }
                              else {
                                updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
                                saveActiveEntity('trippattern')
                              }
                            }

                            // if not following roads
                            // updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}})
                          }
                          // if adding stop in middle
                          else {
                            patternStops.splice(index, 0, newStop)
                            updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
                            saveActiveEntity('trippattern')
                          }
                          // TODO: add strategy for stop at beginning
                        }}
                      />
                    </td>
                    ,
                    <td
                      key='cancel-add-stops-cell'
                      className='col-xs-2'
                    >
                      <Button
                        bsStyle='default'
                        // className='pull-right'
                        style={{marginLeft: '5px'}}
                        onClick={() => {
                          toggleEditSetting('addStops')
                        }}
                      >
                        <Icon name='times'/>
                      </Button>
                    </td>
                  ]
                : <td colSpan='2'
                    onClick={() => {
                      toggleEditSetting('addStops')
                    }}
                    className='small'
                  >
                    <Icon name='plus'/> Add stop
                  </td>
              }
          </tr>
        </tbody>
      </Table>
    )
  }
}

// export default DropTarget(/* ... */)(PatternStopsTable)
