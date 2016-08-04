import React, {Component, PropTypes} from 'react'
import fetch from 'isomorphic-fetch'
import Icon from 'react-fa'
import Helmet from 'react-helmet'
import { Grid, Row, Col, Well, Button, Table, Glyphicon, ButtonToolbar, ButtonGroup, Tabs, Tab, FormControl, Checkbox } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'
import moment from 'moment'

import ManagerPage from '../../common/components/ManagerPage'
import Breadcrumbs from '../../common/components/Breadcrumbs'
import EditableTextField from '../../common/components/EditableTextField'
import WatchButton from '../../common/containers/WatchButton'
import { retrievalMethodString } from '../../common/util/util'
import ExternalPropertiesTable from './ExternalPropertiesTable'
import FeedVersionNavigator from './FeedVersionNavigator'
import NotesViewer from './NotesViewer'
import ActiveEditorFeedSourcePanel from '../../editor/containers/ActiveEditorFeedSourcePanel'
import { isModuleEnabled, getComponentMessages, getConfigProperty } from '../../common/util/config'

const retrievalMethods = [
  'FETCHED_AUTOMATICALLY',
  'MANUALLY_UPLOADED',
  'PRODUCED_IN_HOUSE'
]

export default class FeedSourceViewer extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    feedSourceId: PropTypes.string,
    feedVersionIndex: PropTypes.number,
    isFetching: PropTypes.bool,
    project: PropTypes.object,
    user: PropTypes.object,

    createDeployment: PropTypes.func,
    deleteFeedVersionConfirmed: PropTypes.func,
    downloadFeedClicked: PropTypes.func,
    externalPropertyChanged: PropTypes.func,
    feedSourcePropertyChanged: PropTypes.func,
    feedVersionRenamed: PropTypes.func,
    gtfsPlusDataRequested: PropTypes.func,
    loadFeedVersionForEditing: PropTypes.func,
    newNotePostedForFeedSource: PropTypes.func,
    newNotePostedForVersion: PropTypes.func,
    notesRequestedForFeedSource: PropTypes.func,
    notesRequestedForVersion: PropTypes.func,
    onComponentMount: PropTypes.func,
    updateFeedClicked: PropTypes.func,
    updateUserSubscription: PropTypes.func,
    uploadFeedClicked: PropTypes.func,
    validationResultRequested: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      snapshotVersions: []
    }

    if (this.props.feedSource && this.props.feedSource.retrievalMethod === 'PRODUCED_IN_HOUSE') {
      this.updateSnapshotVersions(this.props.feedSource)
    }
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.feedSource && nextProps.feedSource.retrievalMethod === 'PRODUCED_IN_HOUSE') {
      this.updateSnapshotVersions(nextProps.feedSource)
    }
  }

  updateSnapshotVersions (feedSource) {
    const url = getConfigProperty('modules.editor.url') + '/api/mgrsnapshot?sourceId=' + feedSource.id
    fetch(url)
      .then(res => res.json())
      .then(snapshots => {
        this.setState({
          snapshotVersions: snapshots
        })
      })
      .catch(err => {
        console.log('Error fetching snapshots', err)
      })
  }
  getAverageFileSize (feedVersions) {
    let sum = 0
    for( var i = 0; i < feedVersions.length; i++ ){
        sum += feedVersions[i].fileSize
    }
    return Math.floor(sum / feedVersions.length / 10000) / 100
  }
  deleteFeedVersion (feedSource, feedVersion) {
    this.refs['page'].showConfirmModal({
      title: 'Delete Feed Version?',
      body: 'Are you sure you want to delete this version?',
      onConfirm: () => {
        this.props.deleteFeedVersionConfirmed(feedSource, feedVersion)
      }
    })
  }

  showUploadFeedModal () {
    this.refs.page.showSelectFileModal({
      title: 'Upload Feed',
      body: 'Select a GTFS feed (.zip) to upload:',
      onConfirm: (files) => {
        let nameArray = files[0].name.split('.')
        if (files[0].type !== 'application/zip' || nameArray[nameArray.length - 1] !== 'zip') {
          return false
        }
        else {
          this.props.uploadFeedClicked(this.props.feedSource, files[0])
          return true
        }
      },
      errorMessage: 'Uploaded file must be a valid zip file (.zip).'
    })
  }

  render () {
    const fs = this.props.feedSource
    if (this.props.isFetching) {
      return (
        <ManagerPage ref='page'>
          <Grid>
            <h1
              className='text-center'
              style={{
                marginTop: '150px'
                // minHeight: '100%',
                // minHeight: '100vh',
                // display: 'flex',
                // alignItems: 'center',
              }}
            >
              <Icon size='5x' spin name='refresh' />
            </h1>
          </Grid>
        </ManagerPage>
      )
    } else if (!fs) {
      return (
        <ManagerPage ref='page'>
          <Grid>
            <Row>
              <Col xs={12}>
                <p>No feed source found for <strong>{this.props.feedSourceId}</strong></p>
                <p><Link to='/project'>Return to list of projects</Link></p>
              </Col>
            </Row>
          </Grid>
        </ManagerPage>
      )
    }

    const messages = getComponentMessages('FeedSourceViewer')
    const disabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'manage-feed')
    const isWatchingFeed = this.props.user.subscriptions.hasFeedSubscription(this.props.project.id, fs.id, 'feed-updated')
    const editGtfsDisabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'edit-gtfs')
    const dateFormat = getConfigProperty('application.date_format')

    return (
      <ManagerPage ref='page'>
      <Helmet
        title={this.props.feedSource.name}
      />
        <Grid>
          <Row> {/* Breadcrumbs Row */}
            <Col xs={12}>
              <Breadcrumbs
                project={this.props.project}
                feedSource={this.props.feedSource}
              />
            </Col>
          </Row>

          <Row> {/*  Title + Shortcut Buttons Row */}
            <Col xs={12}>
              <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: 12, marginBottom: 24 }}>
                {fs.name}

                <ButtonToolbar
                  className={`pull-right`}
                >
                  <WatchButton
                    isWatching={isWatchingFeed}
                    user={this.props.user}
                    target={fs.id}
                    subscriptionType='feed-updated'
                  />
                </ButtonToolbar>
              </h2>
            </Col>
          </Row>

          <Row>
            <Col xs={3}>
              <Well bsSize='small'>
                <h4>Feed Summary</h4>
                <ul className="list-unstyled">
                  <li><b>Last Updated:</b> {fs.lastUpdated ? moment(fs.lastUpdated).format(dateFormat) : 'n/a'}</li>
                  <li><b>Number of versions:</b> {fs.feedVersionCount}</li>
                  {/*<li><b>Average file size:</b> {fs.feedVersions ? `${this.getAverageFileSize(fs.feedVersions)} MB` : 'n/a'}</li>*/}
                </ul>
              </Well>
            </Col>

            <Col xs={1} />

            <Col xs={4}>
              <ButtonToolbar>
                <Button bsStyle='success' bsSize='large'
                  onClick={(evt) => { this.showUploadFeedModal() }}
                >
                  <Glyphicon glyph='upload' /> Upload
                </Button>
                {isModuleEnabled('editor')
                  ? <Button
                      disabled={editGtfsDisabled} // || !fs.latestValidation}
                      bsStyle='success' bsSize='large'
                      onClick={() => { browserHistory.push(`/feed/${fs.id}/edit`) }}>
                      <Glyphicon glyph='pencil' /> Edit
                    </Button>
                  : null
                }
                <Button bsStyle='success' bsSize='large'
                  onClick={(evt) => { this.props.updateFeedClicked(fs) }}
                >
                  <Glyphicon glyph='download' /> Fetch
                </Button>
              </ButtonToolbar>
              <Row style={{ marginTop: 12 }}>
                <Col xs={12}>
                  <div style={{ display: 'inline-block' }}>
                    <b>Fetch URL:&nbsp;</b>
                  </div>
                  <div style={{ display: 'inline-block' }}>
                    <EditableTextField
                      value={fs.url}
                      maxLength={30}
                      disabled={disabled}
                      onChange={(value) => this.props.feedSourcePropertyChanged(fs, 'url', value)}
                    />
                  </div>
                </Col>
              </Row>

            </Col>

            <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <ButtonGroup className='pull-right'>
                    <Button onClick={() => {
                      this.props.feedSourcePropertyChanged(fs, 'deployable', !fs.deployable)
                    }}>
                      <Glyphicon glyph={fs.deployable ? 'check' : 'unchecked'} /> Deployable
                    </Button>
                    <Button bsStyle='primary' disabled={!fs.deployable}
                      onClick={() => { this.props.createDeployment(fs) }}
                    >
                      <Glyphicon glyph='globe' /> Deploy
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
              <Row style={{marginTop: 10}}>
                <Col xs={12}>
                  <ButtonGroup className='pull-right'>
                    <Button onClick={() => {
                      this.props.feedSourcePropertyChanged(fs, 'isPublic', !fs.isPublic)
                    }}>
                      <Glyphicon glyph={fs.isPublic ? 'check' : 'unchecked'} /> Public
                    </Button>
                    <Button bsStyle='primary' disabled={!fs.isPublic}
                      onClick={() => { browserHistory.push(`/public/feed/${fs.id}`) }}
                    >
                      <Glyphicon glyph='globe' /> View Public Page
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </Col>
          </Row>

          <Tabs id='feed-source-viewer-tabs'>
            <Tab eventKey='versions' title={<span><Glyphicon glyph='list' /> {messages.versions}</span>}>
              <FeedVersionNavigator
                versions={fs.feedVersions}
                feedSource={fs}
                versionIndex={this.props.feedVersionIndex}
                user={this.props.user}
                updateUserSubscription={this.props.updateUserSubscription}
                updateDisabled={disabled}
                editGtfsDisabled={editGtfsDisabled}
                deleteDisabled={disabled}
                validationResultRequested={(version) => this.props.validationResultRequested(fs, version) }
                downloadFeedClicked={(version) => this.props.downloadFeedClicked(version)}
                deleteVersionClicked={(version) => {
                  this.deleteFeedVersion(fs, version)
                }}
                notesRequestedForVersion={(version) => {
                  this.props.notesRequestedForVersion(version)
                }}
                newNotePostedForVersion={(version, note) => {
                  this.props.newNotePostedForVersion(version, note)
                }}
                gtfsPlusDataRequested={(version) => {
                  this.props.gtfsPlusDataRequested(version)
                }}
                feedVersionRenamed={(version, name) => this.props.feedVersionRenamed(fs, version, name)}
                loadFeedVersionForEditing={(version) => this.props.loadFeedVersionForEditing(version)}
              />
            </Tab>

            {isModuleEnabled('editor')
              ? <Tab eventKey='snapshots'
                  title={<span><Glyphicon glyph='camera' /> Editor Snapshots</span>}
                >
                  <ActiveEditorFeedSourcePanel feedSource={fs} />
                </Tab>
              : null
            }

            <Tab eventKey='properties' title={<span><Glyphicon glyph='cog' /> {messages.properties.title}</span>}>
              <Row>
                <Col xs={6}>
                  <Table striped style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th className='col-md-4'>{messages.properties.property}</th>
                        <th className='col-md-8'>{messages.properties.value}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Name</td>
                        <td>
                          <EditableTextField
                            value={fs.name}
                            disabled={disabled}
                            onChange={(value) => this.props.feedSourcePropertyChanged(fs, 'name', value)}
                          />
                        </td>
                      </tr>

                      <tr>
                        <td>{messages.properties.retrievalMethod.title}</td>
                        <td>
                          <Row>
                            <Col xs={8}>
                              <FormControl componentClass='select'
                                value={fs.retrievalMethod}
                                disabled={disabled}
                                onChange={(evt) => {
                                  this.props.feedSourcePropertyChanged(fs, 'retrievalMethod', evt.target.value)
                                }}
                              >
                                {retrievalMethods.map(method => {
                                  return <option value={method} key={method}>
                                    {retrievalMethodString(method)}
                                  </option>
                                })}
                              </FormControl>
                            </Col>
                            <Col xs={4}>
                              {this.props.feedSource.retrievalMethod === 'MANUALLY_UPLOADED'
                                ? <Button
                                    className='pull-right'
                                    disabled={disabled || typeof this.props.uploadFeedClicked === 'undefined'}
                                    onClick={(evt) => { this.showUploadFeedModal() }}
                                  >
                                    <Glyphicon glyph='upload' /> Upload
                                  </Button>
                                : <Button
                                    className='pull-right'
                                    disabled={disabled || typeof this.props.updateFeedClicked === 'undefined'}
                                    onClick={(evt) => { this.props.updateFeedClicked(fs) }}
                                  >
                                    <Glyphicon glyph='refresh' /> Update
                                  </Button>
                              }
                            </Col>
                          </Row>
                        </td>
                      </tr>

                      {fs.retrievalMethod === 'FETCHED_AUTOMATICALLY'
                        ? <tr>
                            <td>Retrieval URL</td>
                            <td>
                              <EditableTextField
                                value={fs.url}
                                maxLength={30}
                                disabled={disabled}
                                onChange={(value) => this.props.feedSourcePropertyChanged(fs, 'url', value)}
                              />
                            </td>
                          </tr>
                        : null
                      }

                      {fs.retrievalMethod === 'PRODUCED_IN_HOUSE'
                        ? <tr>
                            <td>Editor Snapshot</td>
                            <td>
                              <FormControl componentClass='select'
                                value={fs.snapshotVersion}
                                onChange={(evt) => {
                                  this.props.feedSourcePropertyChanged(fs, 'snapshotVersion', evt.target.value)
                                }}
                              >
                                <option>{messages.properties.noneSelected}</option>
                                {this.state.snapshotVersions.map(snapshot => {
                                  return <option value={snapshot.id} key={snapshot.id}>
                                    {snapshot.name}
                                  </option>
                                })}
                              </FormControl>
                            </td>
                          </tr>
                        : null
                      }
                      <tr>
                        <td>{messages.properties.public}</td>
                        <td>
                          <Checkbox
                            disabled={disabled}
                            defaultChecked={fs.isPublic}
                            onChange={(e) => {
                              this.props.feedSourcePropertyChanged(fs, 'isPublic', e.target.checked)
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>{messages.properties.deployable}</td>
                        <td>
                          <Checkbox
                            disabled={disabled}
                            defaultChecked={fs.deployable}
                            onChange={(e) => {
                              this.props.feedSourcePropertyChanged(fs, 'deployable', e.target.checked)
                            }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>

                <Col xs={12} sm={6}>
                  {Object.keys(fs.externalProperties || {}).map(resourceType => {
                    return (<ExternalPropertiesTable
                      resourceType={resourceType}
                      editingIsDisabled={disabled}
                      resourceProps={fs.externalProperties[resourceType]}
                      externalPropertyChanged={(name, value) => {
                        this.props.externalPropertyChanged(fs, resourceType, name, value)
                      }}
                    />)
                  })}
                </Col>

              </Row>
            </Tab>

            <Tab eventKey='notes'
              title={<span><Glyphicon glyph='comment' /> {getComponentMessages('NotesViewer').title}</span>}
              onEnter={() => this.props.notesRequestedForFeedSource(fs)}
            >
              <NotesViewer
                type='feed-source'
                notes={fs.notes}
                feedSource={fs}
                user={this.props.user}
                updateUserSubscription={this.props.updateUserSubscription}
                noteCount={fs.noteCount}
                notesRequested={() => { this.props.notesRequestedForFeedSource(fs) }}
                newNotePosted={(note) => { this.props.newNotePostedForFeedSource(fs, note) }}
              />
            </Tab>

          </Tabs>
        </Grid>
      </ManagerPage>
    )
  }
}
