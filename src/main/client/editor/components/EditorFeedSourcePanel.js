import React, {Component, PropTypes} from 'react'
import { Panel, Row, Col, ButtonToolbar, Button, Glyphicon, ListGroup, ListGroupItem } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import moment from 'moment'
import {Icon} from '@conveyal/woonerf'

import ConfirmModal from '../../common/components/ConfirmModal'
import { getComponentMessages, getMessage, getConfigProperty } from '../../common/util/config'

export default class EditorFeedSourcePanel extends Component {

  static propTypes = {
    feedSource: PropTypes.object.isRequired,

    exportSnapshotAsVersion: PropTypes.func.isRequired,
    getSnapshots: PropTypes.func.isRequired,
    restoreSnapshot: PropTypes.func.isRequired,
    deleteSnapshot: PropTypes.func.isRequired,
    loadFeedVersionForEditing: PropTypes.func.isRequired
  }
  componentWillMount () {
    this.props.getSnapshots(this.props.feedSource)
  }
  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }
  render () {
    const messages = getComponentMessages('EditorFeedSourcePanel')
    const hasVersions = this.props.feedSource && this.props.feedSource.feedVersions && this.props.feedSource.feedVersions.length > 0
    const currentSnapshot = this.props.feedSource.editorSnapshots && this.props.feedSource.editorSnapshots.length
       ? this.props.feedSource.editorSnapshots.find(s => s.current)
       : null
    const inactiveSnapshots = this.props.feedSource.editorSnapshots
       ? this.props.feedSource.editorSnapshots.filter(s => !s.current)
       : []
    console.log(inactiveSnapshots)
    return (
      <Row>
        <ConfirmModal ref='confirmLoad' />
        <Col xs={9}>
          {this.props.feedSource.editorSnapshots && this.props.feedSource.editorSnapshots.length
            ? <div>
              <Panel bsStyle='success' header={<h3>Active snapshot</h3>}>
                {currentSnapshot
                  ? <ListGroup fill>
                    <SnapshotItem snapshot={currentSnapshot} {...this.props} />
                  </ListGroup>
                  : <ListGroup fill>
                    <ListGroupItem>No active snapshot</ListGroupItem>
                  </ListGroup>
                }
              </Panel>
              <Panel bsStyle='warning' header={<h3>Inactive snapshots</h3>}>
                <ListGroup fill>
                  {inactiveSnapshots.length === 0
                    ? <ListGroupItem>No other snapshots</ListGroupItem>
                    : inactiveSnapshots.map(s => {
                      return (
                        <SnapshotItem key={s.id} snapshot={s} {...this.props} />
                      )
                    })
                  }
                </ListGroup>
              </Panel>
            </div>
            : <div>
              <p>No snapshots loaded.</p>
              <Button
                bsStyle='success'
                onClick={() => browserHistory.push(`/feed/${this.props.feedSource.id}/edit/`)}
              >
                <Icon type='file' /> {getMessage(messages, 'createFromScratch')}
              </Button>
              {' '}or{' '}
              <Button bsStyle='success'
                disabled={!hasVersions}
                onClick={(evt) => {
                  let version = this.props.feedSource.feedVersions[this.props.feedSource.feedVersions.length - 1]
                  this.refs.confirmLoad.open({
                    title: getMessage(messages, 'load'),
                    body: getMessage(messages, 'confirmLoad'),
                    onConfirm: () => { this.props.loadFeedVersionForEditing(version) }
                  })
                }}
              >
                <Glyphicon glyph='pencil' /> {getMessage(messages, 'loadLatest')}
              </Button>
            </div>
          }
        </Col>
        <Col xs={3}>
          <Panel header={<h3><Icon type='camera' /> What are snapshots?</h3>}>
            <p>Snapshots are save points you can always revert back to when editing a GTFS feed.</p>
            <p>A snapshot might represent a work-in-progress, future planning scenario or even different service patterns (e.g., summer schedule markup).</p>
          </Panel>
        </Col>
      </Row>
    )
  }
}

class SnapshotItem extends Component {
  static propTypes = {
    snapshot: PropTypes.object,
    feedSource: PropTypes.object
  }
  render () {
    const {
      snapshot,
      feedSource,
      restoreSnapshot,
      downloadSnapshot,
      exportSnapshotAsVersion,
      deleteSnapshot
    } = this.props
    const dateFormat = getConfigProperty('application.date_format')
    const timeFormat = 'h:MMa'
    const messages = getComponentMessages('EditorFeedSourcePanel')
    return (
      <ListGroupItem header={snapshot.name}>
        <p>
          <ButtonToolbar className='pull-right' style={{marginTop: '-20px'}}>
            <Button
              bsStyle='primary'
              // disabled={snapshot.current}
              onClick={() => restoreSnapshot(feedSource, snapshot)}
            >
              {snapshot.current
                ? <span><Icon type='check-circle' /> {getMessage(messages, 'active')}</span>
                : <span><Glyphicon glyph='pencil' /> {getMessage(messages, 'restore')}</span>
              }
            </Button>
            <Button
              bsStyle='success'
              onClick={() => downloadSnapshot(feedSource, snapshot)}>
              <Glyphicon glyph='download' /> {getMessage(messages, 'download')}
            </Button>
            <Button
              bsStyle='info'
              onClick={() => exportSnapshotAsVersion(feedSource, snapshot)}>
              <Glyphicon glyph='export' /> {getMessage(messages, 'publish')}
            </Button>
            <Button
              bsStyle='danger'
              onClick={() => deleteSnapshot(feedSource, snapshot)}>
              <Icon type='trash' /> {getMessage(messages, 'delete')}
            </Button>
          </ButtonToolbar>
          <span title={moment(snapshot.snapshotTime).format(`${dateFormat}, ${timeFormat}`)}><Icon type='clock-o' /> created {moment(snapshot.snapshotTime).fromNow()}</span>
        </p>
      </ListGroupItem>
    )
  }
}
