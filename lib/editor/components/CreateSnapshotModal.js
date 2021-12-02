// @flow

import Icon from '@conveyal/woonerf/components/icon'
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

import * as snapshotActions from '../actions/snapshots'
import {getComponentMessages} from '../../common/util/config'
import { getRouteStatusText, routeStatusTextToValue } from '../util'
import {formatTimestamp} from '../../common/util/date-time'
import type {Feed, GtfsRoute} from '../../types'
import type {AppState, LockState} from '../../types/reducers'
import * as activeActions from '../actions/active'
import {getEntityName} from '../util/gtfs'
type Props = {
  createSnapshot: typeof snapshotActions.createSnapshot,
  feedSource: Feed,
  fetchRouteEntities: typeof activeActions.fetchRouteEntities,
  lock: LockState,
  routes: Array<GtfsRoute>
};

type State = {
  comment: ?string,
  confirmPublishWithUnapproved: boolean,
  loading: boolean,
  name: ?string,
  publishNewVersion: boolean,
  showModal: boolean,
}

function getDefaultState () {
  return {
    comment: null,
    name: formatTimestamp(),
    publishNewVersion: false,
    confirmPublishWithUnapproved: false,
    showModal: false,
    loading: false
  }
}

class CreateSnapshotModal extends Component<Props, State> {
  state = getDefaultState()

  messages = getComponentMessages('CreateSnapshotModal')
  onClose = null

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
    if (this.onClose) { this.onClose() }
    this.setState(getDefaultState())
  }

  componentDidUpdate (prevProps) {
    const {routes} = this.props
    if (routes !== prevProps.routes) {
      this.setState({
        loading: false
      })
    }
  }

  open (onClose) {
    this.onClose = onClose

    const {fetchRouteEntities, feedSource} = this.props
    this.setState({loading: true})
    fetchRouteEntities(feedSource)

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
    const {comment, name, publishNewVersion, confirmPublishWithUnapproved, showModal, loading} = this.state
    const {routes} = this.props
    const unapprovedRoutes = routes.filter(route => route.hasOwnProperty('status') && route.status !== routeStatusTextToValue('Approved'))

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
          {loading && <Icon type='spinner' className='fa-pulse' />}
          {unapprovedRoutes.length > 0 &&
            <div>
              <h4>{this.messages('unapprovedRoutesHeader')}</h4>
              <h5>{this.messages('unapprovedRoutesDesc')}</h5>
              <ul>
                {
                  unapprovedRoutes.map(route => (
                    <li key={route.route_id}>{getEntityName(route)}: {getRouteStatusText(parseInt(route.status))}</li>
                  ))
                }
              </ul>
              <FormGroup>
                <Checkbox
                  name='confirmPublishWithUnapproved'
                  checked={confirmPublishWithUnapproved}
                  onChange={this._onTogglePublishUnapproved}>
                  {this.messages('fields.confirmPublishWithUnapproved.label')}
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
  createSnapshot: snapshotActions.createSnapshot,
  fetchRouteEntities: activeActions.fetchRouteEntities
}

const mapStateToProps = (state: AppState, ownProps: {}) => ({
  lock: state.editor.data.lock,
  routes: state.editor.data.tables.routes
})

// $FlowFixMe - ignore connect missing additional args
export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  // Note: this will need to change to forwardRef once react-redux is updated to
  // v6+ https://medium.com/octopus-labs-london/how-to-access-a-redux-components-methods-with-createref-ca28a96efd59
  { withRef: true }
)(CreateSnapshotModal)
