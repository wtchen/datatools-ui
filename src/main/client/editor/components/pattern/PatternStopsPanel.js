import React, { Component } from 'react'
import {Icon} from '@conveyal/woonerf'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { polyline as getPolyline, getSegment } from '../../scenario-editor/utils/valhalla'
import ll from 'lonlng'

import PatternStopContainer from './PatternStopContainer'
import VirtualizedEntitySelect from '../VirtualizedEntitySelect'

export default class PatternStopsPanel extends Component {
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
  async drawPatternFromStops (pattern, stops) {
    let newShape = await getPolyline(stops)
    console.log(newShape)
    this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: newShape}})
    this.props.saveActiveEntity('trippattern')
    return true
  }
  addStopFromSelect (input, activePattern) {
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
      } else {
        // if shape coordinates do not exist, add pattern stop and get shape between stops (if multiple stops exist)
        patternStops.push(newStop)
        if (patternStops.length > 1) {
          let previousStop = this.props.stops.find(s => s.id === patternStops[patternStops.length - 2].stopId)
          getSegment([[previousStop.stop_lon, previousStop.stop_lat], [stop.stop_lon, stop.stop_lat]], this.props.editSettings.followStreets)
          .then(geojson => {
            this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: geojson.coordinates}})
            this.props.saveActiveEntity('trippattern')
          })
        } else {
          this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
          this.props.saveActiveEntity('trippattern')
        }
      }
      // if not following roads
      // updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}})
    }
  }
  render () {
    const { activePattern } = this.props
    const cardStyle = {
      border: '1px dashed gray',
      padding: '0.5rem 0.5rem',
      marginBottom: '.5rem',
      backgroundColor: '#f2f2f2',
      cursor: 'pointer'
    }
    return (
      <div>
        <h4>
          <ButtonToolbar
            className='pull-right'
          >
            <Button
              onClick={() => this.props.updateEditSetting('addStops', !this.props.editSettings.addStops)}
              bsStyle={this.props.editSettings.addStops ? 'default' : 'success'}
              bsSize='small'
            >
              {this.props.editSettings.addStops
                ? <span><Icon type='times' /> Cancel</span>
                : <span><Icon type='plus' /> Add stop</span>
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
        <div className='clearfix' />
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
              onChange={(input) => this.addStopFromSelect(input, activePattern)}
            />
            <div style={{marginTop: '5px'}} className='text-center'>
              <Button
                bsSize='small'
                bsStyle='default'
                block
                onClick={() => this.props.updateEditSetting('addStops', !this.props.editSettings.addStops)}
              >
                <Icon type='times' /> Cancel
              </Button>
            </div>
          </div>
          : <div style={cardStyle}>
            <p
              style={{width: '100%', margin: '0px'}}
              onClick={() => this.props.updateEditSetting('addStops', !this.props.editSettings.addStops)}
              className='small'
            >
              <Icon type='plus' /> Add stop
            </p>
          </div>
        }
      </div>
    )
  }
}
