import React, {Component, PropTypes} from 'react'
import Helmet from 'react-helmet'
import moment from 'moment'
import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon, Badge, ButtonInput, ButtonToolbar, form } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerPage from '../../common/components/ManagerPage'
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

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {

    if(!this.props.project) {
      return <ManagerPage />
    }
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
              <ul className='breadcrumb'>
                <li><Link to='/'>Explore</Link></li>
                <li><Link to='/project'>Projects</Link></li>
                <li className='active'>{this.props.project.name}</li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <h2>
                {this.props.project.name}
                <ButtonToolbar
                  className={`pull-right`}
                >
                  {DT_CONFIG.application.notifications_enabled
                    ? <Button
                        onClick={() => { this.props.updateUserSubscription(this.props.user.profile, this.props.project.id, 'project-updated') }}
                      >
                        {
                          isWatchingProject ? <span><Glyphicon glyph='eye-close'/> Unwatch</span>
                          : <span><Glyphicon glyph='eye-open'/> Watch</span>
                        }
                      </Button>
                    : null
                  }
                  <Button
                    bsStyle='primary'
                    onClick={() => { this.props.downloadMergedFeed(this.props.project) }}
                  >
                    <Glyphicon glyph='download'/> Merge Feeds
                  </Button>
                </ButtonToolbar>
              </h2>
            </Col>
          </Row>

          <ProjectSettings
            project={this.props.project}
            expanded={this.props.activeComponent === 'settings'}
            updateProjectSettings={this.props.updateProjectSettings}
            projectEditDisabled={projectEditDisabled}
          />

          {isModuleEnabled('deployment')
            ? <DeploymentsPanel
                deployments={this.props.project.deployments}
                expanded={this.props.activeComponent === 'deployments'}
                deleteDeploymentConfirmed={this.props.deleteDeploymentConfirmed}
                deploymentsRequested={this.props.deploymentsRequested}
                onNewDeploymentClick={this.props.onNewDeploymentClick}
                newDeploymentNamed={this.props.newDeploymentNamed}
              />
            : null
          }
          <Panel
            header={(<h3><Glyphicon glyph='list' /> Feed Sources</h3>)}
            collapsible
            defaultExpanded={true}
          >
            <Row>
              <Col xs={4}>
                <Input
                  type="text"
                  placeholder="Search by Feed Source Name"
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
                  New Feed Source
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
                    <Glyphicon glyph='refresh' /> Update all
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
                      <th>Public?</th>
                      <th>Deployable?</th>
                      <th>Retrieval Method</th>
                      <th>GTFS Last Updated</th>
                      <th>Error<br/>Count</th>
                      <th>Valid Range</th>
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
                      />
                    })}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Panel>
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
    const deployments = this.props.deployments
    const na = (<span style={{ color: 'lightGray' }}>N/A</span>)
    return (
      <Panel
        header={(
          <h3 onClick={() => {
            if(!this.state.expanded) this.props.deploymentsRequested()
            this.setState({ expanded: !this.state.expanded })
          }}>
            <Glyphicon glyph='globe' /> Deployments
          </h3>
        )}
        collapsible
        expanded={this.state.expanded}
      >
        <Row>
          <Col xs={12}>
          <Button
            bsStyle='success'
            /*disabled={projectEditDisabled}*/
            className='pull-right'
            onClick={() => this.props.onNewDeploymentClick()}
          >
            <Glyphicon glyph='plus'/> New Deployment
          </Button>
            <Table striped hover>
              <thead>
                <tr>
                  <th className='col-md-4'>Name</th>
                  <th>Creation Date</th>
                  <th>Number of feeds</th>
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
      </Panel>
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
        <td>
          <Badge>{retrievalMethodString(fs.retrievalMethod)}</Badge>
        </td>
        <td>{fs.lastUpdated ? moment(fs.lastUpdated).format('MMM Do YYYY') : na}</td>
        <td>{fs.latestValidation ? fs.latestValidation.errorCount : na}</td>
        <td>{fs.latestValidation
          ? (<span>{moment(fs.latestValidation.startDate).format('MMM Do YYYY')} to {moment(fs.latestValidation.endDate).format('MMM Do YYYY')}</span>)
          : na
        }</td>
        <td>
          <Button
            bsStyle='danger'
            bsSize='small'
            disabled={disabled}
            className='pull-right'
            onClick={this.props.deleteFeedSourceClicked}
          >
            <Glyphicon glyph='remove' />
          </Button>
        </td>
      </tr>
    )
  }

}
