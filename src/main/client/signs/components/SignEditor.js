import React from 'react'

import { Grid, Row, Col, ButtonGroup, Button, Input, Panel, Glyphicon } from 'react-bootstrap'
import DisplaySelector from './DisplaySelector'

import DateTimeField from 'react-bootstrap-datetimepicker'

import ManagerPage from '../../common/components/ManagerPage'
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
    // console.log('SignEditor')
    if (!this.props.sign) {
      return <ManagerPage/>
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
    console.log('displays', this.props.sign.displays)
    return (
      <ManagerPage ref='page'>
        <Grid>
          <Row>
            <Col xs={4} sm={8} md={9}>
              <Button
                onClick={
                  (evt) => {
                  browserHistory.push('/signs')
                }}
              ><Glyphicon glyph='chevron-left'/> Back</Button>
            </Col>
            <Col xs={8} sm={4} md={3}>
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
                    if(this.props.sign.affectedEntities.length === 0) {
                      alert('You must specify at least one stop')
                      return
                    }

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
            <Col xs={12} sm={6} style={{marginTop: '10px'}}>
              <Input
                type='text'
                label='Configuration Name'
                bsSize='large'
                placeholder='E.g., Fremont (Inside Station)'
                defaultValue={this.props.sign.title || ''}
                onChange={evt => {
                  this.props.titleChanged(evt.target.value)
                }}
              />
              <Panel header={<b><Glyphicon glyph='modal-window'/> Associated Displays for Sign Configuration</b>}>
                <Row>
                  <Col xs={12}>
                    <DisplaySelector
                      feeds={this.props.activeFeeds}
                      createDisplay={(input) => {
                        this.refs.page.showConfirmModal({
                          title: 'Create New Display?',
                          body: <p>Create new display for <strong>{input}</strong>?</p>,
                          onConfirm: () => {
                            this.props.createDisplay(input)
                          }
                        })
                      }}
                      placeholder='Click to add displays...'
                      sign={this.props.sign}
                      label='List of Signs'
                      clearable={true}
                      toggleConfigForDisplay={this.props.toggleConfigForDisplay}
                      onChange={(evt) => {
                        console.log('we need to add this sign to the draft config', evt)
                        // if (typeof evt !== 'undefined' && evt !== null){
                            this.props.updateDisplays(evt.map(s => s.display))
                        // }

                      }}
                      value={this.props.sign.displays ? this.props.sign.displays.map(d => ({'display': d, 'value': d.Id, 'label': <span><strong>{d.DisplayTitle}</strong> {d.LocationDescription}</span>})) : ''}
                    />
                  </Col>
                </Row>
              </Panel>
              <Panel header={<b><Glyphicon glyph='th-list'/> Stops/Routes for Sign Configuration</b>}>
                <Row>
                  <Col xs={12}>
                    <Row style={{marginBottom: '15px'}}>
                      <Col xs={12}>
                        <GtfsSearch
                          feeds={this.props.activeFeeds}
                          placeholder='Click to add stops...'
                          limit={100}
                          entities={['stops']}
                          clearable={true}
                          onChange={(evt) => {
                            console.log('we need to add this entity to the store', evt)
                            if (typeof evt !== 'undefined' && evt !== null) {
                              this.props.onAddEntityClick('STOP', evt.stop, evt.agency)
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

            <Col xs={12} sm={6}>
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
      </ManagerPage>
    )
  }
}
