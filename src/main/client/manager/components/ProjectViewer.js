import React, {Component, PropTypes} from 'react'
import Helmet from 'react-helmet'
import moment from 'moment'
import { Tabs, Tab, Grid, Row, Col, Button, Table, FormControl, Checkbox, Panel, Glyphicon, Badge, ButtonInput, ButtonToolbar, form, SplitButton, MenuItem } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'
import Icon from 'react-fa'

import ManagerPage from '../../common/components/ManagerPage'
import Breadcrumbs from '../../common/components/Breadcrumbs'
import WatchButton from '../../common/containers/WatchButton'
import ProjectSettings from './ProjectSettings'
import EditableTextField from '../../common/components/EditableTextField'
import { defaultSorter, retrievalMethodString } from '../../common/util/util'
import { isModuleEnabled, isExtensionEnabled } from '../../common/util/config'

export default class ProjectViewer extends Component {

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
  showUploadFeedModal (feedSource) {
    this.refs.page.showSelectFileModal({
      title: 'Upload Feed',
      body: 'Select a GTFS feed to upload:',
      onConfirm: (files) => {
        let nameArray = files[0].name.split('.')
        if (files[0].type !== 'application/zip' || nameArray[nameArray.length - 1] !== 'zip') {
          return false
        }
        else {
          this.props.uploadFeedClicked(feedSource, files[0])
          return true
        }
      },
      errorMessage: 'Uploaded file must be a valid zip file (.zip).'
    })
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {

    if(!this.props.project) {
      return <ManagerPage />
    }
    const messages = DT_CONFIG.messages.active.ProjectViewer
    const isWatchingProject = this.props.user.subscriptions.hasProjectSubscription(this.props.project.id, 'project-updated')
    const projectEditDisabled = !this.props.user.permissions.isProjectAdmin(this.props.project.id)
    const filteredFeedSources = this.props.project.feedSources
      ? this.props.project.feedSources.filter(feedSource => {
          if(feedSource.isCreating) return true // feeds actively being created are always visible
          return feedSource.name !== null ? feedSource.name.toLowerCase().indexOf((this.props.visibilitySearchText || '').toLowerCase()) !== -1 : '[unnamed project]'
        }).sort(defaultSorter)
      : []

    return (
      <ManagerPage ref='page'>
      <Helmet
        title={this.props.project.name}
      />
        <Grid>
          <Row>
            <Col xs={12}>
              <Breadcrumbs
                project={this.props.project}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: 12, marginBottom: 24 }}>
                {this.props.project.name}
                <ButtonToolbar
                  className={`pull-right`}
                >
                  <WatchButton
                    isWatching={isWatchingProject}
                    user={this.props.user}
                    target={this.props.project.id}
                    subscriptionType='project-updated'
                  />
                  <Button
                    bsStyle='primary'
                    onClick={() => { this.props.downloadMergedFeed(this.props.project) }}
                  >
                    <Glyphicon glyph='download'/> {messages.mergeFeeds}
                  </Button>
                </ButtonToolbar>
              </h2>
            </Col>
          </Row>
          <Tabs
            activeKey={this.props.activeComponent ? this.props.activeComponent : 'sources'}
            onSelect={(key) => {
              if (key === 'sources') {
                browserHistory.push(`/project/${this.props.project.id}/`)
              }
              else {
                browserHistory.push(`/project/${this.props.project.id}/${key}`)
              }
              if (key === 'deployments') {
                this.props.deploymentsRequested()
              }
            }}
          >
            <Tab
              eventKey='sources' title={<span><Glyphicon glyph='list' /> {messages.feeds.title}</span>}
            >
                <Row>
                  <Col xs={4}>
                    <FormControl
                      placeholder={messages.feeds.search}
                      onChange={evt => this.props.searchTextChanged(evt.target.value)}
                    />
                  </Col>
                  <Col xs={8}>
                    <Button
                      bsStyle='primary'
                      disabled={projectEditDisabled}
                      className='pull-right'
                      onClick={() => this.props.onNewFeedSourceClick()}
                    >
                      {messages.feeds.new}
                    </Button>
                    <ButtonToolbar>
                      {isExtensionEnabled('transitland')
                        ? <Button
                            bsStyle='primary'
                            disabled={projectEditDisabled}
                            id='TRANSITLAND'
                            onClick={(evt) => {
                              this.props.thirdPartySync('TRANSITLAND')
                            }}
                          >
                            <Glyphicon glyph='refresh' /> transit.land
                          </Button>
                        : null
                      }
                      {isExtensionEnabled('transitfeeds')
                        ? <Button
                            bsStyle='primary'
                            disabled={projectEditDisabled}
                            id='TRANSITFEEDS'
                            onClick={(evt) => {
                              this.props.thirdPartySync('TRANSITFEEDS')
                            }}
                          >
                            <Glyphicon glyph='refresh' /> transitfeeds.com
                          </Button>
                        : null
                      }
                      {isExtensionEnabled('mtc')
                        ? <Button
                            bsStyle='primary'
                            disabled={projectEditDisabled}
                            id='MTC'
                            onClick={(evt) => {
                              this.props.thirdPartySync('MTC')
                            }}
                          >
                            <Glyphicon glyph='refresh' /> MTC
                          </Button>
                        : null
                      }
                      <Button
                        bsStyle='default'
                        disabled={projectEditDisabled}
                        onClick={() => {
                          console.log(this.props.project)
                          this.props.updateAllFeeds(this.props.project)
                        }}
                      >
                        <Glyphicon glyph='refresh' /> {messages.feeds.update}
                      </Button>
                    </ButtonToolbar>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th className='col-md-4'>Name</th>
                          <th>{messages.feeds.table.public}</th>
                          <th>{messages.feeds.table.deployable}</th>
                          <th>{messages.feeds.table.retrievalMethod}</th>
                          <th>{messages.feeds.table.lastUpdated}</th>
                          <th>{messages.feeds.table.errorCount}</th>
                          <th>{messages.feeds.table.validRange}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFeedSources.map((feedSource) => {
                          return <FeedSourceTableRow
                            feedSource={feedSource}
                            project={this.props.project}
                            key={feedSource.id}
                            user={this.props.user}
                            newFeedSourceNamed={this.props.newFeedSourceNamed}
                            feedSourcePropertyChanged={this.props.feedSourcePropertyChanged}
                            deleteFeedSourceClicked={() => this.deleteFeedSource(feedSource)}
                            uploadFeedSourceClicked={() => this.showUploadFeedModal(feedSource)}
                          />
                        })}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
            </Tab>
            <Tab
              eventKey='settings' title={<span><Glyphicon glyph='cog'/> {messages.settings}</span>}
            >
              <ProjectSettings
                project={this.props.project}
                expanded={this.props.activeComponent === 'settings'}
                updateProjectSettings={this.props.updateProjectSettings}
                projectEditDisabled={projectEditDisabled}
              />
            </Tab>
            {isModuleEnabled('deployment')
              ? <Tab
                  eventKey='deployments' title={<span><Glyphicon glyph='globe' /> {messages.deployments}</span>}
                >
                  <DeploymentsPanel
                    deployments={this.props.project.deployments}
                    expanded={this.props.activeComponent === 'deployments'}
                    deleteDeploymentConfirmed={this.props.deleteDeploymentConfirmed}
                    deploymentsRequested={this.props.deploymentsRequested}
                    onNewDeploymentClick={this.props.onNewDeploymentClick}
                    newDeploymentNamed={this.props.newDeploymentNamed}
                  />
                </Tab>
              : null
            }
          </Tabs>
        </Grid>
      </ManagerPage>
    )
  }
}

class DeploymentsPanel extends Component {
  constructor (props) {
    super(props)
    console.log(this.props.expanded)
    this.state = { expanded: this.props.expanded }
  }
  componentWillMount () {
    if (this.props.expanded) {
      this.props.deploymentsRequested()
    }
  }
  // deleteDeployment (deployment) {
  //   console.log(this.refs)
  //   this.refs['page'].showConfirmModal({
  //     title: 'Delete Deployment?',
  //     body: `Are you sure you want to delete the deployment ${deployment.name}?`,
  //     onConfirm: () => {
  //       console.log('OK, deleting')
  //       this.props.deleteDeploymentConfirmed(deployment)
  //     }
  //   })
  // }
  render () {
    const messages = DT_CONFIG.messages.active.DeploymentsPanel
    const deployments = this.props.deployments
    const na = (<span style={{ color: 'lightGray' }}>N/A</span>)
    return (
        <Row>
          <Col xs={12}>
          <Button
            bsStyle='success'
            /*disabled={projectEditDisabled}*/
            className='pull-right'
            onClick={() => this.props.onNewDeploymentClick()}
          >
            <Glyphicon glyph='plus'/> {messages.new}
          </Button>
            <Table striped hover>
              <thead>
                <tr>
                  <th className='col-md-4'>{messages.table.name}</th>
                  <th>{messages.table.creationDate}</th>
                  <th>{messages.table.feedCount}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.props.deployments
                  ? this.props.deployments.map(dep => {
                    return (
                      <tr
                        key={dep.id || 'new-deployment-' + Math.random()}
                      >
                        <td>
                          <EditableTextField
                            isEditing={(dep.isCreating === true)}
                            value={dep.name}
                            onChange={(value) => {
                              console.log(dep.isCreating)
                              if(dep.isCreating) this.props.newDeploymentNamed(value)
                              else this.props.feedSourcePropertyChanged(dep, 'name', value)
                            }}
                            link={`/deployment/${dep.id}`}
                          />
                        </td>
                        <td>{dep.dateCreated
                          ? (<span>{moment(dep.dateCreated).format('MMM Do YYYY')} ({moment(dep.dateCreated).fromNow()})</span>)
                          : na
                        }</td>
                        <td>{dep.feedVersions
                          ? (<span>{dep.feedVersions.length}</span>)
                          : na
                        }</td>
                        <td>
                          <Button
                            bsStyle='danger'
                            bsSize='xsmall'
                            /*disabled={disabled}*/
                            className='pull-right'
                            onClick={() => this.props.deleteDeploymentConfirmed(dep)}
                          >
                            <Glyphicon glyph='remove' />
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                  : null
                }
              </tbody>
            </Table>
          </Col>
        </Row>
    )
  }
}

class FeedSourceTableRow extends Component {

  constructor (props) {
    super(props)
  }

  render () {
    const fs = this.props.feedSource
    const na = (<span style={{ color: 'lightGray' }}>N/A</span>)
    const disabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'manage-feed')
    const isWatchingFeed = this.props.user.subscriptions.hasFeedSubscription(this.props.project.id, fs.id, 'feed-updated')
    const editGtfsDisabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'edit-gtfs')
    const dateFormat = DT_CONFIG.application.date_format
    return (
      <tr key={fs.id}>
        <td className="col-md-4">
          <div>
            <EditableTextField
              isEditing={(fs.isCreating === true)}
              value={fs.name}
              disabled={disabled}
              onChange={(value) => {
                if(fs.isCreating) this.props.newFeedSourceNamed(value)
                else this.props.feedSourcePropertyChanged(fs, 'name', value)
              }}
              link={`/feed/${fs.id}`}
            />
          </div>
        </td>
        <td>
          <Checkbox
            disabled={disabled}
            defaultChecked={fs.isPublic}
            onChange={(e) => {
              this.props.feedSourcePropertyChanged(fs, 'isPublic', e.target.checked)
            }}
          />
        </td>
        <td>
          <Checkbox
            disabled={disabled}
            defaultChecked={fs.deployable}
            onChange={(e) => {
              this.props.feedSourcePropertyChanged(fs, 'deployable', e.target.checked)
            }}
          />
        </td>
        <td>
          <Badge>{retrievalMethodString(fs.retrievalMethod)}</Badge>
        </td>
        <td>{fs.lastUpdated ? moment(fs.lastUpdated).format(dateFormat) : na}</td>
        <td>{fs.latestValidation ? fs.latestValidation.errorCount : na}</td>
        <td>{fs.latestValidation
          ? (<span>{moment(fs.latestValidation.startDate).format(dateFormat)} to {moment(fs.latestValidation.endDate).format(dateFormat)}</span>)
          : na
        }</td>
        <td className='col-xs-2'>
        <SplitButton
          bsStyle='default'
          title={<span><Glyphicon glyph='refresh' /> Update</span>}
          onClick={this.props.updateFeedSource}
          onSelect={key => {
            console.log(key)
            switch (key) {
              case 'delete':
                return this.props.deleteFeedSourceClicked()
              case 'edit':
                return browserHistory.push(`/feed/${fs.id}/edit`)
              case 'upload':
                return this.props.uploadFeedSourceClicked()
              case 'deploy':
                return this.props.createDeployment(fs)
            }
          }}
          id={`feed-source-action-button`}
          pullRight
        >
          <MenuItem disabled={editGtfsDisabled} eventKey='edit'><Icon name='pencil'/> Edit</MenuItem>
          <MenuItem disabled={disabled} eventKey='upload'><Glyphicon glyph='upload' /> Upload</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey='3'><Glyphicon glyph='globe'/> Deploy</MenuItem>
          {isWatchingFeed
            ? <MenuItem eventKey='unwatch'><Glyphicon glyph='eye-close'/> Unwatch</MenuItem>
            : <MenuItem eventKey='watch'><Glyphicon glyph='eye-open'/> Watch</MenuItem>
          }
          {fs.isPublic
            ? <MenuItem eventKey='public'><Glyphicon glyph='eye-open'/> View public page</MenuItem>
            : null
          }
          <MenuItem divider />
          <MenuItem disabled={disabled} eventKey='delete'><Icon name='trash'/> Delete</MenuItem>
        </SplitButton>
        </td>
      </tr>
    )
  }

}
