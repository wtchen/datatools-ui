// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
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

import type {
  NormalizeFieldFields,
  ReactSelectOption,
  Substitution,
  TransformProps
} from '../../../types'

/**
 * Component that renders input fields for the NormalizeFieldTransformation.
 */
export default class NormalizeField extends Component<TransformProps<NormalizeFieldFields>, NormalizeFieldFields> {
  componentDidMount () {
    this._updateErrors()
  }

  _onChangeFieldToNormalize = (fieldOption: ReactSelectOption) => {
    this._updateTransformation({fieldName: fieldOption.value})
  }

  _onChangeCapitalize = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateTransformation({capitalize: evt.target.checked})
  }

  _onChangeCapitalizationExceptions = (values: Array<{value: string}>) => {
    this._updateTransformation({capitalizationExceptions: values.map(v => v.value)})
  }

  _onChangePerformSubstitutions = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateTransformation({performSubstitutions: evt.target.checked})
  }

  _onChangeSubstitution = (substitution: Substitution, index: number) => {
    const newSubstitutions = [].concat(this.props.transformation.substitutions)
    newSubstitutions[index] = substitution
    this._updateTransformation({substitutions: newSubstitutions})
  }

  _onRemoveSubstitution = (index: number) => {
    const newSubstitutions = [].concat(this.props.transformation.substitutions)
    newSubstitutions.splice(index, 1)
    this._updateTransformation({substitutions: newSubstitutions})
  }

  _onNewSubstitution = () => {
    this._updateTransformation({substitutions: [...[].concat(this.props.transformation.substitutions), {
      pattern: 'Text to find',
      replacement: 'Replacement'
    }]})
  }

  _getValidationErrors (fields: NormalizeFieldFields): Array<string> {
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

  /**
   * Notify containing component of the resulting validation errors if any.
   * @param fields: The updated transformation fields. If not set, the initial transformation will be used.
   */
  _updateErrors = (fields?: NormalizeFieldFields) => {
    const { onValidationErrors } = this.props
    onValidationErrors(this._getValidationErrors(fields || this.props.transformation))
  }

  /**
   * Update the component editing state
   * and perform and notify of validation checks.
   */
  _updateTransformation = (partialState: any) => {
    const { index, onSave, transformation } = this.props
    const newTransformation = {
      ...transformation,
      ...partialState
    }
    onSave(newTransformation, index)
    this._updateErrors(newTransformation)
  }

  render () {
    const { index, transformation } = this.props
    const {
      capitalizationExceptions,
      capitalize,
      fieldName,
      performSubstitutions,
      substitutions
    } = transformation

    const capitalizationExceptionList = capitalizationExceptions &&
      capitalizationExceptions.map(s => ({ label: s, value: s }))
    const capitalizationExceptionListId = `capitalizationExceptionList-${index}`

    const normalizeTooltip = (
      <Tooltip id='normalize-space-tooltip'>
        <p>
          If checked, this option will add or shrink the space surrounding
          the text to substitute to one space.
        </p>
        <p>
          For example if "@" were replaced with "and",
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
              Enforce title case (e.g., "Main Street And First Avenue")
            </Checkbox>
            <span style={{display: 'block'}}>
              <label htmlFor={capitalizationExceptionListId}>
                Capitalization exceptions (e.g., "via" or "MLK")
              </label>
              <FormGroup>
                <Select.Creatable
                  arrowRenderer={null}
                  clearable={false}
                  id={capitalizationExceptionListId}
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
              Perform the following substitutions
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
                      disabled={!performSubstitutions}
                      index={i}
                      key={i}
                      onChange={this._onChangeSubstitution}
                      onRemove={this._onRemoveSubstitution}
                      substitution={s}
                    />
                  ))}
                  <tr>
                    <td colSpan='4'>
                      <Button
                        bsSize='xsmall'
                        disabled={!performSubstitutions}
                        onClick={this._onNewSubstitution}
                      >
                        <Icon type='plus' /> Add
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </FormGroup>
          </li>
        </ul>
      </div>
    )
  }
}
