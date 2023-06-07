// @flow

import React, { Component } from 'react'

import type { AddCustomFileProps, ReplaceFileFromStringFields, TransformProps } from '../../../types'

import CustomCSVForm from './CustomCSVForm'

/**
 * Component that renders fields for AddCustomFile. This transformation shares csvData props with the ReplaceFileFromString transformation.
 * TODO: adapt this transformation to include a file upload for larger custom files?
 */
export default class AddCustomFile extends Component<TransformProps<AddCustomFileProps>, AddCustomFileProps> {
  constructor (props: TransformProps<AddCustomFileProps>) {
    super(props)
    this.state = {csvData: props.transformation.csvData, customFileName: props.transformation.customFileName}
  }

  // $FlowFixMe: Flow doesn't recognize return type for these arrow functions
  _handleChange = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({...this.state, customFileName: evt.target.value})
  }

  // $FlowFixMe[signature-verification-failure]
  _onSaveCsvData = () => {
    const csvData = this.state.csvData || null
    const customFileName = this.state.customFileName || null
    this.props.onSave({csvData, customFileName}, this.props.index)
  }

  // $FlowFixMe[signature-verification-failure]
  _onChangeCsvData = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const newState = {...this.state, csvData: evt.target.value}
    this.setState(newState)
    this._updateErrors(newState)
  }

  _getValidationErrors (fields: ReplaceFileFromStringFields): Array<string> {
    const issues = []
    const { csvData } = fields

    // CSV data must be defined.
    if (!csvData || csvData.length === 0) {
      issues.push('CSV data must be defined.')
    } else if (!this.state.customFileName) {
      issues.push('Custom CSV must have a name.')
    }
    return issues
  }

  /**
   * Notify containing component of the resulting validation errors if any.
   * @param fields: The updated state. If not set, the component state will be used.
   */
  // $FlowFixMe[signature-verification-failure]
  _updateErrors = (fields?: ReplaceFileFromStringFields) => {
    const { onValidationErrors } = this.props
    onValidationErrors(this._getValidationErrors(fields || this.state))
  }

  render () {
    const {transformation} = this.props
    const {csvData, customFileName} = this.state
    const inputIsUnchanged = csvData === transformation.csvData
    return (
      <div>
        <div>
          <input
            onChange={this._handleChange}
            placeholder='Custom file name'
            type='text'
            value={customFileName || null}
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
