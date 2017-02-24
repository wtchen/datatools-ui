import React, {Component} from 'react'
import { Row, Col, Button, Panel, Glyphicon, Form, Radio, Checkbox, FormGroup, ControlLabel, FormControl } from 'react-bootstrap'
import update from 'react-addons-update'
import { shallowEqual } from 'react-pure-render'

import { getMessage, getComponentMessages } from '../../common/util/config'

export default class DeploymentSettings extends Component {
  constructor (props) {
    super(props)
    this.state = {
      deployment: {
        buildConfig: {},
        routerConfig: {},
        otpServers: this.props.project && this.props.project.otpServers ? this.props.project.otpServers : []
      }
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
  shouldComponentUpdate (nextProps, nextState) {
    return !shallowEqual(nextProps, this.props) || !shallowEqual(nextState, this.state)
  }
  render () {
    console.log(this.state)
    const messages = getComponentMessages('ProjectSettings')
    const { project, editDisabled, updateProjectSettings } = this.props
    const noEdits = Object.keys(this.state.deployment.buildConfig).length === 0 &&
      Object.keys(this.state.deployment.routerConfig).length === 0 &&
      shallowEqual(this.state.deployment.otpServers, project.otpServers)
    return (
      <div className='deployment-settings-panel'>
        <Panel header={<h4>{getMessage(messages, 'deployment.buildConfig.title')}</h4>}>
          <Row>
            <Col xs={6}>
              <FormGroup>
                <ControlLabel>{getMessage(messages, 'deployment.buildConfig.fetchElevationUS')}</ControlLabel>
                <FormControl
                  componentClass='select'
                  defaultValue={project.buildConfig && project.buildConfig.fetchElevationUS ? project.buildConfig.fetchElevationUS : ''}
                  ref='fetchElevationUS'
                  onChange={(evt) => {
                    const stateUpdate = { deployment: { buildConfig: { fetchElevationUS: { $set: (evt.target.value === 'true') } } } }
                    this.setState(update(this.state, stateUpdate))
                  }}>
                  <option value='false'>false</option>
                  <option value='true'>true</option>
                </FormControl>
              </FormGroup>
            </Col>
            <Col xs={6}>
              <FormGroup>
                <ControlLabel>{getMessage(messages, 'deployment.buildConfig.stationTransfers')}</ControlLabel>
                <FormControl
                  componentClass='select'
                  defaultValue={project.buildConfig && project.buildConfig.stationTransfers ? project.buildConfig.stationTransfers : ''}
                  ref='stationTransfers'
                  onChange={(evt) => {
                    const stateUpdate = { deployment: { buildConfig: { stationTransfers: { $set: (evt.target.value === 'true') } } } }
                    this.setState(update(this.state, stateUpdate))
                  }}>
                  <option value='false'>false</option>
                  <option value='true'>true</option>
                </FormControl>
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <ControlLabel>{getMessage(messages, 'deployment.buildConfig.subwayAccessTime')}</ControlLabel>
            <FormControl
              defaultValue={project.buildConfig && project.buildConfig.subwayAccessTime ? project.buildConfig.subwayAccessTime : ''}
              placeholder='2.5 (min)'
              ref='subwayAccessTime'
              onChange={(evt) => {
                const stateUpdate = { deployment: { buildConfig: { subwayAccessTime: { $set: +evt.target.value } } } }
                this.setState(update(this.state, stateUpdate))
              }} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{getMessage(messages, 'deployment.buildConfig.fares')}</ControlLabel>
            <FormControl
              defaultValue={project.buildConfig && project.buildConfig.fares ? project.buildConfig.fares : ''}
              placeholder='fares'
              ref='fares'
              onChange={(evt) => {
                const stateUpdate = { deployment: { buildConfig: { fares: { $set: evt.target.value } } } }
                this.setState(update(this.state, stateUpdate))
              }} />
          </FormGroup>
        </Panel>
        <Panel header={<h4>Router Config</h4>}>
          <Row>
            <Col xs={6}>
              <FormGroup>
                <ControlLabel>{getMessage(messages, 'deployment.routerConfig.numItineraries')}</ControlLabel>
                <FormControl
                  type='integer'
                  defaultValue={project.routerConfig && project.routerConfig.numItineraries ? project.routerConfig.numItineraries : ''}
                  placeholder='6'
                  ref='numItineraries'
                  onChange={(evt) => {
                    const stateUpdate = { deployment: { routerConfig: { numItineraries: { $set: +evt.target.value } } } }
                    this.setState(update(this.state, stateUpdate))
                  }} />
              </FormGroup>
            </Col>
            <Col xs={6}>
              <FormGroup>
                <ControlLabel>{getMessage(messages, 'deployment.routerConfig.walkSpeed')}</ControlLabel>
                <FormControl
                  type='number'
                  defaultValue={project.routerConfig && project.routerConfig.walkSpeed ? project.routerConfig.walkSpeed : ''}
                  placeholder='3.0'
                  ref='walkSpeed'
                  onChange={(evt) => {
                    const stateUpdate = { deployment: { routerConfig: { walkSpeed: { $set: +evt.target.value } } } }
                    this.setState(update(this.state, stateUpdate))
                  }} />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <FormGroup>
                <ControlLabel>{getMessage(messages, 'deployment.routerConfig.stairsReluctance')}</ControlLabel>
                <FormControl
                  type='number'
                  defaultValue={project.routerConfig && project.routerConfig.stairsReluctance ? project.routerConfig.stairsReluctance : ''}
                  placeholder='2.0'
                  ref='stairsReluctance'
                  onChange={(evt) => {
                    const stateUpdate = { deployment: { routerConfig: { stairsReluctance: { $set: +evt.target.value } } } }
                    this.setState(update(this.state, stateUpdate))
                  }} />
              </FormGroup>
            </Col>
            <Col xs={6}>
              <FormGroup>
                <ControlLabel>{getMessage(messages, 'deployment.routerConfig.carDropoffTime')}</ControlLabel>
                <FormControl
                  type='number'
                  defaultValue={project.routerConfig && project.routerConfig.carDropoffTime ? project.routerConfig.carDropoffTime : ''}
                  placeholder='240 (sec)'
                  ref='carDropoffTime'
                  onChange={(evt) => {
                    const stateUpdate = { deployment: { routerConfig: { carDropoffTime: { $set: +evt.target.value } } } }
                    this.setState(update(this.state, stateUpdate))
                  }} />
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <ControlLabel>{getMessage(messages, 'deployment.routerConfig.brandingUrlRoot')}</ControlLabel>
            <FormControl
              type='text'
              defaultValue={project.routerConfig && project.routerConfig.brandingUrlRoot ? project.routerConfig.brandingUrlRoot : ''}
              placeholder='http://gtfs.example.com/branding'
              ref='brandingUrlRoot'
              onChange={(evt) => {
                const stateUpdate = { deployment: { routerConfig: { brandingUrlRoot: { $set: evt.target.value } } } }
                this.setState(update(this.state, stateUpdate))
              }} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{getMessage(messages, 'deployment.routerConfig.requestLogFile')}</ControlLabel>
            <FormControl
              type='text'
              defaultValue={project.routerConfig && project.routerConfig.requestLogFile ? project.routerConfig.requestLogFile : ''}
              placeholder='/var/otp/request.log'
              ref='requestLogFile'
              onChange={(evt) => {
                const stateUpdate = { deployment: { routerConfig: { requestLogFile: { $set: evt.target.value } } } }
                this.setState(update(this.state, stateUpdate))
              }} />
          </FormGroup>
        </Panel>
        <Panel header={
          <h4>
            <Button
              className='pull-right'
              bsStyle='success'
              bsSize='xsmall'
              onClick={() => {
                const stateUpdate = { deployment: { otpServers: { $push: [{name: '', publicUrl: '', internalUrl: [], admin: false}] } } }
                this.setState(update(this.state, stateUpdate))
              }}>
              <Glyphicon glyph='plus' /> {getMessage(messages, 'deployment.servers.new')}
            </Button>
            {getMessage(messages, 'deployment.servers.title')}
          </h4>
        }>
          <div>
            {this.state.deployment.otpServers && this.state.deployment.otpServers.map((server, i) => {
              const title = (
                <h5>
                  {server.name}{'  '}
                  <small>{server.publicUrl}</small>
                </h5>
              )
              return (
                <Panel key={i}
                  header={server.name ? title : `[${getMessage(messages, 'deployment.servers.serverPlaceholder')}]`}
                  defaultExpanded={server.name === ''}
                  collapsible>
                  <Form>
                    <Button
                      bsSize='xsmall'
                      bsStyle='danger'
                      className='pull-right'
                      onClick={() => {
                        const stateUpdate = { deployment: { otpServers: { $splice: [[i, 1]] } } }
                        this.setState(update(this.state, stateUpdate))
                      }}>
                      Remove <Glyphicon glyph='remove' />
                    </Button>
                    <FormGroup>
                      <ControlLabel>{getMessage(messages, 'deployment.servers.name')}</ControlLabel>
                      <FormControl
                        type='text'
                        placeholder={getMessage(messages, 'deployment.servers.namePlaceholder')}
                        defaultValue={server.name}
                        onChange={(evt) => {
                          const stateUpdate = { deployment: { otpServers: { [i]: { $merge: { name: evt.target.value } } } } }
                          this.setState(update(this.state, stateUpdate))
                        }} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>{getMessage(messages, 'deployment.servers.public')}</ControlLabel>
                      <FormControl
                        type='text'
                        placeholder='http://otp.example.com'
                        defaultValue={server.publicUrl}
                        onChange={(evt) => {
                          const stateUpdate = { deployment: { otpServers: { [i]: { $merge: { publicUrl: evt.target.value } } } } }
                          this.setState(update(this.state, stateUpdate))
                        }} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>{getMessage(messages, 'deployment.servers.internal')}</ControlLabel>
                      <FormControl
                        type='text'
                        placeholder='http://127.0.0.1/otp,http://0.0.0.0/otp'
                        defaultValue={server.internalUrl && server.internalUrl.join(',')}
                        onChange={(evt) => {
                          const stateUpdate = { deployment: { otpServers: { [i]: { $merge: { internalUrl: evt.target.value.split(',') } } } } }
                          this.setState(update(this.state, stateUpdate))
                        }} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>{getMessage(messages, 'deployment.servers.s3Bucket')}</ControlLabel>
                      <FormControl
                        type='text'
                        placeholder='s3_bucket_name'
                        defaultValue={server.s3Bucket}
                        onChange={(evt) => {
                          const stateUpdate = { deployment: { otpServers: { [i]: { $merge: { s3Bucket: evt.target.value } } } } }
                          this.setState(update(this.state, stateUpdate))
                        }} />
                    </FormGroup>
                    <Checkbox
                      checked={server.admin}
                      onChange={(evt) => {
                        const stateUpdate = { deployment: { otpServers: { [i]: { $merge: { admin: evt.target.checked } } } } }
                        this.setState(update(this.state, stateUpdate))
                      }}>
                      {getMessage(messages, 'deployment.servers.admin')}
                    </Checkbox>
                  </Form>
                </Panel>
              )
            })}
          </div>
        </Panel>
        <Panel header={<h4>{getMessage(messages, 'deployment.osm.title')}</h4>}>
          <FormGroup
            onChange={(evt) => {
              const stateUpdate = { deployment: { useCustomOsmBounds: { $set: (evt.target.value === 'true') } } }
              this.setState(update(this.state, stateUpdate))
            }}
          >
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
                ref='osmBounds'
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
              type='submit'
              disabled={editDisabled || noEdits}
              onClick={(evt) => {
                evt.preventDefault()
                console.log(this.state)
                console.log(project)
                updateProjectSettings(project, this.state.deployment)
              }}>
              {getMessage(messages, 'save')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
