import {Icon} from '@conveyal/woonerf'
import React from 'react'
import Helmet from 'react-helmet'
import { sentence as toSentenceCase } from 'change-case'
import { Grid, Row, Col, ButtonGroup, Button, FormControl, ControlLabel, FormGroup } from 'react-bootstrap'
import DateTimeField from 'react-bootstrap-datetimepicker'

import ManagerPage from '../../common/components/ManagerPage'
import Loading from '../../common/components/Loading'
import AffectedServices from './AffectedServices'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'

import { checkEntitiesForFeeds } from '../../common/util/permissions'
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
    if (!this.props.alert) {
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
    const canPublish = checkEntitiesForFeeds(this.props.alert.affectedEntities, this.props.publishableFeeds)
    const canEdit = checkEntitiesForFeeds(this.props.alert.affectedEntities, this.props.editableFeeds)

    const editingIsDisabled = this.props.alert.published && !canPublish ? true : !canEdit
    const sortedFeeds = this.props.editableFeeds.sort(compare)
    // if user has edit rights and alert is unpublished, user can delete alert, else check if they have publish rights
    const deleteIsDisabled = !editingIsDisabled && !this.props.alert.published ? false : !canPublish
    const deleteButtonMessage = this.props.alert.published && deleteIsDisabled ? 'Cannot delete because alert is published'
      : !canEdit ? 'Cannot alter alerts for other agencies' : 'Delete alert'

    const editButtonMessage = this.props.alert.published && deleteIsDisabled ? 'Cannot edit because alert is published'
      : !canEdit ? 'Cannot alter alerts for other agencies' : 'Edit alert'

    const newEntityId = this.props.alert.affectedEntities.length
      ? 1 + this.props.alert.affectedEntities.map(e => e.id).reduce((initial, current) => initial > current ? initial : current)
      : 1

    return (
      <ManagerPage ref='page'>
        <Helmet
          title={this.props.alert.id > 0 ? `Alert ${this.props.alert.id}` : 'New Alert'}
        />
        <Grid fluid>
          <Row>
            <Col xs={4} sm={8} md={9}>
              <Button
                onClick={(evt) => browserHistory.push('/alerts')}
              ><Icon type='chevron-left' /> Back</Button>
            </Col>
            <Col xs={8} sm={4} md={3}>
              <ButtonGroup className='pull-right'>
                <Button
                  title={editButtonMessage}
                  bsStyle='default'
                  disabled={editingIsDisabled}
                  onClick={this.validateAndSave}
                >Save</Button>

                <Button
                  disabled={!canPublish}
                  bsStyle={this.props.alert.published ? 'warning' : 'success'}
                  onClick={(evt) => {
                    this.props.onPublishClick(this.props.alert, !this.props.alert.published)
                  }}
                >
                  {this.props.alert.published ? 'Unpublish' : 'Publish'}</Button>
                <Button
                  title={deleteButtonMessage}
                  bsStyle='danger'
                  disabled={deleteIsDisabled}
                  onClick={(evt) => {
                    this.refs.page.showConfirmModal({
                      title: 'Delete Alert #' + this.props.alert.id + '?',
                      body: <p>Are you sure you want to delete <strong>Alert {this.props.alert.id}</strong>?</p>,
                      onConfirm: () => {
                        this.props.onDeleteClick(this.props.alert)
                      }
                    })
                  }}
                >Delete</Button>
              </ButtonGroup>
            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={6}>
              <Row>
                <Col xs={12} style={{marginTop: '10px'}}>
                  <FormGroup controlId='formControlsTitle'>
                    <ControlLabel>Alert Title</ControlLabel>
                    <FormControl
                      bsSize='large'
                      placeholder='E.g., Sig. Delays due to Golden Gate Bridge Closure'
                      defaultValue={this.props.alert.title || ''}
                      onChange={evt => this.props.titleChanged(evt.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col xs={6}>
                  <div style={{marginBottom: '5px'}}><strong>Start</strong></div>
                  {this.props.alert.start
                    ? <DateTimeField
                      dateTime={this.props.alert.start}
                      onChange={time => this.props.startChanged(time)}
                    />
                    : <DateTimeField
                      defaultText='Please select a date'
                      onChange={time => this.props.startChanged(time)}
                    />
                  }
                </Col>
                <Col xs={6}>
                  <div style={{marginBottom: '5px'}}><strong>End</strong></div>
                  {this.props.alert.end
                    ? <DateTimeField
                      dateTime={this.props.alert.end}
                      onChange={time => this.props.endChanged(time)}
                    />
                    : <DateTimeField
                      defaultText='Please select a date'
                      onChange={time => this.props.endChanged(time)}
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
                      onChange={(evt) => this.props.causeChanged(evt.target.value)}
                      value={this.props.alert.cause}
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
                      onChange={(evt) => this.props.effectChanged(evt.target.value)}
                      value={this.props.alert.effect}
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
                      defaultValue={this.props.alert.description}
                      onChange={(evt) => this.props.descriptionChanged(evt.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col xs={12} sm={6}>
                  <FormGroup controlId='formControlsURL'>
                    <ControlLabel>URL</ControlLabel>
                    <FormControl
                      type='text'
                      placeholder='http://511.org/alerts/transit/123'
                      defaultValue={this.props.alert.url}
                      onChange={(evt) => this.props.urlChanged(evt.target.value)}
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
                feeds={this.props.activeFeeds}
                onStopClick={this.props.editorStopClick}
                onRouteClick={this.props.editorRouteClick}
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
