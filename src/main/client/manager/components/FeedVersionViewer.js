import React, {Component, PropTypes} from 'react'
import { Row, Col, Table, Button, Glyphicon } from 'react-bootstrap'
import moment from 'moment'

import GtfsValidationViewer from './validation/GtfsValidationViewer'
import NotesViewer from './NotesViewer'

export default class FeedVersionViewer extends Component {

  render () {
    const version = this.props.version
    return (
      <div>
        <Row>
          <Col xs={6}>
            <Table striped>
              <tbody>
                <tr>
                  <td className='col-md-4'><b>Status</b></td>
                  <td>{version.validationSummary.loadStatus}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>Agency Count</b></td>
                  <td>{version.validationSummary.agencyCount}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>Route Count</b></td>
                  <td>{version.validationSummary.routeCount}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col xs={6}>
            <Table striped>
              <tbody>
                <tr>
                  <td className='col-md-4'><b>Trip Count</b></td>
                  <td>{version.validationSummary.tripCount}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>Stop time Count</b></td>
                  <td>{version.validationSummary.stopTimesCount}</td>
                </tr>
                <tr>
                  <td className='col-md-4'><b>Valid Dates</b></td>
                  <td>
                    {moment(version.validationSummary.startDate).format("MMM Do YYYY")} to&nbsp;
                    {moment(version.validationSummary.endDate).format("MMM Do YYYY")}
                  </td>
                </tr>
              </tbody>
          </Table>
          </Col>
        </Row>

        <Row style={{marginBottom: '20px'}}>
          <Col xs={12}>
            <Button
              className='pull-right'
              onClick={() => {
                console.log('edit GTFS+', version);
                browserHistory.push(`/gtfsplus/${version.feedSource.id}?version=${version.id}`)
              }}
            >
              <Glyphicon glyph='edit' /> Edit GTFS+ from Version
            </Button>
          </Col>
        </Row>

        <GtfsValidationViewer
          validationResult={version.validationResult}
          validationResultRequested={() => { this.props.validationResultRequested(version) }}
        />

        <NotesViewer
          title='Comments for this Version'
          notes={version.notes}
          notesRequested={() => { this.props.notesRequested() }}
          newNotePosted={(note) => { this.props.newNotePosted(note) }}
        />
      </div>
    )
  }
}
