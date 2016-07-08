import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, ListGroupItem, Button, ButtonGroup, DropdownButton, MenuItem, ButtonToolbar, Collapse, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
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
import TimetableEditor from './TimetableEditor'
import {polyline as getPolyline} from '../../scenario-editor/utils/valhalla'
import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import { getEntityName } from '../util/gtfs'

export default class TripPatternList extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentWillReceiveProps (nextProps) {
  }
  async drawPatternFromStops (pattern, stops) {
    let newShape = await getPolyline(stops)
    console.log(newShape)
    // let encodedShape = encodePolyline(newShape.map(coord => ([coord[1], coord[0]])))
    // console.log(encodedShape)
    this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: newShape}})
    this.props.saveActiveEntity('trippattern')
    return true
  }
  async extendPatternToStop (pattern, endPoint, stop) {
    let newShape = await getPolyline([endPoint, stop])
    console.log(newShape)
    // let encodedShape = encodePolyline(newShape.map(coord => ([coord[1], coord[0]])))
    // console.log(encodedShape)
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
    const { feedSource, route, activePatternId } = this.props
    if (!route.tripPatterns) {
      return <Icon spin name='refresh' />
    }
    const activePattern = route.tripPatterns.find(p => p.id === activePatternId)
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
        {route.tripPatterns ? route.tripPatterns.map(pattern => {
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
                  if (isActive) this.props.setActiveEntity(feedSource.id, 'route', route, 'trippattern')
                  else this.props.setActiveEntity(feedSource.id, 'route', route, 'trippattern', pattern)
                }}
              >
                <Icon name={isActive ? 'caret-down' : 'caret-right'}/>
                {' '}
                {pattern.name ? patternName : '[Unnamed]'}
              </p>
              <Collapse in={isActive}>
                <div>
                  <EditableTextField
                    value={pattern.name}
                    onChange={(value) => {
                      let props = {}
                      props.name = value
                      this.setState({name: value})
                      this.props.updateActiveEntity(pattern, 'trippattern', props)
                    }}
                  />
                  <h4>Pattern Geometry</h4>
                  <ButtonToolbar>
                  <Button
                    style={{marginBottom: '5px'}}
                    bsStyle={this.props.isEditingGeometry ? 'primary' : 'warning'}
                    onClick={() => {
                      if (this.props.isEditingGeometry) {
                        this.props.saveActiveEntity('trippattern')
                        .then(() => {
                          this.props.toggleEditGeometry()
                        })
                      }
                      else {
                        this.props.toggleEditGeometry()
                      }
                    }}
                  >
                    {this.props.isEditingGeometry
                      ? <span><Icon name='check'/> Save</span>
                      : <span><Icon name='pencil'/> Edit</span>
                    }
                  </Button>
                  {this.props.isEditingGeometry
                    ? [
                        <Button
                          style={{marginBottom: '5px'}}
                          bsStyle='default'
                          onClick={() => {
                            this.props.resetActiveEntity(pattern, 'trippattern')
                            this.props.toggleEditGeometry()
                          }}
                        >
                          <span><Icon name='times'/> Cancel</span>
                        </Button>
                        // ,
                        // <Button
                        //   style={{marginBottom: '5px'}}
                        //   bsStyle='danger'
                        //   onClick={() => this.props.toggleFollowRoads()}
                        // >
                        //   <span><Icon name='times'/> Discard</span>
                        // </Button>
                      ]
                    : [
                        <Button
                          style={{marginBottom: '5px'}}
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
                  </ButtonToolbar>
                  <ButtonGroup>
                    <DropdownButton title="Use timetables" id="bg-nested-dropdown">
                      <MenuItem eventKey="2">Use frequencies</MenuItem>
                    </DropdownButton>
                    <Button
                      disabled={activePatternId === 'new' || (activePattern && activePattern.patternStops.length === 0)}
                      onClick={() => {
                        if (showTimetable) this.props.setActiveEntity(feedSource.id, 'route', route, 'trippattern', pattern)
                        else this.props.setActiveEntity(feedSource.id, 'route', route, 'trippattern', pattern, 'timetable')
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
                          // console.log(totalTravelTime, moment().seconds(totalTravelTime))
                          let stopIsActive = this.state.activeStop === s.stopId
                          let stop = this.props.stops.find(st => st.id === s.stopId)
                          // console.log(stop)
                          let stopRowName = stop ? `${index + 1}. ${stop.stop_name}` : `${index + 1}. ${s.stopId}`
                          return (
                            <tr
                              key={`${index}-${s.stopId}`}
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
                                    if (!stopIsActive) this.setState({activeStop: s.stopId})
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
                                  <div>
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
                                      <Icon name='times'/> Remove
                                    </Button>
                                    <FormGroup
                                      controlId="formBasicText"
                                      /*validationState={this.getValidationState()}*/
                                    >
                                    <ControlLabel>Default travel time</ControlLabel>
                                    <FormControl
                                      // tabIndex={index}
                                      type='number'
                                      min={0}
                                      step={1}
                                      defaultValue={s.defaultTravelTime}
                                      onChange={(evt) => {
                                        let patternStops = [...activePattern.patternStops]
                                        patternStops[index].defaultTravelTime = +evt.target.value
                                        this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                                      }}
                                    />
                                    </FormGroup>
                                    <FormGroup
                                      controlId="formBasicText"
                                      /*validationState={this.getValidationState()}*/
                                    >
                                    <ControlLabel>Default dwell time</ControlLabel>
                                    <FormControl
                                      // tabIndex={index}
                                      type='number'
                                      min={0}
                                      step={1}
                                      defaultValue={s.defaultDwellTime}
                                      onChange={(evt) => {
                                        let patternStops = [...activePattern.patternStops]
                                        patternStops[index].defaultDwellTime = +evt.target.value
                                        this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                                      }}
                                    />
                                    </FormGroup>
                                  </div>
                                </Collapse>
                              </td>
                            </tr>
                          )
                        })
                        : !this.props.stops
                        ? <tr><td className='text-center'><Icon spin name='refresh' /></td></tr>
                        : <tr><td className='text-center'>No stops</td></tr>
                      }
                      <tr
                        style={stopRowStyle}
                      >
                        <td colSpan='2'>
                          {this.props.isAddingStops
                            ? <div>
                              <Button
                                bsStyle='danger'
                                // className='pull-right'
                                style={{marginLeft: '5px'}}
                                onClick={() => {
                                  this.props.toggleAddStops()
                                }}
                              >
                                <Icon name='times'/>
                              </Button>
                                <VirtualizedEntitySelect
                                  value={this.props.entity ? {value: this.props.entity.id, label: getEntityName(this.props.activeComponent, this.props.entity), entity: this.props.entity} : null}
                                  component={'stop'}
                                  entities={this.props.stops}
                                  onChange={(input) => {
                                    console.log(input)
                                    let patternStops = [...pattern.patternStops]
                                    let stop = input.entity
                                    // let stopPoint = point([stop.stop_lon, stop.stop_lat])
                                    let coordinates = pattern.shape && pattern.shape.coordinates
                                    let endPoint = ll.toLatlng(coordinates[coordinates.length - 1])
                                    // let distance =
                                    this.extendPatternToStop(pattern, endPoint, {lng: stop.stop_lon, lat: stop.stop_lat})
                                    .then(() => {
                                      patternStops.push({stopId: input.value, defaultDwellTime: 0, defaultTravelTime: 0})
                                      this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
                                      this.props.saveActiveEntity('trippattern')
                                    })
                                  }}
                                />
                              </div>
                            : <p
                                onClick={() => {
                                  // this.props.fetchStops(this.props.feedSource.id)
                                  // this.setState({isAddingStop: true})
                                  this.props.toggleAddStops()
                                }}
                                className='small'
                              >
                                <Icon name='plus'/> Add stop
                              </p>
                          }
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
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
              <Button
                bsSize='small'
                disabled={!activePatternId}
              >
                <Icon name='clone'/>
              </Button>
              <Button
                bsSize='small'
                disabled={!activePatternId}
                bsStyle='danger'
                onClick={() => {
                  this.props.deleteEntity(feedSource.id, 'trippattern', activePattern)
                  this.props.setActiveEntity(feedSource.id, 'route', route, 'trippattern')
                }}
              >
                <Icon name='trash'/>
              </Button>
            </ButtonToolbar>
            <Button
              bsSize='small'
              disabled={route.tripPatterns && route.tripPatterns.findIndex(e => e.id === 'new') !== -1}
              onClick={() => {
                this.props.newEntityClicked(this.props.feedSource.id, 'trippattern', {routeId: route.id})
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
