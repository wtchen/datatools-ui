import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button, ButtonToolbar} from 'react-bootstrap'

import EditSettings from './EditSettings'
import { polyline as getPolyline } from '../../../scenario-editor/utils/valhalla'

export default class EditShapePanel extends Component {
  async drawPatternFromStops (pattern, stops) {
    const newShape = await getPolyline(stops)
    if (newShape) {
      this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: newShape}})
      this.props.saveActiveEntity('trippattern')
      return true
    } else {
      this.props.setErrorMessage('Error drawing pattern from stops! Some stops may be unreachable by streets.')
      return false
    }
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
              const stopLocations = this.props.stops && activePattern.patternStops && activePattern.patternStops.length
                ? activePattern.patternStops.map((s, index) => {
                  const stop = this.props.stops.find(st => st.id === s.stopId)
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
    return (
      <div>
        <h4 className='line'>Pattern Shape</h4>
        <ButtonToolbar>
          {this.renderEditButtons(this.props.editSettings.editGeometry, activePattern)}
          <EditSettings
            editSettings={this.props.editSettings}
            updateEditSetting={this.props.updateEditSetting} />
        </ButtonToolbar>
      </div>
    )
  }
}
