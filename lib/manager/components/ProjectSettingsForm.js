// @flow

import lonlat from '@conveyal/lonlat'
import Icon from '@conveyal/woonerf/components/icon'
import moment from 'moment'
import React from 'react'
import update from 'react-addons-update'
import {
  Button,
  Checkbox,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  Glyphicon,
  HelpBlock,
  InputGroup,
  ListGroup,
  ListGroupItem,
  Panel,
  Row
} from 'react-bootstrap'
import DateTimeField from 'react-bootstrap-datetimepicker'
import ReactDOM from 'react-dom'
import {shallowEqual} from 'react-pure-render'
import {browserHistory} from 'react-router'

import {deleteProject, updateProject} from '../actions/projects'
import MapModal from '../../common/components/MapModal.js'
import ConfirmModal from '../../common/components/ConfirmModal'
import LanguageSelect from '../../common/components/LanguageSelect'
import MessageComponent from '../../common/components/MessageComponent'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import {validationState} from '../util'

import type {Bounds, Project} from '../../types'

type ProjectModel = {
  autoFetchFeeds?: boolean,
  autoFetchHour?: number,
  autoFetchMinute?: number,
  bounds?: Bounds,
  defaultLanguage?: string,
  defaultLocationLat?: number,
  defaultLocationLon?: number,
  defaultTimeZone?: string,
  id?: string,
  name?: string
}

type Props = {
  deleteProject?: typeof deleteProject,
  editDisabled?: boolean,
  onCancelUrl: string,
  project: Project | ProjectModel,
  showDangerZone?: boolean,
  updateProject: typeof updateProject
}

type State = {
  model: ProjectModel,
  validation: {
    bounds: boolean,
    defaultLocation: boolean,
    name: boolean
  }
}

const DEFAULT_FETCH_TIME = moment().startOf('day').add(2, 'hours')

export default class ProjectSettingsForm extends MessageComponent<Props, State> {
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

  _onCancel = () => {
    browserHistory.push(this.props.onCancelUrl)
  }

  _onDeleteProject = () => {
    const {deleteProject, project} = this.props
    if (!deleteProject) {
      throw new Error('ProjectSettingsForm component missing deleteProject action')
    }
    // cast to make flow happy
    const _project = ((project): any)
    this.refs.confirm.open({
      title: this.messages('deleteProject'),
      body: this.messages('confirmDelete'),
      onConfirm: () => deleteProject(_project)
    })
  }

  _onChangeAutoFetch = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const autoFetchMinute = DEFAULT_FETCH_TIME.minutes()
    const autoFetchHour = DEFAULT_FETCH_TIME.hours()
    const autoFetchFeeds = evt.target.checked
    this.setState(update(this.state, {
      model: {
        $merge: {autoFetchFeeds, autoFetchMinute, autoFetchHour}
      }
    }))
  }

  _onChangeBounds = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    // Parse values found in string into floats
    const {value} = evt.target
    const bBox = value.split(',')
      .map(parseFloat)
      // Filter out any bad parsed values
      .filter(parsedValue => !isNaN(parsedValue))
    if (bBox.length === 4) {
      // Update settings if and only if there are four valid parsed values
      const [west, south, east, north] = bBox
      const bounds = {west, south, east, north}
      this.setState(update(this.state, {
        model: {
          $merge: {bounds}
        },
        validation: {
          bounds: {
            $set: bBox.every(isNumeric)
          }
        }
      }))
    } else {
      this.setState(
        update(this.state, {
          validation: {
            bounds: {
              $set: !value || value === ''
            }
          }
        })
      )
    }
  }

  _onChangeDateTime = (seconds: number) => {
    const time = moment(+seconds)
    this.setState(update(this.state, {
      model: {
        $merge: {
          autoFetchMinute: time.minutes(),
          autoFetchHour: time.hours()
        }
      }
    }))
  }

  _onChangeLocation = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const value = evt.target.value
    let defaultLocationLat, defaultLocationLon
    // use lonlat to parse the string
    // if the coordinates are invalid, it will throw an exception
    try {
      ({lat: defaultLocationLat, lon: defaultLocationLon} = lonlat.fromString(
        value
      ))
    } catch (e) {
      return this.setState(
        update(this.state, {
          validation: {
            defaultLocation: {
              $set: !value || value === ''
            }
          }
        })
      )
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

  _onChangeLanguage = (defaultLanguage: string) => {
    this.setState(update(this.state, {model: {$merge: {defaultLanguage}}}))
  }

  _onChangeTimeZone = ({value: defaultTimeZone}: { value: string }) => {
    this.setState(update(this.state, {model: {$merge: {defaultTimeZone}}}))
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
    const bounds = project.bounds
      ? [
        [project.bounds.south, project.bounds.west],
        [project.bounds.north, project.bounds.east]
      ]
      : null
    this.refs.mapModal.open({
      title: 'Select project bounds',
      body: `Pretend this is a map`,
      bounds: bounds,
      rectangleSelect: true,
      onConfirm: (rectangle) => {
        if (rectangle && rectangle.getBounds()) {
          const [[south, west], [north, east]] = rectangle.getBounds()
            .map(arr => arr.map(v => v.toFixed(6)))
          const domNode: HTMLInputElement = (
            (ReactDOM.findDOMNode(this.refs.boundingBox): any): HTMLInputElement
          )
          if (domNode) {
            domNode.value = `${west},${south},${east},${north}`
          }
          this.setState(update(this.state, {
            model: { $merge: {west, south, east, north} }
          }))
        }
        return rectangle
      }
    })
  }

  _onOpenMapModal = () => {
    const {project} = this.props
    const defaultLocationLat = project.defaultLocationLat || null
    const defaultLocationLon = project.defaultLocationLon || null
    const bounds = defaultLocationLat !== null && defaultLocationLon !== null
      ? [
        [+defaultLocationLat + 1, +defaultLocationLon + 1],
        [+defaultLocationLat - 1, +defaultLocationLon - 1]
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
          this.setState(update(this.state, {
            model: {
              $merge: {defaultLocationLat, defaultLocationLon}
            }
          }))
        }
      }
    })
  }

  _onSaveSettings = () => {
    // if updating, only the things that have changed should be sent to the server
    const {model} = this.state
    let changes: any
    if (this.props.project.id) {
      // updating a project
      changes = {}
      Object.keys(model).map(k => {
        if (model[k] !== this.props.project[k]) {
          changes[k] = model[k]
        }
      })
    } else {
      // creating a project
      changes = model
    }
    this.props.updateProject(this.props.project.id || '', changes)
  }

  _settingsAreUnedited = () => Object.keys(this.state.model).length === 0 &&
    this.state.model.constructor === Object

  render () {
    const {editDisabled, showDangerZone} = this.props
    const {model, validation} = this.state
    const {autoFetchHour, autoFetchMinute} = model
    const noEdits = Object.keys(model).length === 0 && model.constructor === Object
    const autoFetchChecked = model.autoFetchFeeds
    if (editDisabled) {
      return (
        <p className='lead text-center'>
          <strong>Warning!</strong>{' '}
          You do not have permission to edit details for this feed source.
        </p>
      )
    }
    return (
      <div>
        <ConfirmModal ref='confirm' />
        <Panel header={<h4>{this.messages('title')}</h4>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup
                data-test-id='project-name-input-container'
                validationState={validationState(validation.name)}
              >
                <ControlLabel>{this.messages('fields.name')}</ControlLabel>
                <FormControl
                  value={model.name}
                  name={'name'}
                  onChange={this._onChangeName}
                />
                <FormControl.Feedback />
                <HelpBlock>Required.</HelpBlock>
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Panel header={<h4>{this.messages('fields.updates.title')}</h4>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup>
                <Checkbox
                  checked={autoFetchChecked}
                  onChange={this._onChangeAutoFetch}>
                  <strong>
                    {this.messages('fields.updates.autoFetchFeeds')}
                  </strong>
                </Checkbox>
                {autoFetchChecked
                  ? <DateTimeField
                    dateTime={(
                      typeof autoFetchMinute === 'number' &&
                      typeof autoFetchHour === 'number'
                    )
                      ? +moment().startOf('day')
                        .add(autoFetchHour, 'hours')
                        .add(autoFetchMinute, 'minutes')
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
        <Panel header={<h4>{this.messages('fields.location.title')}</h4>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup
                validationState={validationState(validation.defaultLocation)}
              >
                <ControlLabel>
                  <Glyphicon glyph='map-marker' />
                  {this.messages('fields.location.defaultLocation')}
                </ControlLabel>
                <InputGroup ref='defaultLocationGroup'>
                  <FormControl
                    disabled
                    onChange={this._onChangeLocation}
                    placeholder='34.8977,-87.29987'
                    ref='defaultLocation'
                    type='text'
                    value={model.defaultLocationLat && model.defaultLocationLon
                      ? `${model.defaultLocationLat},${model.defaultLocationLon}`
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
                  {this.messages('fields.location.boundingBox')}
                </ControlLabel>
                <InputGroup ref='boundingBoxGroup'>
                  <FormControl
                    type='text'
                    defaultValue={model.bounds
                      ? `${model.bounds.west},${model.bounds.south},${model.bounds.east},${model.bounds.north}`
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
                {this.messages('fields.location.defaultTimeZone')}
              </ControlLabel>
              <TimezoneSelect
                value={model.defaultTimeZone}
                onChange={this._onChangeTimeZone} />
            </ListGroupItem>
            <ListGroupItem>
              <ControlLabel>
                <Glyphicon glyph='globe' />{' '}
                {this.messages('fields.location.defaultLanguage')}
              </ControlLabel>
              <LanguageSelect
                value={model.defaultLanguage}
                onChange={this._onChangeLanguage} />
            </ListGroupItem>
          </ListGroup>
        </Panel>
        {showDangerZone &&
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
                <p>Once you delete an project, the project and all feed sources it contains cannot be recovered.</p>
              </ListGroupItem>
            </ListGroup>
          </Panel>
        }
        <Row>
          <Col xs={12}>
            {/* Cancel button */}
            <Button
              onClick={this._onCancel}
              style={{marginRight: 10}}
            >
              {this.messages('cancel')}
            </Button>
            {/* Save button */}
            <Button
              bsStyle='primary'
              data-test-id='project-settings-form-save-button'
              disabled={
                editDisabled ||
                noEdits ||
                !validation.name ||
                !model.name ||
                model.name === ''
              }
              onClick={this._onSaveSettings}>
              {this.messages('save')}
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
