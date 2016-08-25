import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
// import moment_tz from 'moment-timezone'
import DateTimeField from 'react-bootstrap-datetimepicker'
import update from 'react-addons-update'
import { shallowEqual } from 'react-pure-render'
import { LinkContainer } from 'react-router-bootstrap'
import Icon from 'react-fa'

import { Row, Col, Button, Panel, Glyphicon, Form, Tabs, Tab, Radio, Checkbox, FormGroup, InputGroup, ControlLabel, FormControl, ListGroup, ListGroupItem } from 'react-bootstrap'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import LanguageSelect from '../../common/components/LanguageSelect'
// import languages from '../../common/util/languages'
import { isModuleEnabled, getComponentMessages } from '../../common/util/config'
import MapModal from '../../common/components/MapModal.js'

export default class ProjectSettings extends Component {
  static propTypes = {
    project: PropTypes.object,
    projectEditDisabled: PropTypes.bool,
    updateProjectSettings: PropTypes.func,
    deleteProject: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {
      general: {},
      deployment: {
        buildConfig: {},
        routerConfig: {},
        otpServers: this.props.project && this.props.project.otpServers ? this.props.project.otpServers : []
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      general: {},
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
    const messages = getComponentMessages('ProjectSettings')
    const project = this.props.project
    const generalSettingsUnedited = Object.keys(this.state.general).length === 0 && this.state.general.constructor === Object
    const deploymentSettingsUnedited =
      Object.keys(this.state.deployment.buildConfig).length === 0 &&
      Object.keys(this.state.deployment.buildConfig).length === 0 &&
      shallowEqual(this.state.deployment.otpServers, this.props.project.otpServers)
    const autoFetchChecked = typeof this.state.general.autoFetchFeeds !== 'undefined' ? this.state.general.autoFetchFeeds : project.autoFetchFeeds
    const projectEditDisabled = this.props.projectEditDisabled
    const defaultFetchTime = moment().startOf('day').add(2, 'hours')
    const activeSettingsPanel = !this.props.activeSettingsPanel
      ? <div className='general-settings-panel'>
          <Panel header={<h4>{messages.title}</h4>}>
            <ListGroup fill>
              <ListGroupItem>
              <FormGroup inline>
                <ControlLabel>Organization name</ControlLabel>
                <InputGroup>
                  <FormControl
                    value={this.state.name ? this.state.name : project.name}
                    onChange={(evt) => {
                      this.setState({name: evt.target.value})
                    }}
                  />
                  <InputGroup.Button>
                    <Button
                      disabled={!this.state.name}
                      onClick={() => {
                        this.props.feedSourcePropertyChanged(project, 'name', this.state.name)
                        .then(() => this.setState({name: null}))
                      }}
                    >Rename</Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
              </ListGroupItem>
            </ListGroup>
          </Panel>
          <Panel header={<h4>{messages.general.updates.title}</h4>}>
            <ListGroup fill>
              <ListGroupItem>
                <FormGroup>
                <Checkbox
                  checked={autoFetchChecked}
                  onChange={(evt) => {
                    let minutes = moment(defaultFetchTime).minutes()
                    let hours = moment(defaultFetchTime).hours()
                    let stateUpdate = { general: { $merge: { autoFetchFeeds: evt.target.checked, autoFetchMinute: minutes, autoFetchHour: hours } } }
                    this.setState(update(this.state, stateUpdate))
                  }}
                >
                  <strong>{messages.general.updates.autoFetchFeeds}</strong>
                </Checkbox>
                {autoFetchChecked
                  ? <DateTimeField
                      dateTime={project.autoFetchMinute !== null
                        ? +moment().startOf('day').add(project.autoFetchHour, 'hours').add(project.autoFetchMinute, 'minutes')
                        : defaultFetchTime
                      }
                      mode='time'
                      onChange={seconds => {
                        let time = moment(+seconds)
                        let minutes = moment(time).minutes()
                        let hours = moment(time).hours()
                        let stateUpdate = { general: { $merge: { autoFetchMinute: minutes, autoFetchHour: hours } } }
                        this.setState(update(this.state, stateUpdate))
                      }}
                    />
                  : null
                }
                </FormGroup>
              </ListGroupItem>
            </ListGroup>
          </Panel>
          <Panel header={<h4>{messages.general.location.title}</h4>}>
            <ListGroup fill>
              <ListGroupItem>
                <FormGroup>
                  <ControlLabel><Glyphicon glyph='map-marker' /> {messages.general.location.defaultLocation}</ControlLabel>
                  <InputGroup ref='defaultLocationGroup'>
                    <FormControl
                      type='text'
                      defaultValue={project.defaultLocationLat !== null && project.defaultLocationLon !== null
                        ? `${project.defaultLocationLat},${project.defaultLocationLon}`
                        : ''
                      }
                      ref='defaultLocation'
                      placeholder='34.8977,-87.29987'
                      onChange={(evt) => {
                        const latLng = evt.target.value.split(',')
                        if (typeof latLng[0] !== 'undefined' && typeof latLng[1] !== 'undefined') {
                          let stateUpdate = { general: { $merge: {defaultLocationLat: latLng[0], defaultLocationLon: latLng[1]} } }
                          this.setState(update(this.state, stateUpdate))
                        } else {
                          console.log('invalid value for latlng')
                        }
                      }}
                    />
                    <InputGroup.Button>
                      <Button
                        onClick={() => {
                          const bounds = project.defaultLocationLat !== null && project.defaultLocationLon !== null ? [[project.defaultLocationLat + 1, project.defaultLocationLon + 1], [project.defaultLocationLat - 1, project.defaultLocationLon - 1]] : null
                          console.log(bounds)
                          this.refs.mapModal.open({
                            title: 'Select a default location',
                            body: `Pretend this is a map`,
                            markerSelect: true,
                            marker: project.defaultLocationLat !== null && project.defaultLocationLon !== null
                              ? {lat: project.defaultLocationLat, lng: project.defaultLocationLon}
                              : null,
                            bounds: bounds,
                            onConfirm: (marker) => {
                              if (marker) {
                                ReactDOM.findDOMNode(this.refs.defaultLocation).value = `${marker.lat.toFixed(6)},${marker.lng.toFixed(6)}`
                                let stateUpdate = { general: { $merge: {defaultLocationLat: marker.lat, defaultLocationLon: marker.lng} } }
                                this.setState(update(this.state, stateUpdate))
                              }
                            }
                          })
                        }}
                      >
                        <Glyphicon glyph='map-marker'/>
                      </Button>
                    </InputGroup.Button>
                  </InputGroup>
                </FormGroup>
              </ListGroupItem>
              <ListGroupItem>
                <FormGroup>
                  <ControlLabel><Glyphicon glyph='fullscreen' /> {messages.general.location.boundingBox}</ControlLabel>
                  <InputGroup ref='boundingBoxGroup'>
                    <FormControl
                      type='text'
                      defaultValue={project.north !== null ? `${project.west},${project.south},${project.east},${project.north}` : ''}
                      ref='boundingBox'
                      placeholder='-88.45,33.22,-87.12,34.89'
                      onChange={(evt) => {
                        const bBox = evt.target.value.split(',')
                        if (bBox.length === 4) {
                          let stateUpdate = { general: { $merge: {west: bBox[0], south: bBox[1], east: bBox[2], north: bBox[3]} } }
                          this.setState(update(this.state, stateUpdate))
                        }
                      }}
                    />
                    {
                      <InputGroup.Button>
                      <Button
                        disabled // TODO: wait for react-leaflet-draw to update library to  re-enable bounds select
                        onClick={() => {
                          const bounds = project.north !== null ? [[project.south, project.west], [project.north, project.east]] : null
                          console.log(bounds)
                          this.refs.mapModal.open({
                            title: 'Select project bounds',
                            body: `Pretend this is a map`,
                            bounds: bounds,
                            rectangleSelect: true,
                            onConfirm: (rectangle) => {
                              console.log('OK, rectangle', rectangle)
                              if (rectangle && rectangle.getBounds()) {
                                let bounds = rectangle.getBounds()
                                let west = bounds.getWest().toFixed(6)
                                let south = bounds.getSouth().toFixed(6)
                                let east = bounds.getEast().toFixed(6)
                                let north = bounds.getNorth().toFixed(6)
                                ReactDOM.findDOMNode(this.refs.boundingBox).value = `${west},${south},${east},${north}`
                                let stateUpdate = { general: { $merge: {west: west, south: south, east: east, north: north} } }
                                this.setState(update(this.state, stateUpdate))
                              }
                              return rectangle
                            }
                          })
                        }}
                      >
                        <Glyphicon glyph='fullscreen'/>
                      </Button>
                    </InputGroup.Button>
                  }
                  </InputGroup>
                </FormGroup>
              </ListGroupItem>
              <ListGroupItem>
                <ControlLabel><Glyphicon glyph='time' /> {messages.general.location.defaultTimeZone}</ControlLabel>
                <TimezoneSelect
                  value={this.state.general.defaultTimeZone || project.defaultTimeZone}
                  onChange={(option) => {
                    let stateUpdate = { general: { $merge: { defaultTimeZone: option.value } } }
                    this.setState(update(this.state, stateUpdate))
                  }}
                />
              </ListGroupItem>
              <ListGroupItem>
                <ControlLabel><Glyphicon glyph='globe' /> {messages.general.location.defaultLanguage}</ControlLabel>
                <LanguageSelect
                  value={this.state.general.defaultLanguage || project.defaultLanguage}
                  onChange={(option) => {
                    let stateUpdate = { general: { $merge: { defaultLanguage: option.value } } }
                    this.setState(update(this.state, stateUpdate))
                  }}
                />
              </ListGroupItem>
            </ListGroup>
          </Panel>
          <Panel bsStyle='danger' header={<h3>Danger zone</h3>}>
            <ListGroup fill>
              <ListGroupItem>
                <Button onClick={() => this.props.deleteProject(project)} className='pull-right' bsStyle='danger'><Icon name='trash'/> Delete organization</Button>
                <h4>Delete this organization.</h4>
                <p>Once you delete an organization, the organization and all feed sources it contains cannot be recovered.</p>
              </ListGroupItem>
            </ListGroup>
          </Panel>
          <Row>
            <Col xs={12}>
              {/* Save button */}
              <Button
                bsStyle='primary'
                type='submit'
                disabled={projectEditDisabled || generalSettingsUnedited}
                onClick={(evt) => {
                  evt.preventDefault()
                  console.log(this.state)
                  console.log(project)
                  this.props.updateProjectSettings(project, this.state.general)
                }}
              >
                {messages.save}
              </Button>
            </Col>
          </Row>
      </div>
      : <div className='general-settings-panel'>
          <Panel header={<h4>{messages.deployment.buildConfig.title}</h4>}>
            <Row>
            <Col xs={6}>
            <FormGroup>
              <FormControl
                componentClass='select'
                defaultValue={project.buildConfig && project.buildConfig.fetchElevationUS ? project.buildConfig.fetchElevationUS : ''}
                label={messages.deployment.buildConfig.fetchElevationUS}
                ref='fetchElevationUS'
                onChange={(evt) => {
                  let stateUpdate = { deployment: { buildConfig: { fetchElevationUS: { $set: (evt.target.value === 'true') } } } }
                  this.setState(update(this.state, stateUpdate))
                }}
              >
                <option value='false'>false</option>
                <option value='true'>true</option>
              </FormControl>
            </FormGroup>
            </Col>
            <Col xs={6}>
            <FormGroup>
            <FormControl
              componentClass='select'
              defaultValue={project.buildConfig && project.buildConfig.stationTransfers ? project.buildConfig.stationTransfers : ''}
              label={messages.deployment.buildConfig.stationTransfers}
              ref='stationTransfers'
              onChange={(evt) => {
                let stateUpdate = { deployment: { buildConfig: { stationTransfers: { $set: (evt.target.value === 'true') } } } }
                this.setState(update(this.state, stateUpdate))
              }}
            >
              <option value='false'>false</option>
              <option value='true'>true</option>
            </FormControl>
            </FormGroup>
            </Col>
            </Row>
            <FormGroup>
            <FormControl
              defaultValue={project.buildConfig && project.buildConfig.subwayAccessTime ? project.buildConfig.subwayAccessTime : ''}
              placeholder='2.5 (min)'
              label={messages.deployment.buildConfig.subwayAccessTime}
              ref='subwayAccessTime'
              onChange={(evt) => {
                let stateUpdate = { deployment: { buildConfig: { subwayAccessTime: { $set: +evt.target.value } } } }
                this.setState(update(this.state, stateUpdate))
              }}
            />
            </FormGroup>
            <FormGroup>
            <FormControl
              defaultValue={project.buildConfig && project.buildConfig.fares ? project.buildConfig.fares : ''}
              placeholder='fares'
              label={messages.deployment.buildConfig.fares}
              ref='fares'
              onChange={(evt) => {
                let stateUpdate = { deployment: { buildConfig: { fares: { $set: evt.target.value } } } }
                this.setState(update(this.state, stateUpdate))
              }}
            />
            </FormGroup>
          </Panel>
          <Panel header={<h4>Router Config</h4>}>
            <Row>
            <Col xs={6}>
            <FormGroup>
            <FormControl
              type='integer'
              defaultValue={project.routerConfig && project.routerConfig.numItineraries ? project.routerConfig.numItineraries : ''}
              placeholder='6'
              label={messages.deployment.buildConfig.numItineraries}
              ref='numItineraries'
              onChange={(evt) => {
                let stateUpdate = { deployment: { routerConfig: { numItineraries: { $set: +evt.target.value } } } }
                this.setState(update(this.state, stateUpdate))
              }}
            />
            </FormGroup>
            </Col>
            <Col xs={6}>
            <FormGroup>
            <FormControl
              type='number'
              defaultValue={project.routerConfig && project.routerConfig.walkSpeed ? project.routerConfig.walkSpeed : ''}
              placeholder='3.0'
              label={messages.deployment.buildConfig.walkSpeed}
              ref='walkSpeed'
              onChange={(evt) => {
                let stateUpdate = { deployment: { routerConfig: { walkSpeed: { $set: +evt.target.value } } } }
                this.setState(update(this.state, stateUpdate))
              }}
            />
            </FormGroup>
            </Col>
            </Row>
            <Row>
            <Col xs={6}>
            <FormGroup>
            <FormControl
              type='number'
              defaultValue={project.routerConfig && project.routerConfig.stairsReluctance ? project.routerConfig.stairsReluctance : ''}
              placeholder='2.0'
              label={messages.deployment.buildConfig.stairsReluctance}
              ref='stairsReluctance'
              onChange={(evt) => {
                let stateUpdate = { deployment: { routerConfig: { stairsReluctance: { $set: +evt.target.value } } } }
                this.setState(update(this.state, stateUpdate))
              }}
            />
            </FormGroup>
            </Col>
            <Col xs={6}>
            <FormGroup>
            <FormControl
              type='number'
              defaultValue={project.routerConfig && project.routerConfig.carDropoffTime ? project.routerConfig.carDropoffTime : ''}
              placeholder='240 (sec)'
              label={messages.deployment.buildConfig.carDropoffTime}
              ref='carDropoffTime'
              onChange={(evt) => {
                let stateUpdate = { deployment: { routerConfig: { carDropoffTime: { $set: +evt.target.value } } } }
                this.setState(update(this.state, stateUpdate))
              }}
            />
            </FormGroup>
            </Col>
            </Row>
            <FormGroup>
            <FormControl
              type='text'
              defaultValue={project.routerConfig && project.routerConfig.brandingUrlRoot ? project.routerConfig.brandingUrlRoot : ''}
              placeholder='http://gtfs.example.com/branding'
              label={messages.deployment.buildConfig.brandingUrlRoot}
              ref='brandingUrlRoot'
              onChange={(evt) => {
                let stateUpdate = { deployment: { routerConfig: { brandingUrlRoot: { $set: evt.target.value } } } }
                this.setState(update(this.state, stateUpdate))
              }}
            />
            </FormGroup>
          </Panel>
          <Panel header={
            <h4>
              <Button
                className='pull-right'
                bsStyle='success'
                bsSize='xsmall'
                onClick={() => {
                  let stateUpdate = { deployment: { otpServers: { $push: [{name: '', publicUrl: '', internalUrl: [], admin: false}] } } }
                  this.setState(update(this.state, stateUpdate))
                }}
              >
                <Glyphicon glyph='plus'/> {messages.deployment.servers.new}
              </Button>
              {messages.deployment.servers.title}
            </h4>
          }>
            <div>
            {this.state.deployment.otpServers && this.state.deployment.otpServers.map((server, i) => {
              let title = (
                <h5>
                  {server.name}{'  '}
                  <small>{server.publicUrl}</small>
                </h5>
              )
              return (
                <Panel key={i}
                  header={server.name ? title : `[${messages.deployment.servers.serverPlaceholder}]`}
                  defaultExpanded={server.name === ''}
                  collapsible
                >
                  <Form>
                    <Button
                      bsSize='xsmall'
                      bsStyle='danger'
                      className='pull-right'
                      onClick={() => {
                        let stateUpdate = { deployment: { otpServers: { $splice: [[i, 1]] } } }
                        this.setState(update(this.state, stateUpdate))
                      }}
                    >
                      Remove <Glyphicon glyph='remove'/>
                    </Button>
                    <FormGroup>
                      <ControlLabel>{messages.deployment.servers.name}</ControlLabel>
                      <FormControl
                        type='text'
                        placeholder={messages.deployment.servers.namePlaceholder}
                        defaultValue={server.name}
                        onChange={(evt) => {
                          let stateUpdate = { deployment: { otpServers: { [i]: { $merge: { name: evt.target.value } } } } }
                          this.setState(update(this.state, stateUpdate))
                        }}
                      />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>{messages.deployment.servers.public}</ControlLabel>
                      <FormControl
                        type='text'
                        placeholder='http://otp.example.com'
                        defaultValue={server.publicUrl}
                        onChange={(evt) => {
                          let stateUpdate = { deployment: { otpServers: { [i]: { $merge: { publicUrl: evt.target.value } } } } }
                          this.setState(update(this.state, stateUpdate))
                        }}
                      />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>{messages.deployment.servers.internal}</ControlLabel>
                      <FormControl
                        type='text'
                        placeholder='http://127.0.0.1/otp,http://0.0.0.0/otp'
                        defaultValue={server.internalUrl && server.internalUrl.join(',')}
                        onChange={(evt) => {
                          let stateUpdate = { deployment: { otpServers: { [i]: { $merge: { internalUrl: evt.target.value.split(',') } } } } }
                          this.setState(update(this.state, stateUpdate))
                        }}
                      />
                    </FormGroup>
                    <Checkbox
                      checked={server.admin}
                      onChange={(evt) => {
                        let stateUpdate = { deployment: { otpServers: { [i]: { $merge: { admin: evt.target.checked } } } } }
                        this.setState(update(this.state, stateUpdate))
                      }}
                    >
                      {messages.deployment.servers.admin}
                    </Checkbox>
                  </Form>
                </Panel>
              )
            })

            }
            </div>
          </Panel>
          <Panel header={<h4>{messages.deployment.osm.title}</h4>}>
            <FormGroup
              onChange={(evt) => {
                let stateUpdate = { deployment: { useCustomOsmBounds: { $set: (evt.target.value === 'true') } } }
                this.setState(update(this.state, stateUpdate))
              }}
            >
              <Radio
                name='osm-extract'
                checked={typeof this.state.deployment.useCustomOsmBounds !== 'undefined' ? !this.state.deployment.useCustomOsmBounds : !project.useCustomOsmBounds}
                value={false}
              >
                {messages.deployment.osm.gtfs}
              </Radio>
              <Radio
                name='osm-extract'
                checked={typeof this.state.deployment.useCustomOsmBounds !== 'undefined' ? this.state.deployment.useCustomOsmBounds : project.useCustomOsmBounds}
                value={true}
              >
                {messages.deployment.osm.custom}
              </Radio>
            </FormGroup>
            {project.useCustomOsmBounds || this.state.deployment.useCustomOsmBounds
              ? <FormControl
                  type='text'
                  defaultValue={project.osmNorth !== null ? `${project.osmWest},${project.osmSouth},${project.osmEast},${project.osmNorth}` : ''}
                  placeholder='-88.45,33.22,-87.12,34.89'
                  label={(<span><Glyphicon glyph='fullscreen' /> {messages.deployment.osm.bounds}</span>)}
                  ref='osmBounds'
                  onChange={(evt) => {
                    const bBox = evt.target.value.split(',')
                    if (bBox.length === 4) {
                      let stateUpdate = { deployment: { $merge: { osmWest: bBox[0], osmSouth: bBox[1], osmEast: bBox[2], osmNorth: bBox[3] } } }
                      this.setState(update(this.state, stateUpdate))
                    }
                  }}
                />
              : null
            }
          </Panel>
          <Row>
            <Col md={12}>
              {/* Save button */}
              <Button
                bsStyle='primary'
                type='submit'
                disabled={projectEditDisabled || deploymentSettingsUnedited}
                onClick={(evt) => {
                  evt.preventDefault()
                  console.log(this.state)
                  console.log(project)
                  this.props.updateProjectSettings(project, this.state.deployment)
                }}
              >
                {messages.save}
              </Button>
            </Col>
          </Row>
      </div>

    return (
      <Row>
      <Col xs={12} sm={3}>
        <Panel>
          <ListGroup fill>
            <LinkContainer to={`/project/${project.id}/settings`}><ListGroupItem>{messages.general.title}</ListGroupItem></LinkContainer>
            {isModuleEnabled('deployment')
              ? <LinkContainer to={`/project/${project.id}/settings/deployment`}><ListGroupItem>{messages.deployment.title}</ListGroupItem></LinkContainer>
              : null
            }
          </ListGroup>
        </Panel>
      </Col>
      <Col xs={12} sm={7}>
        {activeSettingsPanel}
      </Col>
      <MapModal ref='mapModal'/>
      </Row>

    )
  }
}
