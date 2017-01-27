import React, { Component } from 'react'
import {Icon} from '@conveyal/woonerf'
import { Button, ButtonToolbar } from 'react-bootstrap'
import ll from 'lonlng'

import { polyline as getPolyline, getSegment } from '../../../scenario-editor/utils/valhalla'
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
  addStopFromSelect = (input) => {
    if (!input) {
      return
    }
    let patternStops = [...this.props.activePattern.patternStops]
    let stop = input.entity
    let coordinates = this.props.activePattern.shape && this.props.activePattern.shape.coordinates
    let newStop = {stopId: stop.id, defaultDwellTime: 0, defaultTravelTime: 0}
    // if adding stop to end (currently only place to add stop in stop selector)
    if (typeof index === 'undefined') {
      // if shape coordinates already exist, just extend them
      if (coordinates) {
        let endPoint = ll.toLatlng(coordinates[coordinates.length - 1])
        this.extendPatternToStop(this.props.activePattern, endPoint, {lng: stop.stop_lon, lat: stop.stop_lat})
        .then(() => {
          patternStops.push(newStop)
          this.props.updateActiveEntity(this.props.activePattern, 'trippattern', {patternStops: patternStops})
          this.props.saveActiveEntity('trippattern')
        })
      } else {
        // if shape coordinates do not exist, add pattern stop and get shape between stops (if multiple stops exist)
        patternStops.push(newStop)
        if (patternStops.length > 1) {
          let previousStop = this.props.stops.find(s => s.id === patternStops[patternStops.length - 2].stopId)
          getSegment([[previousStop.stop_lon, previousStop.stop_lat], [stop.stop_lon, stop.stop_lat]], this.props.editSettings.followStreets)
          .then(geojson => {
            this.props.updateActiveEntity(this.props.activePattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: geojson.coordinates}})
            this.props.saveActiveEntity('trippattern')
          })
        } else {
          this.props.updateActiveEntity(this.props.activePattern, 'trippattern', {patternStops: patternStops})
          this.props.saveActiveEntity('trippattern')
        }
      }
      // TODO: add updated shape if not following roads
      // updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}})
    }
  }
  render () {
    const {
      activePattern,
      updateEditSetting,
      editSettings,
      mapState,
      stops,
      updateActiveEntity,
      saveActiveEntity
    } = this.props
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
              onClick={() => updateEditSetting('addStops', !editSettings.addStops)}
              bsStyle={editSettings.addStops ? 'default' : 'success'}
              bsSize='small'
            >
              {editSettings.addStops
                ? <span><Icon type='times' /> Cancel</span>
                : <span><Icon type='plus' /> Add stop</span>
              }
            </Button>
          </ButtonToolbar>
          {editSettings.addStops && mapState.zoom <= 14
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
          stops={stops}
          cardStyle={cardStyle}
          activePattern={activePattern}
          updateActiveEntity={updateActiveEntity}
          saveActiveEntity={saveActiveEntity}
          editSettings={editSettings}
          updateEditSetting={updateEditSetting} />
        {/* Add stop selector */}
        {editSettings.addStops
          ? <div style={cardStyle}>
            <VirtualizedEntitySelect
              component={'stop'}
              entities={stops}
              onChange={this.addStopFromSelect}
            />
            <div style={{marginTop: '5px'}} className='text-center'>
              <Button
                bsSize='small'
                bsStyle='default'
                block
                onClick={() => updateEditSetting('addStops', !editSettings.addStops)}
              >
                <Icon type='times' /> Cancel
              </Button>
            </div>
          </div>
          : <div style={cardStyle}>
            <p
              style={{width: '100%', margin: '0px'}}
              onClick={() => updateEditSetting('addStops', !editSettings.addStops)}
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
