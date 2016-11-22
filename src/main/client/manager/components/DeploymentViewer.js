import React, {Component, PropTypes} from 'react'
import moment from 'moment'
import {Icon} from '@conveyal/woonerf'
import { LinkContainer } from 'react-router-bootstrap'
import { Row, Col, Button, Table, FormControl, Panel, Glyphicon, Badge, ButtonToolbar, DropdownButton, MenuItem, Label } from 'react-bootstrap'
import { Link } from 'react-router'

import Loading from '../../common/components/Loading'
import EditableTextField from '../../common/components/EditableTextField'
import { versionsSorter } from '../../common/util/util'
import { getComponentMessages, getMessage } from '../../common/util/config'

export default class DeploymentViewer extends Component {
  static propTypes = {
    project: PropTypes.object
  }
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentWillMount () {
    // this.props.onComponentMount(this.props)
  }

  render () {
    const { project, deployment, feedSources } = this.props
    if (!this.props.deployment || !this.props.project || !this.props.feedSources) {
      return <Loading />
    }
    const deployableFeeds = this.props.feedSources
      ? this.props.feedSources.filter(fs =>
        this.props.deployment.feedVersions.findIndex(v => v.feedSource.id === fs.id) === -1 &&
        fs.deployable &&
        fs.latestValidation
      )
      : []
    const messages = getComponentMessages('DeploymentViewer')
    const versions = this.props.deployment.feedVersions.sort(versionsSorter)
    return (
      <div>
        <Row>
          <Col xs={12}>
            <div>
              <ButtonToolbar className='pull-right'>
                <Button
                  bsStyle='default'
                  onClick={() => this.props.downloadDeployment(this.props.deployment)}
                >
                  <span><Glyphicon glyph='download' /> {getMessage(messages, 'download')}</span>
                </Button>
                <DropdownButton
                  bsStyle='primary'
                  disabled={!this.props.project.otpServers || !this.props.project.otpServers.length}
                  title={this.props.project.otpServers && this.props.project.otpServers.length
                    ? <span><Glyphicon glyph='globe' /> {getMessage(messages, 'deploy')}</span>
                    : <span>{getMessage(messages, 'noServers')}</span>
                  }
                  onSelect={(evt) => {
                    console.log(evt)
                    this.props.deployToTargetClicked(this.props.deployment, evt)
                    //setTimeout(() => this.props.getDeploymentStatus(this.props.deployment, evt), 5000)
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
                <LinkContainer to={`/project/${project.id}/deployments`}>
                  <Button>
                    <Icon type='reply' /> Back to list
                  </Button>
                </LinkContainer>
                <EditableTextField
                  inline
                  style={{marginLeft: '5px'}}
                  value={this.props.deployment.name}
                  onChange={(value) => this.props.deploymentPropertyChanged(this.props.deployment, 'name', value)}
                />
                {this.props.deployment.deployedTo
                  ? <Label>{this.props.deployment.deployedTo}</Label>
                  : null
                }
              </h2>
            </div>
          </Col>
        </Row>
        <Panel
          header={(<h3><Glyphicon glyph='list' /> {getMessage(messages, 'versions')}</h3>)}
          collapsible
          defaultExpanded
        >
          <Row>
            <Col xs={8} sm={6} md={4}>
              <FormControl
                type='text'
                placeholder={getMessage(messages, 'search')}
                onChange={evt => this.props.searchTextChanged(evt.target.value)}
              />
            </Col>
            <Col xs={4} sm={6} md={8}>
              <DropdownButton
                bsStyle='primary'
                className='pull-right'
                disabled={!deployableFeeds.length}
                title={deployableFeeds.length ? <span><Glyphicon glyph='plus' /> {getMessage(messages, 'addFeedSource')}</span> : <span>{getMessage(messages, 'allFeedsAdded')}</span>}
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
              <Table striped hover fill>
                <thead>
                  <tr>
                    <th className='col-md-4'>{getMessage(messages, 'table.name')}</th>
                    <th>Version</th>
                    <th className='hidden-xs'>{getMessage(messages, 'table.dateRetrieved')}</th>
                    <th className='hidden-xs'>{getMessage(messages, 'table.loadStatus')}</th>
                    <th className='hidden-xs'>{getMessage(messages, 'table.errorCount')}</th>
                    <th className='hidden-xs'>{getMessage(messages, 'table.routeCount')}</th>
                    <th className='hidden-xs'>{getMessage(messages, 'table.tripCount')}</th>
                    <th className='hidden-xs'>{getMessage(messages, 'table.stopTimesCount')}</th>
                    <th>{getMessage(messages, 'table.validFrom')}</th>
                    <th>{getMessage(messages, 'table.expires')}</th>
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
      </div>
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
