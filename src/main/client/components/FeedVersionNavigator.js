import React from 'react'
import moment from 'moment'

import { Grid, Row, Col, ButtonGroup, Button, Table, Input, Panel, Glyphicon } from 'react-bootstrap'

export default class FeedVersionNavigator extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      versionIndex: 0
    }
  }

  render () {

    const versionTitleStyle = {
      fontSize: '24px',
      fontWeight: 'bold'
    }

    const hasVersions = this.props.versions && this.props.versions.length > 0

    let version = null

    if(hasVersions) {
      version = this.props.versions[this.state.versionIndex]
    }

    return (
      <div>
        <Row>
          <Col xs={2} style={versionTitleStyle}>
            {hasVersions
              ? `Version ${version.version} of ${this.props.versions.length}`
              : '(No Versions)'
            }
          </Col>
          <Col xs={8}>
            <ButtonGroup justified>
              <Button href='#'
                disabled={!hasVersions || !version.previousVersionId}
                onClick={(evt) => {
                  evt.preventDefault()
                  this.setState({ versionIndex: this.state.versionIndex - 1 })
                }}
              >
                <Glyphicon glyph='arrow-left' /> Previous Version
              </Button>

              <Button href='#'
                disabled={!hasVersions}
                onClick={(evt) => {
                  evt.preventDefault()
                }}
              >
                <Glyphicon glyph='download' /> Download Feed
              </Button>

              {this.props.feedSource.retrievalMethod === 'MANUALLY_UPLOADED'
                ? <Button href='#' onClick={(evt) => {
                    evt.preventDefault()
                    this.props.uploadFeedClicked()
                  }}>
                    <Glyphicon glyph='upload' /> Upload Feed
                  </Button>
                : <Button href='#' onClick={(evt) => {
                    evt.preventDefault()
                    this.props.updateFeedClicked()
                  }}>
                    <Glyphicon glyph='refresh' /> Update Feed
                  </Button>

              }

              <Button href='#'
                disabled={!hasVersions || !version.nextVersionId}
                onClick={(evt) => {
                  evt.preventDefault()
                  this.setState({ versionIndex: this.state.versionIndex + 1 })
                }}
              >
                Next Version <Glyphicon glyph='arrow-right' />
              </Button>
            </ButtonGroup>
          </Col>
          <Col xs={2}>
            <Button className='pull-right' disabled={!hasVersions}>
              <Glyphicon glyph='list' /> All Versions
            </Button>
          </Col>
        </Row>

        <Row><Col xs={12}>&nbsp;</Col></Row>

        {version
          ? <FeedVersionViewer version={version} />
          : <p>No versions exist for this feed source.</p>
        }

      </div>
    )
  }
}

class FeedVersionViewer extends React.Component {
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

        <Panel
          header={(<h3><Glyphicon glyph='check' /> Validation Results</h3>)}
          collapsible
        >
        </Panel>

        <Panel
          header={(<h3><Glyphicon glyph='comment' /> Comments on this Version</h3>)}
          collapsible
        >
        </Panel>
      </div>
    )
  }
}
