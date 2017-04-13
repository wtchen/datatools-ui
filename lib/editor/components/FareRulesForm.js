import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import { Checkbox, Button, FormGroup, Panel } from 'react-bootstrap'
import Select from 'react-select'

import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import { getEntityName } from '../util/gtfs'

export default class FareRulesForm extends Component {
  static propTypes = {
    activeEntity: PropTypes.object,
    updateActiveEntity: PropTypes.func,
    activeComponent: PropTypes.string,
    tableData: PropTypes.object,
    zones: PropTypes.object,
    zoneOptions: PropTypes.array
  }
  renderRuleSelections (rule, tableData, activeEntity, activeComponent, zones, zoneOptions, routeEntity) {
    return (
      <div>
        {rule.route_id
          ? <VirtualizedEntitySelect
            value={routeEntity ? {value: routeEntity.route_id, label: getEntityName('route', routeEntity), entity: routeEntity} : null}
            component={'route'}
            entityKey='route_id'
            entities={tableData.route}
            onChange={(input) => {
              console.log(input)
              const rules = [...activeEntity.fareRules]
              rule.route_id = input ? input.value : null
              this.props.updateActiveEntity(activeEntity, activeComponent, {fareRules: rules})
            }}
          />
          : null
        }
        {rule.contains_id // can be boolean (no zone specified) or string (specified zone_id)
          ? <Select
            placeholder='Select zone which the itinerary passes through...'
            clearable
            noResultsText={`No zones found. Specify zones in stop.`}
            key={Math.random()}
            value={typeof rule.contains_id === 'string'
              ? {value: rule.contains_id, label: `${rule.contains_id} zone (${zones[rule.contains_id] ? zones[rule.contains_id].length : 0} stops)`}
              : null
            }
            onChange={(input) => {
              console.log(input)
              const rules = [...activeEntity.fareRules]
              rule.contains_id = input ? input.value : null
              this.props.updateActiveEntity(activeEntity, activeComponent, {fareRules: rules})
            }}
            options={zoneOptions}
          />
          : null
        }
        {rule.origin_id || rule.destination_id
          ? [
            <Select
              placeholder='Select origin zone...'
              clearable
              noResultsText={`No zones found. Specify zones in stop.`}
              key={Math.random()}
              value={typeof rule.origin_id === 'string'
                ? {value: rule.origin_id, label: `${rule.origin_id} zone (${zones[rule.origin_id] ? zones[rule.origin_id].length : 0} stops)`}
                : null
              }
              onChange={(input) => {
                console.log(input)
                const rules = [...activeEntity.fareRules]
                rule.origin_id = input ? input.value : null
                this.props.updateActiveEntity(activeEntity, activeComponent, {fareRules: rules})
              }}
              options={zoneOptions}
            />,
            <Select
              placeholder='Select destination zone...'
              clearable
              noResultsText={`No zones found. Specify zones in stop.`}
              key={Math.random()}
              value={typeof rule.destination_id === 'string'
                ? {value: rule.destination_id, label: `${rule.destination_id} zone (${zones[rule.destination_id] ? zones[rule.destination_id].length : 0} stops)`}
                : null
              }
              onChange={(input) => {
                console.log(input)
                const rules = [...activeEntity.fareRules]
                rule.destination_id = input ? input.value : null
                this.props.updateActiveEntity(activeEntity, activeComponent, {fareRules: rules})
              }}
              options={zoneOptions}
            />
          ]
          : null
        }
      </div>
    )
  }
  render () {
    const {
      activeEntity,
      updateActiveEntity,
      activeComponent,
      tableData,
      zones,
      zoneOptions
    } = this.props
    const FARE_RULE_TYPES = [
      {type: 'route_id', label: 'Route'},
      {type: 'origin_id', label: 'From/to'},
      {type: 'contains_id', label: 'Contains'}
    ]
    return (
      <div>
        <p>Specify which routes or zones <strong>{activeEntity.fare_id}</strong> fare applies to.</p>
        <span className='pull-right'>{activeEntity && activeEntity.fareRules.length} rules apply to this fare</span>
        <Button
          style={{marginBottom: '15px'}}
          onClick={() => {
            const rules = [...activeEntity.fareRules]
            rules.unshift({fare_id: activeEntity.fare_id})
            updateActiveEntity(activeEntity, activeComponent, {fareRules: rules})
          }}
        ><Icon type='plus' /> Add rule</Button>
        {activeEntity.fareRules.map((rule, index) => {
          let routeEntity
          if (rule.route_id) {
            routeEntity = tableData.route && tableData.route.find(r => r.route_id === rule.route_id)
          }
          return (
            <Panel
              key={`rule-${index}`}
            >
              <Button
                bsStyle='danger'
                bsSize='xsmall'
                className='pull-right'
                style={{marginLeft: '5px'}}
                key={index}
                onClick={() => {
                  const rules = [...activeEntity.fareRules]
                  rules.splice(index, 1)
                  updateActiveEntity(activeEntity, activeComponent, {fareRules: rules})
                }}
              ><Icon type='times' /></Button>
              <FormGroup>
                {FARE_RULE_TYPES.map((t, i) => {
                  const checked = t.type === 'origin_id' ? rule.origin_id || rule.destination_id : rule[t.type]
                  return (
                    <Checkbox
                      inline
                      name={`fareRuleType-${index}-${i}`}
                      key={`${index}-${i}`}
                      checked={Boolean(checked)}
                      onChange={(evt) => {
                        const rules = [...activeEntity.fareRules]
                        if (t.type === 'origin_id') {
                          rules[index].origin_id = rules[index].origin_id ? null : true
                          rules[index].destination_id = rules[index].destination_id ? null : true
                        } else {
                          rules[index][t.type] = rules[index][t.type] ? null : true
                        }
                        updateActiveEntity(activeEntity, activeComponent, {fareRules: rules})
                      }}
                    >
                      <small>{t.label}</small>
                    </Checkbox>
                  )
                })}
              </FormGroup>
              {this.renderRuleSelections(rule, tableData, activeEntity, activeComponent, zones, zoneOptions, routeEntity)}
            </Panel>
          )
        })}
      </div>
    )
  }
}
