import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'
import { Grid, Row, Col, ButtonToolbar, Button, FormControl, ControlLabel, FormGroup } from 'react-bootstrap'
import DateTimeField from 'react-bootstrap-datetimepicker'
import Toggle from 'react-toggle'
// import Switch from 'rc-switch'

import ManagerPage from '../../common/components/ManagerPage'
import Loading from '../../common/components/Loading'
import AffectedServices from './AffectedServices'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'

import { checkEntitiesForFeeds } from '../../common/util/permissions'
import toSentenceCase from '../../common/util/to-sentence-case'
import { CAUSES, EFFECTS } from '../util'
import { browserHistory } from 'react-router'

import moment from 'moment'

export default class AlertEditor extends React.Component {
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  validateAndSave = () => {
    console.log('times', this.props.alert.end, this.props.alert.start)
    if (!this.props.alert.title) {
      window.alert('You must specify an alert title')
      return
    }
    if (!this.props.alert.end || !this.props.alert.start) {
      window.alert('Alert must have a start and end date')
      return
    }
    if (this.props.alert.end < this.props.alert.start) {
      window.alert('Alert end date cannot be before start date')
      return
    }
    if (moment(this.props.alert.end).isBefore(moment())) {
      window.alert('Alert end date cannot be before the current date')
      return
    }
    if (this.props.alert.affectedEntities.length === 0) {
      window.alert('You must specify at least one affected entity')
      return
    }
    this.props.onSaveClick(this.props.alert)
  }
  render () {
    const {
      alert,
      publishableFeeds,
      editableFeeds,
      onPublishClick,
      onDeleteClick,
      titleChanged,
      startChanged,
      endChanged,
      causeChanged,
      effectChanged,
      descriptionChanged,
      urlChanged,
      activeFeeds,
      editorStopClick,
      editorRouteClick
    } = this.props
    if (!alert) {
      return (
        <ManagerPage>
          <Loading />
        </ManagerPage>
      )
    }
    var compare = function (a, b) {
      var aName = a.shortName || a.name
      var bName = b.shortName || b.name
      // return 511 Staff as first in list to avoid 511 Emergency being first in list
      if (/511 Staff/.test(aName)) return -1
      if (/511 Staff/.test(bName)) return 1
      if (aName < bName) return -1
      if (aName > bName) return 1
      return 0
    }
    const canPublish = checkEntitiesForFeeds(alert.affectedEntities, publishableFeeds)
    const canEdit = checkEntitiesForFeeds(alert.affectedEntities, editableFeeds)

    const editingIsDisabled = alert.published && !canPublish ? true : !canEdit
    const sortedFeeds = editableFeeds.sort(compare)
    // if user has edit rights and alert is unpublished, user can delete alert, else check if they have publish rights
    const deleteIsDisabled = !editingIsDisabled && !alert.published ? false : !canPublish
    const deleteButtonMessage = alert.published && deleteIsDisabled ? 'Cannot delete because alert is published'
      : !canEdit ? 'Cannot alter alerts for other agencies' : 'Delete alert'

    const editButtonMessage = alert.published && deleteIsDisabled ? 'Cannot edit because alert is published'
      : !canEdit ? 'Cannot alter alerts for other agencies' : 'Edit alert'

    const newEntityId = alert.affectedEntities && alert.affectedEntities.length
      ? 1 + alert.affectedEntities.map(e => e.id).reduce((initial, current) => initial > current ? initial : current)
      : 1

    return (
      <ManagerPage
        ref='page'
        title={alert.id > 0 ? `Alert ${alert.id}` : 'New Alert'}
        >
        <Grid fluid>
          <Row>
            <Col xs={4} sm={7} md={8}>
              <Button
                onClick={(evt) => browserHistory.push('/alerts')}
              ><Icon type='chevron-left' /> Back</Button>
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
                  onClick={(evt) => {
                    this.refs.page.showConfirmModal({
                      title: 'Delete Alert #' + alert.id + '?',
                      body: <p>Are you sure you want to delete <strong>Alert {alert.id}</strong>?</p>,
                      onConfirm: () => {
                        onDeleteClick(alert)
                      }
                    })
                  }}
                ><Icon type='trash' /> Delete</Button>
              </ButtonToolbar>
              <FormGroup
                className='pull-right'
                style={{position: 'relative', top: '5px'}}
              >
                <Toggle
                  id='alert-published'
                  disabled={!canPublish}
                  // checkedChildren={<Icon type='check' />}
                  // unCheckedChildren={<Icon type='remove' />}
                  checked={alert.published}
                  onChange={(evt) => onPublishClick(alert, !alert.published)} />
                <label
                  htmlFor='alert-published'
                  style={{position: 'relative', top: '-5px', marginLeft: '5px'}}
                  // onClick={(evt) => onPublishClick(alert, !alert.published)}
                  >Published?</label>
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
                      <h5 style={{margin: '0px'}}><small>Note: alert title serves as text for eTID alerts. Use descriptive language so it can serve as a standalone alert.</small></h5>
                    </ControlLabel>
                    <FormControl
                      bsSize='large'
                      placeholder='E.g., Sig. Delays due to Golden Gate Bridge Closure'
                      defaultValue={alert.title || ''}
                      onChange={evt => titleChanged(evt.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col xs={6}>
                  <div style={{marginBottom: '5px'}}><strong>Start</strong></div>
                  {alert.start
                    ? <DateTimeField
                      disabled
                      dateTime={alert.start}
                      onChange={time => startChanged(time)}
                      />
                    : <DateTimeField
                      defaultText='Please select a date'
                      onChange={time => startChanged(time)}
                    />
                  }
                </Col>
                <Col xs={6}>
                  <div style={{marginBottom: '5px'}}><strong>End</strong></div>
                  {alert.end
                    ? <DateTimeField
                      dateTime={alert.end}
                      onChange={time => endChanged(time)}
                    />
                    : <DateTimeField
                      defaultText='Please select a date'
                      onChange={time => endChanged(time)}
                    />
                  }
                </Col>
              </Row>
              <Row>
                <Col xs={6}>
                  <FormGroup controlId='formControlsCause'>
                    <ControlLabel>Cause</ControlLabel>
                    <FormControl
                      componentClass='select'
                      onChange={(evt) => causeChanged(evt.target.value)}
                      value={alert.cause}
                    >
                      {CAUSES.map((cause) => {
                        return <option key={cause} value={cause}>{toSentenceCase(cause.replace('_', ' '))}</option>
                      })}
                    </FormControl>
                  </FormGroup>
                </Col>
                <Col xs={6}>
                  <FormGroup controlId='formControlsEffect'>
                    <ControlLabel>Effect</ControlLabel>
                    <FormControl
                      componentClass='select'
                      onChange={(evt) => effectChanged(evt.target.value)}
                      value={alert.effect}
                    >
                      {EFFECTS.map((effect) => {
                        return <option key={effect} value={effect}>{toSentenceCase(effect.replace('_', ' '))}</option>
                      })}
                    </FormControl>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={12} sm={6}>
                  <FormGroup controlId='formControlsDescription'>
                    <ControlLabel>Description</ControlLabel>
                    <FormControl
                      componentClass='textarea'
                      placeholder='Detailed description of alert...'
                      defaultValue={alert.description}
                      onChange={(evt) => descriptionChanged(evt.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col xs={12} sm={6}>
                  <FormGroup controlId='formControlsURL'>
                    <ControlLabel>URL</ControlLabel>
                    <FormControl
                      type='text'
                      placeholder='http://511.org/alerts/transit/123'
                      defaultValue={alert.url}
                      onChange={(evt) => urlChanged(evt.target.value)}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <AffectedServices
                    sortedFeeds={sortedFeeds}
                    newEntityId={newEntityId}
                    {...this.props}
                  />
                </Col>
              </Row>
            </Col>

            <Col xs={12} sm={6}>
              <Row>
                <Col xs={12}>
                  <GlobalGtfsFilter
                    permissionFilter='edit-alert'
                  />
                </Col>
              </Row>
              <GtfsMapSearch
                feeds={activeFeeds}
                onStopClick={editorStopClick}
                onRouteClick={editorRouteClick}
                popupAction='Add'
                newEntityId={newEntityId}
              />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
