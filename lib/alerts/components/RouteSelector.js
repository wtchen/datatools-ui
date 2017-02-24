import React, { Component, PropTypes } from 'react'

import { getFeed } from '../../common/util/modules'
import { getRouteNameAlerts } from '../../editor/util/gtfs'
import GtfsSearch from '../../gtfs/components/gtfssearch'

export default class RouteSelector extends Component {
  static propTypes = {
    entity: PropTypes.object,
    stop: PropTypes.object,
    feeds: PropTypes.array,
    entityUpdated: PropTypes.func,
    filterByRoute: PropTypes.bool,
    minimumInput: PropTypes.number,
    clearable: PropTypes.bool
  }
  render () {
    const { route, feeds, minimumInput, filterByStop, clearable, entityUpdated, entity } = this.props
    const feed = route ? getFeed(feeds, route.feed_id) : null
    const agencyName = feed ? feed.name : 'Unknown agency'
    return (
      <div>
        <GtfsSearch
          feeds={feeds}
          limit={100}
          minimumInput={minimumInput}
          filterByStop={filterByStop}
          clearable={clearable}
          entities={['routes']}
          onChange={(evt) => {
            if (typeof evt !== 'undefined' && evt !== null) {
              entityUpdated(entity, 'ROUTE', evt.route, evt.agency)
            } else if (evt == null) {
              if (filterByStop) {
                entityUpdated(entity, 'ROUTE', null, feed)
              } else {
                entityUpdated(entity, 'ROUTE', null, null)
              }
            }
          }}
          value={route
            ? {
              route: route,
              value: route.route_id,
              label: `${getRouteNameAlerts(route)} (${agencyName})`
            }
            : ''
          }
        />
      </div>
    )
  }
}
