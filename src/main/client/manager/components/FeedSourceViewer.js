import fetch  from 'isomorphic-fetch'
import React  from 'react'
import Helmet from 'react-helmet'
import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon, ButtonToolbar } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'

import ManagerPage  from '../../common/components/ManagerPage'
import Breadcrumbs from '../../common/components/Breadcrumbs'
import EditableTextField from '../../common/components/EditableTextField'
import WatchButton from '../../common/containers/WatchButton'
import { retrievalMethodString } from '../../common/util/util'
import ExternalPropertiesTable  from './ExternalPropertiesTable'
import FeedVersionNavigator  from './FeedVersionNavigator'
import NotesViewer from './NotesViewer'
import ActiveEditorFeedSourcePanel from '../../editor/containers/ActiveEditorFeedSourcePanel'
import { isModuleEnabled, isExtensionEnabled } from '../../common/util/config'

const retrievalMethods = [
  'FETCHED_AUTOMATICALLY',
  'MANUALLY_UPLOADED',
  'PRODUCED_IN_HOUSE'
]

export default class FeedSourceViewer extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      snapshotVersions: []
    }

    if(this.props.feedSource && this.props.feedSource.retrievalMethod === 'PRODUCED_IN_HOUSE') {
      this.updateSnapshotVersions(this.props.feedSource)
    }
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if(nextProps.feedSource && nextProps.feedSource.retrievalMethod === 'PRODUCED_IN_HOUSE') {
      this.updateSnapshotVersions(nextProps.feedSource)
    }
  }

  updateSnapshotVersions (feedSource) {
    const url = DT_CONFIG.modules.editor.url + '/api/mgrsnapshot?sourceId=' + feedSource.id
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
      body: 'Select a GTFS feed to upload:',
      onConfirm: (files) => {
        console.log('selected file', files[0]);
        this.props.uploadFeedClicked(this.props.feedSource, files[0])
      }
    })
  }

  render () {
    const fs = this.props.feedSource

    if(!fs) {
      return <ManagerPage ref='page'/>
    }
    const messages = DT_CONFIG.messages.active.FeedSourceViewer
    const disabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'manage-feed')
    const isWatchingFeed = this.props.user.subscriptions.hasFeedSubscription(this.props.project.id, fs.id, 'feed-updated')
    const editGtfsDisabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'edit-gtfs')
    return (
      <ManagerPage ref='page'>
      <Helmet
        title={this.props.feedSource.name}
      />
        <Grid>
          <Row>
            <Col xs={12}>
              <Breadcrumbs
                project={this.props.project}
                feedSource={this.props.feedSource}
              />
            </Col>
          </Row>

          <Row>
            <Col xs={12}>
              <h2>
                {fs.name} &nbsp;
                {fs.isPublic
                  ? <span><small>{messages.private} (<Link to={`/public/feed/${fs.id}`}>{messages.viewPublic}</Link>)</small> &nbsp;</span>
                  : null
                }
                <ButtonToolbar
                  className={`pull-right`}
                >
                  {isModuleEnabled('editor')
                    ? <Button
                        bsStyle='success'
                        onClick={() => { browserHistory.push(`/feed/${fs.id}/edit`) }}
                      >
                        <Glyphicon glyph='pencil'/> {messages.edit}
                      </Button>
                    : null
                  }
                  {isModuleEnabled('deployment')
                    ? <Button
                        bsStyle='primary'
                        disabled={disabled || (fs.feedVersionCount === 0)}
                        onClick={() => { this.props.createDeployment(fs) }}
                      >
                        <Glyphicon glyph='globe'/> {messages.deploy}
                      </Button>
                    : null
                  }
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

          <Panel header={(<h3><Glyphicon glyph='cog' /> {messages.properties.title}</h3>)}>
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
                            <Input type='select'
                              value={fs.retrievalMethod}
                              disabled={disabled}
                              onChange={(evt) => {
                                console.log(evt.target.value);
                                this.props.feedSourcePropertyChanged(fs, 'retrievalMethod', evt.target.value)
                              }}
                            >
                              {retrievalMethods.map(method => {
                                return <option value={method} key={method}>
                                  {retrievalMethodString(method)}
                                </option>
                              })}
                            </Input>
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
                            <Input type='select'
                              value={fs.snapshotVersion}
                              onChange={(evt) => {
                                console.log(evt.target.value);
                                this.props.feedSourcePropertyChanged(fs, 'snapshotVersion', evt.target.value)
                              }}
                            >
                              <option>{messages.properties.noneSelected}</option>
                              {this.state.snapshotVersions.map(snapshot => {
                                return <option value={snapshot.id} key={snapshot.id}>
                                  {snapshot.name}
                                </option>
                              })}
                            </Input>
                          </td>
                        </tr>
                      : null
                    }
                    <tr>
                      <td>{messages.properties.public}</td>
                      <td>
                        <Input
                          type='checkbox'
                          label='&nbsp;'
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
                        <Input
                          type='checkbox'
                          label='&nbsp;'
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
          </Panel>

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

          <Panel header={(<h3><Glyphicon glyph='list' /> {messages.versions}</h3>)}>
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
              newNotePostedForVersion={(version,note) => {
                this.props.newNotePostedForVersion(version, note)
              }}
              gtfsPlusDataRequested={(version) => {
                this.props.gtfsPlusDataRequested(version)
              }}
            />
          </Panel>

          {isModuleEnabled('editor')
            ? <ActiveEditorFeedSourcePanel
                feedSource={fs}
              />
            : null
          }

        </Grid>
      </ManagerPage>
    )
  }
}
