import React, {Component, PropTypes} from 'react'
import Helmet from 'react-helmet'
import moment from 'moment'
import moment_tz from 'moment-timezone'
import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon, Badge, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerPage from '../../common/components/ManagerPage'
import EditableTextField from '../../common/components/EditableTextField'
import { versionsSorter, retrievalMethodString } from '../../common/util/util'
import languages from '../../common/util/languages'
import { isModuleEnabled, isExtensionEnabled } from '../../common/util/config'

export default class DeploymentViewer extends Component {

  constructor (props) {
    super(props)

    this.state = {}
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {

    if(!this.props.deployment) {
      return <ManagerPage />
    }
    const deployableFeeds = this.props.project.feedSources.filter(fs =>
      this.props.deployment.feedVersions.findIndex(v => v.feedSource.id === fs.id) === -1 &&
      fs.deployable &&
      fs.latestValidation
    )
    const versions = this.props.deployment.feedVersions.sort(versionsSorter)

    console.log(this.props.deployment)
    return (
      <ManagerPage ref='page'>
      <Helmet
        title={this.props.deployment.name}
      />
        <Grid>
          <Row>
            <Col xs={12}>
              <ul className='breadcrumb'>
                <li><Link to='/'>Explore</Link></li>
                <li><Link to='/project'>Projects</Link></li>
                <li><Link to={`/project/${this.props.deployment.project.id}`}>{this.props.deployment.project.name}</Link></li>
                <li><Link to={`/project/${this.props.deployment.project.id}/deployments`}>Deployments</Link></li>
                <li className='active'>{this.props.deployment.name}</li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div>
                <ButtonToolbar className='pull-right'>
                  <Button
                    bsStyle='default'
                    onClick={() => this.props.downloadDeployment(this.props.deployment)}
                  >
                    <span><Glyphicon glyph='download' /> Download</span>
                  </Button>
                  <DropdownButton
                    bsStyle='primary'
                    disabled={!this.props.project.otpServers || !this.props.project.otpServers.length}
                    title={this.props.project.otpServers && this.props.project.otpServers.length
                      ? <span><Glyphicon glyph='globe' /> Deploy</span>
                      : <span>No servers defined</span>
                    }
                    onSelect={(evt) => {
                      console.log(evt)
                      this.props.deployToTargetClicked(this.props.deployment, evt)
                      setTimeout(() => this.props.getDeploymentStatus(this.props.deployment, evt), 5000)
                    }}
                  >
                    {this.props.project.otpServers
                      ? this.props.project.otpServers.map(server => (
                          <MenuItem eventKey={server.name}>{server.name}</MenuItem>
                        ))
                      : null
                    }
                  </DropdownButton>
                </ButtonToolbar>
                <h2>
                {/*
                  <EditableTextField
                    value={this.props.deployment.name}
                    onChange={(value) => this.props.deploymentPropertyChanged(this.props.deployment, 'name', value)}
                  />
                */}
                {this.props.deployment.name}
                </h2>
              </div>
            </Col>
          </Row>
          <Panel
            header={(<h3><Glyphicon glyph='list' /> Feed Versions</h3>)}
            collapsible
            defaultExpanded={true}
          >
            <Row>
              <Col xs={8} sm={6} md={4}>
                <Input
                  type='text'
                  placeholder='Search by Feed Source Name'
                  onChange={evt => this.props.searchTextChanged(evt.target.value)}
                />
              </Col>
              <Col xs={4} sm={6} md={8}>
                <DropdownButton
                  bsStyle='primary'
                  className='pull-right'
                  disabled={!deployableFeeds.length}
                  title={deployableFeeds.length ? <span><Glyphicon glyph='plus' /> Add Feed Source</span> : <span>All feeds added</span>}
                  onSelect={(evt) => {
                    console.log(evt)
                    let feed = deployableFeeds.find(fs => fs.id === evt)
                    this.props.addFeedVersion(this.props.deployment, {id: feed.latestVersionId})
                  }}
                >
                  {
                    deployableFeeds.map(fs => (
                      <MenuItem eventKey={fs.id}>{fs.name}</MenuItem>
                    ))
                  }
                </DropdownButton>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th className='col-md-4'>Name</th>
                      <th>Version</th>
                      <th className='hidden-xs'>Date retrieved</th>
                      <th className='hidden-xs'>Loaded successfully</th>
                      <th className='hidden-xs'>Error count</th>
                      <th className='hidden-xs'>Route count</th>
                      <th className='hidden-xs'>Trip count</th>
                      <th className='hidden-xs'>Stop time count</th>
                      <th>Valid from</th>
                      <th>Expires</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {versions.map((version) => {
                      return <FeedVersionTableRow
                        feedSource={version.feedSource}
                        version={version}
                        project={this.props.deployment.project}
                        deployment={this.props.deployment}
                        key={version.id}
                        user={this.props.user}
                        updateVersionForFeedSource={this.props.updateVersionForFeedSource}
                        deleteFeedVersionClicked={this.props.deleteFeedVersion}
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

class FeedVersionTableRow extends Component {

  constructor (props) {
    super(props)
  }

  render () {
    const fs = this.props.feedSource
    const version = this.props.version
    const result = this.props.version.validationResult
    const na = (<span style={{ color: 'lightGray' }}>N/A</span>)
    const hasVersionStyle = {cursor: 'pointer'}
    const noVersionStyle = {color: 'lightGray'}
    const disabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'manage-feed')
    return (
      <tr key={fs.id}>
        <td>
          <Link to={`/feed/${fs.id}`}>{fs.name}</Link>
        </td>
        <td className='col-md-1 col-xs-3'>
          <Link to={`/feed/${fs.id}/version/${version.version - 1}`}>Version {version.version}</Link>
          <ButtonToolbar>
            <Button
              bsSize='xsmall'
              bsStyle='default'
              style={{color: 'black'}}
              disabled={!version.previousVersionId}
              onClick={() => this.props.updateVersionForFeedSource(this.props.deployment, fs, {id: version.previousVersionId})}
            >
              <Glyphicon
                glyph='menu-left'
                style={version.previousVersionId ? hasVersionStyle : noVersionStyle}
                title={version.previousVersionId ? 'Previous version' : 'No previous versions'}
                alt='Previous version'
              />
            </Button>
            <Button
              bsSize='xsmall'
              bsStyle='default'
              style={{color: 'black'}}
              disabled={!version.nextVersionId}
              onClick={() => this.props.updateVersionForFeedSource(this.props.deployment, fs, {id: version.nextVersionId})}
            >
              <Glyphicon
                glyph='menu-right'
                style={version.nextVersionId ? hasVersionStyle : noVersionStyle}
                title={version.nextVersionId ? 'Next version' : 'No newer versions'}
                alt='Next Version'
              />
            </Button>
          </ButtonToolbar>
        </td>
        <td className='hidden-xs'>
          {na}
        </td>
        <td className='hidden-xs'>
          <Badge>{result.loadStatus}</Badge>
        </td>
        <td className='hidden-xs'>{result.errorCount}</td>
        <td className='hidden-xs'>{result.routeCount}</td>
        <td className='hidden-xs'>{result.tripCount}</td>
        <td className='hidden-xs'>{result.stopTimesCount}</td>
        <td>{moment(result.startDate).format('MMM Do YYYY')} ({moment(result.startDate).fromNow()})</td>
        <td>{moment(result.endDate).format('MMM Do YYYY')} ({moment(result.endDate).fromNow()})</td>
        <td>
          <Button
            bsStyle='danger'
            bsSize='xsmall'
            disabled={disabled}
            className='pull-right'
            onClick={() => this.props.deleteFeedVersionClicked(this.props.deployment, version)}
          >
            <Glyphicon glyph='remove' />
          </Button>
        </td>
      </tr>
    )
  }

}
