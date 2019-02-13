// @flow

import React, {Component} from 'react'
import { Modal, Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'

type Props = {
  onOkClicked: (string, ?string) => void
}

type State = {
  comment: ?string,
  name: ?string,
  showModal: boolean
}

export default class CreateSnapshotModal extends Component<Props, State> {
  state = {
    showModal: false,
    name: null,
    comment: null
  }

  _onChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({[e.target.name]: e.target.value})
  }

  close = () => {
    this.setState({
      showModal: false
    })
  }

  open () {
    this.setState({
      showModal: true
    })
  }

  ok = () => {
    const {comment, name} = this.state
    if (!name) return window.alert('Must give snapshot a valid name!')
    this.props.onOkClicked(name, comment)
    this.close()
  }

  render () {
    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header>
          <Modal.Title>Create Snapshot</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              data-test-id='snapshot-dialog-name'
              value={this.state.name || ''}
              name={'name'}
              onChange={this._onChange}
              placeholder='Snapshot name (required)'
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Comment</ControlLabel>
            <FormControl
              componentClass='textarea'
              name={'comment'}
              onChange={this._onChange}
              value={this.state.comment || ''}
              placeholder='Additional information (optional)'
            />
          </FormGroup>
        </Modal.Body>

        <Modal.Footer>
          <Button
            bsStyle='primary'
            data-test-id='confirm-snapshot-create-button'
            onClick={this.ok}
          >
            OK
          </Button>
          <Button
            onClick={this.close}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
