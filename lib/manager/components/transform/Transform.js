// @flow

import { Component } from 'react'

import type {
  Feed,
  FeedTransformation as FeedTransformationType
} from '../../../types'

export type TransformProps<StateType> = {
  feedSource: Feed,
  index: number,
  onSave: (StateType, number) => void,
  onValidationErrors: (Array<string>) => void,
  transformation: FeedTransformationType
}

/**
 * Generic Transform component that holds helper methods for derived components.
 */
export default class Transform<StateType> extends Component<TransformProps<StateType>, StateType> {
  /**
   * Overridable method to obtain validation errors for the current editing state,
   * if applicable.
   * @param fields: The state to be validated. May be different from (more recent than) this.state.
   */
  getValidationErrors (fields: StateType): Array<string> {
    return []
  }

  /**
   * Make derived components perform their own error checks,
   * and notify parent components of the resulting validation errors if any.
   * @param fields: The updated state. If not set, the component state will be used.
   */
  _updateErrors = (fields?: StateType) => {
    const { onValidationErrors } = this.props
    if (typeof onValidationErrors === 'function') {
      onValidationErrors(this.getValidationErrors(fields || this.state))
    }
  }

  /**
   * Update the component editing state
   * and perform and notify of validation checks.
   */
  updateState = (partialState: any) => {
    const newState = {
      ...this.state,
      ...partialState
    }
    this.setState(newState)
    this._updateErrors(newState)
  }

  componentDidMount () {
    this._updateErrors()
  }

  render () {
    throw new Error('render() called on abstract class Transform')
  }
}
