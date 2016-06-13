import React, {Component, PropTypes} from 'react'
import { Panel, Row, Col, Table, ButtonToolbar, Button, Glyphicon } from 'react-bootstrap'
import moment from 'moment'

export default class EditorFeedSourcePanel extends Component {

  static propTypes = {
    feedSource: PropTypes.object.isRequired,
    getSnapshots: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  render () {
    const header = (
      <h3 onClick={() => {
        if (!this.state.expanded) this.props.getSnapshots(this.props.feedSource)
        this.setState({ expanded: !this.state.expanded })
      }}>
        <Glyphicon glyph='camera' /> GTFS Editor Snapshots
      </h3>
    )

    return (
      <Panel
        header={header}
        collapsible
        expanded={this.state.expanded}
      >
        <Row>
          <Col xs={12}>
            {this.props.feedSource.editorSnapshots
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
                        <tr>
                          <td>{snapshot.name}</td>
                          <td>{moment(snapshot.date).format()}</td>
                          <td>
                            <ButtonToolbar className='pull-right'>
                              <Button bsStyle='primary'><Glyphicon glyph='pencil' /> Open in Editor</Button>
                              <Button bsStyle='success'><Glyphicon glyph='download' /> Download GTFS</Button>
                              <Button bsStyle='info'><Glyphicon glyph='export' /> Export as Version</Button>
                              <Button bsStyle='danger'><Glyphicon glyph='remove' /> Delete</Button>
                            </ButtonToolbar>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              : <span>No snapshots loaded</span>
            }
          </Col>
        </Row>
      </Panel>
    )
  }
}
