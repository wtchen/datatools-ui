import React, {Component} from 'react'
import {Icon} from '@conveyal/woonerf'
import ReactDOM from 'react-dom'
import DateTimeField from 'react-bootstrap-datetimepicker'
import update from 'react-addons-update'
import { shallowEqual } from 'react-pure-render'
import moment from 'moment'
import { Row, Col, Button, Panel, Glyphicon, Checkbox, FormGroup, InputGroup, ControlLabel, FormControl, ListGroup, ListGroupItem } from 'react-bootstrap'

import { getMessage, getComponentMessages } from '../../common/util/config'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import LanguageSelect from '../../common/components/LanguageSelect'

export default class GeneralSettings extends Component {
  constructor (props) {
    super(props)
    this.state = {
      general: {}
    }
  }
  componentWillReceiveProps (nextProps) {
    this.setState({
      general: {}
    })
  }
  shouldComponentUpdate (nextProps, nextState) {
    return !shallowEqual(nextProps, this.props) || !shallowEqual(nextState, this.state)
  }
  render () {
    const messages = getComponentMessages('ProjectSettings')
    const { project, editDisabled, updateProjectSettings, deleteProject } = this.props
    const noEdits = Object.keys(this.state.general).length === 0 && this.state.general.constructor === Object
    const autoFetchChecked = typeof this.state.general.autoFetchFeeds !== 'undefined' ? this.state.general.autoFetchFeeds : project.autoFetchFeeds
    const DEFAULT_FETCH_TIME = moment().startOf('day').add(2, 'hours')
    return (
      <div className='general-settings-panel'>
        <Panel header={<h4>{getMessage(messages, 'title')}</h4>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup>
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
                        updateProjectSettings(project, {name: this.state.name})
                        .then(() => this.setState({name: null}))
                      }}
                    >Rename</Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel header={<h4>{getMessage(messages, 'general.updates.title')}</h4>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup>
                <Checkbox
                  checked={autoFetchChecked}
                  onChange={(evt) => {
                    const minutes = moment(DEFAULT_FETCH_TIME).minutes()
                    const hours = moment(DEFAULT_FETCH_TIME).hours()
                    const stateUpdate = { general: { $merge: { autoFetchFeeds: evt.target.checked, autoFetchMinute: minutes, autoFetchHour: hours } } }
                    this.setState(update(this.state, stateUpdate))
                  }}
                >
                  <strong>{getMessage(messages, 'general.updates.autoFetchFeeds')}</strong>
                </Checkbox>
                {autoFetchChecked
                  ? <DateTimeField
                    dateTime={project.autoFetchMinute !== null
                      ? +moment().startOf('day').add(project.autoFetchHour, 'hours').add(project.autoFetchMinute, 'minutes')
                      : DEFAULT_FETCH_TIME
                    }
                    mode='time'
                    onChange={seconds => {
                      const time = moment(+seconds)
                      const minutes = moment(time).minutes()
                      const hours = moment(time).hours()
                      const stateUpdate = { general: { $merge: { autoFetchMinute: minutes, autoFetchHour: hours } } }
                      this.setState(update(this.state, stateUpdate))
                    }}
                  />
                  : null
                }
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel header={<h4>{getMessage(messages, 'general.location.title')}</h4>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup>
                <ControlLabel><Glyphicon glyph='map-marker' /> {getMessage(messages, 'general.location.defaultLocation')}</ControlLabel>
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
                        const stateUpdate = { general: { $merge: {defaultLocationLat: latLng[0], defaultLocationLon: latLng[1]} } }
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
                              const stateUpdate = { general: { $merge: {defaultLocationLat: marker.lat, defaultLocationLon: marker.lng} } }
                              this.setState(update(this.state, stateUpdate))
                            }
                          }
                        })
                      }}
                    >
                      <Glyphicon glyph='map-marker' />
                    </Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <FormGroup>
                <ControlLabel><Glyphicon glyph='fullscreen' /> {getMessage(messages, 'general.location.boundingBox')}</ControlLabel>
                <InputGroup ref='boundingBoxGroup'>
                  <FormControl
                    type='text'
                    defaultValue={project.north !== null ? `${project.west},${project.south},${project.east},${project.north}` : ''}
                    ref='boundingBox'
                    placeholder='-88.45,33.22,-87.12,34.89'
                    onChange={(evt) => {
                      const bBox = evt.target.value.split(',')
                      if (bBox.length === 4) {
                        const stateUpdate = { general: { $merge: {west: bBox[0], south: bBox[1], east: bBox[2], north: bBox[3]} } }
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
                                const bounds = rectangle.getBounds()
                                const west = bounds.getWest().toFixed(6)
                                const south = bounds.getSouth().toFixed(6)
                                const east = bounds.getEast().toFixed(6)
                                const north = bounds.getNorth().toFixed(6)
                                ReactDOM.findDOMNode(this.refs.boundingBox).value = `${west},${south},${east},${north}`
                                const stateUpdate = { general: { $merge: {west: west, south: south, east: east, north: north} } }
                                this.setState(update(this.state, stateUpdate))
                              }
                              return rectangle
                            }
                          })
                        }}
                      >
                        <Glyphicon glyph='fullscreen' />
                      </Button>
                    </InputGroup.Button>
                  }
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <ControlLabel><Glyphicon glyph='time' /> {getMessage(messages, 'general.location.defaultTimeZone')}</ControlLabel>
              <TimezoneSelect
                value={this.state.general.defaultTimeZone || project.defaultTimeZone}
                onChange={(option) => {
                  const stateUpdate = { general: { $merge: { defaultTimeZone: option.value } } }
                  this.setState(update(this.state, stateUpdate))
                }}
              />
            </ListGroupItem>
            <ListGroupItem>
              <ControlLabel><Glyphicon glyph='globe' /> {getMessage(messages, 'general.location.defaultLanguage')}</ControlLabel>
              <LanguageSelect
                value={this.state.general.defaultLanguage || project.defaultLanguage}
                onChange={(option) => {
                  const stateUpdate = { general: { $merge: { defaultLanguage: option.value } } }
                  this.setState(update(this.state, stateUpdate))
                }}
              />
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel bsStyle='danger' header={<h3>Danger zone</h3>}>
          <ListGroup fill>
            <ListGroupItem>
              <Button onClick={() => deleteProject(project)} className='pull-right' bsStyle='danger'><Icon type='trash' /> Delete organization</Button>
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
              disabled={editDisabled || noEdits}
              onClick={(evt) => {
                evt.preventDefault()
                console.log(this.state)
                console.log(project)
                updateProjectSettings(project, this.state.general)
              }}
            >
              {getMessage(messages, 'save')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
