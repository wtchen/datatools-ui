import React, {Component, PropTypes} from 'react'
import { Row, Col, Table, Button, Glyphicon } from 'react-bootstrap'
import moment from 'moment'
import { browserHistory } from 'react-router'

import GtfsValidationViewer from './validation/GtfsValidationViewer'
import NotesViewer from './NotesViewer'
import ActiveGtfsPlusVersionSummary from '../../gtfsplus/containers/ActiveGtfsPlusVersionSummary'
import { isModuleEnabled, isExtensionEnabled } from '../../common/util/config'

const dateFormat = 'MMM. DD, YYYY', timeFormat = 'h:MMa'

export default class FeedVersionViewer extends Component {

  render () {
    const version = this.props.version
    const messages = DT_CONFIG.messages.FeedVersionViewer

    return (
      <div>
        <Row>
          <Col xs={12} sm={6}>
            <Table striped>
              <tbody>
                <tr>
                  <td className='col-md-4'><b>{messages.status}</b></td>
                  <td>{version.validationSummary.loadStatus}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>{messages.validDates}</b></td>
                  <td>
                    {moment(version.validationSummary.startDate).format(dateFormat)} to&nbsp;
                    {moment(version.validationSummary.endDate).format(dateFormat)}
                  </td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>{messages.timestamp}</b></td>
                  <td>{version.fileTimestamp ? moment(version.fileTimestamp).format(dateFormat + ', ' + timeFormat) : 'N/A' }</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>{messages.fileSize}</b></td>
                  <td>{version.fileSize ? Math.round(version.fileSize/10000) / 100 + ' MB' : 'N/A'}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col xs={12} sm={6}>
            <Table striped>
              <tbody>
                <tr>
                  <td className='col-md-4'><b>{messages.agencyCount}</b></td>
                  <td>{version.validationSummary.agencyCount}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>{messages.routeCount}</b></td>
                  <td>{version.validationSummary.routeCount}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>{messages.tripCount}</b></td>
                  <td>{version.validationSummary.tripCount}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>{messages.stopTimesCount}</b></td>
                  <td>{version.validationSummary.stopTimesCount}</td>
                </tr>
              </tbody>
          </Table>
          </Col>
        </Row>

        <GtfsValidationViewer
          validationResult={version.validationResult}
          version={version}
          validationResultRequested={() => { this.props.validationResultRequested(version) }}
        />

        {isModuleEnabled('gtfsplus')
          ? <ActiveGtfsPlusVersionSummary
              version={version}
            />
          : null
        }

        <NotesViewer
          type='feed-version'
          version={this.props.version}
          notes={version.notes}
          noteCount={version.noteCount}
          notesRequested={() => { this.props.notesRequested() }}
          newNotePosted={(note) => { this.props.newNotePosted(note) }}
        />
      </div>
    )
  }
}
