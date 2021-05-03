// @flow

import Icon from '@conveyal/woonerf/components/icon'
import { isEqual } from 'lodash'
import React from 'react'
import {
  Button,
  Checkbox,
  FormGroup,
  OverlayTrigger,
  Table,
  Tooltip
} from 'react-bootstrap'
import Select from 'react-select'

import GtfsFieldSelector from '../GtfsFieldSelector'
import SubstitutionRow from './SubstitutionRow'
import Transform from './Transform'

import type {
  NormalizeFieldFields,
  ReactSelectOption,
  Substitution
} from '../../../types'
import type { TransformProps } from './Transform'

/**
 * Extract just the subset of fields to build the state variable.
 */
function extractStateFields (transformation: NormalizeFieldFields): NormalizeFieldFields {
  const {
    capitalizationExceptions,
    capitalize,
    fieldName,
    performSubstitutions,
    substitutions
  } = transformation
  return {
    capitalizationExceptions: capitalizationExceptions || [],
    capitalize,
    fieldName: fieldName || '',
    performSubstitutions,
    substitutions: substitutions || []
  }
}

/**
 * Component that renders input fields for the NoramlizeFieldTransformation.
 */
export default class NormalizeField extends Transform<NormalizeFieldFields> {
  constructor (props: TransformProps<NormalizeFieldFields>) {
    super(props)
    this.state = extractStateFields(props.transformation)
  }

  _onChangeFieldToNormalize = (fieldOption: ReactSelectOption) => {
    this.updateState({fieldName: fieldOption.value})
  }

  _onChangeCapitalize = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.updateState({capitalize: evt.target.checked})
  }

  _onChangeCapitalizationExceptions = (values: Array<{value: string}>) => {
    this.updateState({capitalizationExceptions: values.map(v => v.value)})
  }

  _onChangePerformSubstitutions = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.updateState({performSubstitutions: evt.target.checked})
  }

  _onChangeSubstitution = (substitution: Substitution, index: number) => {
    const newSubstitutions = [].concat(this.state.substitutions)
    newSubstitutions[index] = substitution
    this.updateState({substitutions: newSubstitutions})
  }

  _onRemoveSubstitution = (index: number) => {
    const newSubstitutions = [].concat(this.state.substitutions)
    newSubstitutions.splice(index, 1)
    this.updateState({substitutions: newSubstitutions})
  }

  _onNewSubstitution = () => {
    this.updateState({substitutions: [...[].concat(this.state.substitutions), {
      pattern: 'Text to find',
      replacement: 'Replacement'
    }]})
  }

  _onSaveTransformationSettings = () => {
    this.props.onSave(this.state, this.props.index)
  }

  _onRevertTransformationSettings = () => {
    this.updateState(extractStateFields(this.props.transformation))
  }

  getValidationErrors (fields: NormalizeFieldFields): Array<string> {
    const issues = []
    const { fieldName, performSubstitutions, substitutions } = fields

    // fieldName must be defined.
    if (!fieldName || fieldName.length === 0) {
      issues.push('Field to normalize must be defined.')
    }

    // If substitutions are enabled, then substitutions must be defined,
    // and the pattern for each must not be null or empty.
    if (performSubstitutions) {
      if (substitutions && substitutions.length > 0) {
        if (substitutions.filter(s => !s.pattern || s.pattern === '').length > 0) {
          issues.push('Substitution patterns must be defined.')
        }
      } else {
        issues.push('Substitutions must be defined when enabling substitutions.')
      }
    }

    return issues
  }

  render () {
    const { transformation } = this.props
    const {
      capitalizationExceptions,
      capitalize,
      fieldName,
      performSubstitutions,
      substitutions
    } = this.state

    const inputIsUnchanged = isEqual(this.state, extractStateFields(transformation))
    const capitalizationExceptionList = capitalizationExceptions &&
      capitalizationExceptions.map(s => ({ label: s, value: s }))

    const normalizeTooltip = (
      <Tooltip id='normalize-space-tooltip'>
        <p>
          If checked, this option will add or shrink the space surrounding
          the text to substitute to one space.
        </p>
        <p>
          For example if "@" was replaced with "and",
          then "12th@&nbsp;&nbsp;&nbsp;West" would become "12th and West".
        </p>
      </Tooltip>
    )

    const substituteTooltip = (
      <Tooltip id='substitute-space-tooltip'>
        <p>
          Enter the text to search as a regular expression (regex).
          Some characters may need to be escaped (e.g., enter "\+" for the "+" symbol).
        </p>
        <p>
          Click the <Icon title='Test this regex' type='flask' /> icon next to a regex below to test it
          or to get help writing one.
        </p>
      </Tooltip>
    )

    return (
      <div>
        <GtfsFieldSelector
          onChange={this._onChangeFieldToNormalize}
          selectedField={fieldName}
          tableName={transformation.table}
        />

        <ul style={{ listStyleType: 'none', paddingLeft: '0px' }}>
          <li>
            <Checkbox
              checked={capitalize}
              onChange={this._onChangeCapitalize}
            >
              Capitalize field value
            </Checkbox>
            <span style={{display: 'block'}}>
              Exceptions:
              <FormGroup>
                <Select.Creatable
                  arrowRenderer={null}
                  clearable={false}
                  multi
                  onChange={this._onChangeCapitalizationExceptions}
                  placeholder='Enter exceptions then press enter'
                  value={capitalizationExceptionList}
                />
              </FormGroup>
            </span>
          </li>
          <li>
            <Checkbox
              checked={performSubstitutions}
              onChange={this._onChangePerformSubstitutions}
            >
              Perform the following substitutions:
            </Checkbox>
            <FormGroup>
              <Table condensed>
                <thead>
                  <tr>
                    <th>
                      Substitute
                      <OverlayTrigger
                        overlay={substituteTooltip}
                        placement='top'
                      >
                        <Icon type='info-circle' />
                      </OverlayTrigger>
                    </th>
                    <th>With</th>
                    <th style={{ textAlign: 'right' }}>
                      Normalize<br />space?
                      <OverlayTrigger
                        overlay={normalizeTooltip}
                        placement='top'
                      >
                        <Icon type='info-circle' />
                      </OverlayTrigger>
                    </th>
                    <th style={{width: '45%'}}>Description</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {substitutions && substitutions.map((s, i) => (
                    <SubstitutionRow
                      index={i}
                      key={i}
                      onChange={this._onChangeSubstitution}
                      onRemove={this._onRemoveSubstitution}
                      substitution={s}
                    />
                  ))}
                  <tr>
                    <td colSpan='4'>
                      <Button bsSize='xsmall' onClick={this._onNewSubstitution}>
                        <Icon type='plus' /> Add
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </FormGroup>
          </li>
        </ul>
        <div style={{marginBottom: '10px'}}>
          <Button
            bsSize='xsmall'
            disabled={inputIsUnchanged}
            onClick={this._onSaveTransformationSettings}
            style={{marginRight: '5px'}}
          >
            Save
          </Button>
          <Button
            bsSize='xsmall'
            disabled={inputIsUnchanged}
            onClick={this._onRevertTransformationSettings}
            style={{marginRight: '5px'}}
          >
            Revert
          </Button>
        </div>
      </div>
    )
  }
}
