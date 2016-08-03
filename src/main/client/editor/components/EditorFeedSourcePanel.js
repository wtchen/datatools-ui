import React, {Component, PropTypes} from 'react'
import { Panel, Row, Col, Table, ButtonToolbar, Button, Glyphicon } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import moment from 'moment'

export default class EditorFeedSourcePanel extends Component {

  static propTypes = {
    feedSource: PropTypes.object.isRequired,

    exportSnapshotAsVersion: PropTypes.func.isRequired,
    getSnapshots: PropTypes.func.isRequired,
    restoreSnapshot: PropTypes.func.isRequired,
    deleteSnapshot: PropTypes.func.isRequired
  }

  componentWillMount () {
    this.props.getSnapshots(this.props.feedSource)
  }

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  render () {
    return (
      <Row>
        <Col xs={12}>
          {this.props.feedSource.editorSnapshots && this.props.feedSource.editorSnapshots.length
            ? <Table striped>
                <thead>
                  <tr>
                    <th className='col-md-3'>Name</th>
                    <th className='col-md-2'>Date</th>
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
                              <Glyphicon glyph='pencil' /> Restore
                            </Button>
                            <Button bsStyle='success'>
                              <Glyphicon glyph='download' /> Download
                            </Button>
                            <Button bsStyle='info'
                              onClick={() => this.props.exportSnapshotAsVersion(this.props.feedSource, snapshot)}
                            >
                              <Glyphicon glyph='export' /> Version
                            </Button>
                            <Button bsStyle='danger'
                              onClick={() => this.props.deleteSnapshot(this.props.feedSource, snapshot)}
                            >
                              <Glyphicon glyph='remove' /> Delete
                            </Button>
                          </ButtonToolbar>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            : <span>No snapshots loaded. <Button bsStyle='success' onClick={() => browserHistory.push(`/feed/${this.props.feedSource.id}/edit/`)}>Create GTFS from scratch</Button></span>
          }
        </Col>
      </Row>
    )
  }
}
