// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button} from 'react-bootstrap'
import Select from 'react-select'

import {getGtfsSpec, getGtfsPlusSpec, isModuleEnabled} from '../../../common/util/config'
import {getTransformationName} from '../../util/transform'
import NormalizeField, {getNormalizeFieldsValidationIssues} from './NormalizeField'
import ReplaceFileFromString, {getReplaceFileFromStringValidationIssues} from './ReplaceFileFromString'
import ReplaceFileFromVersion, {getReplaceFileFromVersionValidationIssues} from './ReplaceFileFromVersion'

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

// An index of UI components and validation checks for different transformation types.
// (All transformation types should be listed, but component and/or getValidationIssues for each are optional.)
const transformationTypes = {
  DeleteRecordsTransformation: {},
  NormalizeFieldTransformation: {
    component: NormalizeField,
    getValidationIssues: getNormalizeFieldsValidationIssues
  },
  ReplaceFileFromStringTransformation: {
    component: ReplaceFileFromString,
    getValidationIssues: getReplaceFileFromStringValidationIssues
  },
  ReplaceFileFromVersionTransformation: {
    component: ReplaceFileFromVersion,
    getValidationIssues: getReplaceFileFromVersionValidationIssues
  }
}

/**
 * Component that renders fields for one feed transformation
 * (e.g., ReplaceFileFromStringTransformation).
 */
export default class FeedTransformation extends Component<Props> {
  _getFieldsForType = (type: string) => {
    const {feedSource, index, onChange, transformation} = this.props
    const FieldsComponent = transformationTypes[type].component
    return FieldsComponent && (
      <FieldsComponent
        feedSource={feedSource}
        index={index}
        onSave={onChange}
        transformation={transformation}
      />
    )
  }

  _getValidationIssues = () => {
    const {feedSource, transformation} = this.props
    let issues: Array<string> = []
    if (!transformation.table) {
      issues.push('Table must be defined')
    }

    const {getValidationIssues} = transformationTypes[transformation['@type']]
    if (typeof getValidationIssues === 'function') {
      issues = issues.concat(getValidationIssues(transformation, feedSource))
    }
    return issues
  }

  _onRemoveTransformation = () => {
    this.props.onRemove(this.props.index)
  }

  _onSelectTable = (tableOption: ReactSelectOption) => {
    this.props.onChange({table: tableOption.value}, this.props.index)
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
