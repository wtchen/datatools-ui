// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button, Checkbox, FormControl, FormGroup} from 'react-bootstrap'
import Select from 'react-select'

import {getGtfsSpec, getGtfsPlusSpec, isModuleEnabled} from '../../../common/util/config'
import {getTransformationName} from '../../util/transform'
import VersionSelectorDropdown from '../version/VersionSelectorDropdown'
import NormalizeFields, {getNormalizeFieldsValidationIssues} from './NormalizeFields'
import ReplaceFileFromStringFields, {getReplaceFileFromStringValidationIssues} from './ReplaceFileFromStringFields'

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
export default class FeedTransformation extends Component<Props> {
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
      case 'ReplaceFileFromStringTransformation': {
        fields.push(
          <ReplaceFileFromStringFields
            feedSource={feedSource}
            key={index++}
            index={this.props.index}
            onSave={this.props.onChange}
            transformation={transformation}
          />
        )
        break
      }
      case 'NormalizeFieldTransformation': {
        fields.push(
          <NormalizeFields
            feedSource={feedSource}
            key={index++}
            index={this.props.index}
            onSave={this.props.onChange}
            transformation={transformation}
          />
        )
        break
      }
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
    let issues: Array<string> = []
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
        issues = issues.concat(getReplaceFileFromStringValidationIssues(transformation))
        break
      case 'NormalizeFieldTransformation':
        issues = issues.concat(getNormalizeFieldsValidationIssues(transformation))
        break;
      default:
        break
    }
    return issues
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
