import React, {Component, PropTypes} from 'react'
import { Row, Col, Table, Button, Checkbox, Collapse, FormGroup, ControlLabel, OverlayTrigger, Tooltip } from 'react-bootstrap'
import {Icon} from 'react-fa'
import { DropTarget } from 'react-dnd'

import { getEntityName } from '../util/gtfs'
import MinuteSecondInput from './MinuteSecondInput'
import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import PatternStopRow from './PatternStopRow'

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

    let onDragOver = (e) => {
      e.preventDefault()
      // Logic here
      console.log('onDragOver')
    }
    let onDragStart = (e) => {
      e.dataTransfer.setData('id', 'setTheId')
      console.log(e.currentTarget)
      console.log(e.target.value)
      console.log(e.target.key)
      console.log('onDragStart')
    }
    let onDrop = (e) => {
      console.log('onDrop')
      var id = e.dataTransfer.getData('id')
      console.log('Dropped with id:', id)
    }
    const stopRowStyle = {
      cursor: 'pointer',
      paddingTop: 2,
      paddingBottom: 2,
    }
    let totalTravelTime = 0
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
              <PatternStopRow
                patternStop={s}
                activePattern={pattern}
                activeStop={this.state.activeStop}
                setActiveStop={(s) => this.setState({activeStop: s})}
                index={index}
                {...this.props}
              />
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
                    <td>
                      <VirtualizedEntitySelect
                        value={entity ? {value: entity.id, label: getEntityName(activeComponent, entity), entity: entity} : null}
                        component={'stop'}
                        entities={stops}
                        onChange={(input) => {
                          console.log(input)
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
                                let previousStop = stops.find(s => patternStop.id === patternStops[patternStops.length - 2].stopId)
                                console.log(previousStop)
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
                    <td className='col-xs-2'>
                      <Button
                        bsStyle='danger'
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
