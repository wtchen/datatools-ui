// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import {
  Checkbox,
  ControlLabel,
  Radio,
  FormGroup,
  InputGroup,
  HelpBlock,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Button,
  Panel,
  FormControl,
  Glyphicon,
  Badge,
  ButtonGroup,
  DropdownButton,
  MenuItem
} from 'react-bootstrap'
import {Map, TileLayer, Rectangle} from 'react-leaflet'
import Select from 'react-select'
import fetch from 'isomorphic-fetch'
import validator from 'validator'

import * as deploymentActions from '../../actions/deployments'
import Loading from '../../../common/components/Loading'
import EditableTextField from '../../../common/components/EditableTextField'
import Title from '../../../common/components/Title'
import WatchButton from '../../../common/containers/WatchButton'
import {getComponentMessages, getConfigProperty} from '../../../common/util/config'
import {formatTimestamp, fromNow} from '../../../common/util/date-time'
import {isValidJSONC} from '../../../common/util/json'
import {defaultTileLayerProps} from '../../../common/util/maps'
import { versionsSorter } from '../../../common/util/util'
import {getServerDeployedTo} from '../../util/deployment'
import CurrentDeploymentPanel from './CurrentDeploymentPanel'
import DeploymentConfirmModal from './DeploymentConfirmModal'
import DeploymentVersionsTable from './DeploymentVersionsTable'

import type {Props as ContainerProps} from '../../containers/ActiveDeploymentViewer'
import type {
  CustomFile,
  Deployment,
  ReactSelectOption,
  ServerJob,
  SummarizedFeedVersion
} from '../../../types'
import type {ManagerUserState} from '../../../types/reducers'

type Props = ContainerProps & {
  addFeedVersion: typeof deploymentActions.addFeedVersion,
  deleteFeedVersion: typeof deploymentActions.deleteFeedVersion,
  deployJobs: Array<ServerJob>,
  deployToTarget: typeof deploymentActions.deployToTarget,
  downloadBuildArtifact: typeof deploymentActions.downloadBuildArtifact,
  downloadDeployment: typeof deploymentActions.downloadDeployment,
  fetchDeployment: typeof deploymentActions.fetchDeployment,
  terminateEC2InstanceForDeployment: typeof deploymentActions.terminateEC2InstanceForDeployment,
  updateDeployment: typeof deploymentActions.updateDeployment,
  updateVersionForFeedSource: typeof deploymentActions.updateVersionForFeedSource,
  user: ManagerUserState
}

type State = {
  customFileEditIdx: null | number,
  otp: Array<ReactSelectOption>,
  searchText: ?string,
  target: ?string
}

const BOUNDS_LIMIT = 10 // Limit for the decimal degrees span

const SAMPLE_BUILD_CONFIG = `{
  "subwayAccessTime": 2.5
}`

const SAMPLE_ROUTER_CONFIG = `{
  "routingDefaults": {
    "walkSpeed": 2.0,
    "stairsReluctance": 4.0,
    "carDropoffTime": 240
  }
}`

const TRIP_PLANNER_VERSIONS = [
  { label: 'OTP 1.X', value: 'OTP_1' },
  { label: 'OTP 2.X', value: 'OTP_2' }
]

export default class DeploymentViewer extends Component<Props, State> {
  messages = getComponentMessages('DeploymentViewer')
  state = {
    customFileEditIdx: null,
    otp: [],
    searchText: null,
    target: null
  }

  componentDidMount () {
    this.resetMap()
    // Fetch the available OTP and R5 build versions from S3.
    this._loadOptions()
  }

  /**
   * When the component remounts after an initial mount, the map needs to be
   * reset using Leaflet.invalidateSize so that the map tiles do not "grey out."
   *
   * Also, this re-fits the bounds to the deployment bounds.
   */
  resetMap () {
    setTimeout(() => {
      if (this.refs.map) {
        this.refs.map.leafletElement.invalidateSize()
        this.refs.map.leafletElement.fitBounds(this._getBounds())
      }
    }, 500)
  }

  _getBounds = () => {
    const {east, north, south, west} = this.props.deployment.projectBounds ||
      {east: 10, north: 10, west: -10, south: -10}
    return [[north, east], [south, west]]
  }

  /**
   * Parse .jar options from an S3 text XML response.
   * @param  {string} text text response from s3
   * @param  {string} key  state key under which to store options
   */
  _parseOptionsFromXml = (text: string) => {
    const parser = new window.DOMParser()
    const doc = parser.parseFromString(text, 'application/xml')

    const all = Array.from(doc.querySelectorAll('Contents'))
      .map(item => item.querySelector('Key').childNodes[0].nodeValue) // get just key
      .filter(item => item !== 'index.html') // don't include the main page
      .map(item => item.replace(/.jar$/, '')) // and remove .jar
    this.setState({otp: all})
  }

  _loadAndParseOptionsFromXml = (url: string) => {
    fetch(url)
      .then(res => res.text())
      .then(text => this._parseOptionsFromXml(text))
  }

  /**
   * Load .jar options from OTP and R5 S3 buckets.
   */
  _loadOptions = () => {
    const otpUrl = getConfigProperty('modules.deployment.otp_download_url') || 'https://opentripplanner-builds.s3.amazonaws.com'
    this._loadAndParseOptionsFromXml(otpUrl)
  }

  _onAddCustomFile = () => {
    const { deployment } = this.props
    const customFiles = deployment.customFiles
      ? [...deployment.customFiles, {}]
      : [{}]
    this._updateDeployment({ customFiles })
    this.setState({ customFileEditIdx: customFiles.length - 1 })
  }

  _onAddFeedSource = (feedSourceId: string) => {
    const feed = this.props.feedSources.find(fs => fs.id === feedSourceId)
    const id = feed && feed.latestVersionId
    if (!id) {
      console.warn('No latest version ID found for feed', feed)
      return
    }
    this.props.addFeedVersion(this.props.deployment, {id})
  }

  _onChangeSearch = (evt: SyntheticInputEvent<HTMLInputElement>) =>
    this.setState({searchText: evt.target.value})

  _onChangeName = (name: string) => this._updateDeployment({name})

  _onChangeBuildGraphOnly = () => this._updateDeployment({buildGraphOnly: !this.props.deployment.buildGraphOnly})

  _onChangeSkipOsmExtract = () => {
    const {skipOsmExtract} = this.props.deployment
    if (!skipOsmExtract) {
      // If changing from including OSM to skipping OSM, verify that this is
      // intentional.
      if (!window.confirm('Are you sure you want to exclude an OSM extract from the graph build? This will prevent the use of the OSM street network in routing results.')) {
        return
      }
    }
    this._updateDeployment({skipOsmExtract: !skipOsmExtract})
  }

  _onClickDownload = () => this.props.downloadDeployment(this.props.deployment)

  _onCloseModal = () => this.setState({target: null})

  _onCancelEditingCustomFile = () => {
    this.setState({ customFileEditIdx: null })
  }

  _onEditCustomFile = (idx: number) => {
    this.setState({ customFileEditIdx: idx })
  }

  _onDeleteCustomFile = (idx: number) => {
    const { deployment } = this.props
    const customFiles = [...deployment.customFiles || []]
    customFiles.splice(idx, 1)
    this._updateDeployment({ customFiles })
  }

  _onSaveCustomFile = (idx: number, data: CustomFile) => {
    const { deployment } = this.props
    const customFiles = [...deployment.customFiles || []]
    customFiles[idx] = data
    this._updateDeployment({ customFiles })
    this.setState({ customFileEditIdx: null })
  }

  _setOsmUrl = () => {
    const currentUrl = this.props.deployment.osmExtractUrl || ''
    const osmExtractUrl = window.prompt(
      'Please provide a public URL from which to download an OSM extract (.pbf).',
      currentUrl
    )
    if (osmExtractUrl) {
      if (!validator.isURL(osmExtractUrl)) {
        window.alert(`URL ${osmExtractUrl} is invalid!`)
        return
      }
      this._updateDeployment({osmExtractUrl})
    }
  }

  _clearOsmUrl = () => this._updateDeployment({osmExtractUrl: null})

  _onSelectTarget = (target: string) => this.setState({target})

  _onUpdateTripPlannerVersion = (option: ReactSelectOption) => {
    const {deployment, updateDeployment} = this.props
    updateDeployment(deployment, { tripPlannerVersion: option.value })
  }

  _onUpdateVersion = (option: ReactSelectOption) => {
    this._updateDeployment({otpVersion: option.value})
  }

  _updateDeployment = (props: {[string]: any}) => {
    const {deployment, updateDeployment} = this.props
    updateDeployment(deployment, props)
  }

  renderHeader () {
    const {
      deployJobs,
      deployment,
      project,
      user
    } = this.props
    const na = (<span style={{ color: 'lightGray' }}>N/A</span>)
    const isWatchingDeployment = user.subscriptions &&
      user.subscriptions.hasFeedSubscription(
        project.id,
        deployment.id,
        'deployment-updated'
      )

    return (
      <div>
        <h4>
          <ButtonGroup className='pull-right'>
            <WatchButton
              isWatching={isWatchingDeployment}
              user={user}
              target={deployment.id}
              subscriptionType='deployment-updated' />
            <Button
              bsStyle='default'
              onClick={this._onClickDownload}>
              <span><Glyphicon glyph='download' /> {this.messages('download')}</span>
            </Button>
            <DropdownButton
              bsStyle='primary'
              id='deploy-server-dropdown'
              pullRight
              disabled={!project.otpServers || !project.otpServers.length}
              title={project.otpServers && project.otpServers.length
                ? <span>
                  <Glyphicon glyph='globe' />{' '}
                  {this.messages('deploy')}
                </span>
                : <span>{this.messages('noServers')}</span>
              }
              onSelect={this._onSelectTarget}>
              {project.otpServers
                ? project.otpServers.map((server, i) => (
                  <MenuItem
                    data-test-id={`deploy-server-${i}-button`}
                    // Disable server if the server is missing a name,
                    // has neither an internal URL or s3 bucket name,
                    // or has a load balancer target group set, but is
                    // set for a test feed source (with a non-default router).
                    disabled={
                      deployJobs.length > 0 ||
                      !server.name ||
                      (
                        (!server.internalUrl || server.internalUrl.length === 0) &&
                        !server.s3Bucket
                      ) ||
                      (server.ec2Info && server.ec2Info.targetGroupArn && deployment.feedSourceId)
                    }
                    eventKey={server.id}
                    key={server.id}
                  >
                    {server.name || '[Unnamed]'}
                  </MenuItem>
                ))
                : null
              }
              {project.otpServers && <MenuItem divider />}
              <LinkContainer
                to='/admin/servers'
                key={project.id}>
                <MenuItem>
                  <Icon type='cog' /> Manage servers
                </MenuItem>
              </LinkContainer>
            </DropdownButton>
          </ButtonGroup>
          <EditableTextField
            inline
            style={{marginLeft: '5px'}}
            value={deployment.name}
            onChange={this._onChangeName} />
        </h4>
        <small title={deployment.lastDeployed && formatTimestamp(deployment.lastDeployed)}>
          <Icon type='clock-o' />
          {' '}
          Last deployed {deployment.lastDeployed ? fromNow(deployment.lastDeployed) : na}
        </small>
      </div>
    )
  }

  renderMap () {
    const { deployment } = this.props
    const isMissingBounds = !deployment.projectBounds
    const {east, north, south, west} = deployment.projectBounds ||
      {east: 10, north: 10, west: -10, south: -10}
    const boundsTooLarge = east - west > BOUNDS_LIMIT || north - south > BOUNDS_LIMIT
    const bounds = this._getBounds()

    return (
      <Map
        ref='map'
        bounds={bounds}
        scrollWheelZoom={false}
        style={{width: '100%', height: '300px'}}>
        <TileLayer {...defaultTileLayerProps()} />
        {!isMissingBounds &&
          <Rectangle
            bounds={bounds}
            // If bounds are too large, draw rectangle in red
            // (otherwise use the default path color).
            color={boundsTooLarge ? 'red' : '#3388ff'}
            fillOpacity={0} />
        }
      </Map>
    )
  }

  renderDeployentVersionsTableHeader (versions: Array<SummarizedFeedVersion>) {
    const { deployment, feedSources, project } = this.props
    const { feedVersions } = deployment
    if (!deployment || !project || !feedSources) return <Loading />
    // Only permit adding feed sources to non-feed source deployments.
    const deployableFeeds = !deployment.feedSourceId && feedSources
      ? feedSources.filter(fs =>
        // Include feed sources that are not currently added, have feed versions,
        // are marked deployable, and have been validated.
        feedVersions && feedVersions.findIndex(v => v.feedSource.id === fs.id) === -1 &&
        fs.deployable &&
        fs.latestValidation
      )
      : []
    const earliestDate = formatTimestamp(`${Math.min(...versions.map(v => +v.validationResult.startDate))}`, false)
    const latestDate = formatTimestamp(`${Math.max(...versions.map(v => +v.validationResult.endDate))}`, false)

    return (
      <Row>
        <Col xs={6}>
          <h4>
            <Glyphicon glyph='list' /> {this.messages('versions')}{' '}
            <Badge>{versions.length}</Badge>
            <br />
            <small>
              <Glyphicon glyph='calendar' />{' '}
              {earliestDate} {this.messages('to')} {latestDate}
            </small>
          </h4>
        </Col>
        <Col xs={6}>
          <FormGroup className='pull-right'>
            <InputGroup>
              <FormControl
                type='text'
                className='pull-right'
                style={{width: '160px'}}
                placeholder={this.messages('search')}
                onChange={this._onChangeSearch} />
              <DropdownButton
                id='add-feedsource-button'
                componentClass={InputGroup.Button}
                disabled={!deployableFeeds.length}
                title={deployableFeeds.length
                  ? <span>
                    <Glyphicon glyph='plus' />{' '}
                    {this.messages('addFeedSource')}
                  </span>
                  : <span>{this.messages('allFeedsAdded')}</span>
                }
                onSelect={this._onAddFeedSource}>
                {deployableFeeds.map((fs, i) => (
                  <MenuItem MenuItem key={i} eventKey={fs.id}>{fs.name}</MenuItem>
                ))}
              </DropdownButton>
            </InputGroup>
          </FormGroup>
        </Col>
      </Row>
    )
  }

  renderConfigurationsPanel () {
    const { deployment, updateDeployment } = this.props
    const options = this.state.otp
    const isOtp = deployment.tripPlannerVersion.startsWith('OTP_')

    return (
      <Panel header={<h3><Icon type='cog' /> OTP Configuration</h3>}>
        <ListGroup fill>
          <ListGroupItem>
            <Checkbox
              checked={deployment.buildGraphOnly}
              onChange={this._onChangeBuildGraphOnly}
            >
              Build graph only
            </Checkbox>
            Trip Planner Version:
            <Select
              value={deployment.tripPlannerVersion}
              onChange={this._onUpdateTripPlannerVersion}
              options={TRIP_PLANNER_VERSIONS}
            />
            {isOtp && (
              <div>
                OTP jar file
                <Select
                  value={deployment.otpVersion}
                  onChange={this._onUpdateVersion}
                  options={options ? options.map(v => ({value: v, label: v})) : []}
                />
              </div>
            )}
          </ListGroupItem>
          <ListGroupItem>
            Deploying to the{' '}
            <small><em>{deployment.routerId || 'default'}</em></small>{' '}
            OpenTripPlanner router.
          </ListGroupItem>
          <ListGroupItem>
            OpenStreetMap Settings
            <Checkbox
              checked={!deployment.skipOsmExtract}
              onChange={this._onChangeSkipOsmExtract}>
              Build graph with OSM extract
            </Checkbox>
            {/* Hide URL/auto-extract if skipping OSM extract. */}
            {deployment.skipOsmExtract
              ? null
              : deployment.osmExtractUrl
                ? <div>
                  <ControlLabel className='unselectable buffer-right'>
                    URL:
                  </ControlLabel>
                  <span
                    className='overflow'
                    style={{
                      marginBottom: '5px',
                      width: '240px',
                      verticalAlign: 'middle'
                    }}
                    title={deployment.osmExtractUrl}>
                    {deployment.osmExtractUrl}
                  </span>
                  <Button
                    bsSize='xsmall'
                    style={{marginLeft: '5px'}}
                    onClick={this._setOsmUrl}>Change</Button>
                  <Button
                    bsSize='xsmall'
                    style={{marginLeft: '5px'}}
                    onClick={this._clearOsmUrl}>Clear</Button>
                </div>
                : <div>
                  Auto-extract OSM (N. America only)
                  <Button
                    bsSize='xsmall'
                    style={{marginLeft: '5px'}}
                    onClick={this._setOsmUrl}>Override</Button>
                </div>
            }
          </ListGroupItem>
          <ListGroupItem>
            <CustomConfig
              name='customBuildConfig'
              label='Build'
              updateDeployment={updateDeployment}
              deployment={deployment} />
          </ListGroupItem>
          <ListGroupItem>
            <CustomConfig
              name='customRouterConfig'
              label='Router'
              updateDeployment={updateDeployment}
              deployment={deployment} />
          </ListGroupItem>
          {this.renderCustomFiles()}
        </ListGroup>
      </Panel>
    )
  }

  renderCustomFiles = () => {
    const { deployment } = this.props
    const { customFileEditIdx } = this.state

    return (
      <ListGroupItem>
        <h5>Custom Files</h5>
        {deployment.customFiles && deployment.customFiles.map(
          (customFile, idx) => (
            <CustomFileEditor
              customFile={customFile}
              customFileEditIdx={customFileEditIdx}
              deployment={deployment}
              idx={idx}
              onCancelEditing={this._onCancelEditingCustomFile}
              onDelete={this._onDeleteCustomFile}
              onEdit={this._onEditCustomFile}
              onSave={this._onSaveCustomFile}
            />
          )
        )}
        <Button
          disabled={customFileEditIdx !== null}
          onClick={this._onAddCustomFile}
        >
          <Glyphicon glyph='plus' />{' '}
          Add custom file
        </Button>
      </ListGroupItem>
    )
  }

  render () {
    const {
      deleteFeedVersion,
      deployJobs,
      deployment,
      deployToTarget,
      feedSources,
      project,
      updateVersionForFeedSource,
      user
    } = this.props
    const {target} = this.state
    const {feedVersions} = deployment
    if (!deployment || !project || !feedSources) return <Loading />
    const versions = feedVersions
      ? feedVersions
        .filter(
          version =>
            version.feedSource.name
              .toLowerCase()
              .indexOf((this.state.searchText || '').toLowerCase()) !== -1
        )
        .sort(versionsSorter)
      : []
    const serverDeployedTo = getServerDeployedTo(deployment, project)
    const oldDeployment = (target && project.deployments)
      ? project.deployments.find(d => d.deployedTo === target && deployment.routerId === d.routerId)
      : null
    const appName = getConfigProperty('application.title')
    const title = `${appName ? appName + ' - ' : ''}${deployment.name}`
    return (
      <div>
        <Title>{title}</Title>
        {target &&
          <DeploymentConfirmModal
            deployToTarget={deployToTarget}
            deployment={deployment}
            oldDeployment={oldDeployment}
            onClose={this._onCloseModal}
            project={project}
            target={target} />
        }
        <Row>
          <Col sm={9}>
            <Panel header={this.renderHeader()}>
              <ListGroup fill>
                <ListGroupItem style={{padding: '0px'}}>
                  {this.renderMap()}
                </ListGroupItem>
                <ListGroupItem>
                  {this.renderDeployentVersionsTableHeader(versions)}
                </ListGroupItem>
                {versions.length === 0
                  ? <p className='lead text-center margin-top-15'>
                    No feed sources found.
                  </p>
                  : <DeploymentVersionsTable
                    deleteFeedVersion={deleteFeedVersion}
                    deployment={deployment}
                    project={project}
                    updateVersionForFeedSource={updateVersionForFeedSource}
                    user={user}
                    versions={versions} />
                }
              </ListGroup>
            </Panel>
          </Col>
          <Col sm={3}>
            {/* Current deployment panel */}
            <CurrentDeploymentPanel
              deployJobs={deployJobs}
              deployment={deployment}
              downloadBuildArtifact={this.props.downloadBuildArtifact}
              fetchDeployment={this.props.fetchDeployment}
              project={project}
              server={serverDeployedTo}
              terminateEC2InstanceForDeployment={this.props.terminateEC2InstanceForDeployment} />
            {/* Configurations panel */}
            {this.renderConfigurationsPanel()}
          </Col>
        </Row>
      </div>
    )
  }
}

class CustomConfig extends Component<{
  deployment: Deployment,
  label: string,
  name: string,
  updateDeployment: typeof deploymentActions.updateDeployment
}, {[string]: any}> {
  state = {}

  _toggleCustomConfig = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const {deployment, updateDeployment} = this.props
    const {name} = evt.target
    const value = deployment[name]
      ? null
      : name === 'customBuildConfig'
        ? SAMPLE_BUILD_CONFIG
        : SAMPLE_ROUTER_CONFIG
    updateDeployment(deployment, {[name]: value})
  }

  _onChangeConfig = (evt: SyntheticInputEvent<HTMLInputElement>) =>
    this.setState({[this.props.name]: evt.target.value})

  _onSaveConfig = () => {
    const {deployment, name, updateDeployment} = this.props
    const value = this.state[name]
    if (!isValidJSONC(value)) return window.alert('Must provide valid JSON string.')
    else {
      updateDeployment(deployment, {[name]: value})
      this.setState({[name]: undefined})
    }
  }

  render () {
    const {deployment, name, label} = this.props
    const useCustom = deployment[name] !== null
    const value = this.state[name] || deployment[name]
    const validJSON = isValidJSONC(value)
    return (
      <div>
        <h5>{label} configuration</h5>
        <FormGroup>
          <Radio
            checked={!useCustom}
            name={name}
            onChange={this._toggleCustomConfig}
            inline>
            Project default
          </Radio>
          <Radio
            checked={useCustom}
            name={name}
            onChange={this._toggleCustomConfig}
            inline>
            Custom
          </Radio>
        </FormGroup>
        <p>
          {useCustom
            ? `Use custom JSON defined below for ${label} configuration.`
            : `Use the ${label} configuration defined in the project deployment settings.`
          }
          <span>{' '}
            {useCustom
              ? <Button
                style={{marginLeft: '15px'}}
                bsSize='xsmall'
                disabled={!this.state[name] || !validJSON}
                onClick={this._onSaveConfig}>Save</Button>
              : <LinkContainer
                to={`/project/${deployment.projectId}/settings/deployment`}>
                <Button bsSize='xsmall'>
                  <Icon type='pencil' /> Edit
                </Button>
              </LinkContainer>
            }
          </span>
        </p>
        {useCustom &&
          <FormGroup validationState={validJSON ? null : 'error'}>
            <FormControl
              componentClass='textarea'
              style={{height: '125px'}}
              placeholder='{"blah": true}'
              onChange={this._onChangeConfig}
              value={value} />
            {!validJSON && <HelpBlock>Must provide valid JSON string.</HelpBlock>}
          </FormGroup>
        }
      </div>
    )
  }
}

class CustomFileEditor extends Component<{
  customFile: CustomFile,
  customFileEditIdx: null | number,
  idx: number,
  onCancelEditing: () => void,
  onDelete: (number) => void,
  onEdit: (number) => void,
  onSave: (number, CustomFile) => void
}, {
  fileSource: 'raw' | 'uri',
  model: CustomFile
}> {
  constructor (props) {
    super(props)
    const { customFile } = props
    this.state = {
      fileSource: customFile.contents ? 'raw' : 'uri',
      model: props.customFile
    }
  }

  _onChangeBuildUse = () => {
    const { model } = this.state
    this.setState({
      model: {
        ...model,
        useDuringBuild: !model.useDuringBuild
      }
    })
  }

  _onChangeContents = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({
      model: {
        ...this.state.model,
        contents: evt.target.value
      }
    })
  }

  _onChangeFilename = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({
      model: {
        ...this.state.model,
        filename: evt.target.value
      }
    })
  }

  _onChangeServeUse = () => {
    const { model } = this.state
    this.setState({
      model: {
        ...model,
        useDuringServe: !model.useDuringServe
      }
    })
  }

  _onChangeSource = (evt: SyntheticInputEvent<HTMLSelectElement>) => {
    const model = {...this.state.model}
    // set variable to make flow happy
    let newSource
    if (evt.target.value === 'raw') {
      model.uri = null
      newSource = 'raw'
    } else {
      model.contents = null
      newSource = 'uri'
    }
    this.setState({
      fileSource: newSource,
      model
    })
  }

  _onChangeUri = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({
      model: {
        ...this.state.model,
        uri: evt.target.value
      }
    })
  }

  _onCancelEditing = () => {
    const { customFile, onCancelEditing } = this.props
    this.setState({
      fileSource: customFile.contents ? 'raw' : 'uri',
      model: customFile
    })
    onCancelEditing()
  }

  _onDelete = () => {
    const { idx, onDelete } = this.props
    onDelete(idx)
  }

  _onEdit = () => {
    const { idx, onEdit } = this.props
    onEdit(idx)
  }

  _onSave = () => {
    const { idx, onSave } = this.props
    onSave(idx, this.state.model)
  }

  render () {
    const {
      customFileEditIdx,
      idx
    } = this.props
    const {
      fileSource,
      model: customFile
    } = this.state
    const isValid = customFile.contents || customFile.uri
    const isEditing = idx === customFileEditIdx
    const canEdit = customFileEditIdx === null

    return (
      <div className='custom-file'>
        <ButtonGroup>
          {isEditing && (
            <Button
              disabled={!isValid}
              onClick={this._onSave}
            >
              Save
            </Button>
          )}
          {isEditing && <Button onClick={this._onCancelEditing}>Cancel</Button>}
          {canEdit && <Button onClick={this._onEdit}>Edit</Button>}
          {canEdit && <Button onClick={this._onDelete}>Delete</Button>}
        </ButtonGroup>
        <FormControl
          disabled={!isEditing}
          onChange={this._onChangeFilename}
          placeholder='Enter filename'
          type='text'
          value={customFile.filename}
        />
        <Checkbox
          checked={customFile.useDuringBuild}
          disabled={!isEditing}
          onChange={this._onChangeBuildUse}
        >
          Use during graph build
        </Checkbox>
        <Checkbox
          checked={customFile.useDuringServe}
          disabled={!isEditing}
          onChange={this._onChangeServeUse}
        >
          Use while running server
        </Checkbox>
        <FormGroup validationState={isValid ? null : 'error'}>
          <ControlLabel>File source</ControlLabel>
          <FormControl
            componentClass='select'
            disabled={!isEditing}
            onChange={this._onChangeSource}
            placeholder='select type'
            style={{ marginBottom: 5 }}
            value={fileSource}
          >
            <option value='raw'>From raw input</option>
            <option value='uri'>Download from URI</option>
          </FormControl>
          {!isValid && <HelpBlock>Please set contents or uri!</HelpBlock>}
          {fileSource === 'raw' && (
            <FormControl
              componentClass='textarea'
              disabled={!isEditing}
              style={{height: '125px'}}
              placeholder='{"blah": true}'
              onChange={this._onChangeContents}
              value={customFile.contents}
            />
          )}
          {fileSource === 'uri' && (
            <span>
              <FormControl
                disabled={!isEditing}
                placeholder='https://www.examle.com/file.json'
                onChange={this._onChangeUri}
                type='text'
                value={customFile.uri}
              />
              {!customFile.uri && (
                <HelpBlock>Enter either a HTTP(S) URL or AWS S3 URI</HelpBlock>
              )}
            </span>
          )}
        </FormGroup>
      </div>
    )
  }
}
