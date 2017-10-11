// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import update from 'react-addons-update'
import ReactDOM from 'react-dom'
import DateTimeField from 'react-bootstrap-datetimepicker'
import { shallowEqual } from 'react-pure-render'
import { browserHistory } from 'react-router'
import moment from 'moment'
import { Row, Col, Button, Panel, Glyphicon, Checkbox, FormGroup, InputGroup, ControlLabel, FormControl, ListGroup, ListGroupItem } from 'react-bootstrap'

import MapModal from '../../common/components/MapModal.js'
import ConfirmModal from '../../common/components/ConfirmModal'
import { getMessage, getComponentMessages } from '../../common/util/config'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import LanguageSelect from '../../common/components/LanguageSelect'

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
  }
}

const DEFAULT_FETCH_TIME = moment().startOf('day').add(2, 'hours')

const messages = getComponentMessages('ProjectSettings')

export default class GeneralSettings extends Component {
  props: Props
  state: State

  state = {
    model: {}
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
      onConfirm: () => {
        deleteProject(castedProject)
        .then(() => browserHistory.push(`/home`))
      }
    })
  }

  _onChangeAutoFetch = (evt: Event & {target: HTMLInputElement}) => {
    const autoFetchMinute = DEFAULT_FETCH_TIME.minutes()
    const autoFetchHour = DEFAULT_FETCH_TIME.hours()
    this.setState(
      update(this.state, {
        model: {
          $merge: {
            autoFetchFeeds: evt.target.checked,
            autoFetchMinute,
            autoFetchHour
          }
        }
      })
    )
  }

  _onChangeBounds = (evt: Event & {target: HTMLInputElement}) => {
    const bBox = evt.target.value.split(',')
    if (bBox.length === 4) {
      const [west, south, east, north] = bBox
      this.setState(
        update(this.state, {
          model: {
            $merge: {west, south, east, north}
          }
        })
      )
    }
  }

  _onChangeDateTime = (seconds: number) => {
    const time = moment(+seconds)
    this.setState(
      update(this.state, {
        model: {
          $merge: {
            autoFetchMinute: time.minutes(),
            autoFetchHour: time.hours()
          }
        }
      })
    )
  }

  _onChangeLocation = (evt: Event & {target: HTMLInputElement}) => {
    const latLng = evt.target.value.split(',')
    if (typeof latLng[0] !== 'undefined' && typeof latLng[1] !== 'undefined') {
      const [defaultLocationLat, defaultLocationLon] = latLng
      this.setState(
        update(this.state, {
          model: {
            $merge: {defaultLocationLat, defaultLocationLon}
          }
        })
      )
    } else {
      console.log('invalid value for latlng')
    }
  }

  _onChangeLanguage = ({value: defaultLanguage}: {value: string}) => {
    this.setState(
      update(this.state, {
        model: {
          $merge: { defaultLanguage }
        }
      })
    )
  }

  _onChangeTimeZone = ({value: defaultTimeZone}: {value: string}) => {
    this.setState(
      update(this.state, {
        model: {
          $merge: { defaultTimeZone }
        }
      })
    )
  }

  _onChangeValue = ({target}: {target: HTMLInputElement}) => this.setState(
    update(this.state, {
      model: {
        $merge: {[target.name]: target.value}
      }
    })
  )

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
          const [[south, west], [north, east]] = rectangle.getBounds().map(arr => arr.map(v => v.toFixed(6)))
          const domNode: HTMLInputElement = ((ReactDOM.findDOMNode(this.refs.boundingBox): any): HTMLInputElement)
          if (domNode) {
            domNode.value = `${west},${south},${east},${north}`
          }
          this.setState(
            update(this.state, {
              model: {
                $merge: {west, south, east, north}
              }
            })
          )
        }
        return rectangle
      }
    })
  }

  _onOpenMapModal = () => {
    let bounds, defaultLocationLat, defaultLocationLon
    if (this.props.project.id) {
      const castedProject = ((this.props.project: any): Project);
      ({defaultLocationLat, defaultLocationLon} = castedProject)
      bounds = isNumeric(defaultLocationLat) && isNumeric(defaultLocationLon)
        // $FlowFixMe we checked that vals are numeric in above line
        ? [[defaultLocationLat + 1, defaultLocationLon + 1], [defaultLocationLat - 1, defaultLocationLon - 1]]
        : null
    }
    this.refs.mapModal.open({
      title: 'Select a default location',
      body: `Pretend this is a map`,
      markerSelect: true,
      marker: bounds
        ? {lat: defaultLocationLat, lng: defaultLocationLon}
        : null,
      bounds: bounds,
      onConfirm: (marker) => {
        if (marker) {
          const defaultLocationLat = marker.lat.toFixed(6)
          const defaultLocationLon = marker.lng.toFixed(6)
          // ReactDOM.findDOMNode(this.refs.defaultLocation).value = `${defaultLocationLat},${defaultLocationLon}`
          this.setState(
            update(this.state, {
              model: {
                $merge: {defaultLocationLat, defaultLocationLon}
              }
            })
          )
        }
      }
    })
  }

  _onSaveSettings = () => {
    // cast to make flow happy
    const model: Project = ((this.state.model: any): Project)
    this.props.updateProject(this.props.project, model)
  }

  render () {
    const {editDisabled, showDangerZone} = this.props
    const {model} = this.state
    const noEdits = Object.keys(model).length === 0 && model.constructor === Object
    const autoFetchChecked = model.autoFetchFeeds
    if (editDisabled) {
      return <p className='lead text-center'><strong>Warning!</strong> You do not have permission to edit details for this feed source.</p>
    }
    return (
      <div className='general-settings-panel'>
        <ConfirmModal ref='confirm' />
        <Panel header={<h4>{getMessage(messages, 'title')}</h4>}>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup>
                <ControlLabel>{getMessage(messages, 'fields.name')}</ControlLabel>
                <FormControl
                  value={model.name}
                  name={'name'}
                  onChange={this._onChangeValue} />
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
                  <strong>{getMessage(messages, 'fields.updates.autoFetchFeeds')}</strong>
                </Checkbox>
                {autoFetchChecked
                  ? <DateTimeField
                    dateTime={model.autoFetchMinute !== null
                      ? +moment().startOf('day').add(model.autoFetchHour, 'hours').add(model.autoFetchMinute, 'minutes')
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
                <ControlLabel><Glyphicon glyph='map-marker' /> {getMessage(messages, 'fields.location.defaultLocation')}</ControlLabel>
                <InputGroup ref='defaultLocationGroup'>
                  <FormControl
                    type='text'
                    value={model.defaultLocationLat && model.defaultLocationLon
                      ? `${model.defaultLocationLat},${model.defaultLocationLon}`
                      : ''
                    }
                    ref='defaultLocation'
                    placeholder='34.8977,-87.29987'
                    onChange={this._onChangeLocation} />
                  <InputGroup.Button>
                    <Button
                      onClick={this._onOpenMapModal}>
                      <Glyphicon glyph='map-marker' />
                    </Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <FormGroup>
                <ControlLabel><Glyphicon glyph='fullscreen' /> {getMessage(messages, 'fields.location.boundingBox')}</ControlLabel>
                <InputGroup ref='boundingBoxGroup'>
                  <FormControl
                    type='text'
                    defaultValue={isNumeric(model.north) ? `${model.west},${model.south},${model.east},${model.north}` : ''}
                    ref='boundingBox'
                    placeholder='-88.45,33.22,-87.12,34.89'
                    onChange={this._onChangeBounds} />
                  {
                    <InputGroup.Button>
                      <Button
                        disabled // TODO: wait for react-leaflet-draw to update library to  re-enable bounds select
                        onClick={this._onOpenMapBoundsModal}>
                        <Glyphicon glyph='fullscreen' />
                      </Button>
                    </InputGroup.Button>
                  }
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <ControlLabel><Glyphicon glyph='time' /> {getMessage(messages, 'fields.location.defaultTimeZone')}</ControlLabel>
              <TimezoneSelect
                value={model.defaultTimeZone}
                onChange={this._onChangeTimeZone} />
            </ListGroupItem>
            <ListGroupItem>
              <ControlLabel><Glyphicon glyph='globe' /> {getMessage(messages, 'fields.location.defaultLanguage')}</ControlLabel>
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
                  onClick={this._onDeleteProject}
                  className='pull-right'
                  bsStyle='danger'>
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
            {/* Save button */}
            <Button
              bsStyle='primary'
              disabled={editDisabled || noEdits}
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
