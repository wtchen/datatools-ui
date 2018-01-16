import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button, ButtonGroup} from 'react-bootstrap'
import ll from '@conveyal/lonlat'
import numeral from 'numeral'
import lineDistance from 'turf-line-distance'
import lineString from 'turf-linestring'
import point from 'turf-point'

import EditSettings from './EditSettings'
import {polyline as getPolyline} from '../../../scenario-editor/utils/valhalla'
import OptionButton from '../../../common/components/OptionButton'

export default class EditShapePanel extends Component {
  async drawPatternFromStops (pattern, stopsCoordinates, followStreets) {
    const {saveActiveEntity, setErrorMessage, updatePatternGeometry} = this.props
    const patternSegments = followStreets
      ? await getPolyline(stopsCoordinates, true)
      // FIXME: fix follow streets to return straight line segments
      : stopsCoordinates.map(stop => ll.toCoordinates(stop))
    if (patternSegments) {
      const controlPoints = this.controlPointsFromSegments(pattern.patternStops, patternSegments)
      updatePatternGeometry({
        controlPoints,
        patternSegments
      })
      saveActiveEntity('trippattern')
      return true
    } else {
      setErrorMessage({message: 'Error drawing pattern from stops! Some stops may be unreachable by streets.'})
      return false
    }
  }

  controlPointsFromSegments = (patternStops, patternSegments) => {
    const controlPoints = []
    let cumulativeDistance = 0
    for (var i = 0; i <= patternSegments.length; i++) {
      let coordinate
      if (i === patternSegments.length) {
        const previousSegment = patternSegments[i - 1]
        coordinate = previousSegment[previousSegment.length - 1]
      } else {
        coordinate = patternSegments[i][0]
      }
      const controlPoint = {
        id: i,
        point: point(coordinate),
        pointType: 2,
        distance: cumulativeDistance,
        stopId: patternStops[i].stopId
      }
      controlPoints.push(controlPoint)
      if (i < patternSegments.length) {
        // Only increase distance if not on last iteration (last iteration has
        // no segment defined).
        cumulativeDistance += lineDistance(lineString(patternSegments[i]), 'meters')
      }
    }
    return controlPoints
  }

  _cancelEdits = () => {
    const {activePattern, resetActiveEntity, togglePatternEditing} = this.props
    togglePatternEditing(false)
    resetActiveEntity(activePattern, 'trippattern')
  }

  createFromStops = () => {
    const {activePattern, editSettings, showConfirmModal, stops} = this.props
    showConfirmModal({
      title: `Create pattern shape from stops?`,
      body: `Are you sure you want to overwrite this trip pattern?`,
      onConfirm: () => {
        const stopLocations = stops && activePattern.patternStops && activePattern.patternStops.length
          ? activePattern.patternStops.map((s, index) => {
            const stop = stops.find(st => st.stop_id === s.stopId)
            return {lng: stop.stop_lon, lat: stop.stop_lat}
          })
          : []
        return this.drawPatternFromStops(activePattern, stopLocations, editSettings.present.followStreets)
      }
    })
  }

  _deleteShape = () => {
    const {activePattern, saveActiveEntity, showConfirmModal, updateActiveEntity} = this.props
    showConfirmModal({
      title: `Delete shape for trip pattern?`,
      body: `Are you sure you want to delete this trip pattern shape?`,
      onConfirm: () => {
        updateActiveEntity(activePattern, 'trippattern', {shapePoints: []})
        saveActiveEntity('trippattern')
      }
    })
  }

  _beginEditing = () => {
    const {togglePatternEditing} = this.props
    togglePatternEditing(true)
    // updateEditSetting('editGeometry', !editSettings.present.editGeometry, activePattern)
  }

  save = () => {
    const {activePattern, editSettings, saveActiveEntity, updateEditSetting} = this.props
    saveActiveEntity('trippattern')
      .then(() => updateEditSetting('editGeometry', !editSettings.present.editGeometry, activePattern))
  }

  render () {
    const {
      activePattern,
      controlPoints, // FIXME use to describe which segment user is editing
      patternSegment,
      patternSegments,
      editSettings: editSettingsState,
      resnapStops,
      setActivePatternSegment,
      updateEditSetting,
      undoActiveTripPatternEdits
    } = this.props
    const {present: editSettings} = editSettingsState
    const hasEdits = editSettingsState.past.length === 0
    let buttons
    if (editSettings.editGeometry) {
      buttons = [{
        key: 'save',
        // Save is disabled if there have not been any edits made to shape points
        disabled: hasEdits,
        onClick: this.save,
        children: <span><Icon type='check' /> Save</span>
      }, {
        key: 'undo',
        disabled: hasEdits,
        onClick: undoActiveTripPatternEdits,
        children: <span><Icon type='undo' /> Undo</span>
      }, {
        key: 'delete',
        onClick: this._deleteShape,
        children: <span><Icon type='trash' /> Wipe</span>
      }, {
        key: 'create',
        onClick: this.createFromStops,
        children: <span><Icon type='map-marker' /> Stops</span>
      }]
    }

    let formattedShapeDistance
    if (activePattern.shape) {
      if (!activePattern.shape.coordinates) {
        throw new Error('received invalid shape coordinates')
      }
      formattedShapeDistance = numeral(
        lineDistance(activePattern.shape, 'miles')
      ).format('0,0.00')
    } else {
      formattedShapeDistance = 0
    }

    return (
      <div>
        <h4 className='line'>
          Pattern shape
          {' '}
          ({formattedShapeDistance} miles)
        </h4>
        {editSettings.editGeometry
          ? <div>
            <Button
              block
              style={{marginTop: '5px', marginBottom: '5px'}}
              onClick={this._cancelEdits}
              bsSize='small'>
              <span><Icon type='times' /> Cancel geometry edits</span>
            </Button>
            <div>
              <OptionButton
                onClick={setActivePatternSegment}
                value={patternSegment - 1}
                disabled={!patternSegment || patternSegment < 1}
                bsSize='xsmall'>
                Previous
              </OptionButton>
              <small>
                {!patternSegment && patternSegment !== 0
                  ? `Click segment to begin editing`
                  : `Manipulating anchor ${patternSegment + 1} of ${controlPoints.length}`
                }
              </small>
              <OptionButton
                onClick={setActivePatternSegment}
                value={(!patternSegment && patternSegment !== 0)
                  ? 0
                  : patternSegment + 1
                }
                disabled={patternSegment >= controlPoints.length - 1}
                bsSize='xsmall'>
                Next
              </OptionButton>
            </div>
            <ButtonGroup justified>
              {buttons.map(b => (
                <Button href='#' bsSize='small' {...b} />
              ))}
            </ButtonGroup>
            <EditSettings
              editSettings={editSettings}
              resnapStops={resnapStops}
              updateEditSetting={updateEditSetting} />
          </div>
          : <Button
            block
            onClick={this._beginEditing}
            bsSize='small'
            bsStyle='warning'>
            <span><Icon type='pencil' /> Edit pattern geometry</span>
          </Button>
        }
      </div>
    )
  }
}
