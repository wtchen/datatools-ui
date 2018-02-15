import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import {Panel, Row, Col, ButtonGroup, Button, Glyphicon, ListGroup, ListGroupItem} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import moment from 'moment'

import CreateSnapshotModal from '../../editor/components/CreateSnapshotModal'
import ConfirmModal from '../../common/components/ConfirmModal'
import {getComponentMessages, getMessage, getConfigProperty} from '../../common/util/config'
import {isEditingDisabled} from '../../manager/util'

export default class EditorFeedSourcePanel extends Component {
  static propTypes = {
    feedSource: PropTypes.object.isRequired,

    exportSnapshotAsVersion: PropTypes.func.isRequired,
    getSnapshots: PropTypes.func.isRequired,
    restoreSnapshot: PropTypes.func.isRequired,
    deleteSnapshot: PropTypes.func.isRequired,
    loadFeedVersionForEditing: PropTypes.func.isRequired
  }

  messages = getComponentMessages('EditorFeedSourcePanel')

  state = { expanded: false }

  componentWillMount () {
    this.props.getSnapshots(this.props.feedSource)
  }

  _onCreateSnapshot = (name, comment) => {
    this.props.createSnapshot(this.props.feedSource, name, comment)
  }

  _openModal = () => this.refs.snapshotModal.open()

  _onLoadVersion = () => {
    const {feedSource, loadFeedVersionForEditing} = this.props
    const version = feedSource.feedVersions[feedSource.feedVersions.length - 1]
    const {id: feedVersionId, feedSourceId} = version
    this.refs.confirmModal.open({
      title: getMessage(this.messages, 'load'),
      body: getMessage(this.messages, 'confirmLoad'),
      onConfirm: () => loadFeedVersionForEditing({feedSourceId, feedVersionId})
    })
  }

  isSnapshotActive = snapshot => {
    return snapshot.feedLoadResult &&
      snapshot.feedLoadResult.uniqueIdentifier === this.props.feedSource.editorNamespace
  }

  render () {
    const {
      feedSource,
      project,
      user
    } = this.props
    const disabled = !user.permissions.hasFeedPermission(project.organizationId, project.id, feedSource.id, 'manage-feed')
    const editDisabled = isEditingDisabled(user, feedSource, project)
    const hasVersions = feedSource && feedSource.feedVersions && feedSource.feedVersions.length > 0
    const currentSnapshot = feedSource.editorSnapshots && feedSource.editorSnapshots.length
       ? feedSource.editorSnapshots.find(this.isSnapshotActive)
       : null
    const inactiveSnapshots = feedSource.editorSnapshots
       ? feedSource.editorSnapshots
        .filter(s => !this.isSnapshotActive(s))
        .sort((a, b) => b.snapshotTime - a.snapshotTime)
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
              {/* This is the active snapshot */}
              <Panel bsStyle='success' header={<h3>Active snapshot</h3>}>
                {currentSnapshot
                  ? <ListGroup fill>
                    <SnapshotItem
                      modal={this.refs.confirmModal}
                      isActive
                      disabled={disabled}
                      snapshot={currentSnapshot}
                      {...this.props} />
                  </ListGroup>
                  : <ListGroup fill>
                    <ListGroupItem>No active snapshot</ListGroupItem>
                  </ListGroup>
                }
              </Panel>
              {/* These are the inactive snapshots */}
              <Panel bsStyle='warning' header={<h3>Inactive snapshots</h3>}>
                <ListGroup fill>
                  {inactiveSnapshots.length === 0
                    ? <ListGroupItem>No other snapshots</ListGroupItem>
                    : inactiveSnapshots.map(s => {
                      return (
                        <SnapshotItem
                          modal={this.refs.confirmModal}
                          key={s.id}
                          isActive={false}
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
              <p>No snapshots loaded.</p>
              <LinkContainer to={`/feed/${feedSource.id}/edit`}>
                <Button
                  bsStyle='success'>
                  <Icon type='file' /> {getMessage(this.messages, 'createFromScratch')}
                </Button>
              </LinkContainer>
              {' '}or{' '}
              <Button bsStyle='success'
                disabled={!hasVersions}
                onClick={this._onLoadVersion}
              >
                <Glyphicon glyph='pencil' /> {getMessage(this.messages, 'loadLatest')}
              </Button>
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
          <Panel header={<h3><Icon type='camera' /> {getMessage(this.messages, 'help.title')}</h3>}>
            <p>{getMessage(this.messages, 'help.body.0')}</p>
            <p>{getMessage(this.messages, 'help.body.1')}</p>
          </Panel>
        </Col>
      </Row>
    )
  }
}

class SnapshotItem extends Component {
  static propTypes = {
    isActive: PropTypes.bool,
    modal: PropTypes.object.isRequired,
    snapshot: PropTypes.object.isRequired,
    feedSource: PropTypes.object.isRequired
  }

  messages = getComponentMessages('EditorFeedSourcePanel')

  _onClickDownload = () => this.props.downloadSnapshot(this.props.feedSource, this.props.snapshot)

  _onClickExport = () => this.props.exportSnapshotAsVersion(this.props.feedSource, this.props.snapshot.id)

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
    const {disabled, isActive, snapshot} = this.props
    const dateFormat = getConfigProperty('application.date_format')
    const timeFormat = 'h:MMa'
    return (
      <ListGroupItem>
        <h4
          style={{width: '48%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}
          title={snapshot.name}
          className='list-group-item-heading'>
          {snapshot.name}
        </h4>
        <div>
          <ButtonGroup className='pull-right' style={{marginTop: '-20px'}}>
            <Button
              bsSize='small'
              disabled={isActive || disabled}
              onClick={this._onRestoreSnapshot}>
              {isActive
                ? <span><Icon type='check-circle' /> {getMessage(this.messages, 'active')}</span>
                : <span><Glyphicon glyph='pencil' /> {getMessage(this.messages, 'restore')}</span>
              }
            </Button>
            <Button
              bsSize='small'
              onClick={this._onClickDownload}>
              <Glyphicon glyph='download' /> {getMessage(this.messages, 'download')}
            </Button>
            <Button
              bsSize='small'
              disabled={disabled}
              onClick={this._onClickExport}>
              <Glyphicon glyph='export' /> {getMessage(this.messages, 'publish')}
            </Button>
            <Button
              bsSize='small'
              disabled={disabled}
              onClick={this._onDeleteSnapshot}>
              <span className='text-danger'><Icon type='trash' /> {getMessage(this.messages, 'delete')}</span>
            </Button>
          </ButtonGroup>
          <p
            className='list-group-item-text'
            title={moment(snapshot.snapshotTime).format(`${dateFormat}, ${timeFormat}`)}>
            <Icon type='clock-o' /> created {moment(snapshot.snapshotTime).fromNow()}
          </p>
        </div>
      </ListGroupItem>
    )
  }
}
