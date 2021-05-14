// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button} from 'react-bootstrap'
import Select from 'react-select'

import {getGtfsSpec, getGtfsPlusSpec, isModuleEnabled} from '../../../common/util/config'
import {getTransformationName, getTransformationPlaceholder} from '../../util/transform'
import NormalizeField from './NormalizeField'
import ReplaceFileFromString from './ReplaceFileFromString'
import ReplaceFileFromVersion from './ReplaceFileFromVersion'

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
    component: NormalizeField
  },
  ReplaceFileFromStringTransformation: {
    component: ReplaceFileFromString
  },
  ReplaceFileFromVersionTransformation: {
    component: ReplaceFileFromVersion
  }
}

/**
 * Component that renders fields for one feed transformation
 * (e.g., ReplaceFileFromStringTransformation).
 */
export default class FeedTransformation extends Component<Props, {errors: Array<string>}> {
  state = {
    errors: []
  }

  _getFieldsForType = (type: string) => {
    const {feedSource, index, onChange, transformation} = this.props
    const FieldsComponent = transformationTypes[type].component
    // Pass a key to React that depends on transform content, so that
    // the component is recreated/rerendered if transform changes.
    const key = JSON.stringify(transformation)
    return FieldsComponent && (
      <FieldsComponent
        feedSource={feedSource}
        index={index}
        key={key}
        onSave={onChange}
        onValidationErrors={this._onValidationErrors}
        transformation={transformation}
      />
    )
  }

  _onValidationErrors = (errors: Array<string>) => {
    const issues: Array<string> = []
    if (!this.props.transformation.table) {
      issues.push('Table must be defined')
    }
    this.setState({ errors: issues.concat(errors) })
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
    const {errors: validationIssues} = this.state
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
            placeholder={getTransformationPlaceholder(transformationType, 'filePlaceholder')}
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
