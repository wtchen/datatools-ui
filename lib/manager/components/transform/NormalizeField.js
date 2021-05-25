// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import {
  Button,
  Checkbox,
  ControlLabel,
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

type State = NormalizeFieldFields & {
  activeEditingIndex: number
}

/**
 * Component that renders input fields for the NormalizeFieldTransformation.
 */
export default class NormalizeField extends Component<TransformProps<NormalizeFieldFields>, State> {
  state = {
    activeEditingIndex: -1
  }

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
    const { substitutions } = this.props.transformation
    this._updateTransformation({substitutions: [...(substitutions || []), {
      pattern: 'Text to find',
      replacement: 'Replacement'
    }]})
  }

  _getValidationErrors (fields: NormalizeFieldFields): Array<string> {
    const issues = []
    const { fieldName, substitutions } = fields

    // fieldName must be defined.
    if (!fieldName || fieldName.length === 0) {
      issues.push('Field to normalize must be defined.')
    }

    // The pattern for substitutions must not be null or empty.
    if (substitutions && substitutions.filter(s => !s.pattern || s.pattern === '').length > 0) {
      issues.push('Substitution patterns must be defined.')
    }

    return issues
  }

  _onBeginEditSubstitution = (index: number) => {
    this.setState({ activeEditingIndex: index })
  }

  _onEndEditSubstitution = () => {
    this.setState({ activeEditingIndex: -1 })
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
   * Update the transformation
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
      substitutions
    } = transformation
    const { activeEditingIndex } = this.state

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
          For example, if "@" were replaced with "and",
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

        <Checkbox
          checked={capitalize}
          onChange={this._onChangeCapitalize}
        >
          Enforce title case (e.g., "Main Street And First Avenue")
        </Checkbox>
        <FormGroup>
          <ControlLabel htmlFor={capitalizationExceptionListId}>
            Capitalization exceptions (e.g., "via" or "MLK")
          </ControlLabel>
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
              <th style={{ lineHeight: '1.0', textAlign: 'right' }}>
                Normalize<br />space?
                <OverlayTrigger
                  overlay={normalizeTooltip}
                  placement='top'
                >
                  <Icon type='info-circle' />
                </OverlayTrigger>
              </th>
              <th style={{ width: '45%' }}>Description</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {substitutions && substitutions.map((s, i) => (
              <SubstitutionRow
                activeEditingIndex={activeEditingIndex}
                index={i}
                key={i}
                onBeginEdit={this._onBeginEditSubstitution}
                onChange={this._onChangeSubstitution}
                onEndEdit={this._onEndEditSubstitution}
                onRemove={this._onRemoveSubstitution}
                substitution={s}
              />
            ))}
            <tr>
              <td colSpan='4' style={{ borderTop: 'none' }}>
                {(!substitutions || substitutions.length === 0) && (
                  <p>(No substitutions defined)</p>
                )}
                <Button
                  bsSize='xsmall'
                  onClick={this._onNewSubstitution}
                >
                  <Icon type='plus' /> Add
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    )
  }
}
