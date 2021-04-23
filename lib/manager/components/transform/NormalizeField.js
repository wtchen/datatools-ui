// @flow

import { isEqual } from 'lodash'
import React from 'react'
import { Button, Checkbox, FormControl, FormGroup } from 'react-bootstrap'
import Select from 'react-select'

import { getGtfsSpec } from '../../../common/util/config'
import Transform from './Transform'

import type {
  FeedTransformation as FeedTransformationType,
  GtfsSpecTable,
  NormalizeFieldFields,
  ReactSelectOption
} from '../../../types'
import type { TransformProps } from './Transform'

function extractStateFields (transformation: FeedTransformationType): NormalizeFieldFields {
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
    substitutions: substitutions || ''
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
    console.log(evt.target.checked)
    this.updateState({performSubstitutions: evt.target.checked})
  }

  _onChangeSubstitutions = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.updateState({substitutions: evt.target.value})
  }

  _onSaveTransformationSettings = () => {
    this.props.onSave(this.state, this.props.index)
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
              Capitalize value
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
              <FormControl
                disabled={!performSubstitutions}
                onChange={this._onChangeSubstitutions}
                // TODO: Add something to explain the syntax (when finalized).
                placeholder='Enter substitutions in the form old => new, separated by commas'
                type='text'
                value={substitutions}
              />
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
      options={table.fields.map((field, colIndex) => ({label: field.name, value: field.name}))}
      placeholder='Choose the field to normalize'
      searchable={false}
      style={{margin: '10px 0px', width: '230px'}}
      value={selectedField}
    />
  )
}
