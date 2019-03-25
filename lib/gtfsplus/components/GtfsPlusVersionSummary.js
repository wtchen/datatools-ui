// @flow

import React, {Component} from 'react'
import {Panel, Row, Col, Table, Button, Glyphicon, Alert} from 'react-bootstrap'
import {browserHistory} from 'react-router'
import moment from 'moment'

import {getGtfsPlusSpec} from '../../common/util/config'
import * as gtfsPlusActions from '../actions/gtfsplus'

import type {Props as ContainerProps} from '../containers/ActiveGtfsPlusVersionSummary'
import type {GtfsPlusReducerState, ManagerUserState} from '../../types/reducers'

type Props = ContainerProps & {
  downloadGtfsPlusFeed: typeof gtfsPlusActions.downloadGtfsPlusFeed,
  gtfsplus: GtfsPlusReducerState,
  publishGtfsPlusFeed: typeof gtfsPlusActions.publishGtfsPlusFeed,
  user: ManagerUserState
}

type State = {
  expanded: boolean
}

export default class GtfsPlusVersionSummary extends Component<Props, State> {
  state = { expanded: false }

  componentDidMount () {
    this.props.downloadGtfsPlusFeed(this.props.version.id)
  }

  isTableIncluded (tableId: string) {
    const {tableData} = this.props.gtfsplus
    if (!tableData) return null
    return tableId in tableData ? 'Yes' : 'No'
  }

  tableRecordCount (tableId: string): ?string {
    const {tableData} = this.props.gtfsplus
    if (!tableData) return null
    if (!(tableId in tableData)) return 'N/A'
    return tableData[tableId].length.toLocaleString()
  }

  validationIssueCount (tableId: string): ?string {
    const {validation} = this.props.gtfsplus
    if (!validation) return null
    if (!(tableId in validation)) return 'None'
    return validation[tableId].length.toLocaleString()
  }

  _getTableLevelIssues = (tableId: string) => {
    const {validation} = this.props.gtfsplus
    if (!validation) return null
    if (!(tableId in validation)) return null
    // Table level issues are identified by not having -1 for row index.
    const tableLevelIssues = validation[tableId].filter(issue => issue.rowIndex === -1)
    return tableLevelIssues.length > 0 ? tableLevelIssues : null
  }

  feedStatus () {
    const {timestamp} = this.props.gtfsplus
    if (!timestamp) return null
    if (!this.gtfsPlusEdited()) return <i>GTFS+ data for this feed version has not been edited.</i>
    return <b>GTFS+ Data updated {moment(timestamp).format('MMM. DD, YYYY, h:MMa')}</b>
  }

  gtfsPlusEdited = () => (this.props.gtfsplus.timestamp !== this.props.version.fileTimestamp)

  _onClickEdit = () => {
    const {version} = this.props
    browserHistory.push(`/gtfsplus/${version.feedSource.id}/${version.id}`)
  }

  _onClickPublish = () => {
    this.props.publishGtfsPlusFeed(this.props.version)
    this.setState({ expanded: false })
  }

  _toggleExpanded = () => {
    const {downloadGtfsPlusFeed, version} = this.props
    const {expanded} = this.state
    if (!expanded) downloadGtfsPlusFeed(version.id)
    this.setState({ expanded: !expanded })
  }

  render () {
    const {
      user,
      version
    } = this.props
    const { feedSource } = version
    const editingIsDisabled = !user.permissions ||
      !user.permissions.hasFeedPermission(
        feedSource.organizationId,
        feedSource.projectId,
        feedSource.id,
        'edit-gtfs'
      )
    const publishingIsDisabled = !user.permissions ||
      !user.permissions.hasFeedPermission(
        feedSource.organizationId,
        feedSource.projectId,
        feedSource.id,
        'approve-gtfs'
      )
    const header = (
      <h3>
        <Glyphicon glyph='check' /> GTFS+ for this Version
      </h3>
    )

    return (
      <Panel header={header}>
        <Row>
          <Col xs={6}>
            <Alert>{this.feedStatus()}</Alert>
          </Col>
          <Col xs={6} style={{ textAlign: 'right' }}>
            <Button
              disabled={editingIsDisabled}
              bsStyle='primary'
              onClick={this._onClickEdit}>
              <Glyphicon glyph='edit' /> Edit GTFS+
            </Button>
            {this.gtfsPlusEdited()
              ? <Button
                disabled={publishingIsDisabled}
                bsStyle='primary'
                style={{ marginLeft: '6px' }}
                onClick={this._onClickPublish}>
                <Glyphicon glyph='upload' /> Publish as New Version
              </Button>
              : null
            }
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Panel>
              <Table striped fill>
                <thead>
                  <tr>
                    <th>Table</th>
                    <th>Included?</th>
                    <th>Records</th>
                    <th>Validation Issues</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {getGtfsPlusSpec().map((table, index) => {
                    const issueCount = this.validationIssueCount(table.id)
                    const tableLevelIssues = this._getTableLevelIssues(table.id)
                    return (
                      <tr
                        rowSpan={tableLevelIssues ? 2 : 1}
                        key={index}
                        className={tableLevelIssues
                          ? 'danger'
                          : +issueCount > 0 && 'warning'
                        }
                        style={{ color: this.isTableIncluded(table.id) === 'Yes' ? 'black' : 'lightGray' }}>
                        <td>
                          {table.name}
                          {tableLevelIssues
                            ? <small>
                              <br />
                              {tableLevelIssues.length} critical table issue(s):
                              <ul>
                                {tableLevelIssues.map((issue, i) =>
                                  <li key={i}>{issue.description}</li>)}
                              </ul>
                            </small>
                            : null
                          }
                        </td>
                        <td>{this.isTableIncluded(table.id)}</td>
                        <td>{this.tableRecordCount(table.id)}</td>
                        <td>{issueCount}</td>
                        <td />
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </Panel>
          </Col>
        </Row>
      </Panel>
    )
  }
}
