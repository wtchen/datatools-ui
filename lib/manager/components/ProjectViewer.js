import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import {
  Button,
  ButtonToolbar,
  Col,
  Glyphicon,
  Grid,
  ListGroup,
  ListGroupItem,
  Panel,
  Row,
  Tab,
  Tabs
} from 'react-bootstrap'
import {browserHistory, Link} from 'react-router'
import {shallowEqual} from 'react-pure-render'

import ManagerPage from '../../common/components/ManagerPage'
import WatchButton from '../../common/containers/WatchButton'
import {
  getComponentMessages,
  getConfigProperty,
  getMessage,
  isModuleEnabled
} from '../../common/util/config'
import {defaultSorter} from '../../common/util/util'
import CreateFeedSource from './CreateFeedSource'
import DeploymentsPanel from './DeploymentsPanel'
import FeedSourceTable from './FeedSourceTable'
import ProjectFeedListToolbar from './ProjectFeedListToolbar'
import ProjectSettings from './ProjectSettings'

const messages = getComponentMessages('ProjectViewer')

export default class ProjectViewer extends Component {
  static propTypes = {
    activeComponent: PropTypes.string,
    activeSubComponent: PropTypes.string,
    createFeedSource: PropTypes.func,
    deployPublic: PropTypes.func,
    downloadMergedFeed: PropTypes.func,
    project: PropTypes.object,
    onComponentMount: PropTypes.func,
    searchTextChanged: PropTypes.func,
    thirdPartySync: PropTypes.func,
    updateAllFeeds: PropTypes.func,
    uploadFeed: PropTypes.func,
    user: PropTypes.object,
    visibilityFilter: PropTypes.object,
    visibilityFilterChanged: PropTypes.func
  }

  state = {}

  deleteFeedSource (feedSource) {
    this.refs['page'].showConfirmModal({
      title: 'Delete Feed Source?',
      body: `Are you sure you want to delete the feed source ${feedSource.name}?`,
      onConfirm: () => this.props.deleteFeedSourceConfirmed(feedSource)
    })
  }

  _selectTab = (key) => {
    if (key === 'sources') {
      browserHistory.push(`/project/${this.props.project.id}/`)
    } else {
      browserHistory.push(`/project/${this.props.project.id}/${key}`)
    }
    if (key === 'deployments' && !this.props.project.deployments) {
      this.props.deploymentsRequested()
    }
  }

  shouldComponentUpdate (newProps, nextState) {
    return !shallowEqual(newProps, this.props) || !shallowEqual(nextState, this.state)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  _onClickDeploy = () => this.props.deployPublic(this.props.project)

  _onSelectFilter = (key) => this.props.visibilityFilterChanged(key)

  _toggleCreateView = () => this.setState({ createMode: !this.state.createMode })

  render () {
    const {
      activeComponent,
      activeSubComponent,
      createFeedSource,
      project,
      user,
      visibilityFilter
    } = this.props
    if (!project) return <ManagerPage />
    const isWatchingProject = user.subscriptions.hasProjectSubscription(project.id, 'project-updated')
    const publicFeedsLink = `https://s3.amazonaws.com/${getConfigProperty('application.data.gtfs_s3_bucket')}/public/index.html`
    const projectEditDisabled = !user.permissions.isProjectAdmin(project.id, project.organizationId)
    const filteredFeedSources = project.feedSources
      ? project.feedSources.filter(feedSource => {
        if (feedSource.isCreating) return true // feeds actively being created are always visible
        const visible = feedSource.name !== null ? feedSource.name.toLowerCase().indexOf((visibilityFilter.searchText || '').toLowerCase()) !== -1 : '[unnamed project]'
        switch (visibilityFilter.filter) {
          case 'ALL':
            return visible
          case 'STARRED':
            return [].indexOf(feedSource.id) !== -1 // check userMetaData
          case 'PUBLIC':
            return feedSource.isPublic
          case 'PRIVATE':
            return !feedSource.isPublic
          default:
            return visible
        }
      }).sort(defaultSorter)
      : []
    return (
      <ManagerPage
        ref='page'
        title={project.name}>
        <Grid fluid>
          <Row className='project-header'>
            <Col xs={12}>
              <h3>
                <Icon className='icon-link' type='folder-open-o' />
                <Link to={`/project/${project.id}`}>{project.name}</Link>
                <ButtonToolbar className={`pull-right`}>
                  {getConfigProperty('application.notifications_enabled')
                  ? <WatchButton
                    isWatching={isWatchingProject}
                    user={user}
                    target={project.id}
                    subscriptionType='project-updated' />
                  : null
                }
                </ButtonToolbar>
              </h3>
              <ul className='list-unstyled list-inline small' style={{marginBottom: '0px'}}>
                <li><Icon type='map-marker' /> {project.defaultLocationLon ? `${project.defaultLocationLat}, ${project.defaultLocationLon}` : 'n/a'}</li>
                <li><Icon type='cloud-download' /> {project.autoFetchFeeds ? `${project.autoFetchHour}:${project.autoFetchMinute < 10 ? '0' + project.autoFetchMinute : project.autoFetchMinute}` : 'Auto fetch disabled'}</li>
                {/* <li><Icon type='file-archive-o' /> {fs.feedVersions ? `${this.getAverageFileSize(fs.feedVersions)} MB` : 'n/a'}</li> */}
              </ul>
            </Col>
          </Row>
          <Tabs
            id='project-viewer-tabs'
            activeKey={activeComponent || 'sources'}
            onSelect={this._selectTab}>
            <Tab
              eventKey='sources'
              title={
                <span>
                  <Glyphicon className='icon-link' glyph='list' />
                  <span className='hidden-xs'>{getMessage(messages, 'feeds.title')}</span>
                </span>
              }>
              <Row>
                <Col xs={12} sm={9}>
                  {this.state.createMode
                    ? (
                      <CreateFeedSource
                        createFeedSource={createFeedSource}
                        onCancel={this._toggleCreateView}
                        projectId={project.id}
                        />
                    )
                    : (
                      <Panel
                        header={
                          <ProjectFeedListToolbar
                            {...this.props}
                            onNewFeedSourceClick={this._toggleCreateView}
                            />
                        }
                        >
                        <FeedSourceTable
                          fill
                          {...this.props}
                          feedSources={filteredFeedSources}
                          onNewFeedSourceClick={this._toggleCreateView}
                          />
                      </Panel>
                    )
                  }
                </Col>
                <Col xs={12} sm={3}>
                  {isModuleEnabled('enterprise') && !projectEditDisabled &&
                    <div style={{marginBottom: '20px'}}>
                      <Button
                        bsStyle='primary'
                        block
                        style={{marginBottom: '5px'}}
                        onClick={this._onClickDeploy}>
                        <Icon type='users' /> {getMessage(messages, 'makePublic')}
                      </Button>
                      <p className='small'>
                        <strong>Note:</strong> Public feeds page can be viewed <a target='_blank' href={publicFeedsLink}>here</a>.
                      </p>
                    </div>
                  }
                  <ProjectSummaryPanel
                    project={project}
                    feedSources={project.feedSources || []} />
                  <Panel header={<h3>What is a feed source?</h3>}>
                    A feed source defines the location or upstream source of a GTFS feed. GTFS can be populated via automatic fetch, directly editing or uploading a zip file.
                  </Panel>
                </Col>
              </Row>
            </Tab>
            {isModuleEnabled('deployment')
              ? <Tab
                eventKey='deployments'
                disabled={projectEditDisabled}
                title={<span><Glyphicon className='icon-link' glyph='globe' /><span className='hidden-xs'>{getMessage(messages, 'deployments')}</span></span>}>
                <DeploymentsPanel
                  deployments={project.deployments}
                  expanded={activeComponent === 'deployments'}
                  {...this.props} />
              </Tab>
              : null
            }
            <Tab
              eventKey='settings'
              disabled={projectEditDisabled}
              title={
                <span>
                  <Glyphicon className='icon-link' glyph='cog' />
                  <span className='hidden-xs'>{getMessage(messages, 'settings')}</span>
                </span>
              }>
              <ProjectSettings
                activeSettingsPanel={activeSubComponent}
                projectEditDisabled={projectEditDisabled}
                {...this.props} />
            </Tab>
          </Tabs>
        </Grid>
      </ManagerPage>
    )
  }
}

class ProjectSummaryPanel extends Component {
  render () {
    const { project, feedSources } = this.props
    const errorCount = feedSources.map(fs => fs.latestValidation ? fs.latestValidation.errorCount : 0).reduce((a, b) => a + b, 0)
    const serviceSeconds = feedSources.map(fs => fs.latestValidation ? fs.latestValidation.avgDailyRevenueTime : 0).reduce((a, b) => a + b, 0)
    return (
      <Panel header={<h3>{project.name} summary</h3>}>
        <ListGroup fill>
          <ListGroupItem>Number of feeds: {feedSources.length}</ListGroupItem>
          <ListGroupItem>Total errors: {errorCount}</ListGroupItem>
          <ListGroupItem>Total service: {Math.floor(serviceSeconds / 60 / 60 * 100) / 100} hours per weekday</ListGroupItem>
        </ListGroup>
      </Panel>
    )
  }
}
