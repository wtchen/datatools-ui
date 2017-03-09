import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Grid, Row, Col, ListGroup, ListGroupItem, Button, Badge, Panel, Glyphicon, Tabs, Tab, FormControl, InputGroup, ControlLabel, FormGroup, Checkbox } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'

import ManagerPage from '../../common/components/ManagerPage'
import Breadcrumbs from '../../common/components/Breadcrumbs'
import ExternalPropertiesTable from './ExternalPropertiesTable'
import ManagerHeader from './ManagerHeader'
import ActiveFeedVersionNavigator from '../containers/ActiveFeedVersionNavigator'
import NotesViewer from './NotesViewer'
import ActiveEditorFeedSourcePanel from '../../editor/containers/ActiveEditorFeedSourcePanel'
import { isModuleEnabled, getComponentMessages, getMessage } from '../../common/util/config'
import toSentenceCase from '../../common/util/to-sentence-case'

export default class FeedSourceViewer extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    feedSourceId: PropTypes.string,
    feedVersionIndex: PropTypes.number,
    isFetching: PropTypes.bool,
    project: PropTypes.object,
    routeParams: PropTypes.object,
    user: PropTypes.object,
    activeComponent: PropTypes.string,
    activeSubComponent: PropTypes.string,

    componentDidUpdate: PropTypes.func,
    createDeployment: PropTypes.func,
    deleteFeedSource: PropTypes.func,
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
    fetchFeed: PropTypes.func,
    updateUserSubscription: PropTypes.func,
    uploadFeed: PropTypes.func,
    fetchValidationResult: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {}
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
    // this.setState({willMount: true})
  }
  componentDidMount () {
    this.setState({didMount: true})
  }
  componentDidUpdate (prevProps) {
    this.props.componentDidUpdate(prevProps, this.props)
    if (this.props.feedSource && this.state.didMount) {
      this.setState({didMount: false})
    }
  }
  confirmDeleteFeedSource (feedSource) {
    this.refs.page.showConfirmModal({
      title: 'Delete Feed Source?',
      body: 'Are you sure you want to delete this feed source? This action cannot be undone and all feed versions will be deleted.',
      onConfirm: () => {
        this.props.deleteFeedSource(feedSource)
        .then(() => browserHistory.push(`/project/${feedSource.projectId}`))
      }
    })
  }

  render () {
    const fs = this.props.feedSource
    if (this.props.isFetching && this.state.didMount) {
      return (
        <ManagerPage ref='page'>
          <Grid fluid>
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
              <Icon className='fa-5x fa-spin' type='refresh' />
            </h1>
          </Grid>
        </ManagerPage>
      )
    } else if (!fs) {
      return (
        <ManagerPage ref='page'>
          <Grid fluid>
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
    const {
      user,
      project,
      activeComponent,
      activeSubComponent,
      routeParams,
      feedSourcePropertyChanged,
      externalPropertyChanged,
      feedSource,
      feedVersionIndex,
      notesRequestedForFeedSource,
      updateUserSubscription,
      newNotePostedForFeedSource
    } = this.props
    const messages = getComponentMessages('FeedSourceViewer')
    const disabled = !user.permissions.hasFeedPermission(project.organizationId, project.id, fs.id, 'manage-feed')
    const isProjectAdmin = user.permissions.isProjectAdmin(project.id, project.organizationId)
    // const editGtfsDisabled = !user.permissions.hasFeedPermission(project.organizationId, project.id, fs.id, 'edit-gtfs')
    const autoFetchFeed = fs.retrievalMethod === 'FETCHED_AUTOMATICALLY'
    const resourceType = activeComponent === 'settings' && activeSubComponent && activeSubComponent.toUpperCase()
    const activeTab = ['settings', 'comments', 'snapshots'].indexOf(activeComponent) === -1 || typeof routeParams.feedVersionIndex !== 'undefined'
      ? ''
      : activeComponent
    // console.log(activeComponent, routeParams.feedVersionIndex)
    const activeSettings = !resourceType
      ? <Col xs={7}>
        <Panel header={<h3>Settings</h3>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup>
                <ControlLabel>Feed source name</ControlLabel>
                <InputGroup>
                  <FormControl
                    value={typeof this.state.name !== 'undefined' ? this.state.name : fs.name}
                    onChange={(evt) => {
                      this.setState({name: evt.target.value})
                    }}
                  />
                  <InputGroup.Button>
                    <Button
                      disabled={!this.state.name || this.state.name === fs.name} // disable if no change or no value.
                      onClick={() => {
                        feedSourcePropertyChanged(fs, 'name', this.state.name)
                        .then(() => this.setState({name: null}))
                      }}
                    >Rename</Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <FormGroup>
                <Checkbox checked={fs.deployable} onChange={() => feedSourcePropertyChanged(fs, 'deployable', !fs.deployable)}><strong>Make feed source deployable</strong></Checkbox>
                <small>Enable this feed source to be deployed to an OpenTripPlanner (OTP) instance (defined in organization settings) as part of a collection of feed sources or individually.</small>
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel header={<h3>Automatic fetch</h3>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup>
                <ControlLabel>Feed source fetch URL</ControlLabel>
                <InputGroup>
                  <FormControl
                    value={typeof this.state.url !== 'undefined' ? this.state.url : fs.url || ''}
                    onChange={(evt) => {
                      this.setState({url: evt.target.value})
                    }}
                  />
                  <InputGroup.Button>
                    <Button
                      disabled={this.state.url === fs.url} // disable if no change.
                      onClick={() => {
                        feedSourcePropertyChanged(fs, 'url', this.state.url)
                        .then(() => this.setState({url: null}))
                      }}
                    >Change URL</Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <FormGroup>
                <Checkbox checked={autoFetchFeed} onChange={() => feedSourcePropertyChanged(fs, 'retrievalMethod', autoFetchFeed ? 'MANUALLY_UPLOADED' : 'FETCHED_AUTOMATICALLY')} bsStyle='danger'><strong>Auto fetch feed source</strong></Checkbox>
                <small>Set this feed source to fetch automatically. (Feed source URL must be specified and project auto fetch must be enabled.)</small>
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel bsStyle='danger' header={<h3>Danger zone</h3>}>
          <ListGroup fill>
            <ListGroupItem>
              <Button onClick={() => feedSourcePropertyChanged(fs, 'isPublic', !fs.isPublic)} className='pull-right'>Make {fs.isPublic ? 'private' : 'public'}</Button>
              <h4>Make this feed source {fs.isPublic ? 'private' : 'public'}.</h4>
              <p>This feed source is currently {fs.isPublic ? 'public' : 'private'}.</p>
            </ListGroupItem>
            <ListGroupItem>
              <Button onClick={() => this.confirmDeleteFeedSource(fs)} className='pull-right' bsStyle='danger'><Icon type='trash' /> Delete feed source</Button>
              <h4>Delete this feed source.</h4>
              <p>Once you delete a feed source, it cannot be recovered.</p>
            </ListGroupItem>
          </ListGroup>
        </Panel>
      </Col>
      : <Col xs={7}>
        <ExternalPropertiesTable
          resourceType={resourceType}
          editingIsDisabled={disabled}
          isProjectAdmin={isProjectAdmin}
          resourceProps={fs.externalProperties[resourceType]}
          externalPropertyChanged={(name, value) => {
            externalPropertyChanged(fs, resourceType, name, value)
          }}
        />
      </Col>
    return (
      <ManagerPage
        breadcrumbs={
          <Breadcrumbs
            project={project}
            feedSource={feedSource}
          />
        }
        ref='page'
        title={feedSource.name}
        >
        <Grid fluid>
          <ManagerHeader
            {...this.props}
          />

          {/* Feed Versions tab */}
          <Tabs id='feed-source-viewer-tabs'
            style={{minHeight: '400px'}}
            activeKey={activeTab}
            onSelect={(eventKey => browserHistory.push(`/feed/${fs.id}/${eventKey}`))}
          >
            <Tab eventKey='' title={<span><Icon className='icon-link' type='database' /><span className='hidden-xs'>{getMessage(messages, 'gtfs')}</span></span>}>
              <Row>
                <Col xs={12}>
                  <ActiveFeedVersionNavigator
                    routeParams={routeParams}
                    feedSource={fs}
                    disabled={disabled}
                    versionIndex={feedVersionIndex}
                    deleteDisabled={disabled}
                    {...this.props}
                  />
                </Col>
              </Row>
            </Tab>

            {isModuleEnabled('editor')
              ? <Tab eventKey='snapshots'
                title={<span><Icon className='icon-link' type='pencil-square-o' /><span className='hidden-xs'>{getComponentMessages('EditorFeedSourcePanel').title} </span><Badge>{fs.editorSnapshots ? fs.editorSnapshots.length : 0}</Badge></span>}
              >
                <ActiveEditorFeedSourcePanel feedSource={fs} />
              </Tab>
              : null
            }
            {/* Comments for feed source */}
            <Tab eventKey='comments'
              title={<span><Glyphicon className='icon-link' glyph='comment' /><span className='hidden-xs'>{getComponentMessages('NotesViewer').title} </span><Badge>{fs.noteCount}</Badge></span>}
              onEnter={() => notesRequestedForFeedSource(fs)}
            >
              <NotesViewer
                type='feed-source'
                notes={fs.notes}
                feedSource={fs}
                user={user}
                updateUserSubscription={updateUserSubscription}
                noteCount={fs.noteCount}
                notesRequested={() => { notesRequestedForFeedSource(fs) }}
                newNotePosted={(note) => { newNotePostedForFeedSource(fs, note) }}
              />
            </Tab>
            {/* Settings */}
            <Tab eventKey='settings' title={<span><Glyphicon className='icon-link' glyph='cog' /><span className='hidden-xs'>{getMessage(messages, 'properties.title')}</span></span>}>
              <Row>
                <Col xs={3}>
                  <Panel>
                    <ListGroup fill>
                      <LinkContainer to={`/feed/${fs.id}/settings`} active={!activeSubComponent}><ListGroupItem>General</ListGroupItem></LinkContainer>
                      {Object.keys(fs.externalProperties || {}).map(resourceType => {
                        const resourceLowerCase = resourceType.toLowerCase()
                        return (
                          <LinkContainer key={resourceType} to={`/feed/${fs.id}/settings/${resourceLowerCase}`} active={activeSubComponent === resourceLowerCase}><ListGroupItem>{toSentenceCase(resourceType)} properties</ListGroupItem></LinkContainer>
                        )
                      })}
                    </ListGroup>
                  </Panel>
                </Col>
                <Col xs={6} />
                {activeSettings}
              </Row>
            </Tab>
          </Tabs>
        </Grid>
      </ManagerPage>
    )
  }
}
