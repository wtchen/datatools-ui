import React from 'react'
import Helmet from 'react-helmet'

import { Grid, Row, Col, ButtonGroup, Button, Input, Panel, Glyphicon } from 'react-bootstrap'
import DisplaySelector from './DisplaySelector'

import ManagerPage from '../../common/components/ManagerPage'
import AffectedEntity from './AffectedEntity'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'
import GtfsSearch from '../../gtfs/components/gtfssearch'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'

import { checkEntitiesForFeeds } from '../../common/util/permissions'
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

    const newEntityId = this.props.sign.affectedEntities.length
      ? 1 + this.props.sign.affectedEntities.map(e => e.id).reduce((initial, current) => initial > current ? initial : current)
      : 1

    console.log('displays', this.props.sign.displays)
    return (
      <ManagerPage ref='page'>
      <Helmet
        title={this.props.sign.id > 0 ? `eTID Config ${this.props.sign.id}` : 'New eTID Config'}
      />
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
                    if(!this.props.sign.title) {
                      alert('You must specify a name for the sign configuration')
                      return
                    }
                    // check for no entities
                    if(this.props.sign.affectedEntities.length === 0) {
                      alert('You must specify at least one stop')
                      return
                    }
                    // check for entities without routes
                    for (var i = 0; i < this.props.sign.affectedEntities.length; i++) {
                      let ent = this.props.sign.affectedEntities[i]
                      if (!ent.route || ent.route.length === 0) {
                        alert('You must specify at least one route for ' + ent.stop.stop_name)
                        return
                      }
                    }
                    // check for published displays for unpublished config
                    for (var i = 0; i < this.props.sign.displays.length; i++) {
                      let disp = this.props.sign.displays[i]
                      if (disp.PublishedDisplayConfigurationId === this.props.sign.id && !this.props.sign.published) {
                        alert('Published displays may not be associated with an unpublished sign configuration.')
                        return
                      }
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
                      // let r = confirm('Are you sure you want to delete this sign configuration?')
                      // if (r == true) {
                      //     this.props.onDeleteClick(this.props.sign)
                      // } else {
                      //     return
                      // }
                      this.refs.page.showConfirmModal({
                        title: 'Delete Configuration #' + this.props.sign.id + '?',
                        body: <p>Are you sure you want to delete <strong>Sign Configuration {this.props.sign.id}</strong>?</p>,
                        onConfirm: () => {
                          this.props.onDeleteClick(this.props.sign)
                        }
                      })
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
                placeholder='E.g., Civic Center surface bus services'
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
                      placeholder='Click to add displays, or enter a new display name...'
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
                              this.props.onAddEntityClick('STOP', evt.stop, evt.agency, newEntityId)
                            }
                          }}
                        />
                      </Col>
                    </Row>
                    {this.props.sign.affectedEntities
                      .sort((a, b) => b.id - a.id) // reverse sort by entity id
                      .map((entity) => {
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
              <GlobalGtfsFilter
                permissionFilter='edit-etid'
              />
              <GtfsMapSearch
                feeds={this.props.activeFeeds}
                onStopClick={this.props.editorStopClick}
                newEntityId={newEntityId}
                popupAction='Add'
              />
            </Col>

          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
