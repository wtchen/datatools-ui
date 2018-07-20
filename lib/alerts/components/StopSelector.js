import React, { Component, PropTypes } from 'react'

import GtfsSearch from '../../gtfs/components/gtfs-search'

export default class StopSelector extends Component {
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
    const {entityUpdated, entity} = this.props
    if (value) entityUpdated(entity, 'STOP', value.stop, value.agency)
    else entityUpdated(entity, 'STOP', null, null)
  }

  render () {
    const {stop, feeds, minimumInput, filterByRoute, clearable, entity} = this.props
    const {agency: feed} = entity
    const agencyName = feed ? feed.name : 'Unknown agency'
    return (
      <GtfsSearch
        feeds={feeds}
        limit={100}
        minimumInput={minimumInput}
        filterByRoute={filterByRoute}
        entities={['stops']}
        clearable={clearable}
        onChange={this._onChange}
        value={stop
          ? {
            stop,
            value: stop.stop_id,
            label: `${stop.stop_name} (${agencyName})`,
            agency: feed
          }
          : ''
        } />
    )
  }
}
