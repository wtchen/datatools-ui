// @flow

import React, {Component} from 'react'
import {
  Button,
  ButtonToolbar,
  Checkbox,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock
} from 'react-bootstrap'

import type {
  CustomFile
} from '../../../types'

type Props = {
  customFile: CustomFile,
  customFileEditIdx: null | number,
  idx: number,
  onCancelEditing: () => void,
  onDelete: (number) => void,
  onEdit: (number) => void,
  onSave: (number, CustomFile) => void
}

export default class CustomFileEditor extends Component<Props, {
  fileSource: 'raw' | 'uri',
  model: CustomFile
}> {
  constructor (props: Props) {
    super(props)
    const { customFile } = props
    this.state = {
      fileSource: customFile.contents ? 'raw' : 'uri',
      model: props.customFile
    }
  }

  _canEdit = () => this.props.customFileEditIdx === null

  _isEditing= () => this.props.idx === this.props.customFileEditIdx

  _isValid = () => {
    const {model: customFile} = this.state
    return customFile.contents || customFile.uri
  }

  _onChangeBuildUse = () => {
    const { model } = this.state
    this.setState({
      model: {
        ...model,
        useDuringBuild: !model.useDuringBuild
      }
    })
  }

  _onChangeContents = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({
      model: {
        ...this.state.model,
        contents: evt.target.value
      }
    })
  }

  _onChangeFilename = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({
      model: {
        ...this.state.model,
        filename: evt.target.value
      }
    })
  }

  _onChangeServeUse = () => {
    const { model } = this.state
    this.setState({
      model: {
        ...model,
        useDuringServe: !model.useDuringServe
      }
    })
  }

  _onChangeSource = (evt: SyntheticInputEvent<HTMLSelectElement>) => {
    const model = {...this.state.model}
    // set variable to make flow happy
    let newSource
    if (evt.target.value === 'raw') {
      model.uri = null
      newSource = 'raw'
    } else {
      model.contents = null
      newSource = 'uri'
    }
    this.setState({
      fileSource: newSource,
      model
    })
  }

  _onChangeUri = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({
      model: {
        ...this.state.model,
        uri: evt.target.value
      }
    })
  }

  _onCancelEditing = () => {
    const { customFile, onCancelEditing } = this.props
    this.setState({
      fileSource: customFile.contents ? 'raw' : 'uri',
      model: customFile
    })
    onCancelEditing()
  }

  _onDelete = () => {
    const { idx, onDelete } = this.props
    onDelete(idx)
  }

  _onEdit = () => {
    const { idx, onEdit } = this.props
    onEdit(idx)
  }

  _onSave = () => {
    const { idx, onSave } = this.props
    onSave(idx, this.state.model)
  }

  _renderToolbar = () => {
    const isEditing = this._isEditing()
    const canEdit = this._canEdit()
    const either = !isEditing && !canEdit
    return (
      <ButtonToolbar>
        <Button
          bsSize='xsmall'
          disabled={either}
          onClick={canEdit ? this._onEdit : this._onCancelEditing}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
        {isEditing &&
          <Button
            bsSize='xsmall'
            disabled={!this._isValid()}
            onClick={this._onSave}
          >
            Save
          </Button>
        }
        <Button
          bsSize='xsmall'
          bsStyle='danger'
          className='pull-right'
          disabled={either}
          onClick={this._onDelete}
        >
          Delete
        </Button>
      </ButtonToolbar>
    )
  }

  render () {
    const {
      fileSource,
      model: customFile
    } = this.state
    const isValid = this._isValid()
    const isEditing = this._isEditing()
    return (
      <div className='custom-file'>
        {this._renderToolbar()}
        <div className='margin-top-15'>
          {isEditing
            ? <FormControl
              onChange={this._onChangeFilename}
              placeholder='Enter filename'
              type='text'
              value={customFile.filename}
            />
            : <span>
              Filename:{' '}
              <span style={{fontFamily: 'monospace'}}>
                {/* FIXME: what should the behavior be here if missing */}
                {customFile.filename || '[defaults to URI]'}
              </span>
            </span>
          }
        </div>
        <Checkbox
          checked={customFile.useDuringBuild}
          disabled={!isEditing}
          onChange={this._onChangeBuildUse}
        >
          Use during graph build
        </Checkbox>
        <Checkbox
          checked={customFile.useDuringServe}
          disabled={!isEditing}
          onChange={this._onChangeServeUse}
        >
          Use while running server
        </Checkbox>
        <FormGroup validationState={isValid ? null : 'error'}>
          <ControlLabel>File source</ControlLabel>
          <FormControl
            componentClass='select'
            disabled={!isEditing}
            onChange={this._onChangeSource}
            placeholder='select type'
            style={{ marginBottom: 5 }}
            value={fileSource}
          >
            <option value='raw'>From raw input</option>
            <option value='uri'>Download from URI</option>
          </FormControl>
          {!isValid && <HelpBlock>Please set contents or uri!</HelpBlock>}
          {fileSource === 'raw' && (
            <FormControl
              componentClass='textarea'
              disabled={!isEditing}
              style={{height: '125px'}}
              placeholder='{"blah": true}'
              onChange={this._onChangeContents}
              value={customFile.contents}
            />
          )}
          {fileSource === 'uri' && (
            <span>
              <FormControl
                disabled={!isEditing}
                placeholder='https://www.examle.com/file.json'
                onChange={this._onChangeUri}
                type='text'
                value={customFile.uri}
              />
              {!customFile.uri && (
                <HelpBlock>Enter either a HTTP(S) URL or AWS S3 URI</HelpBlock>
              )}
            </span>
          )}
        </FormGroup>
      </div>
    )
  }
}
