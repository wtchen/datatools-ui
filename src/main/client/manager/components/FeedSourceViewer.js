import React, {Component, PropTypes} from 'react'
import {Icon} from '@conveyal/woonerf'
import Helmet from 'react-helmet'
import { sentence as toSentenceCase } from 'change-case'
import { LinkContainer } from 'react-router-bootstrap'
import { Grid, Row, Col, ListGroup, ListGroupItem, Button, Badge, Panel, Glyphicon, ButtonToolbar, Tabs, Tab, FormControl, InputGroup, ControlLabel, FormGroup, Checkbox } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'
import moment from 'moment'
import numeral from 'numeral'

import ManagerPage from '../../common/components/ManagerPage'
import Breadcrumbs from '../../common/components/Breadcrumbs'
import WatchButton from '../../common/containers/WatchButton'
import StarButton from '../../common/containers/StarButton'
import ExternalPropertiesTable from './ExternalPropertiesTable'
import ActiveFeedVersionNavigator from '../containers/ActiveFeedVersionNavigator'
import NotesViewer from './NotesViewer'
import ActiveEditorFeedSourcePanel from '../../editor/containers/ActiveEditorFeedSourcePanel'
import { isModuleEnabled, getComponentMessages, getMessage, getConfigProperty } from '../../common/util/config'

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

  getAverageFileSize (feedVersions) {
    let sum = 0
    let avg
    if (feedVersions) {
      for (var i = 0; i < feedVersions.length; i++) {
        sum += feedVersions[i].fileSize
      }
      avg = sum / feedVersions.length
    }
    return numeral(avg || 0).format('0 b')
  }
  confirmDeleteFeedSource (feedSource) {
    this.refs['page'].showConfirmModal({
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

    const messages = getComponentMessages('FeedSourceViewer')
    const disabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'manage-feed')
    const isWatchingFeed = this.props.user.subscriptions.hasFeedSubscription(this.props.project.id, fs.id, 'feed-updated')
    const editGtfsDisabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'edit-gtfs')
    const dateFormat = getConfigProperty('application.date_format')
    const autoFetchFeed = fs.retrievalMethod === 'FETCHED_AUTOMATICALLY'
    const resourceType = this.props.activeComponent === 'settings' && this.props.activeSubComponent && this.props.activeSubComponent.toUpperCase()
    const activeTab = ['settings', 'comments', 'snapshots'].indexOf(this.props.activeComponent) === -1 || typeof this.props.routeParams.feedVersionIndex !== 'undefined'
      ? ''
      : this.props.activeComponent
    // console.log(this.props.activeComponent, this.props.routeParams.feedVersionIndex)
    const activeSettings = !resourceType
      ? <Col xs={7}>
        <Panel header={<h3>Settings</h3>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup inline>
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
                        this.props.feedSourcePropertyChanged(fs, 'name', this.state.name)
                        .then(() => this.setState({name: null}))
                      }}
                    >Rename</Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <FormGroup>
                <Checkbox checked={fs.deployable} onChange={() => this.props.feedSourcePropertyChanged(fs, 'deployable', !fs.deployable)}><strong>Make feed source deployable</strong></Checkbox>
                <small>Enable this feed source to be deployed to an OpenTripPlanner (OTP) instance (defined in organization settings) as part of a collection of feed sources or individually.</small>
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel header={<h3>Automatic fetch</h3>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup inline>
                <ControlLabel>Feed source fetch URL</ControlLabel>
                <InputGroup>
                  <FormControl
                    value={typeof this.state.url !== 'undefined' ? this.state.url : fs.url}
                    onChange={(evt) => {
                      this.setState({url: evt.target.value})
                    }}
                  />
                  <InputGroup.Button>
                    <Button
                      disabled={this.state.url === fs.url} // disable if no change.
                      onClick={() => {
                        this.props.feedSourcePropertyChanged(fs, 'url', this.state.url)
                        .then(() => this.setState({url: null}))
                      }}
                    >Change URL</Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <FormGroup>
                <Checkbox checked={autoFetchFeed} onChange={() => this.props.feedSourcePropertyChanged(fs, 'retrievalMethod', autoFetchFeed ? 'MANUALLY_UPLOADED' : 'FETCHED_AUTOMATICALLY')} bsStyle='danger'><strong>Auto fetch feed source</strong></Checkbox>
                <small>Set this feed source to fetch automatically. (Feed source URL must be specified and project auto fetch must be enabled.)</small>
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel bsStyle='danger' header={<h3>Danger zone</h3>}>
          <ListGroup fill>
            <ListGroupItem>
              <Button onClick={() => this.props.feedSourcePropertyChanged(fs, 'isPublic', !fs.isPublic)} className='pull-right'>Make {fs.isPublic ? 'private' : 'public'}</Button>
              <h4>Make this feed source {fs.isPublic ? 'private' : 'public'}.</h4>
              <p>This feed source is currently {fs.isPublic ? 'public' : 'private'}.</p>
            </ListGroupItem>
            <ListGroupItem>
              <Button onClick={() => this.confirmDeleteFeedSource(fs)} className='pull-right' bsStyle='danger'><Icon type='trash'/> Delete feed source</Button>
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
            resourceProps={fs.externalProperties[resourceType]}
            externalPropertyChanged={(name, value) => {
              this.props.externalPropertyChanged(fs, resourceType, name, value)
            }}
          />
        </Col>
    return (
      <ManagerPage ref='page'
        breadcrumbs={
          <Breadcrumbs
            project={this.props.project}
            feedSource={this.props.feedSource}
          />
        }
      >
      <Helmet
        title={this.props.feedSource.name}
      />
        <Grid fluid>
          <Row
            style={{
              backgroundColor: '#F5F5F5',
              margin: '-40px',
              paddingTop: '40px',
              marginBottom: '-64px',
              paddingBottom: '60px',
              paddingRight: '20px',
              paddingLeft: '20px',
              borderBottom: '1px #e3e3e3 solid'
            }}
          > {/*  Title + Shortcut Buttons Row */}
            <Col xs={12}>
              <h3>
                <Icon className='icon-link' name='folder-open-o'/>
                <Link to={`/project/${this.props.project.id}`}>{this.props.project.name}</Link>
                {' '}/{' '}
                <Link to={`/feed/${fs.id}`}>{fs.name}</Link>{' '}
                {fs.isPublic ? null : <Icon className='text-warning' title='This feed source and all its versions are private.' name='lock'/>}
                {' '}
                {fs.editedSinceSnapshot
                  ? <Icon style={{display: 'inline-block', paddingBottom: '3px', verticalAlign: 'middle', fontSize: '50%'}} className='text-warning' title='There are unpublished edits for this feed source.' name='circle'/>
                  : <Icon style={{display: 'inline-block', paddingBottom: '3px', verticalAlign: 'middle', fontSize: '50%'}} className='text-success' title='No edits since last publish.' name='circle'/>
                }
                <ButtonToolbar
                  className={`pull-right`}
                >
                  <StarButton
                    isStarred
                    user={this.props.user}
                    target={fs.id}
                  />

                  <WatchButton
                    isWatching={isWatchingFeed}
                    user={this.props.user}
                    target={fs.id}
                    subscriptionType='feed-updated'
                  />
                  <Button><Icon type='thumbs-o-up'/></Button>
                </ButtonToolbar>
              </h3>
              <ul className='list-unstyled list-inline small' style={{marginBottom: '0px'}}>
                <li><Icon type='clock-o'/> {fs.lastUpdated ? moment(fs.lastUpdated).format(dateFormat) : 'n/a'}</li>
                <li><Icon type='link'/> {fs.url ? fs.url : '(none)'}
                </li>
                {<li><Icon type='file-archive-o'/> {this.getAverageFileSize(fs.feedVersions)}</li>}
              </ul>
              {/*<li><Icon type='list-ol'/> {fs.feedVersionCount}</li><small style={{marginLeft: '30px'}}><Icon type='link'/> <a href={fs.url}>{fs.url}</a></small>*/}
            </Col>
          </Row>

          {/* Feed Versions tab */}
          <Tabs id='feed-source-viewer-tabs'
            style={{minHeight: '400px'}}
            activeKey={activeTab}
            onSelect={(eventKey => browserHistory.push(`/feed/${fs.id}/${eventKey}`))}
          >
            <Tab eventKey='' title={<span><Icon className='icon-link' name='database'/><span className='hidden-xs'>{getMessage(messages, 'gtfs')}</span></span>}>
              <Row>
                {/*<Col xs={12} sm={3}>
                  <Well bsSize='small'>
                    <h4>Feed Summary</h4>
                    <ul className='list-unstyled small'>
                      <li><b>Last Updated:</b> {fs.lastUpdated ? moment(fs.lastUpdated).format(dateFormat) : 'n/a'}</li>
                      <li><b>Number of versions:</b> {fs.feedVersionCount}</li>
                      <hr style={{marginTop: '5px', marginBottom: '0px'}}/>
                      <li><b>URL:</b> <EditableTextField
                          value={fs.url}
                          inline
                          maxLength={25}
                          disabled={disabled}
                          onChange={(value) => this.props.feedSourcePropertyChanged(fs, 'url', value)}
                        />
                      </li>
                    </ul>
                  </Well>
                </Col>*/}

                <Col xs={12} sm={7} style={{maxHeight: '200px', overflowY: 'hidden'}}>
                  {/*<Image
                    style={{
                      position: 'relative',
                      top: '50%',
                      transform: 'translateY(-30%)'
                    }}
                    responsive
                    src={mapUrl}
                  />*/}
                  {/*
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
                      onClick={(evt) => { this.props.fetchFeed(fs) }}
                    >
                      <Glyphicon glyph='download' /> Fetch
                    </Button>
                  </ButtonToolbar>
                  <Row style={{ marginTop: 12 }}>
                    <Col xs={12} sm={12}>
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
                  */}
                </Col>

                <Col xs={12} sm={2}>
                  {/*<Row>
                    <Col xs={12}>
                      <ButtonToolbar style={{marginBottom: '10px'}}>
                        <Button block bsSize='large' bsStyle='info'><Glyphicon glyph='pencil'/> Edit feed</Button>
                      </ButtonToolbar>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <h5>Create new version</h5>
                      <ul className='list-unstyled'>
                        <li><Button onClick={(evt) => { this.showUploadFeedModal() }} style={{margin: '0px', padding: '0px'}} bsStyle='link'><Glyphicon glyph='upload'/> Upload file</Button></li>
                        <li><Button style={{margin: '0px', padding: '0px'}} bsStyle='link'><Glyphicon glyph='download'/> Fetch by URL</Button></li>
                        <hr style={{marginTop: '5px', marginBottom: '5px'}}/>
                        <li><Button style={{margin: '0px', padding: '0px'}} bsStyle='link'><Glyphicon glyph='camera'/> Load from snapshot</Button></li>
                      </ul>
                    </Col>
                  </Row>*/}
                  {/*<ButtonToolbar className='pull-right'>
                    <DropdownButton
                      pullRight
                      title={<span><Icon type='plus'/> New version</span>}
                    >
                      <MenuItem><Glyphicon glyph='upload'/> Upload</MenuItem>
                      <MenuItem><Glyphicon glyph='download'/> Fetch</MenuItem>
                      <MenuItem divider />
                      <MenuItem><Glyphicon glyph='camera'/> From snapshot</MenuItem>
                    </DropdownButton>
                  </ButtonToolbar>
                  */}
                </Col>
              </Row>
              {/*<Panel>
                12 Versions
              </Panel>*/}
              <Row>
                <Col xs={12}>
                  <ActiveFeedVersionNavigator
                    routeParams={this.props.routeParams}
                    feedSource={fs}
                    disabled={disabled}
                    versionIndex={this.props.feedVersionIndex}
                    deleteDisabled={disabled}
                    {...this.props}
                  />
                </Col>
                {/* <Col xs={3}>
                  <Panel header={<h3><Icon type='camera'/> Snapshots</h3>}>
                    <ListGroup fill>
                      <ListGroupItem>
                        Snapshot 1
                      </ListGroupItem>
                    </ListGroup>
                  </Panel>
                </Col> */}
              </Row>
            </Tab>

            {isModuleEnabled('editor')
              ? <Tab eventKey='snapshots'
                  title={<span><Icon className='icon-link' name='pencil-square-o' /><span className='hidden-xs'>{getComponentMessages('EditorFeedSourcePanel').title} </span><Badge>{fs.editorSnapshots ? fs.editorSnapshots.length : 0}</Badge></span>}
                >
                  <ActiveEditorFeedSourcePanel feedSource={fs} />
                </Tab>
              : null
            }
            {/* Comments for feed source */}
            <Tab eventKey='comments'
              title={<span><Glyphicon className='icon-link' glyph='comment' /><span className='hidden-xs'>{getComponentMessages('NotesViewer').title} </span><Badge>{fs.noteCount}</Badge></span>}
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
            {/* Settings */}
            <Tab eventKey='settings' title={<span><Glyphicon className='icon-link' glyph='cog' /><span className='hidden-xs'>{getMessage(messages, 'properties.title')}</span></span>}>
              <Row>
                <Col xs={3}>
                <Panel>
                  <ListGroup fill>
                  <LinkContainer to={`/feed/${fs.id}/settings`} active={!this.props.activeSubComponent}><ListGroupItem>General</ListGroupItem></LinkContainer>
                  {Object.keys(fs.externalProperties || {}).map(resourceType => {
                    const resourceLowerCase = resourceType.toLowerCase()
                    return (
                      <LinkContainer to={`/feed/${fs.id}/settings/${resourceLowerCase}`} active={this.props.activeSubComponent === resourceLowerCase}><ListGroupItem>{toSentenceCase(resourceType)} properties</ListGroupItem></LinkContainer>
                    )
                  })}
                  </ListGroup>
                </Panel>
                </Col>
                <Col xs={6}>
                {/*
                  <Table striped style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th className='col-md-4'>{getMessage(messages, 'properties.property')}</th>
                        <th className='col-md-8'>{getMessage(messages, 'properties.value')}</th>
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
                        <td>{getMessage(messages, 'properties.retrievalMethod.title')}</td>
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
                                    disabled={disabled || typeof this.props.fetchFeed === 'undefined'}
                                    onClick={(evt) => { this.props.fetchFeed(fs) }}
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

                      <tr>
                        <td>{getMessage(messages, 'properties.public')}</td>
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
                        <td>{getMessage(messages, 'properties.deployable')}</td>
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
                */}
                </Col>
                {activeSettings}
                {/*
                <Col xs={12} sm={6}>
                  {Object.keys(fs.externalProperties || {}).map(resourceType => {
                    return (
                      <ExternalPropertiesTable
                        resourceType={resourceType}
                        editingIsDisabled={disabled}
                        resourceProps={fs.externalProperties[resourceType]}
                        externalPropertyChanged={(name, value) => {
                          this.props.externalPropertyChanged(fs, resourceType, name, value)
                        }}
                      />
                    )
                  })}
                </Col>*/}

              </Row>
            </Tab>
          </Tabs>
        </Grid>
      </ManagerPage>
    )
  }
}
