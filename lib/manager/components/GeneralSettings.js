// @flow

import lonlat from '@conveyal/lonlat'
import Icon from '@conveyal/woonerf/components/icon'
import moment from 'moment'
import React, {Component} from 'react'
import update from 'react-addons-update'
import {shallowEqual} from 'react-pure-render'
import moment from 'moment'
import {
  Row,
  Col,
  Button,
  Panel,
  Glyphicon,
  Checkbox,
  FormGroup,
  InputGroup,
  ControlLabel,
  FormControl,
  ListGroup,
  ListGroupItem
} from 'react-bootstrap'

import MapModal from '../../common/components/MapModal.js'
import ConfirmModal from '../../common/components/ConfirmModal'
import {getMessage, getComponentMessages} from '../../common/util/config'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import LanguageSelect from '../../common/components/LanguageSelect'
import {validationState} from '../util'

import type {Project} from '../../types'

type Props = {
  deleteProject?: (Project) => Promise<*>,
  editDisabled?: boolean,
  project: {} | Project,
  showDangerZone?: boolean,
  updateProject: (Object | Project, Project) => void
}

type State = {
  model: {
    name?: string
  },
  validation: {
    bounds: boolean,
    defaultLocation: boolean,
    name: boolean
  }
}

const DEFAULT_FETCH_TIME = moment().startOf('day').add(2, 'hours')

const messages = getComponentMessages('ProjectSettings')

export default class GeneralSettings extends Component {
  props: Props
  state: State

  state = {
    model: {},
    validation: {
      bounds: true,
      defaultLocation: true,
      name: true
    }
  }

  componentWillMount () {
    this._updateStateFromProps(this.props)
  }

  componentWillReceiveProps (nextProps: Props) {
    this._updateStateFromProps(nextProps)
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    return !shallowEqual(nextProps, this.props) || !shallowEqual(nextState, this.state)
  }

  _updateStateFromProps (props: Props) {
    // cast to make flow happy
    const model: any = props.project
    this.setState({ model })
  }

  _onDeleteProject = () => {
    const {deleteProject, project} = this.props
    if (!deleteProject) {
      throw new Error('GeneralSettings component missing deleteProject action')
    }
    // cast to make flow happy
    const castedProject: Project = ((project: any): Project)
    this.refs.confirm.open({
      title: getMessage(messages, 'deleteProject'),
      body: getMessage(messages, 'confirmDelete'),
      onConfirm: () => deleteProject(project)
    })
  }

  _onChangeAutoFetch = (evt: Event & {target: HTMLInputElement}) => {
    const autoFetchMinute = DEFAULT_FETCH_TIME.minutes()
    const autoFetchHour = DEFAULT_FETCH_TIME.hours()
    const autoFetchFeeds = evt.target.checked
    this.setState(update(this.state, {general: {
      $merge: {autoFetchFeeds, autoFetchMinute, autoFetchHour}
    }}))
  }

  _onChangeBounds = evt => {
    // Parse values found in string into floats
    const bBox = evt.target.value.split(',')
      .map(parseFloat)
      // Filter out any bad parsed values
      .filter(parsedValue => !isNaN(parsedValue))
    if (bBox.length === 4) {
      // Update settings if and only if there are four valid parsed values
      const [west, south, east, north] = bBox
      const bounds = {west, south, east, north}
      this.setState(update(this.state, {general: {
        $merge: {bounds}
      }}))
    } else {
      console.warn('Invalid values for bounding box', bBox)
    }
  }

  _onChangeDateTime = (seconds: number) => {
    const time = moment(+seconds)
    this.setState(update(this.state, {general: {
      $merge: {autoFetchMinute: time.minutes(), autoFetchHour: time.hours()}
    }}))
  }

  _onChangeLocation = (evt) => {
    const latLng = evt.target.value.split(',')
    if (typeof latLng[0] !== 'undefined' && typeof latLng[1] !== 'undefined') {
      const [defaultLocationLat, defaultLocationLon] = latLng
      this.setState(update(this.state, {general: {
        $merge: {defaultLocationLat, defaultLocationLon}
      }}))
    } else {
      console.warn('invalid value for latlng', latLng)
    }

    this.setState(
      update(this.state, {
        model: {
          $merge: {defaultLocationLat, defaultLocationLon}
        },
        validation: {
          defaultLocation: {
            $set: true
          }
        }
      })
    )
  }

  _onChangeLanguage = ({value: defaultLanguage}) => {
    this.setState(update(this.state, {general: {$merge: {defaultLanguage}}}))
  }

  _onChangeTimeZone = ({value: defaultTimeZone}) => {
    this.setState(update(this.state, {general: {$merge: {defaultTimeZone}}}))
  }

  _onChangeName = ({target}: {target: HTMLInputElement}) => {
    const value = target.value
    this.setState(
      update(this.state, {
        model: {
          $merge: {[target.name]: value}
        },
        validation: {
          name: {
            $set: value && value.length > 0
          }
        }
      })
    )
  }

  _onOpenMapBoundsModal = () => {
    const project = this.props
    // $FlowFixMe - ignore type check to make flow happy
    const bounds = isNumeric(project.north) ? [[project.south, project.west], [project.north, project.east]] : null
    this.refs.mapModal.open({
      title: 'Select project bounds',
      body: `Pretend this is a map`,
      bounds: bounds,
      rectangleSelect: true,
      onConfirm: (rectangle) => {
        if (rectangle && rectangle.getBounds()) {
          const [[south, west], [north, east]] = rectangle.getBounds()
            .map(arr => arr.map(v => v.toFixed(6)))
          const bounds = `${west},${south},${east},${north}`
          ReactDOM.findDOMNode(this.refs.boundingBox).value = bounds
          this.setState(update(this.state, {general: {
            $merge: {west, south, east, north}
          }}))
        }
        return rectangle
      }
    })
  }

  _onOpenMapModal = () => {
    const {defaultLocationLat, defaultLocationLon} = this.props.project
    const bounds = defaultLocationLat !== null && defaultLocationLon !== null
      ? [
        [defaultLocationLat + 1, defaultLocationLon + 1],
        [defaultLocationLat - 1, defaultLocationLon - 1]
      ]
      : null
    this.refs.mapModal.open({
      title: 'Select a default location',
      body: `Pretend this is a map`,
      markerSelect: true,
      marker: bounds
        ? {lat: defaultLocationLat, lng: defaultLocationLon}
        : null,
      bounds,
      onConfirm: (marker) => {
        if (marker) {
          const defaultLocationLat = +marker.lat.toFixed(6)
          const defaultLocationLon = +marker.lng.toFixed(6)
          this.setState(update(this.state, {general: {
            $merge: {defaultLocationLat, defaultLocationLon}
          }}))
        }
      }
    })
  }

  _onSaveSettings = () => {
    this.props.updateProjectSettings(this.props.project, this.state.general)
  }

  _onUpdateName = () => {
    const {name} = this.state
    this.props.updateProjectSettings(this.props.project, {name})
      .then(() => this.setState({name: undefined}))
  }

  _settingsAreUnedited = () => Object.keys(this.state.general).length === 0 &&
    this.state.general.constructor === Object

  render () {
    // console.log(this.state)
    const messages = getComponentMessages('ProjectSettings')
    const {project, editDisabled} = this.props
    // const {north, south, east, west} = project.bounds
    const autoFetchChecked = typeof this.state.general.autoFetchFeeds !== 'undefined'
      ? this.state.general.autoFetchFeeds
      : project.autoFetchFeeds
    if (editDisabled) {
      return (
        <p className='lead text-center'>
          <strong>Warning!</strong>{' '}
          You do not have permission to edit details for this feed source.
        </p>
      )
    }
    return (
      <div className='general-settings-panel'>
        <ConfirmModal ref='confirm' />
        <Panel header={<h4>{getMessage(messages, 'title')}</h4>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup>
                <ControlLabel>
                  {getMessage(messages, 'general.name')}
                </ControlLabel>
                <InputGroup>
                  <FormControl
                    value={typeof this.state.name !== 'undefined'
                      ? this.state.name
                      : project.name
                    }
                    name={'name'}
                    onChange={this._onChangeValue} />
                  <InputGroup.Button>
                    <Button
                      disabled={!this.state.name || this.state.name === project.name}
                      onClick={this._onUpdateName}>
                      {getMessage(messages, 'rename')}
                    </Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel header={<h4>{getMessage(messages, 'fields.updates.title')}</h4>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup>
                <Checkbox
                  checked={autoFetchChecked}
                  onChange={this._onChangeAutoFetch}>
                  <strong>
                    {getMessage(messages, 'general.updates.autoFetchFeeds')}
                  </strong>
                </Checkbox>
                {autoFetchChecked
                  ? <DateTimeField
                    dateTime={project.autoFetchMinute !== null
                      ? +moment().startOf('day')
                        .add(project.autoFetchHour, 'hours')
                        .add(project.autoFetchMinute, 'minutes')
                      : DEFAULT_FETCH_TIME
                    }
                    mode='time'
                    onChange={this._onChangeDateTime} />
                  : null
                }
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel header={<h4>{getMessage(messages, 'fields.location.title')}</h4>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup>
                <ControlLabel>
                  <Glyphicon glyph='map-marker' />{' '}
                  {getMessage(messages, 'general.location.defaultLocation')}
                </ControlLabel>
                <InputGroup ref='defaultLocationGroup'>
                  <FormControl
                    disabled
                    onChange={this._onChangeLocation}
                    placeholder='34.8977,-87.29987'
                    ref='defaultLocation'
                    type='text'
                    value={this.state.general.defaultLocationLat && this.state.general.defaultLocationLon
                      ? `${this.state.general.defaultLocationLat},${this.state.general.defaultLocationLon}`
                      : project.defaultLocationLat && project.defaultLocationLon
                        ? `${project.defaultLocationLat},${project.defaultLocationLon}`
                        : ''
                    }
                    />
                  <InputGroup.Button>
                    <Button
                      onClick={this._onOpenMapModal}>
                      <Glyphicon glyph='map-marker' />
                    </Button>
                  </InputGroup.Button>
                </InputGroup>
                <HelpBlock>Press the location marker to select the location.</HelpBlock>
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <FormGroup>
                <ControlLabel>
                  <Glyphicon glyph='fullscreen' />{' '}
                  {getMessage(messages, 'general.location.boundingBox')}
                </ControlLabel>
                <InputGroup ref='boundingBoxGroup'>
                  <FormControl
                    type='text'
                    defaultValue={project.bounds !== null
                      ? `${project.bounds.west},${project.bounds.south},${project.bounds.east},${project.bounds.north}`
                      : ''
                    }
                    ref='boundingBox'
                    placeholder='-88.45,33.22,-87.12,34.89'
                    onChange={this._onChangeBounds} />
                  {
                    <InputGroup.Button>
                      <Button
                        // TODO: wait for react-leaflet-draw to update library
                        // to re-enable bounds select
                        disabled
                        onClick={this._onOpenMapBoundsModal}>
                        <Glyphicon glyph='fullscreen' />
                      </Button>
                    </InputGroup.Button>
                  }
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <ControlLabel>
                <Glyphicon glyph='time' />{' '}
                {getMessage(messages, 'general.location.defaultTimeZone')}
              </ControlLabel>
              <TimezoneSelect
                value={model.defaultTimeZone}
                onChange={this._onChangeTimeZone} />
            </ListGroupItem>
            <ListGroupItem>
              <ControlLabel>
                <Glyphicon glyph='globe' />{' '}
                {getMessage(messages, 'general.location.defaultLanguage')}
              </ControlLabel>
              <LanguageSelect
                value={model.defaultLanguage}
                onChange={this._onChangeLanguage} />
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel bsStyle='danger' header={<h3>Danger zone</h3>}>
          <ListGroup fill>
            <ListGroupItem>
              <Button
                bsStyle='danger'
                className='pull-right'
                data-test-id='delete-project-button'
                onClick={this._onDeleteProject}
              >
                <Icon type='trash' /> Delete project
              </Button>
              <h4>Delete this project.</h4>
              <p>
                Once you delete a project, the project and all feed sources
                it contains cannot be recovered.
              </p>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Row>
          <Col xs={12}>
            {/* Save button */}
            <Button
              bsStyle='primary'
              disabled={editDisabled || this._settingsAreUnedited()}
              onClick={this._onSaveSettings}>
              {getMessage(messages, 'save')}
            </Button>
          </Col>
        </Row>
        <MapModal ref='mapModal' />
      </div>
    )
  }
}

/**
 * Returns true if value looks like a number.
 * Copied from https://stackoverflow.com/a/1830844/269834
 *
 * @param  {any}  value
 * @return {Boolean}
 */
function isNumeric (value: any): boolean {
  return !isNaN(value - parseFloat(value))
}
