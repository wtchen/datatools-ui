import React from 'react'
import moment from 'moment'
import { Grid, Row, Col, ButtonGroup, Button, Table, Input, Panel, Glyphicon } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'

import FeedVersionViewer from './FeedVersionViewer'

export default class FeedVersionNavigator extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillReceiveProps (nextProps) {
    console.log(nextProps)
  }

  render () {

    const versionTitleStyle = {
      fontSize: '24px',
      fontWeight: 'bold'
    }
    const messages = DT_CONFIG.messages.FeedVersionNavigator
    const hasVersions = this.props.versions && this.props.versions.length > 0

    let version = null

    if(hasVersions) {
      version = this.props.versions[this.props.versionIndex]
    }

    console.log(version)

    return (
      <div>
        <Row>
          <Col xs={12} sm={2} style={versionTitleStyle}>
            {hasVersions
              ? `${messages.version} ${version.version} ${messages.of} ${this.props.versions.length}`
              : messages.noVersions
            }
          </Col>
          <Col xs={12} sm={8}>
            <ButtonGroup justified>
              <Button href='#'
                disabled={!hasVersions || !version.previousVersionId}
                onClick={() => browserHistory.push(`/feed/${version.feedSource.id}/version/${this.props.versionIndex - 1}`)}
              >
                <Glyphicon glyph='arrow-left' /><span className='hidden-xs'> {messages.previous}</span><span className='hidden-xs hidden-sm'> {messages.version}</span>
              </Button>
              <Button href='#'
                disabled={!hasVersions}
                onClick={(evt) => {
                  evt.preventDefault()
                  this.props.downloadFeedClicked(version)
                }}
              >
                <Glyphicon glyph='download' /><span className='hidden-xs'> {messages.download}</span><span className='hidden-xs hidden-sm'> {messages.feed}</span>
              </Button>

              <Button href='#'
                disabled={this.props.deleteDisabled || !hasVersions || typeof this.props.deleteVersionClicked === 'undefined'}
                onClick={(evt) => {
                  evt.preventDefault()
                  console.log('deleting version');
                  this.props.deleteVersionClicked(version)
                }}
              >
                <Glyphicon glyph='remove' /><span className='hidden-xs'> {messages.delete}</span><span className='hidden-xs hidden-sm'> {messages.version}</span>
              </Button>
              <Button href='#'
                disabled={!hasVersions || !version.nextVersionId}
                onClick={() => browserHistory.push(`/feed/${version.feedSource.id}/version/${this.props.versionIndex + 1}`)}
              >
                <span className='hidden-xs'>{messages.next} </span><span className='hidden-xs hidden-sm'>{messages.version} </span><Glyphicon glyph='arrow-right' />
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
          : <p>{messages.noVersionsExist}</p>
        }

      </div>
    )
  }
}
