import React, {Component, PropTypes} from 'react'
import { Row, Col, Table, Image, ButtonGroup, Button, Panel, Label, Glyphicon, ButtonToolbar, ListGroup, ListGroupItem } from 'react-bootstrap'
import moment from 'moment'
import { LinkContainer } from 'react-router-bootstrap'
import Icon from 'react-fa'
import numeral from 'numeral'

import GtfsValidationViewer from './validation/GtfsValidationViewer'
import GtfsValidationExplorer from './validation/GtfsValidationExplorer'
import NotesViewer from './NotesViewer'
import ConfirmModal from '../../common/components/ConfirmModal'
import EditableTextField from '../../common/components/EditableTextField'
import ActiveGtfsPlusVersionSummary from '../../gtfsplus/containers/ActiveGtfsPlusVersionSummary'
import { isModuleEnabled, getComponentMessages, getMessage, getConfigProperty } from '../../common/util/config'

const dateFormat = 'MMM. DD, YYYY'
const timeFormat = 'h:MMa'

export default class FeedVersionViewer extends Component {

  static propTypes = {
    version: PropTypes.object,
    versions: PropTypes.array,

    isPublic: PropTypes.bool,
    hasVersions: PropTypes.bool,
    listView: PropTypes.bool,

    newNotePosted: PropTypes.func,
    notesRequested: PropTypes.func,
    fetchValidationResult: PropTypes.func,
    feedVersionRenamed: PropTypes.func,
    downloadFeedClicked: PropTypes.func,
    loadFeedVersionForEditing: PropTypes.func
  }
  getVersionDateLabel (version) {
    const now = +moment()
    const future = version.validationSummary && version.validationSummary.startDate > now
    const expired = version.validationSummary && version.validationSummary.endDate < now
    return version.validationSummary
      ? <Label bsStyle={future ? 'info' : expired ? 'danger' : 'success'}>{future ? 'future' : expired ? 'expired' : 'active'}</Label>
      : null
  }
  render () {
    const version = this.props.version
    const messages = getComponentMessages('FeedVersionViewer')

    if (!version) return <p>{getMessage(messages, 'noVersionsExist')}</p>

    const fsCenter = version.validationSummary && version.validationSummary.bounds
      ? `${(version.validationSummary.bounds.east + version.validationSummary.bounds.west) / 2},${(version.validationSummary.bounds.north + version.validationSummary.bounds.south) / 2}`
      : null
    const fsOverlay = fsCenter
      ? `pin-l-bus(${fsCenter})/`
      : ''
    const mapUrl = fsCenter
      ? `https://api.mapbox.com/v4/mapbox.light/${fsOverlay}${fsCenter},6/1000x800@2x.png?access_token=${getConfigProperty('mapbox.access_token')}`
      : ''
    const versionHeader = (
      <div>
      <h4
        style={{margin: '0px'}}
      >
        {/* Name Display / Editor */}
        {version.validationSummary.loadStatus === 'SUCCESS' && version.validationSummary.errorCount === 0
          ? <Icon title='Feed loaded successfully, and is error-free!' className='text-success' name='check' style={{marginRight: 10}}/>
          : version.validationSummary.errorCount > 0
          ? <Icon title='Feed loaded successfully, but has errors.' className='text-warning' name='exclamation-triangle' style={{marginRight: 10}}/>
          : <Icon title='Feed did not load successfully, something has gone wrong!' className='text-danger' name='times' style={{marginRight: 10}}/>
        }
        {this.props.isPublic
          ? <span>{version.name}</span>
          : <EditableTextField inline value={version.name}
              disabled={this.props.isPublic}
              onChange={(value) => this.props.feedVersionRenamed(version, value)}
            />
        }
        <VersionButtonToolbar
          {...this.props}
        />
      </h4>
      <small title={moment(version.updated).format(dateFormat + ', ' + timeFormat)}><Icon name='clock-o'/> Version published {moment(version.updated).fromNow()}</small>
      </div>
    )


    if (this.props.listView) {
      return (
        <Row>
          <Col xs={12} sm={12}>
              <Panel header={<h3>List of feed versions</h3>}>
                <ListGroup fill>
                  {this.props.versions
                    ? this.props.versions.map(v => {
                        return (
                          <ListGroupItem>
                            {v.name}
                            {' '}
                            <small>
                            {this.getVersionDateLabel(v)}
                            </small>
                            <VersionButtonToolbar
                              version={v}
                              {...this.props}
                            />
                          </ListGroupItem>
                        )
                      })
                    : <ListGroupItem>
                        No versions
                      </ListGroupItem>
                  }
                </ListGroup>
              </Panel>
          </Col>
        </Row>
      )
    }

    switch (this.props.versionSection) {
      case 'validation':
        return <GtfsValidationExplorer
                  {...this.props}
                />
      default:
        return (
          <Row>
            <Col xs={12} sm={3}>
              <Panel>
                <ListGroup fill>
                <LinkContainer to={`/feed/${version.feedSource.id}/version/${this.props.feedVersionIndex}`} active={!this.props.versionSection}><ListGroupItem><Icon name='info-circle'/> Version summary</ListGroupItem></LinkContainer>
                <LinkContainer to={`/feed/${version.feedSource.id}/version/${this.props.feedVersionIndex}/issues`} active={this.props.versionSection === 'issues'}><ListGroupItem><Icon name='exclamation-triangle'/> Validation issues <Label bsStyle={version.validationSummary.errorCount ? 'warning' : 'success'}>{version.validationSummary.errorCount}</Label></ListGroupItem></LinkContainer>
                {isModuleEnabled('gtfsplus')
                  ? <LinkContainer to={`/feed/${version.feedSource.id}/version/${this.props.feedVersionIndex}/gtfsplus`} active={this.props.versionSection === 'gtfsplus'}><ListGroupItem><Icon name='plus'/> GTFS+ for this version</ListGroupItem></LinkContainer>
                  : null
                }
                <LinkContainer to={`/feed/${version.feedSource.id}/version/${this.props.feedVersionIndex}/comments`} active={this.props.versionSection === 'comments'}><ListGroupItem><Glyphicon glyph='comment'/> Version comments <Label>{version.noteCount}</Label></ListGroupItem></LinkContainer>
                </ListGroup>
              </Panel>
            </Col>
            <Col xs={12} sm={9}>
              {!this.props.versionSection
                ? <Panel bsStyle='info' header={versionHeader}>
                    <ListGroup hover fill>
                        <ListGroupItem
                          style={{
                            maxHeight: '200px',
                            overflowY: 'hidden',
                            padding: '0px'
                          }}
                          >
                          <Image
                            style={{
                              position: 'relative',
                              top: '50%',
                              transform: 'translateY(-30%)'
                            }}
                            responsive
                            src={mapUrl}
                          />
                        </ListGroupItem>
                        <ListGroupItem
                          header={
                            <h4>
                              {`${moment(version.validationSummary.startDate).format(dateFormat)} to ${moment(version.validationSummary.endDate).format(dateFormat)}`}
                              {' '}
                              <small>
                                {this.getVersionDateLabel(version)}
                              </small>
                            </h4>
                          }
                        >
                          <Icon name='calendar'/> {getMessage(messages, 'validDates')}
                        </ListGroupItem>
                        <ListGroupItem>
                          <Row>
                            <Col xs={3} className='text-center'>
                              <p title={`${version.validationSummary.agencyCount}`} style={{marginBottom: '0px', fontSize: '200%'}}>{numeral(version.validationSummary.agencyCount).format('0 a')}</p>
                              <p style={{marginBottom: '0px'}}>{getMessage(messages, 'agencyCount')}</p>
                            </Col>
                            <Col xs={3} className='text-center'>
                              <p title={`${version.validationSummary.routeCount}`} style={{marginBottom: '0px', fontSize: '200%'}}>{numeral(version.validationSummary.routeCount).format('0 a')}</p>
                              <p style={{marginBottom: '0px'}}>{getMessage(messages, 'routeCount')}</p>
                            </Col>
                            <Col xs={3} className='text-center'>
                              <p title={`${version.validationSummary.tripCount}`} style={{marginBottom: '0px', fontSize: '200%'}}>{numeral(version.validationSummary.tripCount).format('0 a')}</p>
                              <p style={{marginBottom: '0px'}}>{getMessage(messages, 'tripCount')}</p>
                            </Col>
                            <Col xs={3} className='text-center'>
                              <p title={`${version.validationSummary.stopTimesCount}`} style={{marginBottom: '0px', fontSize: '200%'}}>{numeral(version.validationSummary.stopTimesCount).format('0 a')}</p>
                              <p style={{marginBottom: '0px'}}>{getMessage(messages, 'stopTimesCount')}</p>
                            </Col>
                          </Row>
                        </ListGroupItem>
                        <ListGroupItem>
                          <Icon name='file-archive-o'/> {numeral(version.fileSize || 0).format('0 b')} zip file last modified at {version.fileTimestamp ? moment(version.fileTimestamp).format(timeFormat + ', ' + dateFormat) : 'N/A' }
                        </ListGroupItem>
                    </ListGroup>
                  </Panel>
                : this.props.versionSection === 'issues'
                ? <GtfsValidationViewer
                    validationResult={version.validationResult}
                    version={version}
                    fetchValidationResult={() => { this.props.fetchValidationResult(version) }}
                  />
                : this.props.versionSection === 'gtfsplus' && isModuleEnabled('gtfsplus')
                ? <ActiveGtfsPlusVersionSummary
                    version={version}
                  />
                : this.props.versionSection === 'comments'
                ? <NotesViewer
                    type='feed-version'
                    stacked={true}
                    user={this.props.user}
                    version={this.props.version}
                    notes={version.notes}
                    noteCount={version.noteCount}
                    notesRequested={() => { this.props.notesRequested() }}
                    newNotePosted={(note) => { this.props.newNotePosted(note) }}
                  />
                : null
              }
              {/**/}
            </Col>
          </Row>
        )
    }
  }
}

class VersionButtonToolbar extends Component {
  render () {
    const version = this.props.version
    const messages = getComponentMessages('FeedVersionViewer')
    return (
      <div style={{display: 'inline'}}>
      <ConfirmModal ref='confirm' />
      <ButtonToolbar className='pull-right'>

        {/* "Download Feed" Button */}
        <Button bsStyle='primary'
          disabled={!this.props.hasVersions}
          onClick={(evt) => this.props.downloadFeedClicked(version, this.props.isPublic)}
        >
          <Glyphicon glyph='download' /><span className='hidden-xs'> {getMessage(messages, 'download')}</span><span className='hidden-xs hidden-sm'> {getMessage(messages, 'feed')}</span>
        </Button>

        {/* "Load for Editing" Button */}
        {isModuleEnabled('editor') && !this.props.isPublic
          ? <Button bsStyle='success'
              disabled={!this.props.hasVersions}
              onClick={(evt) => {
                this.refs.confirm.open({
                  title: getMessage(messages, 'load'),
                  body: getMessage(messages, 'confirmLoad'),
                  onConfirm: () => { this.props.loadFeedVersionForEditing(version) }
                })
              }}
            >
              <Glyphicon glyph='pencil' /><span className='hidden-xs'> {getMessage(messages, 'load')}</span>
            </Button>
          : null
        }

        {/* "Delete Version" Button */}
        {!this.props.isPublic
          ? <Button bsStyle='danger'
              disabled={this.props.deleteDisabled || !this.props.hasVersions || typeof this.props.deleteFeedVersionConfirmed === 'undefined'}
              onClick={(evt) => {
                this.refs.confirm.open({
                  title: `${getMessage(messages, 'delete')} ${getMessage(messages, 'version')}`,
                  body: getMessage(messages, 'confirmDelete'),
                  onConfirm: () => { this.props.deleteFeedVersionConfirmed(version) }
                })
              }}
            >
              <Glyphicon glyph='trash' /><span className='hidden-xs'> {getMessage(messages, 'delete')}</span><span className='hidden-xs hidden-sm'> {getMessage(messages, 'version')}</span>
            </Button>
          : null
        }
      </ButtonToolbar>
      </div>
    )
  }
}
