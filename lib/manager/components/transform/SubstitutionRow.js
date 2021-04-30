// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import { Button, Checkbox, FormControl } from 'react-bootstrap'

import type {
  Substitution
} from '../../../types'

type SubstitutionRowProps = {
  index: number,
  onChange: (Substitution, number) => void,
  onRemove: number => void,
  substitution: Substitution
}

/**
 * Renders and lets user edit a substitution.
 */
export default class SubstitutionRow extends Component<SubstitutionRowProps> {
  _onEditPattern = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateSubtitution({ pattern: evt.target.value })
  }

  _onEditReplacement = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateSubtitution({ replacement: evt.target.value })
  }

  _onEditNormalizeSpace = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateSubtitution({ normalizeSpace: evt.target.checked })
  }

  _onEditDescription = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateSubtitution({ description: evt.target.value })
  }

  _onRemove = () => this.props.onRemove(this.props.index)

  _updateSubtitution (partialState: any) {
    const { index, onChange, substitution } = this.props
    const newSubstitution = {
      ...substitution,
      ...partialState
    }
    onChange(newSubstitution, index)
  }

  render () {
    const { substitution } = this.props
    const { description, normalizeSpace, pattern, replacement } = substitution
    const inputStyle = { height: 'unset', padding: '2px' }
    return (
      <tr>
        <td>
          <FormControl
            onChange={this._onEditPattern}
            placeholder='Enter text to find'
            style={inputStyle}
            value={pattern}
          />
        </td>
        <td>
          <FormControl
            onChange={this._onEditReplacement}
            placeholder='Enter replacement text'
            style={inputStyle}
            value={replacement}
          />
        </td>
        <td>
          <Checkbox
            checked={normalizeSpace}
            onChange={this._onEditNormalizeSpace}
            style={{margin: '2px 0'}}
          />
        </td>
        <td>
          <FormControl
            onChange={this._onEditDescription}
            placeholder='Enter optional description'
            style={inputStyle}
            value={description || ''}
          />
        </td>
        <td>
          <Button
            bsSize='xsmall'
            onClick={this._onRemove}
            title='Remove this substitution'
          >
            <Icon type='remove' />
          </Button>
        </td>
      </tr>
    )
  }
}
