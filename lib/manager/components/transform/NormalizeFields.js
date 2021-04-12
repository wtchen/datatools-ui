// @flow

import { isEqual } from 'lodash'
import React, {Component} from 'react'
import {Button, Checkbox, FormControl, FormGroup} from 'react-bootstrap'

import type {
  Feed,
  FeedTransformation as FeedTransformationType
} from '../../../types'

// TODO: Use the correct feed transformation type instead.
type State = {
  capitalize?: boolean,
  capitalizeExceptions?: string,
  fieldName: ?string,
  performSubstitutions?: boolean,
  substitutions?: string
}

type Props = {
  feedSource: Feed,
  index: number,
  onSave: (State, number) => void,
  transformation: FeedTransformationType // TODO: split tranformation types.
}

function getTransformationFields (transformation: FeedTransformationType): State {
  const {
    capitalize,
    capitalizeExceptions = '',
    fieldName = '',
    performSubstitutions,
    substitutions = ''
  } = transformation
  return {
    capitalize,
    capitalizeExceptions,
    fieldName,
    performSubstitutions,
    substitutions
  }
}

/**
 * Obtain the list of validation issues for the given transformation.
 */
export function getNormalizeFieldsValidationIssues (transformation: FeedTransformationType, feedSource: Feed): Array<string> {
  const issues = []
  const { fieldName, performSubstitutions, substitutions } = transformation

  // fieldName must be defined.
  if (!fieldName || fieldName.length === 0) {
    issues.push('Field to normalize must be defined.')
  }

  // If substitutions are enabled, then substitutions must be defined.
  if (performSubstitutions && (!substitutions || substitutions.length === 0)) {
    issues.push('Substitutions must be defined when enabling substitutions.')
  }

  return issues
}

/**
 * Component that renders input fields for the NoramlizeFieldTransformation.
 */
export default class NormalizeFields extends Component<Props, State> {
  state = {
    capitalize: true,
    capitalizeExceptions: '',
    fieldName: '',
    performSubstitutions: true,
    substitutions: ''
  }

  constructor (props: Props) {
    super(props)
    this.state = getTransformationFields(props.transformation)
  }

  _onChangeFieldToNormalize = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({fieldName: evt.target.value})
  }

  _onChangeCapitalizeValues = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({capitalize: evt.target.checked})
  }

  _onChangeCapitalizeExceptions = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({capitalizeExceptions: evt.target.value})
  }

  _onChangePerformSubstitutions = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({performSubstitutions: evt.target.checked})
  }

  _onChangeSubstitutions = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({substitutions: evt.target.value})
  }

  _onSaveTransformationSettings = () => {
    this.props.onSave(this.state, this.props.index)
  }

  componentDidUpdate (prevProps: Props) {
    const { transformation } = this.props
    if (!isEqual(transformation, prevProps.transformation)) {
      this.setState(getTransformationFields(transformation))
    }
  }

  render () {
    const { transformation } = this.props
    const {
      capitalize,
      capitalizeExceptions,
      fieldName,
      performSubstitutions,
      substitutions
    } = this.state

    const inputIsUnchanged = isEqual(this.state, getTransformationFields(transformation))

    return (
      <div>
        <label htmlFor='fieldName'>
          Field to normalize:
          <input
            // TODO: find a component that lists fields of a table.
            // TODO: add validation.
            id='fieldName'
            onChange={this._onChangeFieldToNormalize}
            value={fieldName}
          />
        </label>

        <ul style={{ listStyleType: 'none', paddingLeft: '0px' }}>
          <li>
            <Checkbox
              checked={capitalize}
              onChange={this._onChangeCapitalizeValues}
            >
              Capitalize field value
            </Checkbox>
            <span style={{display: 'block'}}>Exceptions (comma-separated):
              <FormGroup>
                <FormControl
                  disabled={!capitalize}
                  onChange={this._onChangeCapitalizeExceptions}
                  placeholder='Enter exceptions separated by commas'
                  type='text'
                  value={capitalizeExceptions}
                />
              </FormGroup>
            </span>
          </li>
          <li>
            <Checkbox
              checked={performSubstitutions}
              onChange={this._onChangePerformSubstitutions}
            >
              Perform the following substitutions:
            </Checkbox>
            <FormGroup>
              <FormControl
                disabled={!performSubstitutions}
                onChange={this._onChangeSubstitutions}
                // TODO: Add something to explain the syntax (when finalized).
                placeholder='Enter substitutions in the form old => new, separated by commas'
                type='text'
                value={substitutions}
              />
            </FormGroup>
          </li>
        </ul>
        <div style={{marginBottom: '10px'}}>
          <Button
            bsSize='xsmall'
            disabled={inputIsUnchanged}
            onClick={this._onSaveTransformationSettings}
            style={{marginRight: '5px'}}
          >
            Save
          </Button>
        </div>
      </div>
    )
  }
}
