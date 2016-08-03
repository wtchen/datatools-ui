import React, {Component, PropTypes} from 'react'
import { Row, Col, ButtonGroup, ButtonToolbar, DropdownButton, MenuItem, Button, Glyphicon } from 'react-bootstrap'
import { browserHistory } from 'react-router'

import { isModuleEnabled, getComponentMessages } from '../../common/util/config'
import FeedVersionViewer from './FeedVersionViewer'
import EditableTextField from '../../common/components/EditableTextField'

export default class FeedVersionNavigator extends Component {

  static propTypes = {
    deleteDisabled: PropTypes.bool,
    versions: PropTypes.array,
    versionIndex: PropTypes.number,

    deleteVersionClicked: PropTypes.func,
    downloadFeedClicked: PropTypes.func,
    feedVersionRenamed: PropTypes.func,
    importSnapshotFromFeedVersion: PropTypes.func,
    gtfsPlusDataRequested: PropTypes.func,
    newNotePostedForVersion: PropTypes.func,
    notesRequestedForVersion: PropTypes.func,
    validationResultRequested: PropTypes.func
  }

  constructor (props) {
    super(props)
  }

  componentWillReceiveProps (nextProps) {
  }

  render () {
    const versionTitleStyle = {
      fontSize: '24px',
      fontWeight: 'bold'
    }
    const messages = getComponentMessages('FeedVersionNavigator')
    const hasVersions = this.props.versions && this.props.versions.length > 0

    const sortedVersions = hasVersions && this.props.versions.sort((a, b) => {
      if (a.updated < b.updated) return -1
      if (a.updated > b.updated) return 1
      return 0
    })

    let version

    if (typeof this.props.versionIndex === 'undefined') {
      return null
    } else if (hasVersions && this.props.versions.length >= this.props.versionIndex) {
      version = sortedVersions[this.props.versionIndex - 1]
    } else {
      console.log(`Error version ${this.props.versionIndex} does not exist`)
    }

    return (
      <div>
        <Row>
          <Col xs={12} sm={6} style={versionTitleStyle}>
            {hasVersions
              ? <div>
                  <ButtonGroup>
                    <Button href='#'
                      disabled={!hasVersions || !sortedVersions[this.props.versionIndex - 2]}
                      onClick={() => browserHistory.push(`/feed/${version.feedSource.id}/version/${this.props.versionIndex - 1}`)}
                    >
                      <Glyphicon glyph='arrow-left' />
                    </Button>
                    <DropdownButton href='#' id='versionSelector'
                      title={`${this.props.versionIndex} ${messages.of} ${this.props.versions.length}`}
                      onSelect={(key) => browserHistory.push(`/feed/${version.feedSource.id}/version/${key}`)}
                    >
                      {this.props.versions.map((version, k) => {
                        k = k + 1
                        return <MenuItem key={k} eventKey={k}>{k}. {version.name}</MenuItem>
                      })}
                    </DropdownButton>
                    <Button href='#'
                      disabled={!hasVersions || !sortedVersions[this.props.versionIndex]}
                      onClick={() => browserHistory.push(`/feed/${version.feedSource.id}/version/${this.props.versionIndex + 1}`)}
                    >
                      <Glyphicon glyph='arrow-right' />
                    </Button>
                  </ButtonGroup>
                  <span>&nbsp;&nbsp;</span>
                  <EditableTextField inline value={version.name}
                    onChange={(value) => this.props.feedVersionRenamed(version, value)}
                  />
                </div>
              : messages.noVersions
            }
          </Col>
          <Col xs={12} sm={6}>
            <ButtonToolbar className='pull-right'>
              <Button bsStyle='primary'
                disabled={!hasVersions}
                onClick={(evt) => this.props.downloadFeedClicked(version)}
              >
                <Glyphicon glyph='download' /><span className='hidden-xs'> {messages.download}</span><span className='hidden-xs hidden-sm'> {messages.feed}</span>
              </Button>
              {isModuleEnabled('editor')
                ? <Button bsStyle='success'
                    disabled={!hasVersions}
                    onClick={(evt) => {
                      this.props.importSnapshotFromFeedVersion(version)
                    }}
                  >
                    <Glyphicon glyph='camera' /><span className='hidden-xs'> {messages.edit}</span><span className='hidden-xs hidden-sm'> {messages.version}</span>
                  </Button>
                : null
              }
              <Button bsStyle='danger'
                disabled={this.props.deleteDisabled || !hasVersions || typeof this.props.deleteVersionClicked === 'undefined'}
                onClick={(evt) => {
                  this.props.deleteVersionClicked(version)
                }}
              >
                <Glyphicon glyph='remove' /><span className='hidden-xs'> {messages.delete}</span><span className='hidden-xs hidden-sm'> {messages.version}</span>
              </Button>
            </ButtonToolbar>
          </Col>
        </Row>

        <Row><Col xs={12}><span>&nbsp;</span></Col></Row>

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
