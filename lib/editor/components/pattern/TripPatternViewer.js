// @flow

import React, {Component} from 'react'

import EditableTextField from '../../../common/components/EditableTextField'
import EditShapePanel from './EditShapePanel'
import EditSchedulePanel from './EditSchedulePanel'
import CalculateDefaultTimesForm from './CalculateDefaultTimesForm'
import PatternStopsPanel from './PatternStopsPanel'

import type {Props} from './TripPatternList'

export default class TripPatternViewer extends Component<Props> {
  savePatternName = (name: string) => {
    const {activePattern, saveActiveEntity, updateActiveEntity} = this.props
    updateActiveEntity(activePattern, 'trippattern', {name})
    saveActiveEntity('trippattern')
  }

  render () {
    const { activePattern } = this.props
    if (!activePattern) return null
    return (
      <div>
        <EditableTextField
          value={activePattern.name}
          maxLength={28}
          onChange={this.savePatternName} />
        <EditShapePanel {...this.props} />
        <EditSchedulePanel
          activeEntity={this.props.activeEntity}
          activePattern={this.props.activePattern}
          activePatternId={this.props.activePatternId}
          activePatternTripCount={this.props.activePatternTripCount}
          deleteAllTripsForPattern={this.props.deleteAllTripsForPattern}
          feedSource={this.props.feedSource}
          saveActiveEntity={this.props.saveActiveEntity}
          setActiveEntity={this.props.setActiveEntity}
          showConfirmModal={this.props.showConfirmModal}
          updateActiveEntity={this.props.updateActiveEntity} />
        <PatternStopsPanel {...this.props} />
        <CalculateDefaultTimesForm {...this.props} />
      </div>
    )
  }
}
