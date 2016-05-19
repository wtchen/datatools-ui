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

    return (
      <div>
        <Row>
          <Col xs={12} sm={6}>
            <Table striped>
              <tbody>
                <tr>
                  <td className='col-md-4'><b>Status</b></td>
                  <td>{version.validationSummary.loadStatus}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>Valid Dates</b></td>
                  <td>
                    {moment(version.validationSummary.startDate).format(dateFormat)} to&nbsp;
                    {moment(version.validationSummary.endDate).format(dateFormat)}
                  </td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>File Timestamp</b></td>
                  <td>{version.fileTimestamp ? moment(version.fileTimestamp).format(dateFormat + ', ' + timeFormat) : 'N/A' }</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>File Size</b></td>
                  <td>{version.fileSize ? Math.round(version.fileSize/10000) / 100 + ' MB' : 'N/A'}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col xs={12} sm={6}>
            <Table striped>
              <tbody>
                <tr>
                  <td className='col-md-4'><b>Agency Count</b></td>
                  <td>{version.validationSummary.agencyCount}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>Route Count</b></td>
                  <td>{version.validationSummary.routeCount}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>Trip Count</b></td>
                  <td>{version.validationSummary.tripCount}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>Stop time Count</b></td>
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
          title='Comments for this Version'
          notes={version.notes}
          noteCount={version.noteCount}
          notesRequested={() => { this.props.notesRequested() }}
          newNotePosted={(note) => { this.props.newNotePosted(note) }}
        />
      </div>
    )
  }
}
