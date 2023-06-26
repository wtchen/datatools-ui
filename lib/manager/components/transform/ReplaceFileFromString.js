// @flow

import React, { Component } from 'react'

import type { ReplaceFileFromStringFields, TransformProps } from '../../../types'
import CSV_VALIDATION_ERRORS from '../../util/enums/transform'

import CustomCSVForm from './CustomCSVForm'

/**
 * Component that renders fields for ReplaceFileFromStringTransformation.
 */
export default class ReplaceFileFromString extends Component<TransformProps<ReplaceFileFromStringFields>, ReplaceFileFromStringFields> {
  constructor (props: TransformProps<ReplaceFileFromStringFields>) {
    super(props)
    this.state = {csvData: props.transformation.csvData}
  }

  componentDidMount () {
    this._updateErrors()
  }

  _onChangeCsvData = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const newState = {csvData: evt.target.value}
    this.setState(newState)
    this._updateErrors(newState)
  }

  _onSaveCsvData = () => {
    const csvData = this.state.csvData || null
    this.props.onSave({csvData}, this.props.index)
  }

  _getValidationErrors (fields: ReplaceFileFromStringFields): Array<string> {
    const issues = []
    const { csvData } = fields

    // CSV data must be defined.
    if (!csvData || csvData.length === 0) {
      issues.push(CSV_VALIDATION_ERRORS.UNDEFINED_CSV_DATA)
    }
    return issues
  }

  /**
   * Notify containing component of the resulting validation errors if any.
   * @param fields: The updated state. If not set, the component state will be used.
   */
  _updateErrors = (fields?: ReplaceFileFromStringFields) => {
    const { onValidationErrors } = this.props
    onValidationErrors(this._getValidationErrors(fields || this.state))
  }

  render () {
    const {transformation} = this.props
    const {csvData} = this.state
    const inputIsUnchanged = csvData === transformation.csvData

    return <CustomCSVForm
      csvData={csvData}
      inputIsUnchanged={inputIsUnchanged}
      onChangeCsvData={this._onChangeCsvData}
      onSaveCsvData={this._onSaveCsvData}
      type='ReplaceFileFromString'
    />
  }
}
