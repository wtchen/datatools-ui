// @flow

import Icon from '@conveyal/woonerf/components/icon'
import { isEqual } from 'lodash'
import React, { Component } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap'

import type {
  Substitution
} from '../../../types'

type Props = {
  index: number,
  onChange: (Substitution, number) => void,
  onRemove: number => void,
  substitution: Substitution
}

// Hold/update the state for input[type=text] elements when onChange occurs,
// and notify containers when onBlur occurs to reduce unnecessary
// network calls to update the substitution object.
type State = {
  description: string,
  pattern: string,
  replacement: string
}

// (Encoded) test string to be included to URL to regex test tool (regexr).
const STRING_FOR_REGEXR_TEST = encodeURIComponent('Route 10 to Bay 1 @ Train Station (10th+West)')

/**
 * Extract just the subset of fields to build the state variable.
 */
function extractStateFields (props: Props): State {
  const { description, pattern, replacement } = props.substitution
  return {
    description: description || '',
    pattern,
    replacement
  }
}

/**
 * Renders and lets user edit a substitution.
 */
export default class SubstitutionRow extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = extractStateFields(props)
  }

  componentDidUpdate (prevProps: Props) {
    if (
      prevProps.index !== this.props.index ||
      !isEqual(prevProps.substitution, this.props.substitution)
    ) {
      this.setState(extractStateFields(this.props))
    }
  }

  _onBlurPattern = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateSubtitution('pattern', evt.target.value)
  }

  _onChangePattern = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ pattern: evt.target.value })
  }

  _onBlurReplacement = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateSubtitution('replacement', evt.target.value)
  }

  _onChangeReplacement = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ replacement: evt.target.value })
  }

  _onEditNormalizeSpace = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateSubtitution('normalizeSpace', evt.target.checked)
  }

  _onBlurDescription = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this._updateSubtitution('description', evt.target.value)
  }

  _onChangeDescription = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ description: evt.target.value })
  }

  _onRemove = () => this.props.onRemove(this.props.index)

  _updateSubtitution (field: string, value: string | boolean) {
    const { index, onChange, substitution } = this.props

    // Trigger the onChange event
    // only if the value in the given substitution field was changed.
    if (value !== substitution[field]) {
      const newSubstitution = {
        ...substitution,
        [field]: value
      }
      onChange(newSubstitution, index)
    }
  }

  render () {
    const { substitution } = this.props
    const { normalizeSpace } = substitution
    const { description, pattern, replacement } = this.state
    const inputStyle = { height: 'unset', padding: '2px' }
    const inputGroupStyle = { padding: 0 }
    const cellStyle = { borderTop: 'none' }
    const regexTestLink = `https://regexr.com/?expression=${encodeURIComponent(pattern)}&text=${STRING_FOR_REGEXR_TEST}`

    return (
      <tr>
        <td style={cellStyle}>
          <InputGroup style={inputGroupStyle}>
            <FormControl
              onBlur={this._onBlurPattern}
              onChange={this._onChangePattern}
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
        <td colSpan='2' style={cellStyle}>
          <InputGroup style={inputGroupStyle}>
            <FormControl
              onBlur={this._onBlurReplacement}
              onChange={this._onChangeReplacement}
              placeholder='<blank>'
              style={inputStyle}
              value={replacement}
            />
            <InputGroup.Addon style={{ padding: '0 6px' }}>
              <input
                aria-label='Normalize space'
                checked={normalizeSpace}
                onChange={this._onEditNormalizeSpace}
                style={{ padding: '0 6px' }}
                type='checkbox'
              />
            </InputGroup.Addon>
          </InputGroup>
        </td>
        <td style={cellStyle}>
          <FormControl
            onBlur={this._onBlurDescription}
            onChange={this._onChangeDescription}
            placeholder='Optional description'
            style={inputStyle}
            value={description}
          />
        </td>
        <td style={cellStyle}>
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
