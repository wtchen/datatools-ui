import {Icon} from '@conveyal/woonerf'
import React from 'react'
import Helmet from 'react-helmet'
import { sentence as toSentenceCase } from 'change-case'
import { Grid, Row, Col, Label, ButtonGroup, Button, FormControl, ControlLabel, FormGroup, Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import DateTimeField from 'react-bootstrap-datetimepicker'

import ManagerPage from '../../common/components/ManagerPage'
import Loading from '../../common/components/Loading'
import AffectedEntity from './AffectedEntity'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'
import GtfsSearch from '../../gtfs/components/gtfssearch'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'

import { checkEntitiesForFeeds } from '../../common/util/permissions'
import { browserHistory } from 'react-router'

import moment from 'moment'

const causes = [
  'UNKNOWN_CAUSE',
  'TECHNICAL_PROBLEM',
  'STRIKE',
  'DEMONSTRATION',
  'ACCIDENT',
  'HOLIDAY',
  'WEATHER',
  'MAINTENANCE',
  'CONSTRUCTION',
  'POLICE_ACTIVITY',
  'MEDICAL_EMERGENCY',
  'OTHER_CAUSE'
]

const effects = [
  'UNKNOWN_EFFECT',
  'NO_SERVICE',
  'REDUCED_SERVICE',
  'SIGNIFICANT_DELAYS',
  'DETOUR',
  'ADDITIONAL_SERVICE',
  'MODIFIED_SERVICE',
  'STOP_MOVED',
  'OTHER_EFFECT'
]

export default class AlertEditor extends React.Component {
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  renderServicesHeader (entities) {
    const counts = [
      {
        singular: 'agency',
        plural: 'agencies',
        count: entities.filter(e => e.type === 'AGENCY').length,
      },
      {
        singular: 'route',
        plural: 'routes',
        count: entities.filter(e => e.type === 'ROUTE').length,
      },
      {
        singular: 'stop',
        plural: 'stops',
        count: entities.filter(e => e.type === 'STOP').length,
      },
      {
        singular: 'mode',
        plural: 'modes',
        count: entities.filter(e => e.type === 'MODE').length,
      },
    ]
    return (
      <span>
        <b>Affected Service</b>{counts.map(c => {
          return c.count
            ? <span key={c.singular}> <Label
                bsStyle={c.singular === 'agency' || c.singular === 'mode' ? 'warning' : 'default'}
              >
                {`${c.count} ${c.count > 1 ? c.plural : c.singular}`}
              </Label> </span>
            : null
        })}
      </span>
    )
  }
  render () {
    if (!this.props.alert) {
      return (
        <ManagerPage>
          <Loading/>
        </ManagerPage>
      )
    }
    var compare = function (a, b) {
      var aName = a.shortName || a.name
      var bName = b.shortName || b.name

      // return 511 Staff as first in list to avoid 511 Emergency being first in list
      if(/511 Staff/.test(aName)) return -1
      if(/511 Staff/.test(bName)) return 1

      if(aName < bName) return -1
      if(aName > bName) return 1
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
          <Grid>
            <Row>
              <Col xs={4} sm={8} md={9}>
                <Button
                  onClick={
                    (evt) => {
                    browserHistory.push('/alerts')
                  }}
                ><Icon type='chevron-left' /> Back</Button>
              </Col>
              <Col xs={8} sm={4} md={3}>
                <ButtonGroup className='pull-right'>
                  <Button
                    title={editButtonMessage}
                    bsStyle='default'
                    disabled={editingIsDisabled}
                    onClick={(evt) => {
                      console.log('times', this.props.alert.end, this.props.alert.start);
                      if(!this.props.alert.title) {
                        alert('You must specify an alert title')
                        return
                      }
                      if(!this.props.alert.end || !this.props.alert.start) {
                        alert('Alert must have a start and end date')
                        return
                      }
                      if(this.props.alert.end < this.props.alert.start) {
                        alert('Alert end date cannot be before start date')
                        return
                      }
                      if(moment(this.props.alert.end).isBefore(moment())) {
                        alert('Alert end date cannot be before the current date')
                        return
                      }
                      if(this.props.alert.affectedEntities.length === 0) {
                        alert('You must specify at least one affected entity')
                        return
                      }
                      this.props.onSaveClick(this.props.alert)
                    }}
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
                    onClick={
                      (evt) => {
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
                        {causes.map((cause) => {
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
                        {effects.map((effect) => {
                          return <option key={effect} value={effect}>{toSentenceCase(effect.replace('_', ' '))}</option>
                        })}
                      </FormControl>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col xs={12} sm={6}>
                    <FormGroup controlId="formControlsDescription">
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
                    <FormGroup controlId="formControlsURL">
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
                    {/* Affected Service panel */}
                    <Panel
                      header={this.renderServicesHeader(this.props.alert.affectedEntities)}
                    >
                      <ListGroup fill>
                      <ListGroupItem>
                        <Row>
                          <Col xs={5}>
                            <Button style={{marginRight: '5px'}} onClick={(evt) => {
                              console.log('editable feeds', sortedFeeds)
                              this.props.onAddEntityClick('AGENCY', sortedFeeds[0], null, newEntityId)
                            }}>
                              Add Agency
                            </Button>
                            <Button onClick={(evt) => this.props.onAddEntityClick('MODE', {gtfsType: 0, name: 'Tram/LRT'}, sortedFeeds[0], newEntityId)}>
                              Add Mode
                            </Button>
                          </Col>
                          <Col xs={7}>
                            <GtfsSearch
                              feeds={this.props.activeFeeds}
                              placeholder='Add stop/route'
                              limit={100}
                              entities={['stops', 'routes']}
                              clearable={true}
                              onChange={(evt) => {
                                console.log('we need to add this entity to the store', evt)
                                if (typeof evt !== 'undefined' && evt !== null){
                                  if (evt.stop){
                                    this.props.onAddEntityClick('STOP', evt.stop, evt.agency, newEntityId)
                                  }
                                  else if (evt.route)
                                    this.props.onAddEntityClick('ROUTE', evt.route, evt.agency, newEntityId)
                                }
                              }}
                            />
                          </Col>
                        </Row>
                      </ListGroupItem>
                          {this.props.alert.affectedEntities
                            .sort((a, b) => b.id - a.id) // reverse sort by entity id
                            .map((entity) => {
                            return (
                              <AffectedEntity
                                entity={entity}
                                key={entity.id}
                                activeFeeds={this.props.activeFeeds}
                                feeds={sortedFeeds}
                                onDeleteEntityClick={this.props.onDeleteEntityClick}
                                entityUpdated={this.props.entityUpdated}
                              />
                            )
                          })}
                      </ListGroup>
                    </Panel>
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
