import React, {Component, PropTypes} from 'react'
import { Panel, Row, Col, Table, Input, Button, Glyphicon, Well, Alert } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'
import moment from 'moment'

import { getConfigProperty } from '../../common/util/config'

export default class GtfsPlusVersionSummary extends Component {

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  isTableIncluded (tableId) {
    if(!this.props.gtfsplus.tableData) return null
    return tableId in this.props.gtfsplus.tableData ? 'Yes' : 'No'
  }

  tableRecordCount (tableId) {
    if(!this.props.gtfsplus.tableData) return null
    if(!(tableId in this.props.gtfsplus.tableData)) return 'N/A'
    return this.props.gtfsplus.tableData[tableId].length.toLocaleString()
  }

  validationIssueCount (tableId) {
    if(!this.props.gtfsplus.validation) return null
    if(!(tableId in this.props.gtfsplus.validation)) return 'None'
    return this.props.gtfsplus.validation[tableId].length.toLocaleString()
  }

  feedStatus () {
    if(!this.props.gtfsplus.timestamp) return null
    if(!this.gtfsPlusEdited()) return <i>GTFS+ data for this feed version has not been edited.</i>
    return <b>GTFS+ Data updated {moment(this.props.gtfsplus.timestamp).format('MMM. DD, YYYY, h:MMa')}</b>
  }

  gtfsPlusEdited () {
    return (this.props.gtfsplus.timestamp !== this.props.version.fileTimestamp)
  }

  render () {
    const editingIsDisabled = !this.props.user.permissions.hasFeedPermission(this.props.version.feedSource.projectId, this.props.version.feedSource.id, 'edit-gtfs')
    const publishingIsDisabled = !this.props.user.permissions.hasFeedPermission(this.props.version.feedSource.projectId, this.props.version.feedSource.id, 'approve-gtfs')
    const header = (
      <h3 onClick={() => {
        if(!this.state.expanded) this.props.gtfsPlusDataRequested(this.props.version)
        this.setState({ expanded: !this.state.expanded })
      }}>
        <Glyphicon glyph='check' /> GTFS+ for this Version
      </h3>
    )

    return (
      <Panel
        header={header}
        collapsible
        expanded={this.state.expanded}
      >
        <Row>
          <Col xs={6}>
            <Alert>{this.feedStatus()}</Alert>
          </Col>
          <Col xs={6} style={{ textAlign: 'right' }}>
            <Button
              bsSize='large'
              disabled={editingIsDisabled}
              bsStyle='primary'
              onClick={() => { browserHistory.push(`/gtfsplus/${this.props.version.feedSource.id}/${this.props.version.id}`) }}
            >
              <Glyphicon glyph='edit' /> Edit GTFS+
            </Button>
            {this.gtfsPlusEdited()
              ? <Button
                  bsSize='large'
                  disabled={publishingIsDisabled}
                  bsStyle='primary'
                  style={{ marginLeft: '6px' }}
                  onClick={() => {
                    this.props.publishClicked(this.props.version)
                    this.setState({ expanded: false })
                  }}
                >
                  <Glyphicon glyph='upload' /> Publish as New Version
                </Button>
              : null
            }
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Table striped>
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Included?</th>
                  <th>Records</th>
                  <th>Validation Issues</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {getConfigProperty('modules.gtfsplus.spec').map(table => {
                  return (<tr style={{ color: this.isTableIncluded(table.id) === 'Yes' ? 'black' : 'lightGray' }}>
                    <td>{table.name}</td>
                    <td>{this.isTableIncluded(table.id)}</td>
                    <td>{this.tableRecordCount(table.id)}</td>
                    <td>{this.validationIssueCount(table.id)}</td>
                    <td></td>
                  </tr>)
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Panel>
    )
  }
}
