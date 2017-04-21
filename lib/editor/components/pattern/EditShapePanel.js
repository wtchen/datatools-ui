import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button, ButtonToolbar} from 'react-bootstrap'
import numeral from 'numeral'
import lineDistance from 'turf-line-distance'

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

  cancel = () => {
    const {activePattern, editSettings, resetActiveEntity, updateEditSetting} = this.props
    resetActiveEntity(activePattern, 'trippattern')
    updateEditSetting('editGeometry', !editSettings.editGeometry, activePattern)
  }

  createFromStops = () => {
    const {activePattern, showConfirmModal, stops} = this.props
    showConfirmModal({
      title: `Create pattern shape from stops?`,
      body: `Are you sure you want to overwrite this trip pattern?`,
      onConfirm: () => {
        const stopLocations = stops && activePattern.patternStops && activePattern.patternStops.length
          ? activePattern.patternStops.map((s, index) => {
            const stop = stops.find(st => st.id === s.stopId)
            return {lng: stop.stop_lon, lat: stop.stop_lat}
          })
          : []
        return this.drawPatternFromStops(activePattern, stopLocations)
      }
    })
  }

  delete = () => {
    const {activePattern, saveActiveEntity, showConfirmModal, updateActiveEntity} = this.props
    showConfirmModal({
      title: `Delete shape for trip pattern?`,
      body: `Are you sure you want to delete this trip pattern shape?`,
      onConfirm: () => {
        updateActiveEntity(activePattern, 'trippattern', {shape: null})
        saveActiveEntity('trippattern')
      }
    })
  }

  edit = () => {
    const {activePattern, editSettings, updateEditSetting} = this.props
    updateEditSetting('editGeometry', !editSettings.editGeometry, activePattern)
  }

  save = () => {
    const {activePattern, editSettings, saveActiveEntity, updateEditSetting} = this.props
    saveActiveEntity('trippattern')
    .then(() => updateEditSetting('editGeometry', !editSettings.editGeometry, activePattern))
  }

  render () {
    const {activePattern, editSettings, undoActiveTripPatternEdits} = this.props
    let buttons
    if (editSettings.editGeometry) {
      buttons = [{
        key: 'save',
        disabled: editSettings.coordinatesHistory.length === 0,
        bsStyle: 'primary',
        onClick: this.save,
        children: <span><Icon type='check' /> Save</span>
      }, {
        key: 'undo',
        disabled: editSettings.actions.length === 0,
        onClick: undoActiveTripPatternEdits,
        children: <span><Icon type='undo' /> Undo</span>
      }, {
        key: 'cancel',
        onClick: this.cancel,
        children: <span><Icon type='times' /> Cancel</span>
      }]
    } else {
      buttons = [{
        key: 'edit',
        bsStyle: 'warning',
        onClick: this.edit,
        children: <span><Icon type='pencil' /> Edit</span>
      }, {
        key: 'delete',
        bsStyle: 'danger',
        onClick: this.delete,
        children: <span><Icon type='trash' /> Delete</span>
      }, {
        key: 'create',
        bsStyle: 'success',
        onClick: this.createFromStops,
        children: <span><Icon type='map-marker' /> Create</span>
      }]
    }
    return (
      <div>
        <h4 className='line'>
          Pattern shape
          {' '}
          ({numeral(lineDistance(activePattern.shape, 'miles')).format('0,0.00')} miles)
        </h4>
        <ButtonToolbar>
          {buttons.map(b => (
            <Button {...b} />
          ))}
          <EditSettings
            editSettings={this.props.editSettings}
            updateEditSetting={this.props.updateEditSetting} />
        </ButtonToolbar>
      </div>
    )
  }
}
