import React from 'react'
import moment from 'moment'
import { Grid, Row, Col, ButtonGroup, Button, Table, Input, Panel, Glyphicon } from 'react-bootstrap'
import { browserHistory } from 'react-router'

import FeedVersionViewer from './FeedVersionViewer'

export default class FeedVersionNavigator extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      versionIndex: 0
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      versionIndex: nextProps.versions ? nextProps.versions.length - 1 : 0
    })
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
                  this.props.downloadFeedClicked(version)
                }}
              >
                <Glyphicon glyph='download' /> Download Feed
              </Button>

              {this.props.feedSource.retrievalMethod === 'MANUALLY_UPLOADED'
                ? <Button
                    href='#'
                    disabled={typeof this.props.uploadFeedClicked === 'undefined'}
                    onClick={(evt) => {
                      evt.preventDefault()
                      this.props.uploadFeedClicked()
                    }}
                  >
                    <Glyphicon glyph='upload' /> Upload Feed
                  </Button>
                : <Button
                    href='#'
                    disabled={typeof this.props.updateFeedClicked === 'undefined'}
                    onClick={(evt) => {
                      evt.preventDefault()
                      this.props.updateFeedClicked()
                    }}
                  >
                    <Glyphicon glyph='refresh' /> Update Feed
                  </Button>

              }

              <Button href='#'
                disabled={!hasVersions || typeof this.props.deleteVersionClicked === 'undefined'}
                onClick={(evt) => {
                  evt.preventDefault()
                  console.log('deleting version');
                  this.props.deleteVersionClicked(version)
                }}
              >
                <Glyphicon glyph='remove' /> Delete Version
              </Button>

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
            {/*
            <Button className='pull-right' disabled={!hasVersions}>
              <Glyphicon glyph='list' /> All Versions
            </Button>
            */}
          </Col>
        </Row>

        <Row><Col xs={12}>&nbsp;</Col></Row>

        {version
          ? <FeedVersionViewer
              version={version}
              validationResultRequested={(version) => {
                this.props.validationResultRequested(version)
              }}
              notesRequested={() => { this.props.notesRequestedForVersion(version) }}
              newNotePosted={(note) => { this.props.newNotePostedForVersion(version, note) }}
            />
          : <p>No versions exist for this feed source.</p>
        }

      </div>
    )
  }
}
