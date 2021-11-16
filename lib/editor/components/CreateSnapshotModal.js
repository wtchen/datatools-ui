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
import {getComponentMessages} from '../../common/util/config'
import { getRouteStatusText } from '../util/index.js'
import {formatTimestamp} from '../../common/util/date-time'
import type {Feed, GtfsRoute} from '../../types'
import type {AppState} from '../../types/reducers'

type Props = {
  createSnapshot: typeof snapshotActions.createSnapshot,
  feedSource: Feed,
  routes: Array<GtfsRoute>
}

type State = {
  comment: ?string,
  confirmPublishWithUnapproved: Boolean,
  name: ?string,
  publishNewVersion: boolean,
  showModal: boolean
}

function getDefaultState () {
  return {
    comment: null,
    name: formatTimestamp(),
    publishNewVersion: false,
    confirmPublishWithUnapproved: false,
    showModal: false
  }
}

class CreateSnapshotModal extends Component<Props, State> {
  state = getDefaultState()

  messages = getComponentMessages('CreateSnapshotModal')

  _onTogglePublish = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({[e.target.name]: e.target.checked})
  }

  _onTogglePublishUnapproved = (e: SyntheticInputEvent<HTMLInputElement>) => {
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
    if (!name) return window.alert(this.messages('missingNameAlert'))
    createSnapshot(feedSource, name, comment, publishNewVersion)
    this.close()
  }

  render () {
    const {Body, Footer, Header, Title} = Modal
    const {comment, name, publishNewVersion, confirmPublishWithUnapproved, showModal} = this.state
    const {routes} = this.props

    const unapprovedRoutes = routes.filter(route => route.hasOwnProperty('status') && route.status !== 2)

    return (
      <Modal show={showModal} onHide={this.close}>
        <Header>
          <Title>{this.messages('title')}</Title>
        </Header>

        <Body>
          <p>
            {this.messages('description')}
          </p>
          <FormGroup>
            <ControlLabel>{this.messages('fields.name.label')}</ControlLabel>
            <FormControl
              data-test-id='snapshot-dialog-name'
              value={name || ''}
              name={'name'}
              onChange={this._onChange}
              placeholder={this.messages('fields.name.placeholder')}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{this.messages('fields.comment.label')}</ControlLabel>
            <FormControl
              componentClass='textarea'
              name={'comment'}
              onChange={this._onChange}
              value={comment || ''}
              placeholder={this.messages('fields.comment.placeholder')}
            />
          </FormGroup>
          <FormGroup>
            <Checkbox
              name='publishNewVersion'
              checked={publishNewVersion}
              onChange={this._onTogglePublish}>
              {this.messages('fields.publishNewVersion.label')}
            </Checkbox>
          </FormGroup>
          {!!unapprovedRoutes.length > 0 &&
            <div>
              <h4>The following routes are not approved.</h4>
              <h5>These routes will not be included in the output.</h5>
              <ul>
                {
                  unapprovedRoutes.map(route => (
                    <li key={route.route_id}>{route.route_short_name} - {route.route_desc}: {getRouteStatusText(route.status)}</li>
                  ))
                }
              </ul>
              <FormGroup>
                <Checkbox
                  name='confirmPublishWithUnapproved'
                  checked={confirmPublishWithUnapproved}
                  onChange={this._onTogglePublishUnapproved}>
                    Are you sure you want to publish with unapproved routes?
                </Checkbox>
              </FormGroup>
            </div>
          }
        </Body>

        <Footer>
          <Button
            bsStyle='primary'
            data-test-id='confirm-snapshot-create-button'
            onClick={this.ok}
            disabled={unapprovedRoutes.length > 0 && !confirmPublishWithUnapproved}
          >
            {this.messages('ok')}
          </Button>
          <Button
            onClick={this.close}>
            {this.messages('cancel')}
          </Button>
        </Footer>
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
