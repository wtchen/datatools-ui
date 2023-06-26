import React from 'react'

import ReplaceFileFromString from './ReplaceFileFromString'
import CustomCSVForm from './CustomCSVForm'

export default class PreserveCustomFields extends ReplaceFileFromString {
  render () {
    const {transformation} = this.props
    const {csvData} = this.state
    const inputIsSame = csvData === transformation.csvData

    return <CustomCSVForm
      csvData={csvData}
      inputIsSame={inputIsSame}
      onChangeCsvData={this._onChangeCsvData}
      onSaveCsvData={this._onSaveCsvData}
      type='PreserveCustomFields'
    />
  }
}
