// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button, ButtonGroup, ButtonToolbar, OverlayTrigger, Tooltip} from 'react-bootstrap'
import ll from '@conveyal/lonlat'
import numeral from 'numeral'

import * as activeActions from '../../actions/active'
import * as mapActions from '../../actions/map'
import {ARROW_MAGENTA} from '../../constants'
import * as tripPatternActions from '../../actions/tripPattern'
import OptionButton from '../../../common/components/OptionButton'
import EditSettings from './EditSettings'
import * as statusActions from '../../../manager/actions/status'
import {polyline as getPolyline} from '../../../scenario-editor/utils/valhalla'
import {
  controlPointsFromSegments,
  generateControlPointsFromPatternStops,
  getPatternDistance
} from '../../util/map'

import type {ControlPoint, LatLng, Pattern, GtfsStop} from '../../../types'
import type {EditSettingsUndoState} from '../../../types/reducers'

type Props = {
  activePattern: Pattern,
  controlPoints: Array<ControlPoint>,
  editSettings: EditSettingsUndoState,
  patternSegment: number,
  resetActiveGtfsEntity: typeof activeActions.resetActiveGtfsEntity,
  saveActiveGtfsEntity: typeof activeActions.saveActiveGtfsEntity,
  setActivePatternSegment: typeof tripPatternActions.setActivePatternSegment,
  setErrorMessage: typeof statusActions.setErrorMessage,
  showConfirmModal: any,
  stops: Array<GtfsStop>,
  togglePatternEditing: typeof tripPatternActions.togglePatternEditing,
  undoActiveTripPatternEdits: typeof tripPatternActions.undoActiveTripPatternEdits,
  updateActiveGtfsEntity: typeof activeActions.updateActiveGtfsEntity,
  updateEditSetting: typeof activeActions.updateEditSetting,
  updatePatternGeometry: typeof mapActions.updatePatternGeometry,
}

export default class EditShapePanel extends Component<Props> {
  /**
   * Construct new pattern geometry from the pattern stop locations.
   */
  async drawPatternFromStops (pattern: Pattern, stopsCoordinates: Array<LatLng>, followStreets: boolean): Promise<any> {
    const {saveActiveGtfsEntity, setErrorMessage, updatePatternGeometry} = this.props
    let patternSegments = []
    if (followStreets) {
      patternSegments = await getPolyline(stopsCoordinates, true)
    } else {
      // Construct straight-line segments using stop coordinates
      stopsCoordinates
        .forEach((stop, i) => {
          if (i < stopsCoordinates.length - 1) {
            const segment = [ll.toCoordinates(stop), ll.toCoordinates(stopsCoordinates[i + 1])]
            patternSegments.push(segment)
          }
        })
    }
    if (patternSegments && patternSegments.length) {
      const controlPoints = controlPointsFromSegments(pattern.patternStops, patternSegments)
      updatePatternGeometry({
        controlPoints,
        patternSegments
      })
      saveActiveGtfsEntity('trippattern')
      return true
    } else {
      setErrorMessage({message: 'Error drawing pattern from stops! Some stops may be unreachable by streets.'})
      return false
    }
  }

  _cancelEdits = () => {
    const {activePattern, resetActiveGtfsEntity, togglePatternEditing} = this.props
    if (this._hasEdits()) {
      if (!window.confirm('You have unsaved shape edits. Are you sure you want to cancel and revert these changes?')) {
        return
      }
    }
    togglePatternEditing()
    resetActiveGtfsEntity({
      component: 'trippattern',
      entity: activePattern
    })
  }

  _generateShapeFromStops = () => {
    const {activePattern, editSettings, stops} = this.props
    const stopLocations = stops && activePattern.patternStops && activePattern.patternStops.length
      ? activePattern.patternStops
        .map((s, index) => {
          const stop = stops.find(st => st.stop_id === s.stopId)
          if (!stop) {
            console.warn(`Could not locate stop with stop_id=${s.stopId}`)
            return {lng: 0, lat: 0}
          }
          return {lng: stop.stop_lon, lat: stop.stop_lat}
        })
      : []
    this.drawPatternFromStops(activePattern, stopLocations, editSettings.present.followStreets)
  }

  _confirmCreateFromStops = () => {
    const title = 'Create pattern shape from stops?'
    const onConfirm = this._generateShapeFromStops
    const body = this._hasShapePoints()
      ? 'Are you sure you want to overwrite the existing shape for this trip pattern?'
      : 'Are you sure you want to create an auto-generated shape for this trip pattern?'
    this.props.showConfirmModal({title, body, onConfirm})
  }

  _deleteShape = () => {
    const {
      activePattern,
      saveActiveGtfsEntity,
      showConfirmModal,
      stops,
      updateActiveGtfsEntity,
      updatePatternGeometry
    } = this.props
    const shapeId = activePattern.shapeId || '(undefined)'
    showConfirmModal({
      title: `Delete shape for trip pattern?`,
      body: `Are you sure you would like to delete this trip pattern shape (shape_id: ${shapeId})?`,
      onConfirm: () => {
        // FIXME: Do we need to update pattern geometry, too?
        updatePatternGeometry(generateControlPointsFromPatternStops(activePattern.patternStops, stops))
        updateActiveGtfsEntity({
          component: 'trippattern',
          entity: activePattern,
          props: {shapePoints: [], shapeId: null}
        })
        saveActiveGtfsEntity('trippattern')
      }
    })
  }

  _beginEditing = () => {
    const {togglePatternEditing} = this.props
    togglePatternEditing()
  }

  _hasShapePoints = () => this.props.activePattern.shapePoints &&
    this.props.activePattern.shapePoints.length > 0

  save = () => {
    const {editSettings, saveActiveGtfsEntity, updateEditSetting} = this.props
    saveActiveGtfsEntity('trippattern')
      // $FlowFixMe action is actually wrapped in promise when connected
      .then(() => updateEditSetting({
        setting: 'editGeometry',
        value: !editSettings.present.editGeometry
      }))
  }

  _hasEdits = () => this.props.editSettings.past.length > 0

  render () {
    const {
      activePattern,
      controlPoints, // FIXME use to describe which segment user is editing
      patternSegment,
      editSettings: editSettingsState,
      setActivePatternSegment,
      updateEditSetting,
      undoActiveTripPatternEdits
    } = this.props
    const {present: editSettings} = editSettingsState
    const hasEdits = this._hasEdits()
    const fromStopsButton = <OverlayTrigger
      placement='bottom'
      overlay={
        <Tooltip id='from-stops'>Generate pattern shape from stops</Tooltip>
      }>
      <Button
        onClick={this._confirmCreateFromStops}
        bsSize='small'
        style={{width: '102px'}}>
        <span><Icon type='map-marker' /> From stops</span>
      </Button>
    </OverlayTrigger>
    const dist = getPatternDistance(activePattern, controlPoints)
    const formattedShapeDistance = numeral(dist).format('0,0.00')
    const nextSegment = (!patternSegment && patternSegment !== 0)
      ? 0
      : patternSegment + 1
    return (
      <div>
        <h4 className='line'>
          Pattern shape
          {' '}
          ({formattedShapeDistance} miles)
        </h4>
        <div style={{margin: '5px 0'}}>
          {!activePattern.shapeId
            ? <small className='text-warning'>
              <Icon type='exclamation-triangle' />{' '}
              No shape associated with this pattern.
            </small>
            : <small>
              <span className='overflow' style={{width: '250px'}}>
                shape_id:{' '}
                <span title={activePattern.shapeId}>{activePattern.shapeId}</span>
              </span>
              <Button
                bsStyle='link'
                bsSize='small'
                style={{padding: '0 2px 10px 2px'}}
                title='Delete shape for pattern'
                onClick={this._deleteShape}>
                <span className='text-danger'><Icon type='trash' /></span>
              </Button>
            </small>
          }
        </div>
        {editSettings.editGeometry
          ? <div>
            <ButtonToolbar>
              <Button
                block
                style={{width: '167px'}}
                onClick={this._cancelEdits}
                bsSize='small'>
                <Icon type='ban' /> Cancel shape editing
              </Button>
              {fromStopsButton}
            </ButtonToolbar>
            <ButtonGroup style={{margin: '5px 0'}} block>
              <OptionButton
                onClick={setActivePatternSegment}
                value={patternSegment - 1}
                disabled={!patternSegment || patternSegment < 1}
                bsSize='xsmall'>
                <Icon type='caret-left' style={{color: 'blue'}} /> Prev
              </OptionButton>
              <OptionButton
                onClick={setActivePatternSegment}
                style={{minWidth: '165px', fontSize: '80%', padding: '2px 0'}}
                disabled={patternSegment >= controlPoints.length - 1}
                value={nextSegment}
                bsSize='xsmall'>
                {!patternSegment && patternSegment !== 0
                  ? `Click line to begin editing`
                  : `Editing anchor ${patternSegment + 1} of ${controlPoints.length}`
                }
              </OptionButton>
              <OptionButton
                onClick={setActivePatternSegment}
                className='pull-right'
                value={nextSegment}
                disabled={patternSegment >= controlPoints.length - 1}
                bsSize='xsmall'>
                  Next <Icon type='caret-right' style={{color: ARROW_MAGENTA}} />
              </OptionButton>
            </ButtonGroup>
            <ButtonToolbar>
              <Button
                bsSize='small'
                disabled={!hasEdits}
                onClick={this.save}>
                <Icon type='check' /> Save
              </Button>
              <Button
                bsSize='small'
                disabled={!hasEdits}
                onClick={undoActiveTripPatternEdits}>
                <Icon type='undo' /> Undo
              </Button>
            </ButtonToolbar>
            <EditSettings
              editSettings={editSettings}
              patternSegment={patternSegment}
              updateEditSetting={updateEditSetting} />
          </div>
          : <ButtonToolbar>
            <Button
              onClick={this._beginEditing}
              bsSize='small'
              style={{width: '167px'}}
              bsStyle='warning'>
              <span><Icon type='pencil' /> Edit pattern geometry</span>
            </Button>
            {fromStopsButton}
          </ButtonToolbar>
        }
      </div>
    )
  }
}
