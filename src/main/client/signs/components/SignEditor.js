import React from 'react'

import { Grid, Row, Col, ButtonGroup, Button, Input, Panel, Glyphicon } from 'react-bootstrap'
import DisplaySelector from './DisplaySelector'

import DateTimeField from 'react-bootstrap-datetimepicker'

import ManagerNavbar from '../../common/containers/ManagerNavbar'
import AffectedEntity from './AffectedEntity'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'
import GtfsSearch from '../../gtfs/components/gtfssearch'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'

import { checkEntitiesForFeeds } from '../util/util'
import { browserHistory } from 'react-router'

import moment from 'moment'

export default class SignEditor extends React.Component {
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    console.log('SignEditor')
    console.log(this.props.sign)
    if (!this.props.sign) {
      return <ManagerNavbar/>
    }

    const canPublish = checkEntitiesForFeeds(this.props.sign.affectedEntities, this.props.publishableFeeds)
    const canEdit = checkEntitiesForFeeds(this.props.sign.affectedEntities, this.props.editableFeeds)

    const editingIsDisabled = this.props.sign.published && !canPublish ? true : !canEdit

    // if user has edit rights and sign is unpublished, user can delete sign, else check if they have publish rights
    const deleteIsDisabled = !editingIsDisabled && !this.props.sign.published ? false : !canPublish
    const deleteButtonMessage = this.props.sign.published && deleteIsDisabled ? 'Cannot delete because sign is published'
      : !canEdit ? 'Cannot alter signs for other agencies' : 'Delete sign'

    const editButtonMessage = this.props.sign.published && deleteIsDisabled ? 'Cannot edit because sign is published'
      : !canEdit ? 'Cannot alter signs for other agencies' : 'Edit sign'

    return (
      <div>
        <ManagerNavbar/>
        <Grid>
          <Row>
            <Col xs={1}>
              <Button
                onClick={
                  (evt) => {
                  browserHistory.push('/signs')
                }}
              ><Glyphicon glyph='chevron-left'/> Back</Button>
            </Col>
            <Col xs={3}>
              <Input
                type="text"
                label="Configuration Name"
                defaultValue={this.props.sign.title}
                onChange={evt => {
                  this.props.titleChanged(evt.target.value)
                }}
              />
            </Col>
            <Col xs={5}>
            </Col>

            <Col xs={3}>
              <ButtonGroup className='pull-right'>
                <Button
                  title={editButtonMessage}
                  bsStyle='default'
                  disabled={editingIsDisabled}
                  onClick={(evt) => {
                    console.log('times', this.props.sign.end, this.props.sign.start);
                    // if(moment(this.props.sign.end).isBefore(moment())) {
                    //   alert('Sign end date cannot be before the current date')
                    //   return
                    // }
                    // if(this.props.sign.affectedEntities.length === 0) {
                    //   alert('You must specify at least one stop/route')
                    //   return
                    // }

                    this.props.onSaveClick(this.props.sign)
                  }}
                >Save</Button>

                <Button
                  disabled={!canPublish}
                  bsStyle={this.props.sign.published ? 'warning' : 'success'}
                  onClick={(evt) => {
                    this.props.onPublishClick(this.props.sign, !this.props.sign.published)
                  }}
                >
                  {this.props.sign.published ? 'Unpublish' : 'Publish'}</Button>
                <Button
                  title={deleteButtonMessage}
                  bsStyle='danger'
                  disabled={deleteIsDisabled}
                  onClick={
                    (evt) => {
                    this.props.onDeleteClick(this.props.sign)
                  }}
                >Delete</Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <DisplaySelector
                feeds={this.props.activeFeeds}
                placeholder='Add displays'
                sign={this.props.sign}
                label='List of Signs'
                clearable={true}
                handleClick={this.props.handleDisplayClick}
                onChange={(evt) => {
                  console.log('we need to add this sign to the draft config', evt)
                  // if (typeof evt !== 'undefined' && evt !== null){
                      this.props.updateDisplays(evt.map(s => s.display))
                  // }

                }}
              />
              <Panel header={<b>Affected </b>}>
                <Row>
                  <Col xs={12}>
                    <Row style={{marginBottom: '15px'}}>
                      <Col xs={5}>
                        <Button style={{marginRight: '5px'}} onClick={(evt) => {
                          console.log('editable feeds', this.props.editableFeeds)
                          this.props.onAddEntityClick('AGENCY', this.props.editableFeeds[0])
                        }}>
                          Add Agency
                        </Button>
                        <Button onClick={(evt) => this.props.onAddEntityClick('MODE', {gtfsType: 0, name: 'Tram/LRT'}, this.props.editableFeeds[0])}>
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
                                this.props.onAddEntityClick('STOP', evt.stop, evt.agency)
                              }
                              else if (evt.route)
                                this.props.onAddEntityClick('ROUTE', evt.route, evt.agency)
                            }
                          }}
                        />
                      </Col>
                    </Row>
                    {this.props.sign.affectedEntities.map((entity) => {
                      return <AffectedEntity
                        entity={entity}
                        key={entity.id}
                        activeFeeds={this.props.activeFeeds}
                        feeds={this.props.editableFeeds}
                        onDeleteEntityClick={this.props.onDeleteEntityClick}
                        entityUpdated={this.props.entityUpdated}
                      />
                    })}
                  </Col>
                </Row>
              </Panel>
            </Col>

            <Col xs={6}>
              <GlobalGtfsFilter />
              <GtfsMapSearch
                feeds={this.props.activeFeeds}
                onStopClick={this.props.editorStopClick}
                onRouteClick={this.props.editorRouteClick}
                popupAction='Add'
              />
            </Col>

          </Row>
        </Grid>
      </div>
    )
  }
}
