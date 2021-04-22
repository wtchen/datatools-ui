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
   */
  getValidationErrors (): Array<string> {
    return []
  }

  /**
   * Make derived components perform their own error checks,
   * and notify parent components of the resulting validation errors if any.
   */
  _updateErrors = () => {
    const { onValidationErrors } = this.props
    if (typeof onValidationErrors === 'function') {
      onValidationErrors(this.getValidationErrors())
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
    this._updateErrors()
  }

  componentDidMount () {
    this._updateErrors()
  }

  render () {
    throw new Error('render() called on abstract class Transform')
  }
}
