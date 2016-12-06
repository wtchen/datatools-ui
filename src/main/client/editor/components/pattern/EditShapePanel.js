import React, { Component } from 'react'
import {Icon} from '@conveyal/woonerf'
import { Button, Alert, Checkbox, ButtonToolbar, FormGroup, Form, FormControl, ControlLabel } from 'react-bootstrap'
import { sentence as toSentenceCase } from 'change-case'
import Rcslider from 'rc-slider'
import { polyline as getPolyline } from '../../scenario-editor/utils/valhalla'

import { CLICK_OPTIONS } from '../util'

export default class EditShapePanel extends Component {
  async drawPatternFromStops (pattern, stops) {
    let newShape = await getPolyline(stops)
    console.log(newShape)
    this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: newShape}})
    this.props.saveActiveEntity('trippattern')
    return true
  }
  renderEditSettings (isEditing) {
    return isEditing
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
  renderEditButtons (isEditing, activePattern) {
    const buttons = []
    if (isEditing) {
      buttons.push(<Button
        style={{marginBottom: '5px'}}
        key='save'
        disabled={this.props.editSettings.coordinatesHistory.length === 0}
        bsStyle='primary'
        onClick={() => {
          this.props.saveActiveEntity('trippattern')
          .then(() => {
            this.props.updateEditSetting('editGeometry', !this.props.editSettings.editGeometry, activePattern)
          })
        }}
      >
        <span><Icon type='check' /> Save</span>
      </Button>)
      buttons.push(<Button
        style={{marginBottom: '5px'}}
        key='undo'
        disabled={this.props.editSettings.actions.length === 0}
        bsStyle='default'
        onClick={() => {
          this.props.undoActiveTripPatternEdits()
        }}
      >
        <span><Icon type='undo' /> Undo</span>
      </Button>)
      buttons.push(<Button
        style={{marginBottom: '5px'}}
        key='cancel'
        bsStyle='default'
        onClick={() => {
          this.props.resetActiveEntity(activePattern, 'trippattern')
          this.props.updateEditSetting('editGeometry', !this.props.editSettings.editGeometry, activePattern)
        }}
      >
        <span><Icon type='times' /> Cancel</span>
      </Button>)
    } else {
      buttons.push(<Button
        style={{marginBottom: '5px'}}
        key='edit'
        bsStyle={'warning'}
        onClick={() => {
          this.props.updateEditSetting('editGeometry', !this.props.editSettings.editGeometry, activePattern)
        }}
      >
        <span><Icon type='pencil' /> Edit</span>
      </Button>)
      buttons.push(<Button
        style={{marginBottom: '5px'}}
        key='delete'
        bsStyle='danger'
        onClick={() => {
          this.props.showConfirmModal({
            title: `Delete shape for trip pattern?`,
            body: `Are you sure you want to delete this trip pattern shape?`,
            onConfirm: () => {
              this.props.updateActiveEntity(activePattern, 'trippattern', {shape: null})
              this.props.saveActiveEntity('trippattern')
            }
          })
        }}
      >
        <span><Icon type='trash' /> Delete</span>
      </Button>)
      buttons.push(<Button
        style={{marginBottom: '5px'}}
        key='create'
        bsStyle='success'
        onClick={() => {
          this.props.showConfirmModal({
            title: `Create pattern shape from stops?`,
            body: `Are you sure you want to overwrite this trip pattern?`,
            onConfirm: () => {
              let stopLocations = this.props.stops && activePattern.patternStops && activePattern.patternStops.length
                ? activePattern.patternStops.map((s, index) => {
                  let stop = this.props.stops.find(st => st.id === s.stopId)
                  return {lng: stop.stop_lon, lat: stop.stop_lat}
                })
                : []
              return this.drawPatternFromStops(activePattern, stopLocations)
            }
          })
        }}
      >
        <span><Icon type='map-marker' /> Create</span>
      </Button>)
    }
    return buttons
  }
  render () {
    const { activePattern } = this.props
    console.log(this.props)
    return (
      <div>
        <h4>
          Pattern Shape
        </h4>
        <ButtonToolbar>
          {this.renderEditButtons(this.props.editSettings.editGeometry, activePattern)}
          {this.renderEditSettings(this.props.editSettings.editGeometry)}
        </ButtonToolbar>
      </div>
    )
  }
}
