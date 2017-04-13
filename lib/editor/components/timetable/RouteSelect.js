import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Label } from 'react-bootstrap'
import Select from 'react-select'
import truncate from 'truncate'

import { getEntityName } from '../../util/gtfs'

export default class RouteSelect extends Component {
  _render = (option) => {
    return (
      <span title={option.label}>
        <Icon type='bus' /> {truncate(option.label, 23)}
        {' '}
        <Label title={`Route has ${option.routeTrips} trips`}><Icon type='bars' /> {option.routeTrips}</Label>
      </span>
    )
  }
  render () {
    const { route, routes, feedSource, setActiveEntity } = this.props
    return (
      <Select
        value={route && route.id}
        component={'route'}
        valueRenderer={this._render}
        optionRenderer={this._render}
        placeholder={<span><Icon type='bus' /> Select route...</span>}
        options={routes && routes.map(route => ({value: route.id, label: `${getEntityName('route', route)}` || '[Unnamed]', route, routeTrips: route.numberOfTrips}))}
        clearable={false}
        entities={routes}
        onChange={(value) => {
          const patt = {id: 'new'}
          setActiveEntity(feedSource.id, 'route', value.route, 'trippattern', patt, 'timetable', null)
        }}
      />
    )
  }
}
