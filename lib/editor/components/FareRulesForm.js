// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Checkbox, Button, FormGroup, Panel } from 'react-bootstrap'

import FareRuleSelections from './FareRuleSelections'
import {generateNullProps, getTableById} from '../util/gtfs'

import type {EditorTableData, Entity, FareRule, GtfsFare} from '../../types'

type Props = {
  activeEntity: GtfsFare,
  updateActiveEntity: (Entity, string, any) => void,
  activeComponent: string,
  tableData: EditorTableData,
  zones: any,
  zoneOptions: any
}

type RuleType = {type: string, label: string}

const FARE_RULE_TYPES: Array<RuleType> = [
  {type: 'route_id', label: 'Route'},
  {type: 'origin_id', label: 'From/to'},
  {type: 'contains_id', label: 'Contains'}
]

export default class FareRulesForm extends Component<Props> {
  _onClickAdd = () => {
    const {activeComponent, activeEntity, updateActiveEntity} = this.props
    const rules = [...activeEntity.fare_rules]
    // Add new fare rule to beginning of array
    rules.unshift({
      ...generateNullProps('fare_rules'),
      fare_id: activeEntity.fare_id
    })
    updateActiveEntity(activeEntity, activeComponent, {fare_rules: rules})
  }

  render () {
    const {activeEntity} = this.props
    return (
      <div>
        <p>
          Specify which routes or zones <strong>{activeEntity.fare_id}</strong> fare applies to.
        </p>
        <span className='pull-right'>
          {activeEntity && activeEntity.fare_rules.length} rules apply to this fare
        </span>
        <Button
          data-test-id='add-fare-rule-button'
          onClick={this._onClickAdd}
          style={{marginBottom: '15px'}}
        >
          <Icon type='plus' /> Add rule
        </Button>
        {activeEntity.fare_rules.map((rule, index) => (
          <FareRuleItem
            rule={rule}
            key={index}
            index={index}
            {...this.props} />
        ))}
      </div>
    )
  }
}

type RuleProps = Props & {index: number, rule: FareRule}

class FareRuleItem extends Component<RuleProps> {
  _onClickRemoveRule = () => {
    const {activeComponent, activeEntity, index, updateActiveEntity} = this.props
    const rules = [...activeEntity.fare_rules]
    rules.splice(index, 1)
    updateActiveEntity(activeEntity, activeComponent, {fare_rules: rules})
  }

  render () {
    const {
      activeComponent,
      activeEntity,
      index,
      rule,
      tableData,
      updateActiveEntity,
      zoneOptions,
      zones
    } = this.props
    const routeEntity = rule.route_id
      ? getTableById(tableData, 'route').find(r => r.route_id === rule.route_id)
      : null
    return (
      <Panel key={`rule-${index}`}>
        <Button
          bsStyle='danger'
          bsSize='xsmall'
          className='pull-right'
          style={{marginLeft: '5px'}}
          onClick={this._onClickRemoveRule}>
          <Icon type='times' />
        </Button>
        <FormGroup>
          {FARE_RULE_TYPES.map((type, i) => (
            <FareRuleTypeCheckbox
              type={type}
              key={`${index}-${i}`}
              {...this.props} />
          ))}
        </FormGroup>
        <FareRuleSelections
          rule={rule}
          tableData={tableData}
          activeEntity={activeEntity}
          activeComponent={activeComponent}
          zones={zones}
          zoneOptions={zoneOptions}
          updateActiveEntity={updateActiveEntity}
          routeEntity={routeEntity} />
      </Panel>
    )
  }
}

class FareRuleTypeCheckbox extends Component<RuleProps & {type: RuleType}> {
  _onChangeCheckbox = () => {
    const {activeComponent, activeEntity, index, type, updateActiveEntity} = this.props
    const rules = [...activeEntity.fare_rules]
    if (type.type === 'origin_id') {
      // $FlowFixMe
      rules[index].origin_id = rules[index].origin_id ? null : true
      // $FlowFixMe
      rules[index].destination_id = rules[index].destination_id ? null : true
    } else {
      rules[index][type.type] = rules[index][type.type] ? null : []
    }
    updateActiveEntity(activeEntity, activeComponent, {fare_rules: rules})
  }

  render () {
    const {index, rule, type} = this.props
    const checked = type.type === 'origin_id'
      ? rule.origin_id || rule.destination_id
      : rule[type.type]
    return (
      <Checkbox
        inline
        name={`fareRuleType-${index}-${type.type}`}
        checked={Boolean(checked)}
        onChange={this._onChangeCheckbox}>
        <small>{type.label}</small>
      </Checkbox>
    )
  }
}
