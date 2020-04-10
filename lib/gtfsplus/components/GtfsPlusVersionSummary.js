// @flow

import moment from 'moment'
import React, {Component} from 'react'
import {
  Alert,
  Button,
  ButtonToolbar,
  Col,
  Glyphicon,
  Label,
  Panel,
  Row,
  Table
} from 'react-bootstrap'
import {browserHistory, Link} from 'react-router'

import * as gtfsPlusActions from '../actions/gtfsplus'
import {getGtfsPlusSpec} from '../../common/util/config'
import type {Props as ContainerProps} from '../containers/ActiveGtfsPlusVersionSummary'
import type {GtfsSpecTable} from '../../types'
import type {GtfsPlusReducerState, ManagerUserState} from '../../types/reducers'

type Issue = {
  description: string,
  fieldName: string,
  rowIndex: number,
  tableId: string
}

type Props = ContainerProps & {
  deleteGtfsPlusFeed: typeof gtfsPlusActions.deleteGtfsPlusFeed,
  downloadGtfsPlusFeed: typeof gtfsPlusActions.downloadGtfsPlusFeed,
  gtfsplus: GtfsPlusReducerState,
  issuesForTable: any,
  publishGtfsPlusFeed: typeof gtfsPlusActions.publishGtfsPlusFeed,
  user: ManagerUserState
}

type State = {
  expanded: boolean,
  tableExpanded: any
}

type IssueFilter = Issue => boolean

export default class GtfsPlusVersionSummary extends Component<Props, State> {
  state = {
    expanded: false,
    tableExpanded: {}
  }

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
    const {issuesForTable} = this.props
    if (!issuesForTable) return null
    if (!(tableId in issuesForTable)) return 'None'
    return issuesForTable[tableId].length.toLocaleString()
  }

  _getTableLevelIssues = (tableId: string): ?Array<Issue> => {
    return this._getIssues(tableId, issue => issue.rowIndex === -1)
  }

  _getIssues = (tableId: string, filter: ?IssueFilter): ?Array<Issue> => {
    const {issuesForTable} = this.props
    if (!issuesForTable) return null
    if (!(tableId in issuesForTable)) return null

    // Filter table level issues or row issues using the specified filter.
    filter = filter || (() => true)
    const issues = issuesForTable[tableId].filter(filter)
    return (issues.length > 0 ? issues : null)
  }

  feedStatus () {
    const {timestamp} = this.props.gtfsplus
    if (!timestamp) return null
    if (!this._gtfsPlusIsEdited()) return <i>GTFS+ data for this feed version has not been edited.</i>
    const timestampMoment = moment(timestamp)
    const formatted = timestampMoment.format('MMM. DD, YYYY, h:MMa')
    const fromNow = timestampMoment.fromNow()
    return <b>GTFS+ data updated <span title={formatted}>{fromNow}.</span></b>
  }

  _gtfsPlusIsEdited = () => (this.props.gtfsplus.timestamp !== this.props.version.fileTimestamp)

  _onClickEdit = () => {
    const {version} = this.props
    browserHistory.push(`/gtfsplus/${version.feedSource.id}/${version.id}`)
  }

  _onClickDelete = () => {
    if (window.confirm('Are you sure you want to delete the GTFS+ edits for this feed version? Note: this will not delete the feed version itself.')) {
      this.props.deleteGtfsPlusFeed(this.props.version.id)
    }
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

  _toggleTableExpanded = (tableName: string): void => {
    const { tableExpanded } = this.state
    const newTableExpanded = Object.assign(tableExpanded)
    newTableExpanded[tableName] = !newTableExpanded[tableName]

    this.setState({ tableExpanded: newTableExpanded })
  }

  renderIssues = (table: GtfsSpecTable) => {
    const { tableExpanded } = this.state
    const isExpanded = tableExpanded[table.name]
    const issueCount = this.validationIssueCount(table.id)
    const tableLevelIssues = this._getTableLevelIssues(table.id)
    const allIssues = this._getIssues(table.id)
    allIssues && allIssues.sort(
      (issue1, issue2) => issue1.rowIndex - issue2.rowIndex
    )

    return (
      <div>
        <small>
          <Button
            bsSize='small'
            bsStyle='link'
            onClick={() => this._toggleTableExpanded(table.name)}
          >
            <small>
              <Glyphicon
                glyph={isExpanded ? 'triangle-bottom' : 'triangle-right'}
                style={{marginRight: '0.5em'}} />
            </small>
            {issueCount} validation {issueCount !== 1 ? 'issues' : 'issue' }
            {tableLevelIssues && issueCount && ` (${tableLevelIssues.length}/${issueCount} blocking)`}
          </Button>

          {isExpanded && <Table condensed>
            <thead>
              <tr>
                <th>Line</th>
                <th>Column</th>
                <th>Issue</th>
              </tr>
            </thead>
            <tbody>
              {allIssues && allIssues.map((issue, index) =>
                <tr key={index}>
                  <td>{issue.rowIndex + 2}</td> {/* This is the line number in the file */}
                  <td>{issue.fieldName}</td>
                  <td>
                    {issue.description}
                    {' '}
                    {issue.rowIndex === -1 && <Label bsStyle='danger' htmlFor>BLOCKING</Label>}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>}
        </small>
      </div>
    )
  }

  render () {
    const {
      gtfsplus,
      user,
      version,
      versions
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

    const derivedVersions = versions.filter(v => v.originNamespace === version.namespace)
    return (
      <Panel header={header}>
        <Row>
          <Col xs={6}>
            <Alert>
              {this.feedStatus()}
              {derivedVersions.length > 0
                ? <div>
                  Versions created from this version of GTFS+:
                  <ul>
                    {derivedVersions.map(v => {
                      const url = `/feed/${v.feedSource.id}/version/${v.version}`
                      return (
                        <li key={v.id}>
                          <Link to={url}>
                            {v.name} (version {v.version})
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                : this._gtfsPlusIsEdited() && gtfsplus.validation && gtfsplus.validation.issues.length === 0
                  ? <div><strong>Note:</strong> Edits must be published as a new feed version.</div>
                  : null

              }
            </Alert>
          </Col>
          <Col xs={6} style={{ textAlign: 'right' }}>
            <ButtonToolbar className='pull-right'>
              {this._gtfsPlusIsEdited()
                ? <Button
                  onClick={this._onClickDelete}>
                  <Glyphicon glyph='remove' /> Clear edits
                </Button>
                : null
              }
              <Button
                disabled={editingIsDisabled}
                bsStyle='primary'
                onClick={this._onClickEdit}>
                <Glyphicon glyph='edit' /> Edit GTFS+
              </Button>
              {this._gtfsPlusIsEdited()
                ? <Button
                  disabled={publishingIsDisabled}
                  bsStyle='primary'
                  onClick={this._onClickPublish}>
                  <Glyphicon glyph='upload' /> Create a New Version
                </Button>
                : null
              }
            </ButtonToolbar>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Panel>
              <Table fill>
                <thead>
                  <tr>
                    <th>Table</th>
                    <th>Included?</th>
                    <th>Records</th>
                    <th>Validation Issues</th>
                  </tr>
                </thead>
                {/* FIXME: reinstate this <tbody> after switching to React 16. */}
                {/**
                    * Change the behavior as follows:
                    * - Table-level issues are still critical and blocking and and displayed in red.
                    * - Per-row issues are still amber warnings and non-blocking,
                    *   but will now be displayed individually instead of being aggregated.
                    *   Maybe only display the first 25 issues to avoid long rendering times???
                    * - Issues are displayed on a full-width sub-table for better readability,
                    *   in the same "row" as the issue summary.
                    * - Tables are sorted alphabetically.
                    */}
                {getGtfsPlusSpec()
                  .sort((table1, table2) => table1.name.localeCompare(table2.name))
                  .map((table, index) => {
                    const issueCount = this.validationIssueCount(table.id)
                    const tableLevelIssues = this._getTableLevelIssues(table.id)
                    const hasIssues = +issueCount > 0
                    const className = tableLevelIssues
                      ? 'danger'
                      : (hasIssues ? 'warning' : '')

                    return (
                      // FIXME: Use <React.Fragment key={index}> (React 16+ only.)
                      <tbody key={index}>
                        <tr
                          className={className}
                          rowSpan={hasIssues ? 2 : 1}
                          style={{ color: this.isTableIncluded(table.id) === 'Yes' ? 'black' : 'lightGray' }}>
                          <td>
                            {table.name}
                          </td>
                          <td>{this.isTableIncluded(table.id)}</td>
                          <td>{this.tableRecordCount(table.id)}</td>
                          <td>{issueCount}</td>
                        </tr>
                        {hasIssues && (
                          <tr className={className}>
                            <td colSpan='4'>
                              {this.renderIssues(table)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      // </React.Fragment>
                    )
                  })}
                {/* </tbody> */}
              </Table>
            </Panel>
          </Col>
        </Row>
      </Panel>
    )
  }
}
