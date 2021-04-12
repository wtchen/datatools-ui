// @flow

import { isEqual } from 'lodash'
import React, {Component} from 'react'
import {Button} from 'react-bootstrap'

import type {
  Feed,
  FeedTransformation as FeedTransformationType
} from '../../../types'

type Props = {
  feedSource: Feed,
  index: number,
  onSave: (any, number) => void,
  transformation: FeedTransformationType
}

export function getReplaceFileFromStringValidationIssues (transformation: FeedTransformationType, feedSource: Feed): Array<string> {
  const issues = []

  // CSV data must be defined.
  if (!transformation.csvData) {
    issues.push('CSV data must be defined.')
  }

  return issues
}

/**
 * Component that renders fields for ReplaceFileFromStringTransformation.
 */
export default class ReplaceFileFromString extends Component<Props, {csvData: ?string}> {
  state = { csvData: null }

  componentDidUpdate (prevProps: Props) {
    const { transformation } = this.props
    if (!isEqual(transformation, prevProps.transformation)) {
      this.setState({ csvData: transformation.csvData })
    }
  }

  render () {
    const {transformation} = this.props
    const inputIsUnchanged = this.state.csvData === null
    const csvData = inputIsUnchanged
      ? transformation.csvData
      : this.state.csvData
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

  _onChangeCsvData = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({csvData: evt.target.value})
  }

  _onSaveCsvData = () => {
    const csvData = this.state.csvData || null
    this.props.onSave({csvData}, this.props.index)
  }
}
