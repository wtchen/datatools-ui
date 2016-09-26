import React, {Component, PropTypes} from 'react'
import { Row, Col, ButtonGroup, ButtonToolbar, DropdownButton, MenuItem, Button, Glyphicon } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import Icon from 'react-fa'

import { isModuleEnabled, getComponentMessages, getMessage } from '../../common/util/config'
import FeedVersionViewer from './FeedVersionViewer'
import EditableTextField from '../../common/components/EditableTextField'
import ConfirmModal from '../../common/components/ConfirmModal'
import SelectFileModal from '../../common/components/SelectFileModal'

export default class FeedVersionNavigator extends Component {

  static propTypes = {
    deleteDisabled: PropTypes.bool,
    feedSource: PropTypes.object,
    feedVersionIndex: PropTypes.number,
    isPublic: PropTypes.bool,

    deleteFeedVersionConfirmed: PropTypes.func,
    downloadFeedClicked: PropTypes.func,
    feedVersionRenamed: PropTypes.func,
    gtfsPlusDataRequested: PropTypes.func,
    loadFeedVersionForEditing: PropTypes.func,
    newNotePostedForVersion: PropTypes.func,
    notesRequestedForVersion: PropTypes.func,
    fetchValidationResult: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentWillReceiveProps (nextProps) {
  }

  render () {
    console.log(this.props)
    const versionTitleStyle = {
      fontSize: '24px',
      fontWeight: 'bold'
    }
    const { disabled } = this.props
    const fs = this.props.feedSource
    const versions = this.props.feedSource.feedVersions
    const messages = getComponentMessages('FeedVersionNavigator')
    const hasVersions = versions && versions.length > 0

    const sortedVersions = hasVersions && versions.sort((a, b) => {
      if (a.updated < b.updated) return -1
      if (a.updated > b.updated) return 1
      return 0
    })

    let version

    if (typeof this.props.feedVersionIndex === 'undefined') {
      return null
    } else if (hasVersions && versions.length >= this.props.feedVersionIndex) {
      version = sortedVersions[this.props.feedVersionIndex - 1]
    } else {
      console.log(`Error version ${this.props.feedVersionIndex} does not exist`)
    }

    const publicPrefix = this.props.isPublic ? '/public' : ''

    return (
      <div>
        <ConfirmModal ref='deleteModal'
          title='Delete Feed Source?'
          body={`Are you sure you want to delete the feed source ${fs.name}?`}
          onConfirm={() => {
            console.log('OK, deleting')
            this.props.deleteFeedSource(fs)
          }}
        />
        <SelectFileModal ref='uploadModal'
          title='Upload Feed'
          body='Select a GTFS feed to upload:'
          onConfirm={(files) => {
            console.log(files[0].type)
            if (isValidZipFile(files[0])) {
              this.props.uploadFeed(fs, files[0])
              return true
            } else {
              return false
            }
          }}
          errorMessage='Uploaded file must be a valid zip file (.zip).'
        />
        <Row style={{marginBottom: '20px'}}>
          {/* Version Navigation Widget and Name Editor */}
          <Col xs={12} style={versionTitleStyle}>
              <ButtonToolbar>
                <ButtonGroup>
                  <Button active={!this.state.listView} onClick={() => this.setState({listView: false})}><Icon name='square'/></Button>
                  <Button active={this.state.listView} onClick={() => this.setState({listView: true})}><Icon name='list'/></Button>
                </ButtonGroup>
                {this.state.listView
                  ? null
                  : <ButtonGroup> {/* Version Navigation/Selection Widget */}
                      {/* Previous Version Button */}
                      <Button href='#'
                        disabled={!hasVersions || !sortedVersions[this.props.feedVersionIndex - 2]}
                        onClick={() => browserHistory.push(`${publicPrefix}/feed/${fs.id}/version/${this.props.feedVersionIndex - 1}`)}
                      >
                        <Glyphicon glyph='arrow-left' />
                      </Button>

                      {/* Version Selector Dropdown */}
                      <DropdownButton href='#' id='versionSelector'
                        title={`${getMessage(messages, 'version')} ${this.props.feedVersionIndex} ${getMessage(messages, 'of')} ${versions.length}`}
                        onSelect={(key) => browserHistory.push(`${publicPrefix}/feed/${fs.id}/version/${key}`)}
                      >
                        {versions.map((version, k) => {
                          k = k + 1
                          return <MenuItem key={k} eventKey={k}>{k}. {version.name}</MenuItem>
                        })}
                      </DropdownButton>

                      {/* Next Version Button */}
                      <Button href='#'
                        disabled={!hasVersions || !sortedVersions[this.props.feedVersionIndex]}
                        onClick={() => browserHistory.push(`${publicPrefix}/feed/${fs.id}/version/${this.props.feedVersionIndex + 1}`)}
                      >
                        <Glyphicon glyph='arrow-right' />
                      </Button>
                    </ButtonGroup>
                  }
                  <ButtonToolbar className='pull-right'>
                    <Button
                      // bsStyle='primary'
                    >
                      <Icon name='globe'/> Deploy feed
                    </Button>
                    {isModuleEnabled('editor')
                      ? <Button
                          // disabled={editGtfsDisabled} // || !fs.latestValidation}
                          // bsStyle='info'
                          onClick={() => { browserHistory.push(`/feed/${fs.id}/edit`) }}>
                          <Glyphicon glyph='pencil' /> Edit feed
                        </Button>
                      : null
                    }
                    <DropdownButton
                      bsStyle='success'
                      title={<span><Icon name='plus'/> Create new version</span>} id='bg-nested-dropdown'
                      onSelect={key => {
                        console.log(key)
                        switch (key) {
                          case 'delete':
                            return this.refs['deleteModal'].open()
                          case 'fetch':
                            return this.props.fetchFeed(fs)
                          case 'upload':
                            return this.refs['uploadModal'].open()
                          case 'deploy':
                            return this.props.createDeploymentFromFeedSource(fs)
                          case 'public':
                            return browserHistory.push(`/public/feed/${fs.id}`)
                        }
                      }}
                    >
                      <MenuItem disabled={disabled || !fs.url} eventKey='fetch'><Glyphicon glyph='refresh' /> Fetch</MenuItem>
                      <MenuItem disabled={disabled} eventKey='upload'><Glyphicon glyph='upload' /> Upload</MenuItem>
                      <MenuItem divider />
                      <MenuItem disabled={disabled || !fs.editorSnapshots || fs.editorSnapshots.length === 0} eventKey='snapshot'><Glyphicon glyph='camera'/> From snapshot</MenuItem>
                    </DropdownButton>
                  </ButtonToolbar>
                </ButtonToolbar>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <FeedVersionViewer
              isPublic={this.props.isPublic}
              version={version}
              feedVersionIndex={this.props.feedVersionIndex}
              versionSection={this.props.versionSection || null}
              versions={versions}
              listView={this.state.listView}
              hasVersions={hasVersions}
              fetchValidationResult={(version) => {
                this.props.fetchValidationResult(version, this.props.isPublic)
              }}
              gtfsPlusDataRequested={(version) => {
                this.props.gtfsPlusDataRequested(version)
              }}
              notesRequested={() => { this.props.notesRequestedForVersion(version) }}
              newNotePosted={(note) => { this.props.newNotePostedForVersion(version, note) }}
              {...this.props}
            />
          </Col>
        </Row>
      </div>
    )
  }
}
