import React, { Component, PropTypes } from 'react'

import { getRouteNameAlerts } from '../../editor/util/gtfs'
import GtfsSearch from '../../gtfs/components/gtfs-search'

export default class RouteSelector extends Component {
  static propTypes = {
    entity: PropTypes.object,
    stop: PropTypes.object,
    feeds: PropTypes.array,
    entityUpdated: PropTypes.func,
    filterByRoute: PropTypes.object,
    minimumInput: PropTypes.number,
    clearable: PropTypes.bool
  }

  _onChange = (value) => {
    const {entity, entityUpdated, filterByStop} = this.props
    if (value) {
      entityUpdated(entity, 'ROUTE', value.route, value.agency)
    } else if (value == null) {
      if (filterByStop) {
        entityUpdated(entity, 'ROUTE', null, entity.agency)
      } else {
        entityUpdated(entity, 'ROUTE', null, null)
      }
    }
  }

  render () {
    const {route, feeds, minimumInput, filterByStop, clearable, entity} = this.props
    const {agency: feed} = entity
    const agencyName = feed ? feed.name : 'Unknown agency'
    return (
      <GtfsSearch
        feeds={feeds}
        limit={100}
        minimumInput={minimumInput}
        filterByStop={filterByStop}
        clearable={clearable}
        entities={['routes']}
        onChange={this._onChange}
        value={route
          ? {
            route,
            value: route.route_id,
            label: `${getRouteNameAlerts(route)} (${agencyName})`,
            agency: feed
          }
          : ''
        } />
    )
  }
}
