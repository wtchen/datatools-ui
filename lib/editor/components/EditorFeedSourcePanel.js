// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Panel, Row, Col, ButtonGroup, Button, Glyphicon, ListGroup, ListGroupItem} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import moment from 'moment'

import CreateSnapshotModal from '../../editor/components/CreateSnapshotModal'
import ConfirmModal from '../../common/components/ConfirmModal'
import {getComponentMessages, getMessage, getConfigProperty} from '../../common/util/config'
import {isEditingDisabled} from '../../manager/util'

import type {Feed, Project, Snapshot} from '../../types'
import type {UserState} from '../../manager/reducers/user'

type Props = {
  createSnapshot: (Feed, string, ?string) => void,
  downloadSnapshot: (Feed, Snapshot) => void,
  feedSource: Feed,
  exportSnapshotAsVersion: (Feed, string) => void,
  getSnapshots: Feed => void,
  restoreSnapshot: (Feed, Snapshot) => void,
  deleteSnapshot: (Feed, Snapshot) => void,
  project: Project,
  user: UserState
}

export default class EditorFeedSourcePanel extends Component<Props> {
  messages = getComponentMessages('EditorFeedSourcePanel')

  componentWillMount () {
    this.props.getSnapshots(this.props.feedSource)
  }

  _onCreateSnapshot = (name: string, comment: ?string) => {
    this.props.createSnapshot(this.props.feedSource, name, comment)
  }

  _openModal = () => this.refs.snapshotModal.open()

  _sortBySnapshotTime = (a: Snapshot, b: Snapshot) => b.snapshotTime - a.snapshotTime

  render () {
    const {
      feedSource,
      project,
      user
    } = this.props
    const disabled = !user.permissions || !user.permissions.hasFeedPermission(
      project.organizationId,
      project.id,
      feedSource.id,
      'manage-feed')
    const editDisabled = isEditingDisabled(user, feedSource, project)
    const snapshots = feedSource.editorSnapshots
      ? feedSource.editorSnapshots.sort(this._sortBySnapshotTime)
      : []

    return (
      <Row>
        <CreateSnapshotModal
          ref='snapshotModal'
          onOkClicked={this._onCreateSnapshot} />
        <ConfirmModal ref='confirmModal' />
        <Col xs={9}>
          {feedSource.editorSnapshots && feedSource.editorSnapshots.length
            ? <div>
              {/* These are the available snapshots */}
              <Panel bsStyle='success' header={<h3>Available snapshots</h3>}>
                <ListGroup fill>
                  {snapshots.length === 0
                    ? <ListGroupItem>No other snapshots</ListGroupItem>
                    : snapshots.map(s => {
                      return (
                        <SnapshotItem
                          modal={this.refs.confirmModal}
                          key={s.id}
                          disabled={disabled}
                          snapshot={s}
                          {...this.props} />
                      )
                    })
                  }
                </ListGroup>
              </Panel>
            </div>
            : <div>
              {getMessage(this.messages, 'noSnapshotsExist')}
            </div>
          }
        </Col>
        <Col xs={3}>
          <LinkContainer to={`/feed/${feedSource.id}/edit`}>
            <Button
              disabled={editDisabled}
              block>
              <Icon type='pencil' /> Edit feed
            </Button>
          </LinkContainer>
          <Button
            block
            bsStyle='primary'
            disabled={editDisabled}
            style={{marginBottom: '20px'}}
            onClick={this._openModal}>
            <Icon type='camera' /> Take snapshot of latest changes
          </Button>
          <Panel
            header={
              <h3>
                <Icon type='camera' /> {getMessage(this.messages, 'help.title')}
              </h3>
            }>
            <p>{getMessage(this.messages, 'help.body.0')}</p>
            <p>{getMessage(this.messages, 'help.body.1')}</p>
          </Panel>
        </Col>
      </Row>
    )
  }
}

type ItemProps = {
  createSnapshot: (Feed, string, ?string) => void,
  disabled: boolean,
  downloadSnapshot: (Feed, Snapshot) => void,
  feedSource: Feed,
  exportSnapshotAsVersion: (Feed, string) => void,
  getSnapshots: Feed => void,
  restoreSnapshot: (Feed, Snapshot) => void,
  deleteSnapshot: (Feed, Snapshot) => void,
  modal: any,
  snapshot: Snapshot
}

class SnapshotItem extends Component<ItemProps> {
  messages = getComponentMessages('EditorFeedSourcePanel')

  _onClickDownload = () => {
    const {downloadSnapshot, feedSource, snapshot} = this.props
    downloadSnapshot(feedSource, snapshot)
  }

  _onClickExport = () => {
    const {exportSnapshotAsVersion, feedSource, snapshot} = this.props
    exportSnapshotAsVersion(feedSource, snapshot.id)
  }

  _onDeleteSnapshot = () => {
    const {deleteSnapshot, feedSource, snapshot} = this.props
    this.props.modal.open({
      title: `${getMessage(this.messages, 'delete')}`,
      body: getMessage(this.messages, 'confirmDelete'),
      onConfirm: () => deleteSnapshot(feedSource, snapshot)
    })
  }

  _onRestoreSnapshot = () => {
    const {restoreSnapshot, feedSource, snapshot} = this.props
    this.props.modal.open({
      title: `${getMessage(this.messages, 'restore')}`,
      body: getMessage(this.messages, 'confirmLoad'),
      onConfirm: () => restoreSnapshot(feedSource, snapshot)
    })
  }

  render () {
    const {disabled, snapshot} = this.props
    const dateFormat = getConfigProperty('application.date_format') || ''
    const timeFormat = 'h:MMa'
    const formattedTime = moment(snapshot.snapshotTime)
      .format(`${dateFormat}, ${timeFormat}`)
    return (
      <ListGroupItem>
        <h4
          style={{
            width: '48%',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
          title={snapshot.name}
          className='list-group-item-heading'>
          {snapshot.name}
        </h4>
        <div>
          <ButtonGroup className='pull-right' style={{marginTop: '-20px'}}>
            {/* Restore in Editor button */}
            <Button
              bsSize='small'
              disabled={disabled}
              onClick={this._onRestoreSnapshot}>
              <Glyphicon glyph='pencil' />{' '}
              {getMessage(this.messages, 'restore')}
            </Button>

            {/* Download button */}
            <Button
              bsSize='small'
              onClick={this._onClickDownload}>
              <Glyphicon glyph='download' />{' '}
              {getMessage(this.messages, 'download')}
            </Button>

            {/* Publish as Version button */}
            <Button
              bsSize='small'
              data-test-id='publish-snapshot-button'
              disabled={disabled}
              onClick={this._onClickExport}
            >
              <Glyphicon glyph='export' />{' '}
              {getMessage(this.messages, 'publish')}
            </Button>

            {/* Delete button */}
            <Button
              bsSize='small'
              disabled={disabled}
              onClick={this._onDeleteSnapshot}>
              <span className='text-danger'>
                <Icon type='trash' />{' '}
                {getMessage(this.messages, 'delete')}
              </span>
            </Button>
          </ButtonGroup>
          <p
            className='list-group-item-text'
            title={formattedTime}>
            <Icon type='clock-o' />{' '}
            {getMessage(this.messages, 'created')}{' '}
            {moment(snapshot.snapshotTime).fromNow()}
          </p>
        </div>
      </ListGroupItem>
    )
  }
}
