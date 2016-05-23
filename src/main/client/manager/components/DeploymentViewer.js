import React, {Component, PropTypes} from 'react'
import Helmet from 'react-helmet'
import moment from 'moment'
import moment_tz from 'moment-timezone'
import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon, Badge, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerPage from '../../common/components/ManagerPage'
import EditableTextField from '../../common/components/EditableTextField'
import { defaultSorter, retrievalMethodString } from '../../common/util/util'
import languages from '../../common/util/languages'
import { isModuleEnabled, isExtensionEnabled } from '../../common/util/config'

export default class DeploymentViewer extends Component {

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

    if(!this.props.deployment) {
      return <ManagerPage />
    }

    // const projectEditDisabled = !this.props.user.permissions.isProjectAdmin(this.props.project.id)
    // const filteredFeedSources = this.props.project.feedSources
    //   ? this.props.project.feedSources.filter(feedSource => {
    //       if(feedSource.isCreating) return true // feeds actively being created are always visible
    //       return feedSource.name !== null ? feedSource.name.toLowerCase().indexOf((this.props.visibilitySearchText || '').toLowerCase()) !== -1 : '[unnamed project]'
    //     }).sort(defaultSorter)
    //   : []
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
                  >
                    <Glyphicon glyph='download' /> Download
                  </Button>
                  <DropdownButton bsStyle='primary' title={<span><Glyphicon glyph='globe' /> Deploy</span>}>
                    <MenuItem eventKey='1'>Production</MenuItem>
                    <MenuItem eventKey='2'>Test</MenuItem>
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
                  type="text"
                  placeholder="Search by Feed Source Name"
                  onChange={evt => this.props.searchTextChanged(evt.target.value)}
                />
              </Col>
              <Col xs={8}>
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
                    {this.props.deployment.feedVersions.map((version) => {
                      return <FeedVersionTableRow
                        feedSource={version.feedSource}
                        version={version}
                        project={this.props.deployment.project}
                        deployment={this.props.deployment}
                        key={version.id}
                        user={this.props.user}
                        newFeedSourceNamed={this.props.newFeedSourceNamed}
                        feedSourcePropertyChanged={this.props.feedSourcePropertyChanged}
                        deleteFeedSourceClicked={() => this.deleteFeedSource(version)}
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
        <td className='col-md-1 col-xs-3'>
          <Link to=''>Version {version.version}</Link>
          <ButtonToolbar>
            <Button
              bsSize='xsmall'
              bsStyle='default'
              style={{color: 'black'}}
              disabled={!version.previousVersionId}
              onClick={this.props.previousVersionClicked}
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
              onClick={this.props.nextVersionClicked}
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
            onClick={this.props.removeFeedSourceClicked}
          >
            <Glyphicon glyph='remove' />
          </Button>
        </td>
      </tr>
    )
  }

}
