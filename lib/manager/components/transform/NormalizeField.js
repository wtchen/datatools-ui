// @flow

import Icon from '@conveyal/woonerf/components/icon'
import { isEqual } from 'lodash'
import React, { Component } from 'react'
import { Button, Checkbox, FormControl, FormGroup, Table } from 'react-bootstrap'
import Select from 'react-select'

import { getGtfsSpec } from '../../../common/util/config'
import Transform from './Transform'

import type {
  GtfsSpecTable,
  NormalizeFieldFields,
  ReactSelectOption,
  Substitution
} from '../../../types'
import type { TransformProps } from './Transform'

function extractStateFields (transformation: NormalizeFieldFields): NormalizeFieldFields {
  const {
    capitalize,
    capitalizeExceptions,
    fieldName,
    performSubstitutions,
    substitutions
  } = transformation
  return {
    capitalize: capitalize,
    capitalizeExceptions: capitalizeExceptions || '',
    fieldName: fieldName || '',
    performSubstitutions: performSubstitutions,
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

  _onChangeCapitalizeValues = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.updateState({capitalize: evt.target.checked})
  }

  _onChangeCapitalizeExceptions = (values: Array<{value: string}>) => {
    this.updateState({capitalizeExceptions: values.map(v => v.value).join(',')})
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
    this.props.onSave(extractStateFields(this.state), this.props.index)
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

    // If substitutions are enabled, then substitutions must be defined.
    if (performSubstitutions && (!substitutions || substitutions.length === 0)) {
      issues.push('Substitutions must be defined when enabling substitutions.')
    }

    return issues
  }

  render () {
    const { transformation } = this.props
    const {
      capitalize,
      capitalizeExceptions,
      fieldName,
      performSubstitutions,
      substitutions
    } = this.state

    const inputIsUnchanged = isEqual(this.state, extractStateFields(transformation))
    const capitalizeExceptionList = capitalizeExceptions && capitalizeExceptions
      .split(',')
      .map(s => s.trim())
      .map(s => ({ label: s, value: s }))

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
              onChange={this._onChangeCapitalizeValues}
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
                  onChange={this._onChangeCapitalizeExceptions}
                  placeholder='Enter exceptions then press enter'
                  value={capitalizeExceptionList}
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
                    <th>Substitute</th>
                    <th>With</th>
                    <th>Normalize space?</th>
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
                        <Icon type='plus' /> New
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

type GtfsFieldSelectorProps = {
  onChange: (ReactSelectOption => void),
  selectedField: ?string,
  tableName: ?string
}

/**
 * Obtains the desired GTFS spec table.
 */
function getGtfsTableSpec (tableName: string): ?GtfsSpecTable {
  const spec = getGtfsSpec()
  if (!spec) {
    throw new Error('GTFS spec could not be found!')
  }
  const tableFile = `${tableName}.txt`
  return spec.find(t => t.name === tableFile)
}

/**
 * Dropdown selector to select a field from a given GTFS table.
 */
const GtfsFieldSelector = (props: GtfsFieldSelectorProps) => {
  const { onChange, selectedField, tableName } = props
  if (!tableName) return null

  const table = getGtfsTableSpec(tableName)
  if (!table) return null

  return (
    <Select
      clearable={false}
      onChange={onChange}
      options={table.fields.map(field => ({label: field.name, value: field.name}))}
      placeholder='Choose the field to normalize'
      searchable={false}
      style={{margin: '10px 0px', width: '230px'}}
      value={selectedField}
    />
  )
}

type SubstitutionRowProps = {
  index: number,
  onChange: (Substitution, number) => void,
  onRemove: number => void,
  substitution: Substitution
}

/**
 * Renders and lets user edit a substitution.
 */
class SubstitutionRow extends Component<SubstitutionRowProps> {
  _onEditPattern = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateSubtitution({ pattern: evt.target.value })
  }

  _onEditReplacement = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateSubtitution({ replacement: evt.target.value })
  }

  _onEditNormalizeSpace = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateSubtitution({ normalizeSpace: evt.target.checked })
  }

  _onRemove = () => this.props.onRemove(this.props.index)

  _updateSubtitution (partialState: any) {
    const { index, onChange, substitution } = this.props
    const newSubstitution = {
      ...substitution,
      ...partialState
    }
    onChange(newSubstitution, index)
  }

  render () {
    const { substitution } = this.props
    const { normalizeSpace, pattern, replacement } = substitution
    return (
      <tr>
        <td>
          <FormControl
            onChange={this._onEditPattern}
            placeholder='Enter text to find'
            style={{height: 'unset', padding: '2px'}}
            value={pattern}
          />
        </td>
        <td>
          <FormControl
            onChange={this._onEditReplacement}
            placeholder='Enter replacement text'
            style={{height: 'unset', padding: '2px'}}
            value={replacement}
          />
        </td>
        <td>
          <Checkbox
            checked={normalizeSpace}
            onChange={this._onEditNormalizeSpace}
            style={{margin: '2px 0'}}
          />
        </td>
        <td>
          <Button
            bsSize='xsmall'
            onClick={this._onRemove}
            title='Remove this substitution'
          >
            <Icon type='remove' />
          </Button>
        </td>
      </tr>
    )
  }
}
