import React, {Component, PropTypes} from 'react'
import Helmet from 'react-helmet'
import { Tabs, Tab, Grid, Row, Col, Button, InputGroup, ListGroup, ListGroupItem, FormControl, Glyphicon, ButtonToolbar, Panel, DropdownButton, MenuItem } from 'react-bootstrap'
import { sentence as toSentenceCase } from 'change-case'
import {Icon} from '@conveyal/woonerf'
import { browserHistory, Link } from 'react-router'
import { shallowEqual } from 'react-pure-render'

import ManagerPage from '../../common/components/ManagerPage'
import Breadcrumbs from '../../common/components/Breadcrumbs'
import WatchButton from '../../common/containers/WatchButton'
import ProjectSettings from './ProjectSettings'
import DeploymentsPanel from './DeploymentsPanel'
import FeedSourceTable from './FeedSourceTable'
import ThirdPartySyncButton from './ThirdPartySyncButton'
import { defaultSorter } from '../../common/util/util'
import { isModuleEnabled, isExtensionEnabled, getComponentMessages, getMessage, getConfigProperty } from '../../common/util/config'

export default class ProjectViewer extends Component {
  static propTypes = {
    project: PropTypes.object,
    onComponentMount: PropTypes.func,

    visibilityFilter: PropTypes.object,
    visibilityFilterChanged: PropTypes.func,
    searchTextChanged: PropTypes.func
  }
  constructor (props) {
    super(props)

    this.state = {}
  }

  deleteFeedSource (feedSource) {
    this.refs['page'].showConfirmModal({
      title: 'Delete Feed Source?',
      body: `Are you sure you want to delete the feed source ${feedSource.name}?`,
      onConfirm: () => {
        console.log('OK, deleting')
        this.props.deleteFeedSourceConfirmed(feedSource)
      }
    })
  }
  _selectTab (key) {
    if (key === 'sources') {
      browserHistory.push(`/project/${this.props.project.id}/`)
    } else {
      browserHistory.push(`/project/${this.props.project.id}/${key}`)
    }
    if (key === 'deployments' && !this.props.project.deployments) {
      this.props.deploymentsRequested()
    }
  }
  showUploadFeedModal (feedSource) {
    this.refs.page.showSelectFileModal({
      title: 'Upload Feed',
      body: 'Select a GTFS feed to upload:',
      onConfirm: (files) => {
        let nameArray = files[0].name.split('.')
        if (files[0].type !== 'application/zip' || nameArray[nameArray.length - 1] !== 'zip') {
          return false
        } else {
          this.props.uploadFeedClicked(feedSource, files[0])
          return true
        }
      },
      errorMessage: 'Uploaded file must be a valid zip file (.zip).'
    })
  }
  shouldComponentUpdate (newProps) {
    if (!shallowEqual(newProps, this.props)) {
      return true
    } else {
      return false
    }
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  render () {
    if (!this.props.project) {
      return <ManagerPage />
    }
    const messages = getComponentMessages('ProjectViewer')
    const isWatchingProject = this.props.user.subscriptions.hasProjectSubscription(this.props.project.id, 'project-updated')
    const projectEditDisabled = !this.props.user.permissions.isProjectAdmin(this.props.project.id)
    const filteredFeedSources = this.props.project.feedSources
      ? this.props.project.feedSources.filter(feedSource => {
        if (feedSource.isCreating) return true // feeds actively being created are always visible
        let visible = feedSource.name !== null ? feedSource.name.toLowerCase().indexOf((this.props.visibilityFilter.searchText || '').toLowerCase()) !== -1 : '[unnamed project]'
        switch (this.props.visibilityFilter.filter) {
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
    const projectsHeader = (
      <Row>
        <Col xs={4}>
          <InputGroup>
            <DropdownButton
              componentClass={InputGroup.Button}
              id='input-dropdown-addon'
              title={this.props.visibilityFilter.filter ? toSentenceCase(this.props.visibilityFilter.filter) : 'Filter'}
              onSelect={(key) => {
                this.props.visibilityFilterChanged(key)
              }}
            >
              <MenuItem eventKey='ALL'>All</MenuItem>
              <MenuItem eventKey='STARRED'>Starred</MenuItem>
              <MenuItem eventKey='PUBLIC'>Public</MenuItem>
              <MenuItem eventKey='PRIVATE'>Private</MenuItem>
            </DropdownButton>
            <FormControl
              placeholder={getMessage(messages, 'feeds.search')}
              onChange={evt => this.props.searchTextChanged(evt.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs={8}>
          <Button
            bsStyle='primary'
            disabled={projectEditDisabled}
            className='pull-right'
            onClick={() => this.props.onNewFeedSourceClick()}
          >
            <Glyphicon glyph='plus' /> {getMessage(messages, 'feeds.new')}
          </Button>
          <ButtonToolbar>
            {isExtensionEnabled('transitland') || isExtensionEnabled('transitfeeds') || isExtensionEnabled('mtc')
              ? <ThirdPartySyncButton
                projectEditDisabled={projectEditDisabled}
                thirdPartySync={this.props.thirdPartySync}
              />
              : null
            }
            <Button
              bsStyle='default'
              disabled={projectEditDisabled}
              onClick={() => {
                this.props.updateAllFeeds(this.props.project)
              }}
            >
              <Icon type='cloud-download' /> {getMessage(messages, 'feeds.update')}
            </Button>
            <Button
              bsStyle='primary'
              onClick={() => { this.props.downloadMergedFeed(this.props.project) }}
            >
              <Glyphicon glyph='download' /> {getMessage(messages, 'mergeFeeds')}
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    )
    return (
      <ManagerPage ref='page'
        breadcrumbs={
          <Breadcrumbs
            project={this.props.project}
          />
        }
      >
        <Helmet
          title={this.props.project.name}
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
          >
            <Col xs={12}>
              <h3>
                <Icon className='icon-link' type='folder-open-o' /><Link to={`/project/${this.props.project.id}`}>{this.props.project.name}</Link>
                <ButtonToolbar
                  className={`pull-right`}
                >
                  {getConfigProperty('application.notifications_enabled')
                  ? <WatchButton
                    isWatching={isWatchingProject}
                    user={this.props.user}
                    target={this.props.project.id}
                    subscriptionType='project-updated'
                  />
                  : null
                }
                </ButtonToolbar>
              </h3>
              <ul className='list-unstyled list-inline small' style={{marginBottom: '0px'}}>
                <li><Icon type='map-marker' /> {this.props.project.defaultLocationLon ? `${this.props.project.defaultLocationLat}, ${this.props.project.defaultLocationLon}` : 'n/a'}</li>
                <li><Icon type='cloud-download' /> {this.props.project.autoFetchFeeds ? `${this.props.project.autoFetchHour}:${this.props.project.autoFetchMinute < 10 ? '0' + this.props.project.autoFetchMinute : this.props.project.autoFetchMinute}` : 'Auto fetch disabled'}</li>
                {/*
                  <li><Icon type='file-archive-o' /> {fs.feedVersions ? `${this.getAverageFileSize(fs.feedVersions)} MB` : 'n/a'}</li>
                */}
              </ul>
            </Col>
          </Row>
          <Tabs
            id='project-viewer-tabs'
            activeKey={this.props.activeComponent ? this.props.activeComponent : 'sources'}
            onSelect={(key) => this._selectTab(key)}
          >
            <Tab
              eventKey='sources'
              title={
                <span>
                  <Glyphicon className='icon-link' glyph='list' />
                  <span className='hidden-xs'>{getMessage(messages, 'feeds.title')}</span>
                </span>
              }
            >
              <Row>
                <Col xs={12} sm={9}>
                  <Panel header={projectsHeader}>
                    <FeedSourceTable fill {...this.props} feedSources={filteredFeedSources} />
                  </Panel>
                </Col>
                <Col xs={12} sm={3}>
                  <ProjectSummaryPanel
                    project={this.props.project}
                    feedSources={this.props.project.feedSources || []}
                  />
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
                title={<span><Glyphicon className='icon-link' glyph='globe' /><span className='hidden-xs'>{getMessage(messages, 'deployments')}</span></span>}
              >
                <DeploymentsPanel
                  deployments={this.props.project.deployments}
                  expanded={this.props.activeComponent === 'deployments'}
                  {...this.props}
                />
              </Tab>
              : null
            }
            <Tab
              eventKey='settings'
              disabled={projectEditDisabled}
              title={<span><Glyphicon className='icon-link' glyph='cog' /><span className='hidden-xs'>{getMessage(messages, 'settings')}</span></span>}
            >
              <ProjectSettings
                activeSettingsPanel={this.props.activeSubComponent}
                projectEditDisabled={projectEditDisabled}
                {...this.props}
              />
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
