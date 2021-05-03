// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap'

import type {
  Substitution
} from '../../../types'

type SubstitutionRowProps = {
  index: number,
  onChange: (Substitution, number) => void,
  onRemove: number => void,
  substitution: Substitution
}

// (Encoded) test string to be included to URL to regex test tool (regexr).
const STRING_FOR_REGEXR_TEST = encodeURIComponent('Route 10 to Bay 1 @ Train Station (10th+West)')

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
    const inputGroupStyle = { padding: 0 }
    const regexTestLink = `https://regexr.com/?expression=${encodeURIComponent(pattern)}&text=${STRING_FOR_REGEXR_TEST}`

    return (
      <tr>
        <td>
          <InputGroup style={inputGroupStyle}>
            <FormControl
              onChange={this._onEditPattern}
              placeholder='Text (regex) to find'
              style={inputStyle}
              value={pattern}
            />
            <InputGroup.Addon style={inputStyle}>
              <a
                href={regexTestLink}
                target='_blank'
                title='Test this regex'
              >
                <Icon type='flask' />
              </a>
            </InputGroup.Addon>
          </InputGroup>
        </td>
        <td colSpan='2'>
          <InputGroup style={inputGroupStyle}>
            <FormControl
              onChange={this._onEditReplacement}
              placeholder='<blank>'
              style={inputStyle}
              value={replacement}
            />
            <InputGroup.Addon style={{ padding: '0 6px' }}>
              <input
                ariaLabel='Normalize space'
                checked={normalizeSpace}
                onChange={this._onEditNormalizeSpace}
                style={{ padding: '0 6px' }}
                type='checkbox'
              />
            </InputGroup.Addon>
          </InputGroup>
        </td>
        <td>
          <FormControl
            onChange={this._onEditDescription}
            placeholder='Optional description'
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
