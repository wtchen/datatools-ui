import React, {Component, PropTypes} from 'react'
import {Row, Col, Button, Panel, Glyphicon, Radio, FormGroup, ControlLabel, FormControl} from 'react-bootstrap'
import update from 'react-addons-update'
import {shallowEqual} from 'react-pure-render'

import {getMessage, getComponentMessages} from '../../common/util/config'
import OtpServer from './OtpServer'
import {BUILD_FIELDS, ROUTER_FIELDS} from '../util/deployment'

export default class DeploymentSettings extends Component {
  static propTypes = {
    project: PropTypes.object,
    updateProjectSettings: PropTypes.func
  }

  state = {
    deployment: {
      buildConfig: {},
      routerConfig: {},
      otpServers: this.props.project && this.props.project.otpServers ? this.props.project.otpServers : []
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      deployment: {
        buildConfig: {},
        routerConfig: {},
        otpServers: nextProps.project && nextProps.project.otpServers ? nextProps.project.otpServers : []
      }
    })
  }

  _getOnChange = (evt) => {
    let item = BUILD_FIELDS.find(f => f.name === evt.target.name)
    if (item) {
      // if build field
      switch (item.type) {
        case 'select':
          return this._onBuildSelectBool(evt)
        case 'number':
          return this._onChangeBuildNumber(evt)
        default:
          return this._onBuildChange(evt)
      }
    } else {
      // if router field
      item = ROUTER_FIELDS.find(f => f.name === evt.target.name)
      switch (item.type) {
        case 'number':
          return this._onChangeRouterNumber(evt)
        default:
          return this._onRouterChange(evt)
      }
    }
  }

  _onAddServer = () => {
    const stateUpdate = { deployment: { otpServers: { $push: [{name: '', publicUrl: '', internalUrl: [], admin: false}] } } }
    this.setState(update(this.state, stateUpdate))
  }

  _onChangeServer = (index, props) => {
    const stateUpdate = { deployment: { otpServers: { [index]: { $merge: { ...props } } } } }
    this.setState(update(this.state, stateUpdate))
  }

  _onRemoveServer = (index) => {
    const stateUpdate = { deployment: { otpServers: { $splice: [[index, 1]] } } }
    this.setState(update(this.state, stateUpdate))
  }

  _onBuildChange = (evt) => {
    const stateUpdate = { deployment: { buildConfig: { [evt.target.name]: { $set: evt.target.value } } } }
    this.setState(update(this.state, stateUpdate))
  }

  _onChangeBuildNumber = (evt) => {
    const stateUpdate = { deployment: { buildConfig: { [evt.target.name]: { $set: +evt.target.value } } } }
    this.setState(update(this.state, stateUpdate))
  }

  _onChangeRouterNumber = (evt) => {
    const stateUpdate = { deployment: { routerConfig: { [evt.target.name]: { $set: +evt.target.value } } } }
    this.setState(update(this.state, stateUpdate))
  }

  _onRouterChange = (evt) => {
    const stateUpdate = { deployment: { routerConfig: { [evt.target.name]: { $set: evt.target.value } } } }
    this.setState(update(this.state, stateUpdate))
  }

  _onBuildSelectBool = (evt) => {
    const stateUpdate = { deployment: { buildConfig: { [evt.target.name]: { $set: (evt.target.value === 'true') } } } }
    this.setState(update(this.state, stateUpdate))
  }

  _onSave = (evt) => this.props.updateProjectSettings(this.props.project, this.state.deployment)

  shouldComponentUpdate (nextProps, nextState) {
    return !shallowEqual(nextProps, this.props) || !shallowEqual(nextState, this.state)
  }

  render () {
    console.log(this.state)
    const messages = getComponentMessages('ProjectSettings')
    const {project, editDisabled} = this.props
    const noEdits = Object.keys(this.state.deployment.buildConfig).length === 0 &&
      Object.keys(this.state.deployment.routerConfig).length === 0 &&
      shallowEqual(this.state.deployment.otpServers, project.otpServers)
    return (
      <div className='deployment-settings-panel'>
        {/* Build config settings */}
        <Panel header={<h4>{getMessage(messages, 'deployment.buildConfig.title')}</h4>}>
          {BUILD_FIELDS.map((f, index) => (
            <Col key={index} xs={f.width || 6}>
              <FormGroup>
                <ControlLabel>{getMessage(messages, `deployment.buildConfig.${f.name}`)}</ControlLabel>
                <FormControl
                  defaultValue={project.routerConfig && project.routerConfig[f.name] ? project.routerConfig[f.name] : ''}
                  {...f}
                  onChange={this._getOnChange}
                  children={f.children
                    ? f.children.map((o, i) => (
                      <option key={i} {...o} />
                    ))
                    : undefined
                  } />
              </FormGroup>
            </Col>
          ))}
        </Panel>
        {/* Router config settings */}
        <Panel header={<h4>Router Config</h4>}>
          {ROUTER_FIELDS.map((f, index) => (
            <Col key={index} xs={f.width || 6}>
              <FormGroup>
                <ControlLabel>{getMessage(messages, `deployment.routerConfig.${f.name}`)}</ControlLabel>
                <FormControl
                  defaultValue={project.routerConfig && project.routerConfig[f.name] ? project.routerConfig[f.name] : ''}
                  {...f}
                  onChange={this._getOnChange} />
              </FormGroup>
            </Col>
          ))}
        </Panel>
        {/* OTP server settings */}
        <Panel header={
          <h4>
            <Button
              className='pull-right'
              bsStyle='success'
              bsSize='xsmall'
              onClick={this._onAddServer}>
              <Glyphicon glyph='plus' /> {getMessage(messages, 'deployment.servers.new')}
            </Button>
            {getMessage(messages, 'deployment.servers.title')}
          </h4>
        }>
          <div>
            {this.state.deployment.otpServers && this.state.deployment.otpServers.map((server, i) => (
              <OtpServer
                key={i}
                index={i}
                server={server}
                onRemove={this._onRemoveServer}
                onChange={this._onChangeServer} />
            ))}
          </div>
        </Panel>
        {/* OSM extract settings */}
        <Panel header={<h4>{getMessage(messages, 'deployment.osm.title')}</h4>}>
          <FormGroup
            onChange={(evt) => {
              const stateUpdate = { deployment: { useCustomOsmBounds: { $set: (evt.target.value === 'true') } } }
              this.setState(update(this.state, stateUpdate))
            }}>
            <Radio
              name='osm-extract'
              checked={typeof this.state.deployment.useCustomOsmBounds !== 'undefined' ? !this.state.deployment.useCustomOsmBounds : !project.useCustomOsmBounds}
              value={false}>
              {getMessage(messages, 'deployment.osm.gtfs')}
            </Radio>
            <Radio
              name='osm-extract'
              checked={typeof this.state.deployment.useCustomOsmBounds !== 'undefined' ? this.state.deployment.useCustomOsmBounds : project.useCustomOsmBounds}
              value>
              {getMessage(messages, 'deployment.osm.custom')}
            </Radio>
          </FormGroup>
          {project.useCustomOsmBounds || this.state.deployment.useCustomOsmBounds
            ? <FormGroup>
              <ControlLabel>{(<span><Glyphicon glyph='fullscreen' /> {getMessage(messages, 'deployment.osm.bounds')}</span>)}</ControlLabel>
              <FormControl
                type='text'
                defaultValue={project.osmNorth !== null ? `${project.osmWest},${project.osmSouth},${project.osmEast},${project.osmNorth}` : ''}
                placeholder='-88.45,33.22,-87.12,34.89'
                name='osmBounds'
                onChange={(evt) => {
                  const bBox = evt.target.value.split(',')
                  if (bBox.length === 4) {
                    const stateUpdate = { deployment: { $merge: { osmWest: bBox[0], osmSouth: bBox[1], osmEast: bBox[2], osmNorth: bBox[3] } } }
                    this.setState(update(this.state, stateUpdate))
                  }
                }} />
            </FormGroup>
            : null
          }
        </Panel>
        <Row>
          <Col md={12}>
            {/* Save button */}
            <Button
              bsStyle='primary'
              disabled={editDisabled || noEdits}
              onClick={this._onSave}>
              {getMessage(messages, 'save')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
