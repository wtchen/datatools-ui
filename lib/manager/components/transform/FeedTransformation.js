// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button} from 'react-bootstrap'
import Select from 'react-select'

import {getGtfsSpec, getGtfsPlusSpec, isModuleEnabled} from '../../../common/util/config'
import {getTransformationName} from '../../util/transform'
import VersionSelectorDropdown from '../version/VersionSelectorDropdown'

import type {
  Feed,
  FeedTransformation as FeedTransformationType,
  ReactSelectOption
} from '../../../types'

type Props = {
  feedSource: Feed,
  index: number,
  onChange: (any, number) => void,
  onRemove: (number) => void,
  transformation: FeedTransformationType
}

/**
 * Component that renders fields for a single feed transformation
 * (e.g., ReplaceFileFromStringTransformation).
 */
export default class FeedTransformation extends Component<Props, {csvData: ?string}> {
  state = { csvData: null }

  _getFieldsForType = (type: string) => {
    const {feedSource, transformation} = this.props
    // Get selected version (if applicable).
    const version = feedSource.feedVersions &&
      feedSource.feedVersions.find(v => v.id === transformation.sourceVersionId)
    const fields = []
    let index = 0
    switch (type) {
      case 'ReplaceFileFromVersionTransformation':
        fields.push(
          <VersionSelectorDropdown
            key={index++}
            dropdownProps={{
              id: 'merge-versions-dropdown',
              onSelect: this._onSelectVersion
            }}
            title={version
              ? `From source version ${version.version}`
              : 'Select a source version'
            }
            version={version}
            versions={feedSource.feedVersions}
          />
        )
        break
      case 'ReplaceFileFromStringTransformation':
        const inputIsUnchanged = this.state.csvData === null
        const csvData = inputIsUnchanged
          ? transformation.csvData
          : this.state.csvData
        const textValue = csvData || ''
        const numLines = !textValue ? 0 : textValue.split(/\r*\n/).length
        fields.push(
          <div>
            <label htmlFor='csvData'>
              Add the CSV data to add to/replace in the incoming GTFS:
              <textarea
                id='csvData'
                onChange={this._onChangeCsvData}
                style={{
                  fontFamily: 'monospace',
                  fontSize: 'x-small',
                  height: '80px',
                  overflow: 'auto',
                  width: '400px',
                  whiteSpace: 'pre'
                }}
                placeholder={
                  `stop_id,stop_code,stop_name,stop_lat,stop_lon
  1234567,188390987,Broad Ave,33.98768,-87.72686`
                }
                value={textValue} />
            </label>
            <div style={{marginBottom: '10px'}}>
              <Button
                bsSize='xsmall'
                disabled={inputIsUnchanged}
                style={{marginRight: '5px'}}
                onClick={this._onSaveCsvData}>
                Save CSV
              </Button>
              <small>{numLines} lines</small>
            </div>
          </div>
        )
        break
      default:
        break
    }
    return fields
  }

  _getValidationIssues = () => {
    const {feedSource, transformation} = this.props
    // Get selected version (if applicable).
    const version = feedSource.feedVersions &&
      feedSource.feedVersions.find(v => v.id === transformation.sourceVersionId)
    const issues = []
    if (!transformation.table) {
      issues.push('Table must be defined')
    }
    switch (transformation['@type']) {
      case 'ReplaceFileFromVersionTransformation':
        // Only trigger validation issue if versions have been loaded.
        if (!version && feedSource.feedVersions) {
          issues.push('Version must be defined')
        }
        break
      case 'ReplaceFileFromStringTransformation':
        if (!transformation.csvData) {
          issues.push('CSV Data must be defined')
        }
        // TODO: Further validate CSV data based on parsing fields, checking for
        //   missing columns, etc.
        break
      default:
        break
    }
    return issues
  }

  _onChangeCsvData = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({csvData: evt.target.value})
  }

  _onSaveCsvData = () => {
    const csvData = this.state.csvData || null
    this.setState({csvData: null})
    this.props.onChange({csvData}, this.props.index)
  }

  _onRemoveTransformation = () => {
    this.props.onRemove(this.props.index)
  }

  _onSelectTable = (tableOption: ReactSelectOption) => {
    this.props.onChange({table: tableOption.value}, this.props.index)
  }

  _onSelectVersion = (versionIndex: number) => {
    const {feedSource, onChange} = this.props
    if (feedSource.feedVersions) {
      const version = feedSource.feedVersions[versionIndex - 1]
      onChange({sourceVersionId: version.id}, this.props.index)
    } else {
      console.warn('Feed source does not have list of feed versions')
    }
  }

  render () {
    const {feedSource, index, transformation} = this.props
    const tables = [...getGtfsSpec()].filter(t => !t.datatools)
    if (isModuleEnabled('gtfsplus')) tables.push(...getGtfsPlusSpec())
    const transformationType = transformation['@type']
    const validationIssues = this._getValidationIssues()
    const backgroundColor = validationIssues.length === 0
      ? '#f7f7f7'
      : '#ffdf68'
    return (
      <div style={{
        backgroundColor,
        padding: '2px 10px 10px 10px',
        marginBottom: '10px',
        border: '#ccc 1px solid',
        borderRadius: '10px'
      }}>
        <h5>
          <Button
            bsSize='xsmall'
            className='pull-right'
            onClick={this._onRemoveTransformation}>
            Delete step
          </Button>
          Step {index + 1} - {getTransformationName(transformationType, transformation, feedSource.feedVersions)}
        </h5>
        <div className='feed-transformation-body'>
          <Select
            style={{margin: '10px 0px', width: '230px'}}
            clearable={false}
            placeholder='Choose the file/table to replace'
            options={tables.map(table => ({value: table.name.split('.txt')[0], label: table.name}))}
            value={transformation.table}
            onChange={this._onSelectTable} />
          {this._getFieldsForType(transformationType)}
          {validationIssues.length > 0
            ? <ul className='list-unstyled'>
              <Icon type='exclamation-triangle' /> <strong>Validation Issues</strong>
              {validationIssues.map((issue, i) => {
                return (
                  <li style={{marginLeft: '10px'}} key={`issue-${i}`}>
                    {issue}
                  </li>
                )
              })}
            </ul>
            : null
          }
        </div>
      </div>
    )
  }
}
