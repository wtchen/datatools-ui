// @flow

import React, { Component } from 'react'

import type { AddCustomFileProps, TransformProps } from '../../../types'
import CSV_VALIDATION_ERRORS from '../../util/enums/transform'

import CustomCSVForm from './CustomCSVForm'

/**
 * Component that renders fields for AddCustomFile. This transformation shares csvData props with the ReplaceFileFromString transformation.
 * TODO: adapt this transformation to include a file upload for larger custom files?
 */
export default class AddCustomFile extends Component<TransformProps<AddCustomFileProps>, AddCustomFileProps> {
  constructor (props: TransformProps<AddCustomFileProps>) {
    super(props)
    this.state = {csvData: props.transformation.csvData, table: props.transformation.table}
  }

  _handleChange = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const newState = {...this.state, table: evt.target.value}
    this.setState(newState)
    this._updateErrors(newState)
  }

  _onSaveCsvData = () => {
    const csvData = this.state.csvData || null
    const table = this.state.table || null
    this.props.onSave({csvData, table}, this.props.index)
  }

  _onChangeCsvData = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const newState = {...this.state, csvData: evt.target.value}
    this.setState(newState)
    this._updateErrors(newState)
  }

  _getValidationErrors (fields: AddCustomFileProps): Array<string> {
    const issues = []
    const { csvData, table } = fields

    // CSV data must be defined.
    if (!csvData || csvData.length === 0) {
      issues.push(CSV_VALIDATION_ERRORS.UNDEFINED_CSV_DATA)
    }
    if (!table) {
      issues.push(CSV_VALIDATION_ERRORS.CSV_MUST_HAVE_NAME)
    }
    return issues
  }

  /**
   * Notify containing component of the resulting validation errors if any.
   * @param fields: The updated state. If not set, the component state will be used.
   */
  _updateErrors = (fields?: AddCustomFileProps) => {
    const { onValidationErrors } = this.props
    onValidationErrors(this._getValidationErrors(fields || this.state))
  }

  render () {
    const {transformation} = this.props
    const {csvData, table} = this.state
    const inputIsUnchanged = csvData === transformation.csvData && table === transformation.table
    return (
      <div>
        <div>
          <input
            onChange={this._handleChange}
            placeholder='Custom file name'
            type='text'
            value={table || null}
          />.txt
        </div>
        <CustomCSVForm
          csvData={csvData}
          inputIsUnchanged={inputIsUnchanged}
          onChangeCsvData={this._onChangeCsvData}
          onSaveCsvData={this._onSaveCsvData}
          type='AddCustomFile' // TODO: pass the classname directly?
        />
      </div>
    )
  }
}
