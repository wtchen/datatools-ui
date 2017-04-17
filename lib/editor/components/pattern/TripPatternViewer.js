import React, { Component } from 'react'

import EditableTextField from '../../../common/components/EditableTextField'
import EditShapePanel from './EditShapePanel'
import EditSchedulePanel from './EditSchedulePanel'
import CalculateDefaultTimesForm from './CalculateDefaultTimesForm'
import PatternStopsPanel from './PatternStopsPanel'

export default class TripPatternViewer extends Component {
  savePatternName = (name) => {
    this.props.updateActiveEntity(this.props.activePattern, 'trippattern', {name})
    this.props.saveActiveEntity('trippattern')
  }
  render () {
    const { activePattern } = this.props
    return (
      <div>
        <EditableTextField
          value={activePattern.name}
          maxLength={30}
          onChange={this.savePatternName}
        />
        <EditShapePanel {...this.props} />
        <EditSchedulePanel {...this.props} />
        <PatternStopsPanel {...this.props} />
        <CalculateDefaultTimesForm {...this.props} />
      </div>
    )
  }
}
