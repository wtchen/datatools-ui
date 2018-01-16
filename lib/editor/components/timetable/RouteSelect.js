import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import { Label } from 'react-bootstrap'
import Select from 'react-select'
import truncate from 'truncate'

import {ENTITY} from '../../constants'
import { getEntityName } from '../../util/gtfs'

export default class RouteSelect extends Component {
  static propTypes = {
    feedSource: PropTypes.object,
    route: PropTypes.object,
    routes: PropTypes.array,
    setActiveEntity: PropTypes.func
  }

  _optionRenderer = (option) => {
    return (
      <span title={option.label}>
        <Icon type='bus' /> {truncate(option.label, 23)}
        {' '}
        <Label title={`Route has ${option.routeTrips} trips`}>
          <Icon type='bars' /> {option.routeTrips}
        </Label>
      </span>
    )
  }

  _onChange = ({route}) => {
    const {feedSource, setActiveEntity} = this.props
    // FIXME: On selection of a new route, this sets the pattern to a blank 'new'
    // object in order to keep the timetable editor from being exited (the
    // timetable editor depends on having an active route and trip pattern).
    // Perhaps the new ID should be replaced with a blank ID constant
    const patt = {id: ENTITY.NEW_ID}
    setActiveEntity(feedSource.id, 'route', route, 'trippattern', patt, 'timetable', null)
  }

  render () {
    const {route, routes} = this.props
    return (
      <Select
        value={route && route.id}
        component={'route'}
        valueRenderer={this._optionRenderer}
        optionRenderer={this._optionRenderer}
        placeholder={<span><Icon type='bus' /> Select route...</span>}
        options={routes && routes.map(route => (
          {
            value: route.id,
            label: `${getEntityName(route)}` || '[Unnamed]',
            route,
            routeTrips: route.numberOfTrips
          }))
        }
        clearable={false}
        entities={routes}
        onChange={this._onChange} />
    )
  }
}
