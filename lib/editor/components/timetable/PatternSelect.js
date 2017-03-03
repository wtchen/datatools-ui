import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Label } from 'react-bootstrap'
import Select from 'react-select'

import { getEntityName } from '../../util/gtfs'

export default class PatternSelect extends Component {
  _render = (option) => {
    const calendarCount = Object.keys(option.pattern.tripCountByCalendar).length
    return (
      <span title={option.label}>
        <Icon type='code-fork' /> {option.label}
        {' '}
        <Label
          title={`Pattern has ${option.pattern.numberOfTrips} trips`}
        ><Icon type='bars' /> {option.pattern.numberOfTrips}</Label>
        {' '}
        <Label
          title={`Pattern has trips for ${calendarCount} calendars`}
        ><Icon type='calendar-o' /> {calendarCount}</Label>
      </span>
    )
  }
  render () {
    const { activePattern, route, feedSource, setActiveEntity } = this.props
    const patterns = route && route.tripPatterns ? route.tripPatterns : []
    return (
      <Select
        value={activePattern && activePattern.id}
        component={'pattern'}
        valueRenderer={this._render}
        optionRenderer={this._render}
        placeholder={<span><Icon type='code-fork' /> Select pattern...</span>}
        options={patterns.map(pattern => ({value: pattern.id, label: `${getEntityName('pattern', pattern)}` || '[Unnamed]', pattern}))}
        onChange={(value) => {
          const pattern = value && value.pattern || {id: 'new'}
          setActiveEntity(feedSource.id, 'route', route, 'trippattern', pattern, 'timetable', null)
        }}
      />
    )
  }
}
