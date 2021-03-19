// @flow

import * as activeAlertActions from '../actions/activeAlert'
import * as alertActions from '../actions/alerts'

import type {Alert, Feed, GtfsRoute, GtfsStop, Project} from '../../types'
import {Button, ButtonToolbar, Col, ControlLabel, FormControl, FormGroup, Grid, Row} from 'react-bootstrap'
import {CAUSES, EFFECTS, isNew} from '../util'
import React, {Component} from 'react'

import AffectedServices from './AffectedServices'
import type {Props as ContainerProps} from '../containers/ActiveAlertEditor'
import DateTimeField from 'react-bootstrap-datetimepicker'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'
import Icon from '@conveyal/woonerf/components/icon'
import Loading from '../../common/components/Loading'
import ManagerPage from '../../common/components/ManagerPage'
import type {ManagerUserState} from '../../types/reducers'
import PageNotFound from '../../common/components/PageNotFound'
import Toggle from 'react-toggle'
import {browserHistory} from 'react-router'
import {checkEntitiesForFeeds} from '../../common/util/permissions'
import {isModuleEnabled} from '../../common/util/config'
import moment from 'moment'
import toSentenceCase from '../../common/util/to-sentence-case'

type Props = ContainerProps & {
  activeFeeds: Array<Feed>,
  addActiveEntity: typeof activeAlertActions.addActiveEntity,
  alert: Alert,
  createAlert: typeof alertActions.createAlert,
  deleteActiveEntity: typeof activeAlertActions.deleteActiveEntity,
  deleteAlert: typeof alertActions.deleteAlert,
  editableFeeds: Array<Feed>,
  onAlertEditorMount: typeof alertActions.onAlertEditorMount,
  permissionFilter: string,
  project: Project,
  publishableFeeds: Array<Feed>,
  saveAlert: typeof alertActions.saveAlert,
  setActiveProperty: typeof activeAlertActions.setActiveProperty,
  setActivePublished: typeof activeAlertActions.setActivePublished,
  updateActiveEntity: typeof activeAlertActions.updateActiveEntity,
  user: ManagerUserState
}

const ALERT_TITLE_CHAR_LIMIT = 100
const ALERT_DESCRIPTION_CHAR_LIMIT = 1200
const CHAR_WARNING_LIMIT = 10
const _stringToOption = str => (
  <option key={str} value={str}>
    {toSentenceCase(str.replace('_', ' '))}
  </option>
)

const sortFeeds511 = (a, b) => {
  // return 511 Staff as first in list to avoid 511 Emergency being first in list
  if (/511 Staff/.test(a.name)) return -1
  if (/511 Staff/.test(b.name)) return 1
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

export default class AlertEditor extends Component<Props> {
  componentWillMount () {
    const {alert, location, onAlertEditorMount, permissionFilter, user} = this.props
    onAlertEditorMount(alert, location, permissionFilter, user)
  }

  validateAndSave = () => {
    const {alert, saveAlert} = this.props
    const {affectedEntities, description, end, start, title} = alert
    const momentEnd = moment(end)
    const momentStart = moment(start)

    // alert title must not be blank nor just whitespace
    if (!title.trim()) {
      return window.alert('You must specify an alert title')
    }
    if (!end || !start || !momentEnd.isValid() || !momentStart.isValid()) {
      return window.alert('Alert must have a valid start and end date')
    }
    if (end < start) {
      return window.alert(`Alert end date ${momentEnd.format()} cannot be before start date (${momentStart.format()})`)
    }
    if (momentEnd.isBefore(moment())) {
      return window.alert('Alert end date cannot be before the current date (alerts must not be in the past)')
    }
    if (affectedEntities.length === 0) {
      return window.alert('You must specify at least one affected entity')
    }
    saveAlert(alert)
  }

  _deleteAlert = () => this.props.deleteAlert(this.props.alert)

  _onChange = (evt: SyntheticInputEvent<HTMLInputElement>) =>
    this.props.setActiveProperty({[evt.target.name]: evt.target.value})

  _onChangeEnd = (time: string) => this.props.setActiveProperty({end: +time})

  _onChangeStart = (time: string) => this.props.setActiveProperty({start: +time})

  _onClickBack = () => browserHistory.push('/alerts')

  _onClickDelete = () => {
    const {alert} = this.props
    this.refs.page.showConfirmModal({
      title: 'Delete Alert #' + alert.id + '?',
      body: <p>Are you sure you want to delete <strong>Alert {alert.id}</strong>?</p>,
      onConfirm: this._deleteAlert
    })
  }

  _onClickPublish = () => this.props.setActivePublished(!this.props.alert.published)

  _onRouteClick = (feed: Feed, route: GtfsRoute) => {
    this.props.addActiveEntity('ROUTE', route, feed)
  }

  _onStopClick = ({entities, feed}: {entities: Array<GtfsStop>, feed: Feed}) => {
    entities.forEach(stop => this.props.addActiveEntity('STOP', stop, feed))
  }

  /* eslint-disable complexity */
  render () {
    const {
      activeFeeds,
      alert,
      editableFeeds,
      publishableFeeds
    } = this.props
    if (!isModuleEnabled('alerts')) return <PageNotFound message='The alerts module is not enabled.' />
    if (!alert) return <ManagerPage><Loading /></ManagerPage>
    const titleCharacterCount = alert.title ? alert.title.length : 0
    const descriptionCharactersCount = alert.description ? alert.description.length : 0
    const canPublish = alert.affectedEntities.length &&
      checkEntitiesForFeeds(alert.affectedEntities, publishableFeeds)
    const canEdit = checkEntitiesForFeeds(alert.affectedEntities, editableFeeds)
    const editingIsDisabled = alert.published && !canPublish ? true : !canEdit
    const sortedFeeds = editableFeeds.sort(sortFeeds511)
    // If user has edit rights and alert is unpublished, user can delete alert,
    // else check if they have publish rights.
    const deleteIsDisabled = !editingIsDisabled && !alert.published
      ? false
      : !canPublish
    const deleteButtonMessage = alert.published && deleteIsDisabled
      ? 'Cannot delete because alert is published'
      : !canEdit ? 'Cannot alter alerts for other agencies' : 'Delete alert'
    const editButtonMessage = alert.published && deleteIsDisabled
      ? 'Cannot edit because alert is published'
      : !canEdit ? 'Cannot alter alerts for other agencies' : 'Edit alert'
    return (
      <ManagerPage
        ref='page'
        title={isNew(alert) ? `Alert ${alert.id}` : 'New Alert'}>
        <Grid fluid>
          <Row>
            <Col xs={4} sm={7} md={8}>
              <Button
                onClick={this._onClickBack}>
                <Icon type='chevron-left' /> Back
              </Button>
            </Col>
            <Col xs={8} sm={5} md={4}>
              <ButtonToolbar className='pull-right' style={{marginLeft: '5px'}}>
                <Button
                  title={editButtonMessage}
                  bsStyle='primary'
                  disabled={editingIsDisabled}
                  onClick={this.validateAndSave}
                ><Icon type='save' /> Save</Button>
                <Button
                  title={deleteButtonMessage}
                  bsStyle='danger'
                  disabled={deleteIsDisabled}
                  onClick={this._onClickDelete}
                ><Icon type='trash' /> Delete</Button>
              </ButtonToolbar>
              <FormGroup
                className='pull-right'
                style={{position: 'relative', top: '5px'}}>
                <Toggle
                  id='alert-published'
                  disabled={!canPublish}
                  checked={alert.published}
                  onChange={this._onClickPublish} />
                <label
                  htmlFor='alert-published'
                  style={{position: 'relative', top: '-5px', marginLeft: '5px'}}>
                  Published?
                </label>
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={6}>
              <Row>
                <Col xs={12} style={{marginTop: '10px'}}>
                  <FormGroup controlId='formControlsTitle'>
                    <ControlLabel>
                      Alert Title
                      {' '}
                      <span
                        className={
                          titleCharacterCount > CHAR_WARNING_LIMIT && titleCharacterCount <= ALERT_TITLE_CHAR_LIMIT
                            ? 'text-muted'
                            : 'text-danger'
                        }
                        style={{fontWeight: 400}}>
                        {titleCharacterCount}
                      </span>
                      <h5 style={{margin: '0px'}}>
                        <small>
                        <span className="text-danger">{titleCharacterCount > ALERT_TITLE_CHAR_LIMIT ? 'WARNING:  Alert title longer than 100 characters may get truncated in some dissemination channels. ' : ''}</span>
                          Note: alert title serves as text for eTID alerts. Use
                          descriptive language so it can serve as a standalone
                          alert. 
                        </small>
                      </h5>
                    </ControlLabel>
                    <FormControl
                      bsSize='large'
                      placeholder='E.g., Sig. Delays due to Golden Gate Bridge Closure'
                      defaultValue={alert.title || ''}
                      name='title'
                      onChange={this._onChange} />
                  </FormGroup>
                </Col>
                <Col xs={6}>
                  <div style={{marginBottom: '5px'}}><strong>Start</strong></div>
                  {alert.start
                    ? <DateTimeField
                      disabled
                      dateTime={alert.start}
                      onChange={this._onChangeStart} />
                    : <DateTimeField
                      defaultText='Please select a date'
                      onChange={this._onChangeStart} />
                  }
                </Col>
                <Col xs={6}>
                  <div style={{marginBottom: '5px'}}><strong>End</strong></div>
                  {alert.end
                    ? <DateTimeField
                      dateTime={alert.end}
                      onChange={this._onChangeEnd} />
                    : <DateTimeField
                      defaultText='Please select a date'
                      onChange={this._onChangeEnd} />
                  }
                </Col>
              </Row>
              <Row>
                <Col xs={6}>
                  <FormGroup controlId='formControlsCause'>
                    <ControlLabel>Cause</ControlLabel>
                    <FormControl
                      componentClass='select'
                      onChange={this._onChange}
                      name='cause'
                      value={alert.cause}>
                      {CAUSES.map(_stringToOption)}
                    </FormControl>
                  </FormGroup>
                </Col>
                <Col xs={6}>
                  <FormGroup controlId='formControlsEffect'>
                    <ControlLabel>Effect</ControlLabel>
                    <FormControl
                      componentClass='select'
                      onChange={this._onChange}
                      name='effect'
                      value={alert.effect}>
                      {EFFECTS.map(_stringToOption)}
                    </FormControl>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={12} sm={6}>
                  <FormGroup controlId='formControlsDescription'>
                    <ControlLabel>
                      Description
                      {' '}
                      <span
                        className={
                          descriptionCharactersCount > CHAR_WARNING_LIMIT && descriptionCharactersCount <= ALERT_DESCRIPTION_CHAR_LIMIT
                            ? 'text-muted'
                            : 'text-danger'
                        }
                        style={{fontWeight: 400}}>
                        {descriptionCharactersCount}
                        <p><span className="text-danger">{descriptionCharactersCount > ALERT_DESCRIPTION_CHAR_LIMIT ? 'WARNING:  Alert description longer than 1200 characters may get truncated in some dissemination channels. ' : ''}</span></p>
                      </span>
                    </ControlLabel>
                    <FormControl
                      componentClass='textarea'
                      placeholder='Detailed description of alert...'
                      defaultValue={alert.description}
                      name='description'
                      onChange={this._onChange} />
                  </FormGroup>
                </Col>
                <Col xs={12} sm={6}>
                  <FormGroup controlId='formControlsURL'>
                    <ControlLabel>URL</ControlLabel>
                    <FormControl
                      type='text'
                      placeholder='http://511.org/alerts/transit/123'
                      defaultValue={alert.url}
                      name='url'
                      onChange={this._onChange} />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <AffectedServices
                    sortedFeeds={sortedFeeds}
                    {...this.props} />
                </Col>
              </Row>
            </Col>
            <Col xs={12} sm={6}>
              <Row>
                <Col xs={12}>
                  <GlobalGtfsFilter />
                </Col>
              </Row>
              <GtfsMapSearch
                feeds={activeFeeds}
                onRouteClick={this._onRouteClick}
                onStopClick={this._onStopClick}
                popupActionPrefix='Add' />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
