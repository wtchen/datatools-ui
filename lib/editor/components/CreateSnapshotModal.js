// @flow

import React, {Component} from 'react'
import {
  Button,
  Checkbox,
  ControlLabel,
  FormGroup,
  FormControl,
  Modal
} from 'react-bootstrap'
import {connect} from 'react-redux'

import * as snapshotActions from '../actions/snapshots.js'
import { formatTimestamp } from '../../common/util/date-time'

import type {Feed} from '../../types'
import type {AppState, ManagerUserState} from '../../types/reducers'

type Props = {
  createSnapshot: typeof snapshotActions.createSnapshot,
  feedSource: Feed
}

type State = {
  comment: ?string,
  name: ?string,
  publishNewVersion: boolean,
  showModal: boolean
}

function getDefaultState () {
  return {
    comment: null,
    name: formatTimestamp(),
    publishNewVersion: false,
    showModal: false
  }
}

class CreateSnapshotModal extends Component<Props, State> {
  state = getDefaultState()

  _onTogglePublish = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({[e.target.name]: e.target.checked})
  }

  _onChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({[e.target.name]: e.target.value})
  }

  close = () => {
    this.setState(getDefaultState())
  }

  open () {
    this.setState({
      showModal: true
    })
  }

  ok = () => {
    const {createSnapshot, feedSource} = this.props
    const {comment, name, publishNewVersion} = this.state
    if (!name) return window.alert('Must give snapshot a valid name!')
    createSnapshot(feedSource, name, comment, publishNewVersion)
    this.close()
  }

  render () {
    const {comment, name, publishNewVersion, showModal} = this.state
    return (
      <Modal show={showModal} onHide={this.close}>
        <Modal.Header>
          <Modal.Title>Create Snapshot</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              data-test-id='snapshot-dialog-name'
              value={name || ''}
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
              value={comment || ''}
              placeholder='Additional information (optional)'
            />
          </FormGroup>
          <FormGroup>
            <Checkbox
              name='publishNewVersion'
              checked={publishNewVersion}
              onChange={this._onTogglePublish}>
              Publish snapshot as new feed version?
            </Checkbox>
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

const mapDispatchToProps = {
  createSnapshot: snapshotActions.createSnapshot
}

const mapStateToProps = (state: AppState, ownProps: {}) => ({})

// $FlowFixMe - ignore connect missing additional args
export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  // Note: this will need to change to forwardRef once react-redux is updated to
  // v6+ https://medium.com/octopus-labs-london/how-to-access-a-redux-components-methods-with-createref-ca28a96efd59
  { withRef: true }
)(CreateSnapshotModal)
