// @flow

import React, {Component} from 'react'
import Select from 'react-select'

import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import {getEntityName, getTableById} from '../util/gtfs'
import ZoneSelect from './ZoneSelect'

import type {EditorTableData, Entity, FareRule, GtfsFare, GtfsRoute} from '../../types'

type Props = {
  rule: FareRule,
  tableData: EditorTableData,
  activeEntity: GtfsFare,
  activeComponent: string,
  zones: any,
  zoneOptions: Array<any>,
  routeEntity: ?GtfsRoute,
  updateActiveEntity: (Entity, string, any) => void
}

export default class FareRuleSelections extends Component<Props> {
  _onContainsChange = (input: any) => {
    const {activeComponent, activeEntity, rule, updateActiveEntity} = this.props
    const rules = [...activeEntity.fare_rules]
    rule.contains_id = input ? input.value : null
    updateActiveEntity(activeEntity, activeComponent, {fare_rules: rules})
  }

  _onDestinationChange = (input: any) => {
    const {activeComponent, activeEntity, rule, updateActiveEntity} = this.props
    const rules = [...activeEntity.fare_rules]
    rule.destination_id = input ? input.value : null
    updateActiveEntity(activeEntity, activeComponent, {fare_rules: rules})
  }

  _onOriginChange = (input: any) => {
    const {activeComponent, activeEntity, rule, updateActiveEntity} = this.props
    const rules = [...activeEntity.fare_rules]
    rule.origin_id = input ? input.value : null
    updateActiveEntity(activeEntity, activeComponent, {fare_rules: rules})
  }

  _onRouteChange = (input: any) => {
    const {activeComponent, activeEntity, rule, updateActiveEntity} = this.props
    const rules = [...activeEntity.fare_rules]
    rule.route_id = input ? input.value : null
    updateActiveEntity(activeEntity, activeComponent, {fare_rules: rules})
  }

  render () {
    const {rule, tableData, zones, zoneOptions, routeEntity} = this.props
    return (
      <div data-test-id='fare-rule-selections'>
        {rule.route_id
          ? <VirtualizedEntitySelect
            value={routeEntity ? {value: routeEntity.route_id, label: getEntityName(routeEntity), entity: routeEntity} : null}
            component={'route'}
            entityKey='route_id'
            entities={getTableById(tableData, 'route')}
            onChange={this._onRouteChange} />
          : null
        }
        {rule.contains_id // can be boolean (no zone specified) or string (specified zone_id)
          ? <ZoneSelect
            placeholder='Select zone which the itinerary passes through...'
            noResultsText={`No zones found. Specify zones in stop.`}
            key={Math.random()}
            value={typeof rule.contains_id === 'string'
              ? {value: rule.contains_id, label: `${rule.contains_id} zone (${zones[rule.contains_id] ? zones[rule.contains_id].length : 0} stops)`}
              : null
            }
            onChange={this._onContainsChange}
            options={zoneOptions} />
          : null
        }
        {rule.origin_id || rule.destination_id
          ? [
            <ZoneSelect
              placeholder='Select origin zone...'
              noResultsText={`No zones found. Specify zones in stop.`}
              key={Math.random()}
              value={typeof rule.origin_id === 'string'
                ? {
                  value: rule.origin_id,
                  label: `${rule.origin_id} zone (${zones[rule.origin_id] ? zones[rule.origin_id].length : 0} stops)`
                }
                : null
              }
              onChange={this._onOriginChange}
              options={zoneOptions} />,
            <Select
              placeholder='Select destination zone...'
              clearable
              noResultsText={`No zones found. Specify zones in stop.`}
              key={Math.random()}
              value={typeof rule.destination_id === 'string'
                ? {
                  value: rule.destination_id,
                  label: `${rule.destination_id} zone (${zones[rule.destination_id] ? zones[rule.destination_id].length : 0} stops)`
                }
                : null
              }
              onChange={this._onDestinationChange}
              options={zoneOptions} />
          ]
          : null
        }
      </div>
    )
  }
}
