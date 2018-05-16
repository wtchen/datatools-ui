import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import {Label} from 'react-bootstrap'
import Select from 'react-select'

import {getEntityName} from '../../util/gtfs'
import {ENTITY} from '../../constants'

export default class PatternSelect extends Component {
  static propTypes = {
    activePattern: PropTypes.object,
    route: PropTypes.object,
    feedSource: PropTypes.object,
    calendars: PropTypes.array,
    setActiveEntity: PropTypes.func,
    fetchCalendarTripCountsForPattern: PropTypes.func
  }
  /**
   * Fetch active pattern's trip counts when component mounts.
   */
  componentDidMount () {
    const {
      activePattern,
      feedSource,
      fetchCalendarTripCountsForPattern
    } = this.props
    if (activePattern) {
      fetchCalendarTripCountsForPattern(feedSource.id, activePattern.patternId)
    }
  }

  /**
   * Fetch new pattern's trip counts whenever the pattern is changed.
   */
  componentWillReceiveProps (nextProps) {
    const {
      activePattern: newPattern,
      feedSource,
      fetchCalendarTripCountsForPattern
    } = nextProps
    const currentPatternId = this.props.activePattern && this.props.activePattern.id
    if (newPattern && newPattern.id !== currentPatternId) {
      fetchCalendarTripCountsForPattern(feedSource.id, newPattern.patternId)
    }
  }

  _optionRenderer = (option) => {
    // FIXME: Add number of calendars for which pattern has trips?
    // const calendarCount = Object.keys(option.pattern.tripCountByCalendar).length
    return (
      <span title={option.label}>
        <Icon type='code-fork' /> {option.label}
        {' '}
        <Label
          title={`Pattern has ${option.tripCount} trips`}>
          <Icon type='bars' /> {option.tripCount}
        </Label>
        {/** {' '}
        <Label
          title={`Pattern has trips for ${calendarCount} calendars`}>
          <Icon type='calendar-o' /> {calendarCount}
        </Label> **/}
      </span>
    )
  }

  _onChange = (value) => {
    const {feedSource, route, setActiveEntity} = this.props
    const pattern = value ? value.pattern : {id: ENTITY.NEW_ID}
    setActiveEntity(feedSource.id, 'route', route, 'trippattern', pattern, 'timetable', null)
  }

  _getTripCount = (tripCounts, id) => {
    const item = tripCounts && tripCounts.pattern_id.find(item => item.type === id)
    return item ? item.count : 0
  }

  _getOptions = () => {
    const {route, tripCounts} = this.props
    const patterns = route && route.tripPatterns ? route.tripPatterns : []
    return patterns.map(pattern => ({
      value: pattern.id,
      label: `${getEntityName(pattern)}` || '[Unnamed]',
      pattern,
      tripCount: this._getTripCount(tripCounts, pattern.patternId)
    }))
  }

  render () {
    const {activePattern} = this.props
    return (
      <Select
        value={activePattern && activePattern.id}
        component={'pattern'}
        valueRenderer={this._optionRenderer}
        optionRenderer={this._optionRenderer}
        placeholder={<span><Icon type='code-fork' /> Select pattern...</span>}
        options={this._getOptions()}
        onChange={this._onChange} />
    )
  }
}
