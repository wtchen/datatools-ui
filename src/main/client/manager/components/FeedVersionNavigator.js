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

    const sortedVersions = hasVersions && this.props.versions.sort((a, b) => {
      if (a.updated < b.updated) return -1
      if (a.updated > b.updated) return 1
      return 0
    })

    let version = null

    if(hasVersions) {
      version = sortedVersions[this.state.versionIndex]
    }

    return (
      <div>
        <Row>
          <Col xs={12} sm={2} style={versionTitleStyle}>
            {hasVersions
              ? `Version ${this.state.versionIndex + 1} of ${sortedVersions.length}`
              : '(No Versions)'
            }
          </Col>
          <Col xs={12} sm={8}>
            <ButtonGroup justified>
              <Button href='#'
                disabled={!hasVersions || !version.previousVersionId}
                onClick={(evt) => {
                  evt.preventDefault()
                  this.setState({ versionIndex: this.state.versionIndex - 1 })
                }}
              >
                <Glyphicon glyph='arrow-left' /><span className='hidden-xs'> Previous</span><span className='hidden-xs hidden-sm'> Version</span>
              </Button>

              <Button href='#'
                disabled={!hasVersions}
                onClick={(evt) => {
                  evt.preventDefault()
                  this.props.downloadFeedClicked(version)
                }}
              >
                <Glyphicon glyph='download' /><span className='hidden-xs'> Download</span><span className='hidden-xs hidden-sm'> Feed</span>
              </Button>

              <Button href='#'
                disabled={this.props.deleteDisabled || !hasVersions || typeof this.props.deleteVersionClicked === 'undefined'}
                onClick={(evt) => {
                  evt.preventDefault()
                  console.log('deleting version');
                  this.props.deleteVersionClicked(version)
                }}
              >
                <Glyphicon glyph='remove' /><span className='hidden-xs'> Delete</span><span className='hidden-xs hidden-sm'> Version</span>
              </Button>

              <Button href='#'
                disabled={!hasVersions || !version.nextVersionId}
                onClick={(evt) => {
                  evt.preventDefault()
                  this.setState({ versionIndex: this.state.versionIndex + 1 })
                }}
              >
                <span className='hidden-xs'>Next </span><span className='hidden-xs hidden-sm'>Version </span><Glyphicon glyph='arrow-right' />
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
              gtfsPlusDataRequested={(version) => {
                this.props.gtfsPlusDataRequested(version)
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
