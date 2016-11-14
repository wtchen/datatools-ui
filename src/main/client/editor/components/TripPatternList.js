import React, {Component, PropTypes} from 'react'
import { Table, Button, ButtonGroup, Alert, Checkbox, DropdownButton, MenuItem, ButtonToolbar, Collapse, FormGroup, OverlayTrigger, Tooltip, InputGroup, Form, FormControl, ControlLabel } from 'react-bootstrap'
import {Icon} from 'react-fa'
import { sentence as toSentenceCase } from 'change-case'
import Rcslider from 'rc-slider'

import EditableTextField from '../../common/components/EditableTextField'
import Loading from '../../common/components/Loading'
import PatternStopContainer from './PatternStopContainer'
import MinuteSecondInput from './MinuteSecondInput'

import { CLICK_OPTIONS } from '../util'
import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import { polyline as getPolyline, getSegment } from '../../scenario-editor/utils/valhalla'
import ll from 'lonlng'

import 'rc-slider/assets/index.css'

const DEFAULT_SPEED = 20 // km/hr

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
  constructor (props) {
    super(props)
    this.state = {
      // avgSpeed: 20, // km/hr
      // dwellTime: 0 // seconds
    }
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
  componentWillReceiveProps (nextProps) {
  }
  shouldComponentUpdate (nextProps) {
    return true
  }
  async drawPatternFromStops (pattern, stops) {
    let newShape = await getPolyline(stops)
    console.log(newShape)
    this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: newShape}})
    this.props.saveActiveEntity('trippattern')
    return true
  }
  calculateDefaultTimes (pattern, speed = DEFAULT_SPEED, dwellTime = 0) {
    console.log(speed, dwellTime)
    if (!speed) {
      speed = DEFAULT_SPEED
    }
    let patternStops = [...pattern.patternStops]
    let convertedSpeed = speed * 1000 / 60 / 60 // km/hr -> m/s
    // let cumulativeTravelTime = 0
    for (var i = 0; i < patternStops.length; i++) {
      patternStops[i].defaultDwellTime = dwellTime
      patternStops[i].defaultTravelTime = patternStops[i].shapeDistTraveled / convertedSpeed
      // cumulativeTravelTime += dwellTime +
    }
    this.props.updateActiveEntity(pattern, 'trippattern', {patternStops})
    this.props.saveActiveEntity('trippattern')
  }
  render () {
    const { feedSource, activeEntity } = this.props
    const activePatternId = this.props.subEntityId
    if (!activeEntity.tripPatterns) {
      return <Loading/>
    }
    const activePattern = this.props.currentPattern // activeEntity.tripPatterns.find(p => p.id === activePatternId)
    const sidePadding = '5px'
    let panelWidth = '300px'
    let panelStyle = {
      width: panelWidth,
      height: '85%',
      position: 'absolute',
      left: '0px',
      overflowY: 'scroll',
      zIndex: 99,
      // backgroundColor: 'white',
      paddingRight: '0px',
      paddingLeft: sidePadding
    }
    const activeColor = '#fff'
    const patternList = (
      <div
        style={{height: '100%', overflowY: 'scroll'}}
      >
      <Table
        hover
      >
        <thead></thead>
        <tbody>
        {activeEntity.tripPatterns ? activeEntity.tripPatterns.map(pattern => {
          const rowStyle = {
            paddingTop: 5,
            paddingBottom: 5
          }
          const activeRowStyle = {
            backgroundColor: activeColor,
            paddingTop: 5,
            paddingBottom: 5
          }
          const cardStyle = {
            border: '1px dashed gray',
            padding: '0.5rem 0.5rem',
            marginBottom: '.5rem',
            backgroundColor: '#f2f2f2',
            cursor: 'pointer'
          }
          const isActive = activePatternId && pattern.id === activePatternId
          const timetableOptions = [
            <span><Icon name='table'/> Use timetables</span>,
            <span><Icon name='clock-o'/> Use frequencies</span>
          ]
          const patternName = `${`${pattern.name.length > 35 ? pattern.name.substr(0, 35) + '...' : pattern.name}`} ${pattern.patternStops ? `(${pattern.patternStops.length} stops)` : ''}`
          return (
            <tr
              href='#'
              value={pattern.id}
              id={pattern.id}
              key={pattern.id}
              style={rowStyle}
            >
              <td
                style={isActive ? activeRowStyle : rowStyle}
              >
              <p
                title={pattern.name}
                className='small'
                style={{width: '100%', margin: '0px', cursor: 'pointer'}}
                onClick={(e) => {
                  if (isActive) this.props.setActiveEntity(feedSource.id, 'route', activeEntity, 'trippattern')
                  else this.props.setActiveEntity(feedSource.id, 'route', activeEntity, 'trippattern', pattern)
                }}
              >
                <Icon name={isActive ? 'caret-down' : 'caret-right'}/>
                {' '}
                {pattern.name ? patternName : '[Unnamed]'}
              </p>
              <Collapse in={isActive}>
                {isActive
                  ? <div>
                      <EditableTextField
                        value={pattern.name}
                        onChange={(value) => {
                          let props = {}
                          props.name = value
                          this.props.updateActiveEntity(pattern, 'trippattern', props)
                          this.props.saveActiveEntity('trippattern')
                        }}
                      />
                      <hr/>
                      <h4>
                        Pattern Shape
                      </h4>
                      <ButtonToolbar>
                      {this.props.editSettings.editGeometry
                        ? [
                          <Button
                            style={{marginBottom: '5px'}}
                            key='save'
                            disabled={this.props.editSettings.coordinatesHistory.length === 0}
                            bsStyle='primary'
                            onClick={() => {
                              this.props.saveActiveEntity('trippattern')
                              .then(() => {
                                this.props.updateEditSetting('editGeometry', !this.props.editSettings.editGeometry)
                              })
                            }}
                          >
                            <span><Icon name='check'/> Save</span>
                          </Button>,
                          <Button
                            style={{marginBottom: '5px'}}
                            key='undo'
                            disabled={this.props.editSettings.actions.length === 0}
                            bsStyle='default'
                            onClick={() => {
                              this.props.undoActiveTripPatternEdits()
                            }}
                          >
                            <span><Icon name='undo'/> Undo</span>
                          </Button>,
                          <Button
                            style={{marginBottom: '5px'}}
                            key='cancel'
                            bsStyle='default'
                            onClick={() => {
                              this.props.resetActiveEntity(pattern, 'trippattern')
                              this.props.updateEditSetting('editGeometry', !this.props.editSettings.editGeometry)
                            }}
                          >
                            <span><Icon name='times'/> Cancel</span>
                          </Button>
                        ]
                        : [
                          <Button
                            style={{marginBottom: '5px'}}
                            key='edit'
                            bsStyle={'warning'}
                            onClick={() => {
                              this.props.updateEditSetting('editGeometry', !this.props.editSettings.editGeometry)
                            }}
                          >
                            <span><Icon name='pencil'/> Edit</span>
                          </Button>,
                          <Button
                            style={{marginBottom: '5px'}}
                            key='delete'
                            bsStyle='danger'
                            onClick={() => {
                              this.props.showConfirmModal({
                                title: `Delete shape for trip pattern?`,
                                body: `Are you sure you want to delete this trip pattern shape?`,
                                onConfirm: () => {
                                  this.props.updateActiveEntity(pattern, 'trippattern', {shape: null})
                                  this.props.saveActiveEntity('trippattern')
                                }
                              })
                            }}
                          >
                            <span><Icon name='trash'/> Delete</span>
                          </Button>,
                          <Button
                            style={{marginBottom: '5px'}}
                            key='create'
                            bsStyle='success'
                            onClick={() => {
                              this.props.showConfirmModal({
                                title: `Create pattern shape from stops?`,
                                body: `Are you sure you want to overwrite this trip pattern?`,
                                onConfirm: () => {
                                  let stopLocations = this.props.stops && pattern.patternStops && pattern.patternStops.length
                                    ? pattern.patternStops.map((s, index) => {
                                      let stop = this.props.stops.find(st => st.id === s.stopId)
                                      return {lng: stop.stop_lon, lat: stop.stop_lat}
                                    })
                                    : []
                                  return this.drawPatternFromStops(pattern, stopLocations)
                                }
                              })
                            }}
                          >
                            <span><Icon name='map-marker'/> Create</span>
                          </Button>
                        ]
                      }
                      {this.props.editSettings.editGeometry
                        ? <FormGroup className='col-xs-12'>
                            <ControlLabel style={{marginTop: '5px'}}>Edit settings</ControlLabel>
                            <Checkbox style={{marginTop: '0px'}} checked={this.props.editSettings.followStreets} onChange={() => this.props.updateEditSetting('followStreets', !this.props.editSettings.followStreets)}>
                              Snap to streets
                            </Checkbox>
                            <Checkbox checked={this.props.editSettings.snapToStops} onChange={() => this.props.updateEditSetting('snapToStops', !this.props.editSettings.snapToStops)}>
                              Snap to stops
                            </Checkbox>
                            <Checkbox checked={!this.props.editSettings.hideStops} onChange={() => this.props.updateEditSetting('hideStops', !this.props.editSettings.hideStops)}>
                              Show stops
                            </Checkbox>
                            <ControlLabel>Editing mode</ControlLabel>
                            <FormControl
                              componentClass='select'
                              value={this.props.editSettings.onMapClick}
                              onChange={(evt) => this.props.updateEditSetting('onMapClick', evt.target.value)}
                            >
                              {CLICK_OPTIONS.map(v => {
                                return <option key={v} value={v}>{toSentenceCase(v.replace('_', ' '))}</option>
                              })}
                            </FormControl>
                            {this.props.editSettings.onMapClick === 'ADD_STOPS_AT_INTERVAL'
                              ? <div style={{marginTop: '20px'}} >
                                  <Rcslider
                                    min={100}
                                    max={2000}
                                    defaultValue={this.props.editSettings.stopInterval}
                                    onAfterChange={(value) => this.props.updateEditSetting('stopInterval', value)}
                                    step={25}
                                    marks={{
                                      100: '100m',
                                      400: <strong>400m</strong>,
                                      800: '800m',
                                      1600: '1600m'
                                    }}
                                    tipFormatter={(value) => {
                                      return `${value}m (${Math.round(value * 0.000621371 * 100) / 100}mi)`
                                    }}
                                  />
                                </div>
                              : this.props.editSettings.onMapClick === 'ADD_STOPS_AT_INTERSECTIONS'
                              ? <Form inline>
                                  {/* distance from intersection */}
                                  <FormControl
                                    type='number' step={5} min={0} max={100}
                                    value={this.props.editSettings.distanceFromIntersection}
                                    onChange={(evt) => this.props.updateEditSetting('distanceFromIntersection', evt.target.value)}
                                    style={{width: '60px', marginTop: '10px'}}
                                  />
                                  <span> meters </span>
                                  {/* before/after intersection */}
                                  <FormControl
                                    componentClass='select'
                                    value={this.props.editSettings.afterIntersection}
                                    onChange={(evt) => this.props.updateEditSetting('afterIntersection', +evt.target.value)}
                                    style={{width: '80px', marginTop: '10px'}}
                                  >
                                    <option value={1}>after</option>
                                    <option value={0}>before</option>
                                  </FormControl>
                                  <span> every </span>
                                  {/* every n intersections */}
                                  <FormControl
                                    type='number' step={1} max={10} min={1}
                                    value={this.props.editSettings.intersectionStep}
                                    onChange={(evt) => this.props.updateEditSetting('intersectionStep', evt.target.value)}
                                    style={{width: '55px', marginTop: '10px'}}
                                  />
                                  <span> intersections</span>
                                </Form>
                              : null
                            }
                            {this.props.editSettings.onMapClick.includes('ADD_')
                              ? <Alert bsStyle='warning' style={{marginTop: '30px'}}>
                                  <small><strong>Warning!</strong> This editing mode creates new stops. Unless no existing stops are nearby, this mode is not recommended.</small>
                                </Alert>
                              : null
                            }
                          </FormGroup>
                        : null
                      }
                      </ButtonToolbar>
                      <hr/>
                      <h4>Schedules</h4>
                      <ButtonGroup>
                        <DropdownButton
                          onSelect={(key) => {
                            let useFrequency = key !== 'timetables'
                            let other = key === 'timetables' ? 'frequencies' : 'timetables'
                            this.props.showConfirmModal({
                              title: `Use ${key} for ${activePattern.name}?`,
                              body: `Are you sure you want to use ${key} for this trip pattern? Any trips created using ${other} will be lost.`,
                              onConfirm: () => {
                                console.log('use ' + key)
                                this.props.updateActiveEntity(activePattern, 'trippattern', {useFrequency})
                                this.props.saveActiveEntity('trippattern')
                              }
                            })
                          }}
                          title={activePattern.useFrequency ? timetableOptions[1] : timetableOptions[0]} id='frequency-dropdown'>
                          <MenuItem eventKey={activePattern.useFrequency ? 'timetables' : 'frequencies'}>{activePattern.useFrequency ? timetableOptions[0] : timetableOptions[1]}</MenuItem>
                        </DropdownButton>
                        <Button
                          disabled={activePatternId === 'new' || (activePattern && activePattern.patternStops && activePattern.patternStops.length === 0)}
                          onClick={() => {
                            this.props.setActiveEntity(feedSource.id, 'route', activeEntity, 'trippattern', pattern, 'timetable')
                          }}
                        >
                          <Icon name='pencil'/> Edit
                        </Button>
                      </ButtonGroup>
                      <hr/>
                      <h4>
                        <ButtonToolbar
                          className='pull-right'
                        >
                          <Button
                            onClick={() => {
                              this.props.updateEditSetting('addStops', !this.props.editSettings.addStops)
                            }}
                            bsStyle={this.props.editSettings.addStops ? 'default' : 'success'}
                            bsSize='small'
                          >
                          {
                            this.props.editSettings.addStops
                            ? <span><Icon name='times'/> Cancel</span>
                            : <span><Icon name='plus'/> Add stop</span>
                          }
                          </Button>
                        </ButtonToolbar>
                        {this.props.editSettings.addStops && this.props.mapState.zoom <= 14
                          ? <small className='pull-right' style={{margin: '5px'}}>Zoom to view stops</small>
                          : null
                        }
                        Stops
                      </h4>
                      {/* List of pattern stops */}
                      <div className='pull-left' style={{width: '50%'}}>
                           <p style={{marginBottom: '0px'}}>Stop sequence</p>
                      </div>
                      <div className='pull-right' style={{width: '50%'}}>
                           <p style={{marginBottom: '0px'}} className='text-right'>Travel time</p>
                      </div>
                      <div className='clearfix'></div>
                      <PatternStopContainer
                        stops={this.props.stops}
                        cardStyle={cardStyle}
                        activePattern={activePattern}
                        updateActiveEntity={this.props.updateActiveEntity}
                        saveActiveEntity={this.props.saveActiveEntity}
                        editSettings={this.props.editSettings}
                        updateEditSetting={this.props.updateEditSetting}
                      />
                      {/* Add stop selector */}
                      {this.props.editSettings.addStops
                        ? <div style={cardStyle}>
                            <VirtualizedEntitySelect
                              component={'stop'}
                              entities={this.props.stops}
                              onChange={(input) => {
                                let patternStops = [...activePattern.patternStops]
                                let stop = input.entity
                                let coordinates = activePattern.shape && activePattern.shape.coordinates
                                let newStop = {stopId: stop.id, defaultDwellTime: 0, defaultTravelTime: 0}
                                // if adding stop to end
                                if (typeof index === 'undefined') {
                                  // if shape coordinates already exist, just extend them
                                  if (coordinates) {
                                    let endPoint = ll.toLatlng(coordinates[coordinates.length - 1])
                                    this.extendPatternToStop(activePattern, endPoint, {lng: stop.stop_lon, lat: stop.stop_lat})
                                    .then(() => {
                                      patternStops.push(newStop)
                                      this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                                      this.props.saveActiveEntity('trippattern')
                                    })
                                  }
                                  // if shape coordinates do not exist, add pattern stop and get shape between stops (if multiple stops exist)
                                  else {
                                    patternStops.push(newStop)
                                    if (patternStops.length > 1) {
                                      let previousStop = this.props.stops.find(s => s.id === patternStops[patternStops.length - 2].stopId)
                                      getSegment([[previousStop.stop_lon, previousStop.stop_lat], [stop.stop_lon, stop.stop_lat]], this.props.editSettings.followStreets)
                                      .then(geojson => {
                                        this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: geojson.coordinates}})
                                        this.props.saveActiveEntity('trippattern')
                                      })
                                    }
                                    else {
                                      this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                                      this.props.saveActiveEntity('trippattern')
                                    }
                                  }

                                  // if not following roads
                                  // updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}})
                                }
                                // if adding stop in middle
                                else {
                                  // patternStops.splice(index, 0, newStop)
                                  // updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                                  // saveActiveEntity('trippattern')
                                }
                                // TODO: add strategy for stop at beginning
                              }}
                            />
                            <div style={{marginTop: '5px'}} className='text-center'>
                              <Button
                                bsSize='small'
                                bsStyle='default'
                                block
                                onClick={() => {
                                  this.props.updateEditSetting('addStops', !this.props.editSettings.addStops)
                                }}
                              >
                                <Icon name='times'/> Cancel
                              </Button>
                            </div>
                          </div>
                        : <div style={cardStyle}>
                            <p
                              style={{width: '100%', margin: '0px'}}
                              onClick={() => {
                                this.props.updateEditSetting('addStops', !this.props.editSettings.addStops)
                              }}
                              className='small'
                            >
                              <Icon name='plus'/> Add stop
                            </p>
                          </div>
                      }
                      <Form>
                        <FormGroup className={`col-xs-4`} bsSize='small'>
                          <ControlLabel><small>Dwell time</small></ControlLabel>
                          <MinuteSecondInput
                            seconds={this.state.dwellTime}
                            // style={{width: '60px'}}
                            onChange={(value) => {
                              this.setState({dwellTime: value})
                            }}
                          />
                        </FormGroup>
                        {'  '}
                        <InputGroup
                          style={{paddingTop: '25px'}}
                          className={`col-xs-8`}
                          bsSize='small'
                        >
                          <FormControl
                            type='number'
                            min={1}
                            placeholder={`${DEFAULT_SPEED} (km/hr)`}
                            onChange={(evt) => {
                              this.setState({speed: evt.target.value})
                            }}
                          />
                          <InputGroup.Button>
                            <Button
                              onClick={() => {
                                this.calculateDefaultTimes(activePattern, this.state.speed, this.state.dwellTime)
                              }}
                              bsStyle='default'
                            >
                              <Icon name='calculator'/> Calc. times
                            </Button>
                          </InputGroup.Button>
                        </InputGroup>
                      </Form>
                    </div>
                  : <div></div>
                }
              </Collapse>
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

    return (
      <div>
      <div
        style={panelStyle}
      >
        <div
            style={{paddingRight: sidePadding, marginBottom: '5px'}}
        >
          <h3>
            <ButtonToolbar
              className='pull-right'
            >
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Reverse trip pattern</Tooltip>}>
                <Button
                  bsSize='small'
                  disabled={!activePatternId}
                  bsStyle='warning'
                  onClick={() => {
                    this.props.showConfirmModal({
                      title: `Reverse trip pattern?`,
                      body: `Are you sure you want to reverse this trip pattern?`,
                      onConfirm: () => {
                        let newCoords = [...activePattern.shape.coordinates].reverse()
                        let newStops = [...activePattern.patternStops].reverse()
                        this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: newStops, shape: {type: 'LineString', coordinates: newCoords}})
                        this.props.saveActiveEntity('trippattern')
                      }
                    })
                  }}
                >
                  <Icon name='exchange'/>
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Duplicate trip pattern</Tooltip>}>
                <Button
                  bsSize='small'
                  disabled={!activePatternId}
                  onClick={() => {
                    this.props.cloneEntity(feedSource.id, 'trippattern', activePattern.id, true)
                  }}
                >
                  <Icon name='clone'/>
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Delete trip pattern</Tooltip>}>
                <Button
                  bsSize='small'
                  disabled={!activePatternId}
                  bsStyle='danger'
                  onClick={() => {
                    this.props.showConfirmModal({
                      title: `Delete trip pattern?`,
                      body: `Are you sure you want to delete this trip pattern? This will delete all trips associated with this pattern.`,
                      onConfirm: () => {
                        this.props.deleteEntity(feedSource.id, 'trippattern', activePattern.id, activePattern.routeId)
                        this.props.setActiveEntity(feedSource.id, 'route', activeEntity, 'trippattern')
                      },
                      confirmButtonStyle: 'danger',
                      confirmButtonText: 'Delete pattern',
                    })
                  }}
                >
                  <Icon name='trash'/>
                </Button>
              </OverlayTrigger>
            </ButtonToolbar>
            <Button
              bsSize='small'
              disabled={activeEntity.tripPatterns && activeEntity.tripPatterns.findIndex(e => e.id === 'new') !== -1}
              onClick={() => {
                this.props.newGtfsEntity(feedSource.id, 'trippattern', {routeId: activeEntity.id, patternStops: [], name: 'New Pattern', feedId: this.props.feedSource.id, id: 'new'}, true)
              }}
            >
              <Icon name='plus'/> New pattern
            </Button>
          </h3>
        </div>
        {patternList}
      </div>
      </div>
    )
  }
}
