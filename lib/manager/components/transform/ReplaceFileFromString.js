// @flow

import React from 'react'
import {Button} from 'react-bootstrap'

import Transform from './Transform'

import type { ReplaceFileFromStringFields } from '../../../types'
import type { TransformProps } from './Transform'

/**
 * Component that renders fields for ReplaceFileFromStringTransformation.
 */
export default class ReplaceFileFromString extends Transform<ReplaceFileFromStringFields> {
  constructor (props: TransformProps<ReplaceFileFromStringFields>) {
    super(props)
    this.state = {csvData: props.transformation.csvData}
  }

  _onChangeCsvData = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.updateState({csvData: evt.target.value})
  }

  _onSaveCsvData = () => {
    const csvData = this.state.csvData || null
    this.props.onSave({csvData}, this.props.index)
  }

  getValidationErrors (fields: ReplaceFileFromStringFields): Array<string> {
    const issues = []
    const { csvData } = fields

    // CSV data must be defined.
    if (!csvData || csvData.length === 0) {
      issues.push('CSV data must be defined.')
    }
    return issues
  }

  render () {
    const {transformation} = this.props
    const {csvData} = this.state
    const inputIsUnchanged = csvData === transformation.csvData
    const textValue = csvData || ''
    const numLines = !textValue ? 0 : textValue.split(/\r*\n/).length

    return (
      <div>
        <label htmlFor='csvData'>
          Add the CSV data to add to/replace in the incoming GTFS:
          <textarea
            id='csvData'
            onChange={this._onChangeCsvData}
            placeholder={
              `stop_id,stop_code,stop_name,stop_lat,stop_lon
1234567,188390987,Broad Ave,33.98768,-87.72686`
            }
            style={{
              fontFamily: 'monospace',
              fontSize: 'x-small',
              height: '80px',
              overflow: 'auto',
              whiteSpace: 'pre',
              width: '400px'
            }}
            value={textValue} />
        </label>
        <div style={{marginBottom: '10px'}}>
          <Button
            bsSize='xsmall'
            disabled={inputIsUnchanged}
            onClick={this._onSaveCsvData}
            style={{marginRight: '5px'}}
          >
            Save CSV
          </Button>
          <small>{numLines} lines</small>
        </div>
      </div>
    )
  }
}
