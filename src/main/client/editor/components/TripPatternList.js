import React, {Component, PropTypes} from 'react'
import { Row, Col, Table, ListGroup, ListGroupItem, Button, ButtonGroup, Checkbox, DropdownButton, MenuItem, ButtonToolbar, Collapse, Form, FormGroup, FormControl, ControlLabel, OverlayTrigger, Tooltip } from 'react-bootstrap'
import {Icon} from 'react-fa'
import moment from 'moment'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import ll, {isEqual as coordinatesAreEqual} from 'lonlng'

// import lineString from 'turf-linestring'
// import bearing from 'turf-bearing'
import point from 'turf-point'
// import distance from 'turf-distance'
// import along from 'turf-along'
// import lineDistance from 'turf-line-distance'
// import lineSlice from 'turf-line-slice'
// import pointOnLine from 'turf-point-on-line'

import EditableTextField from '../../common/components/EditableTextField'
import EntityDetails from './EntityDetails'
import GtfsTable from './GtfsTable'
import MinuteSecondInput from './MinuteSecondInput'
import TimetableEditor from './TimetableEditor'
import {polyline as getPolyline, getSegment } from '../../scenario-editor/utils/valhalla'
import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import { getEntityName } from '../util/gtfs'

export default class TripPatternList extends Component {

  constructor (props) {
    super(props)
    this.state = {}
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
  async extendPatternToStop (pattern, endPoint, stop) {
    let newShape = await getPolyline([endPoint, stop])
    if (newShape) {
      this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: [...pattern.shape.coordinates, ...newShape]}})
      this.props.saveActiveEntity('trippattern')
      return true
    }
    else {
      this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: [...pattern.shape.coordinates, ll.toCoordinates(stop)]}})
      this.props.saveActiveEntity('trippattern')
      return false
    }
  }
  render () {
    const { feedSource, activeEntity } = this.props
    const activePatternId = this.props.activeSubEntity
    if (!activeEntity.tripPatterns) {
      return <Icon spin name='refresh' />
    }
    const activePattern = activeEntity.tripPatterns.find(p => p.id === activePatternId)
    const sidePadding = '5px'
    const rowHeight = '37px'
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
        style={{height: '100%', overflowY: 'scroll',}}
      >
      <Table
        hover
      >
        <thead></thead>
        <tbody>
        {activeEntity.tripPatterns ? activeEntity.tripPatterns.map(pattern => {
          const rowStyle = {
            paddingTop: 5,
            paddingBottom: 5,
          }
          const activeRowStyle = {
            backgroundColor: activeColor,
            paddingTop: 5,
            paddingBottom: 5,
          }
          const isActive = activePatternId && pattern.id === activePatternId

          const showTimetable = isActive && this.props.subSubComponent === 'timetable'
          const stopRowStyle = {
            cursor: 'pointer',
            paddingTop: 2,
            paddingBottom: 2,
          }
          const patternName = `${`${pattern.name.length > 35 ? pattern.name.substr(0, 35) + '...' : pattern.name}`} ${pattern.patternStops ? `(${pattern.patternStops.length} stops)` : ''}`
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
          let totalTravelTime = 0
          return (
            <tr
              href='#'
              value={pattern.id}
              id={pattern.id}
              key={pattern.id}
              style={rowStyle}
            >
              <td
                /*className={isActive ? 'success' : ''}*/
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
                  ?  <div>
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
                      <h4>Pattern Geometry</h4>
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
                                  this.props.toggleEditSetting('editGeometry')
                                })
                              }}
                            >
                              <span><Icon name='check'/> Save</span>
                            </Button>
                            ,
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
                            </Button>
                            ,
                            <Button
                              style={{marginBottom: '5px'}}
                              key='cancel'
                              bsStyle='default'
                              onClick={() => {
                                this.props.resetActiveEntity(pattern, 'trippattern')
                                this.props.toggleEditSetting('editGeometry')
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
                                this.props.toggleEditSetting('editGeometry')
                              }}
                            >
                              <span><Icon name='pencil'/> Edit</span>
                            </Button>
                            ,
                            <Button
                              style={{marginBottom: '5px'}}
                              key='delete'
                              bsStyle='danger'
                              onClick={() => {
                                this.props.updateActiveEntity(pattern, 'trippattern', {shape: null})
                                this.props.saveActiveEntity('trippattern')
                              }}
                            >
                              <span><Icon name='times'/> Delete</span>
                            </Button>
                            ,
                            <Button
                              style={{marginBottom: '5px'}}
                              key='create'
                              bsStyle='success'
                              onClick={() => {
                                let stopLocations = this.props.stops && pattern.patternStops && pattern.patternStops.length
                                  ? pattern.patternStops.map((s, index) => {
                                    let stop = this.props.stops.find(st => st.id === s.stopId)
                                    return {lng: stop.stop_lon, lat: stop.stop_lat}
                                  })
                                  : []
                                return this.drawPatternFromStops(pattern, stopLocations)
                              }}
                            >
                              <span><Icon name='map-marker'/> Create</span>
                            </Button>
                          ]
                      }
                      {this.props.editSettings.editGeometry
                        ? <FormGroup className='col-xs-12'>
                            <Checkbox checked={this.props.editSettings.followStreets} onChange={() => this.props.toggleEditSetting('followStreets')}>
                              Snap to streets
                            </Checkbox>
                            <Checkbox checked={this.props.editSettings.snapToStops} onChange={() => this.props.toggleEditSetting('snapToStops')}>
                              Snap to stops
                            </Checkbox>
                            <Checkbox checked={!this.props.editSettings.hideStops} onChange={() => this.props.toggleEditSetting('hideStops')}>
                              Show stops
                            </Checkbox>
                          </FormGroup>
                        : null
                      }
                      </ButtonToolbar>
                      <hr/>
                      <ButtonGroup>
                        <DropdownButton title="Use timetables" id="bg-nested-dropdown">
                          <MenuItem eventKey="2">Use frequencies</MenuItem>
                        </DropdownButton>
                        <Button
                          disabled={activePatternId === 'new' || (activePattern && activePattern.patternStops.length === 0)}
                          onClick={() => {
                            if (showTimetable) this.props.setActiveEntity(feedSource.id, 'route', activeEntity, 'trippattern', pattern)
                            else this.props.setActiveEntity(feedSource.id, 'route', activeEntity, 'trippattern', pattern, 'timetable')
                          }}
                        >
                          {showTimetable
                            ? 'Close'
                            : 'Edit'
                          }
                        </Button>
                      </ButtonGroup>
                      <Table
                        hover
                        style={{marginTop: '5px'}}
                        onDrop={onDrop}
                      >
                        <thead>
                          <tr>
                            <th>Stop sequence</th>
                            <th className='text-right'>Travel time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.props.stops && pattern.patternStops && pattern.patternStops.length
                            ? pattern.patternStops.map((s, index) => {
                              totalTravelTime += s.defaultTravelTime + s.defaultDwellTime
                              const key = `${index}-${s.stopId}`
                              // console.log(totalTravelTime, moment().seconds(totalTravelTime))
                              let stopIsActive = this.state.activeStop === key
                              let stop = this.props.stops.find(st => st.id === s.stopId)
                              // console.log(stop)
                              let stopRowName = stop ? `${index + 1}. ${stop.stop_name}` : `${index + 1}. ${s.stopId}`
                              return (
                                <tr
                                  key={key}
                                  draggable={true}
                                  style={stopRowStyle}
                                  onDragOver={onDragOver}
                                  onDragStart={onDragStart}
                                >
                                  <td
                                    style={{padding: '0px'}}
                                    colSpan='2'
                                  >
                                    <p
                                      title={stopRowName}
                                      style={{width: '100%', margin: '0px'}}
                                      className='small'
                                      onClick={(e) => {
                                        console.log(e.target)
                                        if (!stopIsActive) this.setState({activeStop: key})
                                        else this.setState({activeStop: null})
                                      }}
                                    >
                                      <span className='pull-right'>
                                        <span>{Math.round(totalTravelTime/60)} (+{Math.round(s.defaultTravelTime / 60)} +{Math.round(s.defaultDwellTime / 60)})</span>
                                        {'    '}
                                        <Button bsSize='xsmall' bsStyle='link' style={{cursor: '-webkit-grab'}}><Icon name='bars'/></Button>
                                      </span>
                                      <Icon name={stopIsActive ? 'caret-down' : 'caret-right'}/>
                                      {' '}
                                      <span>{stopRowName.length > 25 ? stopRowName.substr(0, 25) + '...' : stopRowName}</span>

                                    </p>
                                    <Collapse in={stopIsActive}>
                                      {stopIsActive
                                        ? <div>
                                            <Row>
                                              <Col xs={12}>
                                              <Button
                                                bsStyle='danger'
                                                bsSize='xsmall'
                                                className='pull-right'
                                                onClick={() => {
                                                  let patternStops = [...activePattern.patternStops]
                                                  patternStops.splice(index, 1)
                                                  this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                                                  this.props.saveActiveEntity('trippattern')
                                                }}
                                              >
                                                <Icon name='trash'/> Remove
                                              </Button>
                                              </Col>
                                            </Row>
                                            <Row>
                                              <Col xs={6}>
                                                <FormGroup
                                                  controlId="formBasicText"
                                                  /*validationState={this.getValidationState()}*/
                                                >
                                                  <ControlLabel>Default travel time</ControlLabel>
                                                  <MinuteSecondInput
                                                    seconds={s.defaultTravelTime}
                                                    onChange={(value) => {
                                                      let patternStops = [...activePattern.patternStops]
                                                      patternStops[index].defaultTravelTime = value
                                                      this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                                                    }}
                                                  />
                                                </FormGroup>
                                              </Col>
                                              <Col xs={6}>
                                                <FormGroup
                                                  controlId="formBasicText"
                                                  /*validationState={this.getValidationState()}*/
                                                >
                                                  <ControlLabel>Default dwell time</ControlLabel>
                                                  <MinuteSecondInput
                                                    seconds={s.defaultDwellTime}
                                                    onChange={(value) => {
                                                      let patternStops = [...activePattern.patternStops]
                                                      patternStops[index].defaultDwellTime = value
                                                      this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                                                    }}
                                                  />
                                                </FormGroup>
                                              </Col>
                                            </Row>
                                          </div>
                                        : <div></div>
                                      }
                                    </Collapse>
                                  </td>
                                </tr>
                              )
                            })
                            : !this.props.stops
                            ? <tr><td className='text-center'><Icon spin name='refresh' /></td></tr>
                            : <tr><td className='text-center' colSpan='2'>No stops</td></tr>
                          }
                          <tr
                            style={stopRowStyle}
                          >
                              {this.props.editSettings.addStops
                                ? [
                                    <td>
                                      <VirtualizedEntitySelect
                                        value={this.props.entity ? {value: this.props.entity.id, label: getEntityName(this.props.activeComponent, this.props.entity), entity: this.props.entity} : null}
                                        component={'stop'}
                                        entities={this.props.stops}
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
                                                this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
                                                this.props.saveActiveEntity('trippattern')
                                              })
                                            }
                                            // if shape coordinates do not exist, add pattern stop and get shape between stops (if multiple stops exist)
                                            else {
                                              patternStops.push(newStop)
                                              if (patternStops.length > 1) {
                                                let previousStop = this.props.stops.find(s => s.id === patternStops[patternStops.length - 2].stopId)
                                                console.log(previousStop)
                                                getSegment([[previousStop.stop_lon, previousStop.stop_lat], [stop.stop_lon, stop.stop_lat]], this.props.editSettings.followStreets)
                                                .then(geojson => {
                                                  this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: geojson.coordinates}})
                                                  this.props.saveActiveEntity('trippattern')
                                                })
                                              }
                                              else {
                                                this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
                                                this.props.saveActiveEntity('trippattern')
                                              }
                                            }

                                            // if not following roads
                                            // this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}})
                                          }
                                          // if adding stop in middle
                                          else {
                                            patternStops.splice(index, 0, newStop)
                                            this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
                                            this.props.saveActiveEntity('trippattern')
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
                                          this.props.toggleEditSetting('addStops')
                                        }}
                                      >
                                        <Icon name='times'/>
                                      </Button>
                                    </td>
                                  ]
                                : <td colSpan='2'
                                    onClick={() => {
                                      // this.props.fetchStops(this.props.feedSource.id)
                                      this.props.toggleEditSetting('addStops')
                                    }}
                                    className='small'
                                  >
                                    <Icon name='plus'/> Add stop
                                  </td>
                              }
                          </tr>
                        </tbody>
                      </Table>
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

    const activeTable = DT_CONFIG.modules.editor.spec
      .find(t => t.id === 'route')

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
                    let newCoords = [...activePattern.shape.coordinates].reverse()
                    let newStops = [...activePattern.patternStops].reverse()
                    this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: newStops, shape: {type: 'LineString', coordinates: newCoords}})
                    this.props.saveActiveEntity('trippattern')
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
                    this.props.deleteEntity(feedSource.id, 'trippattern', activePattern.id, activePattern.routeId)
                    this.props.setActiveEntity(feedSource.id, 'route', activeEntity, 'trippattern')
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
                this.props.newEntityClicked(this.props.feedSource.id, 'trippattern', {routeId: activeEntity.id, patternStops: [], name: 'New Pattern', feedId: this.props.feedSource.id, id: 'new'}, true)
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
