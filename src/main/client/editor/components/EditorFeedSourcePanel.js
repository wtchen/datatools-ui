import React, {Component, PropTypes} from 'react'
import { Panel, Row, Col, Table, ButtonToolbar, Button, Glyphicon } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import moment from 'moment'
import Icon from 'react-fa'

import ConfirmModal from '../../common/components/ConfirmModal'
import { getComponentMessages } from '../../common/util/config'

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

    return (
      <Row>
        <ConfirmModal ref='confirmLoad' />
        <Col xs={12}>
          {this.props.feedSource.editorSnapshots && this.props.feedSource.editorSnapshots.length
            ? <Table striped>
                <thead>
                  <tr>
                    <th className='col-md-3'>{messages.name}</th>
                    <th className='col-md-2'>{messages.date}</th>
                    <th className='col-md-7'></th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.feedSource.editorSnapshots.map(snapshot => {
                    return (
                      <tr key={snapshot.id}>
                        <td>{snapshot.name}</td>
                        <td>{moment(snapshot.date).format()}</td>
                        <td>
                          <ButtonToolbar className='pull-right'>
                            <Button bsStyle='primary'
                              onClick={() => this.props.restoreSnapshot(this.props.feedSource, snapshot)}
                            >
                              <Glyphicon glyph='pencil' /> {messages.restore}
                            </Button>
                            {
                            // <Button bsStyle='success'>
                            //   <Glyphicon glyph='download' /> {messages.download}
                            // </Button>
                            }
                            <Button bsStyle='info'
                              onClick={() => this.props.exportSnapshotAsVersion(this.props.feedSource, snapshot)}
                            >
                              <Glyphicon glyph='export' /> {messages.version}
                            </Button>
                            <Button bsStyle='danger'
                              onClick={() => this.props.deleteSnapshot(this.props.feedSource, snapshot)}
                            >
                              <Glyphicon glyph='remove' /> {messages.delete}
                            </Button>
                          </ButtonToolbar>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            : <div>
                <p>No snapshots loaded.</p>
                <Button
                  bsStyle='success'
                  onClick={() => browserHistory.push(`/feed/${this.props.feedSource.id}/edit/`)}
                >
                  <Icon name='file'/> {messages.createFromScratch}
                </Button>
                {' '}or{' '}
                <Button bsStyle='success'
                    disabled={!hasVersions}
                    onClick={(evt) => {
                      let version = this.props.feedSource.feedVersions[this.props.feedSource.feedVersions.length - 1]
                      this.refs.confirmLoad.open({
                        title: messages.load,
                        body: messages.confirmLoad,
                        onConfirm: () => { this.props.loadFeedVersionForEditing(version) }
                      })
                    }}
                  >
                    <Glyphicon glyph='pencil' /> {messages.loadLatest}
                  </Button>
              </div>
          }
        </Col>
      </Row>
    )
  }
}
