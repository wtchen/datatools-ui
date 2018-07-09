import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import { Label } from 'react-bootstrap'
import Select from 'react-select'

import {entityIsNew} from '../../util/objects'

export default class CalendarSelect extends Component {
  static propTypes = {
    activePattern: PropTypes.object,
    route: PropTypes.object,
    feedSource: PropTypes.object,
    activeCalendar: PropTypes.object,
    calendars: PropTypes.array,
    setActiveEntity: PropTypes.func,
    trips: PropTypes.array
  }

  _optionRenderer = (option) => {
    const {
      label,
      service_id: serviceId,
      patternTrips,
      totalTrips
    } = option
    // If label consists of service_id, don't append parenthetical service_id to
    // label for title
    const title = label !== serviceId
      ? `${label} (${serviceId})`
      : label
    // FIXME: Add back route count and route trips for calendar?
    return (
      <span title={title}>
        <Icon type='calendar-o' /> {label}
        {' '}
        <Label
          bsStyle={patternTrips ? 'success' : 'default'}
          title={`Calendar has ${patternTrips} trips for pattern`}>
          <Icon type='bars' /> {patternTrips}
        </Label>
        {/** {' '}
        <Label
          title={`Calendar has trips for ${routeCount} routes`}>
          <Icon type='bus' /> {routeCount}
        </Label> **/}
        {' '}
        <Label
          title={`Calendar has ${totalTrips} trips for feed`}>
          <Icon type='building-o' /> {totalTrips}
        </Label>
      </span>
    )
  }

  _onChange = (value) => {
    const {activePattern, feedSource, route, setActiveEntity} = this.props
    const calendar = value && value.calendar
    setActiveEntity(feedSource.id, 'route', route, 'trippattern', activePattern, 'timetable', calendar)
  }

  _getTripCount = (tripCounts, id) => {
    const item = tripCounts && tripCounts.service_id.find(item => item.type === id)
    return item ? item.count : 0
  }

  _getPatternTripCount = (tripCounts, serviceId, patternId) => {
    const item = tripCounts && tripCounts[`pattern:${patternId}`].service_id
      .find(item => item.type === serviceId)
    return item ? item.count : 0
  }

  _getOptions = () => {
    const {activePattern, calendars, tripCounts, trips} = this.props
    const patternId = activePattern && activePattern.patternId
    const calendarOptions = calendars && activePattern
      ? calendars
        .map(calendar => ({
          label: calendar.description || calendar.service_id,
          value: calendar.service_id,
          service_id: calendar.service_id,
          calendar,
          patternTrips: this._getTripCount(tripCounts[`pattern:${patternId}`], calendar.service_id),
          totalTrips: this._getTripCount(tripCounts, calendar.service_id),
          // FIXME: argh, IDs should not be integers...
          // routeTrips: 0, // calendar.routes[route.id] || 0,
          calendarTrips: trips.length
        }))
      : []
    return calendarOptions
      .sort((a, b) => {
        return b.patternTrips - a.patternTrips
        // if (route.id in a.routes && !(route.id in b.routes)) return -1
        // else if (route.id in b.routes && !(route.id in a.routes)) return 1
        // else return b.numberOfTrips - a.numberOfTrips
      })
  }

  render () {
    const {
      activePattern,
      activeCalendar
    } = this.props
    return (
      <Select
        value={activeCalendar && activeCalendar.service_id}
        placeholder={<span><Icon type='calendar-o' /> Select calendar...</span>}
        valueRenderer={this._optionRenderer}
        optionRenderer={this._optionRenderer}
        disabled={!activePattern || entityIsNew(activePattern)}
        options={this._getOptions()}
        onChange={this._onChange}
        filterOptions />
    )
  }
}
