import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Label } from 'react-bootstrap'
import Select from 'react-select'

export default class CalendarSelect extends Component {
  _render = (option) => {
    const {activePattern} = this.props
    const patternTrips = (activePattern && activePattern.tripCountByCalendar[option.value]) || 0
    const routeCount = Object.keys(option.calendar.routes).length
    return (
      <span title={`${option.label} (${option.service_id})`}>
        <Icon type='calendar-o' /> {option.label}
        {' '}
        <Label
          bsStyle={patternTrips ? 'success' : 'default'}
          title={`Calendar has ${patternTrips} trips for pattern and ${option.routeTrips} for route`}
        ><Icon type='bars' /> {patternTrips}/{option.routeTrips}</Label>
        {' '}
        <Label
          title={`Calendar has trips for ${routeCount} routes`}
        ><Icon type='bus' /> {routeCount}</Label>
        {' '}
        <Label
          title={`Calendar has ${option.totalTrips} trips for feed`}
        ><Icon type='building-o' /> {option.totalTrips}</Label>
      </span>
    )
  }
  render () {
    const { activePattern, route, feedSource, activeCalendar, calendars, setActiveEntity, trips } = this.props
    const options = calendars && route
      ? calendars.sort((a, b) => {
        if (route.id in a.routes && !(route.id in b.routes)) return -1
        else if (route.id in b.routes && !(route.id in a.routes)) return 1
        else return b.numberOfTrips - a.numberOfTrips
      }).map(calendar => {
        return {
          label: calendar.description,
          value: calendar.id,
          service_id: calendar.service_id,
          calendar,
          totalTrips: calendar.numberOfTrips,
          routeTrips: calendar.routes[route.id] || 0,
          calendarTrips: trips.length
        }
      })
      : []
    return (
      <Select
        value={activeCalendar && activeCalendar.id}
        placeholder={<span><Icon type='calendar-o' /> Select calendar...</span>}
        valueRenderer={this._render}
        optionRenderer={this._render}
        disabled={!activePattern || activePattern.id === 'new'}
        options={options}
        onChange={(value) => {
          const calendar = value && value.calendar
          setActiveEntity(feedSource.id, 'route', route, 'trippattern', activePattern, 'timetable', calendar)
        }}
        filterOptions
      />
    )
  }
}
