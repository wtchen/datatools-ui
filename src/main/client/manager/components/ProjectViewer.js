import React, {Component, PropTypes} from 'react'
import Helmet from 'react-helmet'
import moment from 'moment'
import { Tabs, Tab, Grid, Row, Label, Col, Button, Table, FormControl, Glyphicon, ButtonToolbar } from 'react-bootstrap'

import { shallowEqual } from 'react-pure-render'

import ManagerPage from '../../common/components/ManagerPage'
import Breadcrumbs from '../../common/components/Breadcrumbs'
import WatchButton from '../../common/containers/WatchButton'
import ProjectSettings from './ProjectSettings'
import FeedSourceTable from './FeedSourceTable'
import EditableTextField from '../../common/components/EditableTextField'
import { defaultSorter } from '../../common/util/util'
import { isModuleEnabled, isExtensionEnabled, getComponentMessages, getConfigProperty } from '../../common/util/config'

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
    const messages = getComponentMessages('ProjectViewer')
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
        <Grid fluid>
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
                {getConfigProperty('application.notifications_enabled')
                  ? <WatchButton
                      isWatching={isWatchingProject}
                      user={this.props.user}
                      target={this.props.project.id}
                      subscriptionType='project-updated'
                    />
                  : null
                }

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
            id='project-viewer-tabs'
            // activeKey={this.props.activeComponent ? this.props.activeComponent : 'sources'}
            onSelect={(key) => {
              // if (key === 'sources') {
              //   browserHistory.push(`/project/${this.props.project.id}/`)
              // }
              // else {
              //   browserHistory.push(`/project/${this.props.project.id}/${key}`)
              // }
              if (key === 'deployments'  && !this.props.project.deployments) {
                this.props.deploymentsRequested()
              }
            }}
          >
            <Tab
              eventKey='sources'
              title={<span><Glyphicon glyph='list' /> {messages.feeds.title}</span>}
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
                      <Glyphicon glyph='plus' /> {messages.feeds.new}
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
                    <FeedSourceTable {...this.props} feedSources={filteredFeedSources} />
                  </Col>
                </Row>
            </Tab>
            <Tab
              eventKey='settings'
              disabled={projectEditDisabled}
              title={<span><Glyphicon glyph='cog'/> {messages.settings}</span>}
            >
              <ProjectSettings
                project={this.props.project}
                updateProjectSettings={this.props.updateProjectSettings}
                projectEditDisabled={projectEditDisabled}
              />
            </Tab>
            {isModuleEnabled('deployment')
              ? <Tab
                  eventKey='deployments'
                  disabled={projectEditDisabled}
                  title={<span><Glyphicon glyph='globe' /> {messages.deployments}</span>}
                >
                  <DeploymentsPanel
                    deployments={this.props.project.deployments}
                    expanded={this.props.activeComponent === 'deployments'}
                    deleteDeploymentConfirmed={this.props.deleteDeploymentConfirmed}
                    deploymentsRequested={this.props.deploymentsRequested}
                    onNewDeploymentClick={this.props.onNewDeploymentClick}
                    newDeploymentNamed={this.props.newDeploymentNamed}
                    updateDeployment={this.props.updateDeployment}
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
  static propTypes = {
    deployments: PropTypes.object,
    deleteDeploymentConfirmed: PropTypes.func,
    deploymentsRequested: PropTypes.func,
    onNewDeploymentClick: PropTypes.func,
    newDeploymentNamed: PropTypes.func,
    updateDeployment: PropTypes.func,
    expanded: PropTypes.bool
  }
  constructor (props) {
    super(props)
  }
  componentWillMount () {
    if (this.props.expanded) {
      this.props.deploymentsRequested()
    }
  }
  shouldComponentUpdate (nextProps, nextState) {
    return !shallowEqual(nextProps.deployments, this.props.deployments)
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
    const messages = getComponentMessages('DeploymentsPanel')
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
                  <th>{messages.table.deployedTo}</th>
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
                              if (dep.isCreating) this.props.newDeploymentNamed(value)
                              else this.props.updateDeployment(dep, {name: value})
                            }}
                            link={`/deployment/${dep.id}`}
                          />
                        </td>
                        <td>
                          {dep.dateCreated
                            ? (<span>{moment(dep.dateCreated).format('MMM Do YYYY')} ({moment(dep.dateCreated).fromNow()})</span>)
                            : na
                          }
                        </td>
                        <td>
                          {dep.deployedTo
                            ? (<Label>{dep.deployedTo}</Label>)
                            : na
                          }
                        </td>
                        <td>
                          {dep.feedVersions
                            ? (<span>{dep.feedVersions.length}</span>)
                            : na
                          }
                        </td>
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
