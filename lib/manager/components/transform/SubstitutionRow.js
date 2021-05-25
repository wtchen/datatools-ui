// @flow

import Icon from '@conveyal/woonerf/components/icon'
import { isEqual } from 'lodash'
import React, { Component } from 'react'
import { Button, ButtonGroup, FormControl, InputGroup } from 'react-bootstrap'

import type {
  Substitution
} from '../../../types'

type Props = {
  activeEditingIndex: number,
  index: number,
  onBeginEdit: number => void,
  onChange: (Substitution, number) => void,
  onEndEdit: number => void,
  onRemove: number => void,
  substitution: Substitution
}

// (Encoded) test string to be included to URL to regex test tool (regexr).
const STRING_FOR_REGEXR_TEST = encodeURIComponent('Route 10 to Bay 1 @ Train Station (10th+West)')

// Misc styles.
const buttonGroupStyle = { width: '60px' }
const inputGroupStyle = { padding: 0 }
const cellStyle = { borderTop: 'none' }
const editingInputStyle = {
  height: 'unset',
  padding: '2px'
}
const defaultInputStyle = {
  ...editingInputStyle,
  background: 'none',
  border: 'none',
  boxShadow: 'none'
}

/**
 * Extract just the subset of fields to build the state variable.
 */
function extractStateFields (props: Props): Substitution {
  const { description, normalizeSpace, pattern, replacement } = props.substitution
  return {
    description: description || '',
    normalizeSpace,
    pattern,
    replacement
  }
}

/**
 * Renders and lets user edit a substitution.
 */
export default class SubstitutionRow extends Component<Props, Substitution> {
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

  _onChangePattern = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ pattern: evt.target.value })
  }

  _onChangeReplacement = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ replacement: evt.target.value })
  }

  _onEditNormalizeSpace = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const { activeEditingIndex, index } = this.props
    const isEditing = index === activeEditingIndex
    if (isEditing) {
      this.setState({ normalizeSpace: evt.target.checked })
    }
  }

  _onChangeDescription = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ description: evt.target.value })
  }

  _onClickEdit = () => {
    this.props.onBeginEdit(this.props.index)
  }

  _onClickDiscard = () => {
    this.setState(extractStateFields(this.props))
    this.props.onEndEdit(this.props.index)
  }

  _onClickSave = () => {
    const { index, onChange, substitution } = this.props

    // Trigger the onChange event if the substitution fields were changed.
    if (!isEqual(this.state, substitution)) {
      onChange(this.state, index)
    }
    this._onClickDiscard()
  }

  _onRemove = () => this.props.onRemove(this.props.index)

  render () {
    const { activeEditingIndex, index } = this.props
    const { description, normalizeSpace, pattern, replacement } = this.state
    const isEditing = index === activeEditingIndex
    const inputStyle = isEditing ? editingInputStyle : defaultInputStyle
    const regexTestLink = `https://regexr.com/?expression=${encodeURIComponent(pattern)}&text=${STRING_FOR_REGEXR_TEST}`

    return (
      <tr>
        <td style={cellStyle}>
          <InputGroup style={inputGroupStyle}>
            <FormControl
              onChange={this._onChangePattern}
              placeholder='Text (regex) to find'
              readOnly={!isEditing}
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
              onChange={this._onChangeReplacement}
              placeholder='<blank>'
              readOnly={!isEditing}
              style={inputStyle}
              value={replacement}
            />
            <InputGroup.Addon style={{ ...inputStyle, padding: '0 6px' }}>
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
            onChange={this._onChangeDescription}
            placeholder='Optional description'
            readOnly={!isEditing}
            style={inputStyle}
            value={description}
          />
        </td>
        <td style={cellStyle}>
          {isEditing
            ? (
              // Show save/discard changes buttons if this row is being edited.
              <ButtonGroup style={buttonGroupStyle}>
                <Button
                  bsSize='xsmall'
                  onClick={this._onClickSave}
                  title='Save changes in this row'
                >
                  <Icon type='check' />
                </Button>
                <Button
                  bsSize='xsmall'
                  onClick={this._onClickDiscard}
                  title='Discard changes in this row'
                >
                  <Icon type='remove' />
                </Button>
              </ButtonGroup>
            )
            : activeEditingIndex === -1 && (
              // Show edit/delete if no other row is being edited.
              <ButtonGroup style={buttonGroupStyle}>
                <Button
                  bsSize='xsmall'
                  onClick={this._onClickEdit}
                  title='Edit this substitution'
                >
                  <Icon type='pencil' />
                </Button>
                <Button
                  bsSize='xsmall'
                  onClick={this._onRemove}
                  title='Remove this substitution'
                >
                  <Icon type='trash' />
                </Button>
              </ButtonGroup>
            )
          }
        </td>
      </tr>
    )
  }
}
