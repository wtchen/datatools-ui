// @flow

import React, {Component} from 'react'
import {
  Grid,
  Row,
  Col,
  ButtonGroup,
  Button,
  Panel,
  Glyphicon,
  FormGroup,
  ControlLabel,
  FormControl
} from 'react-bootstrap'
import { browserHistory } from 'react-router'

import * as activeSignActions from '../actions/activeSign'
import * as signsActions from '../actions/signs'
import ManagerPage from '../../common/components/ManagerPage'
import { checkEntitiesForFeeds } from '../../common/util/permissions'
import * as filterActions from '../../gtfs/actions/filter'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'
import GtfsSearch from '../../gtfs/components/gtfs-search'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'
import * as projectsActions from '../../manager/actions/projects'
import AffectedEntity from './AffectedEntity'
import DisplaySelector from './DisplaySelector'

import type {Props as ContainerProps} from '../containers/ActiveSignEditor'
import type {Feed, GtfsStop, Project, Sign} from '../../types'
import type {ManagerUserState} from '../../types/reducers'

type Props = ContainerProps & {
  activeFeeds: Array<Feed>,
  addActiveEntity: typeof activeSignActions.addActiveEntity,
  createDisplay: typeof signsActions.createDisplay,
  createSign: typeof signsActions.createSign,
  deleteActiveEntity: typeof activeSignActions.deleteActiveEntity,
  deleteSign: typeof signsActions.deleteSign,
  editableFeeds: Array<Feed>,
  fetchProjects: typeof projectsActions.fetchProjects,
  fetchRtdSigns: typeof signsActions.fetchRtdSigns,
  permissionFilter: string,
  project: Project,
  publishableFeeds: Array<Feed>,
  saveSign: typeof signsActions.saveSign,
  setActiveSign: typeof signsActions.setActiveSign,
  sign: Sign,
  toggleConfigForDisplay: typeof activeSignActions.toggleConfigForDisplay,
  updateActiveEntity: typeof activeSignActions.updateActiveEntity,
  updateActiveSignProperty: typeof activeSignActions.updateActiveSignProperty,
  updatePermissionFilter: typeof filterActions.updatePermissionFilter,
  user: ManagerUserState
}

export default class SignEditor extends Component<Props> {
  componentWillMount () {
    const {
      createSign,
      fetchProjects,
      fetchRtdSigns,
      location,
      permissionFilter,
      setActiveSign,
      sign,
      updatePermissionFilter,
      user
    } = this.props

    const signId = location.pathname.split('/sign/')[1]
    if (sign) {
      return
    }
    let activeProject
    fetchProjects(true)
      // $FlowFixMe actions wrapped in dispatch returns a promise
      .then(project => {
        activeProject = project
        return fetchRtdSigns()
      })
      // logic for creating new sign or setting active sign (and checking project permissions)
      .then(() => {
        if (
          user.permissions &&
          !user.permissions.hasProjectPermission(
            activeProject.organizationId,
            activeProject.id,
            'edit-etid'
          )
        ) {
          console.log('cannot create sign!')
          browserHistory.push('/signs')
          return
        }
        if (!signId) {
          return createSign()
        } else {
          setActiveSign(signId)
        }
      })
    if (permissionFilter !== 'edit-etid') {
      updatePermissionFilter('edit-etid')
    }
  }

  _createDisplay = (input: any) => {
    this.refs.page.showConfirmModal({
      title: 'Create New Display?',
      body: <p>Create new display for <strong>{input}</strong>?</p>,
      onConfirm: () => this.props.createDisplay(input)
    })
  }

  _onChangeDisplay = (inputs: Array<any>) => {
    this.props.updateActiveSignProperty({
      key: 'displays',
      value: inputs.map(s => s.display)
    })
  }

  _onSelectStop = (evt: any) => {
    if (typeof evt !== 'undefined' && evt !== null) {
      this.props.addActiveEntity('STOP', evt.stop, evt.agency, this._getNewEntityId())
    }
  }

  _onChangeTitle = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.props.updateActiveSignProperty({
      key: 'title',
      value: evt.target.value
    })
  }

  _onClickDelete = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.refs.page.showConfirmModal({
      title: 'Delete Configuration #' + this.props.sign.id + '?',
      body: <p>Are you sure you want to delete <strong>Sign Configuration {this.props.sign.id}</strong>?</p>,
      onConfirm: () => {
        this.props.deleteActiveEntity(this.props.sign)
      }
    })
  }

  _onClickSave = () => {
    if (!this.props.sign.title) {
      return window.alert('You must specify a name for the sign configuration')
    }
    // check for no entities
    if (this.props.sign.affectedEntities.length === 0) {
      return window.alert('You must specify at least one stop')
    }
    // check for entities without routes
    for (var i = 0; i < this.props.sign.affectedEntities.length; i++) {
      const ent = this.props.sign.affectedEntities[i]
      if (!ent.route || ent.route.length === 0) {
        return window.alert('You must specify at least one route for ' + ent.stop.stop_name)
      }
    }
    // check for published displays for unpublished config
    for (let i = 0; i < this.props.sign.displays.length; i++) {
      const disp = this.props.sign.displays[i]
      if (disp.PublishedDisplayConfigurationId === this.props.sign.id && !this.props.sign.published) {
        return window.alert('Published displays may not be associated with an unpublished sign configuration.')
      }
    }
    this.props.saveSign(this.props.sign)
  }

  _getNewEntityId = () => this.props.sign.affectedEntities.length
    ? 1 + this.props.sign.affectedEntities.map(e => e.id).reduce((initial, current) => initial > current ? initial : current)
    : 1

  _onClickBack = () => browserHistory.push('/signs')

  _onClickPublish = () => {
    const {sign, updateActiveSignProperty} = this.props
    updateActiveSignProperty({
      key: 'published',
      value: !sign.published
    })
  }

  _onMapStopClick = (stop: GtfsStop, agency: any, newEntityId: ?number) => {
    this.props.addActiveEntity('STOP', stop, agency, newEntityId)
  }

  render () {
    const {
      activeFeeds,
      deleteActiveEntity,
      editableFeeds,
      publishableFeeds,
      sign,
      toggleConfigForDisplay,
      updateActiveEntity
    } = this.props

    // console.log('SignEditor')
    if (!sign) {
      return <ManagerPage />
    }

    const canPublish = checkEntitiesForFeeds(sign.affectedEntities, publishableFeeds)
    const canEdit = checkEntitiesForFeeds(sign.affectedEntities, editableFeeds)

    const editingIsDisabled = sign.published && !canPublish ? true : !canEdit

    // if user has edit rights and sign is unpublished, user can delete sign, else check if they have publish rights
    const deleteIsDisabled = !editingIsDisabled && !sign.published ? false : !canPublish
    const deleteButtonMessage = sign.published && deleteIsDisabled ? 'Cannot delete because sign is published'
      : !canEdit ? 'Cannot alter signs for other agencies' : 'Delete sign'

    const editButtonMessage = sign.published && deleteIsDisabled ? 'Cannot edit because sign is published'
      : !canEdit ? 'Cannot alter signs for other agencies' : 'Edit sign'

    return (
      <ManagerPage
        ref='page'
        title={sign.id > 0 ? `eTID Config ${sign.id}` : 'New eTID Config'}>
        <Grid fluid>
          <Row>
            <Col xs={4} sm={8} md={9}>
              <Button
                onClick={this._onClickBack}>
                <Glyphicon glyph='chevron-left' /> Back
              </Button>
            </Col>
            <Col xs={8} sm={4} md={3}>
              <ButtonGroup className='pull-right'>
                <Button
                  title={editButtonMessage}
                  bsStyle='default'
                  disabled={editingIsDisabled}
                  onClick={this._onClickSave}>
                  Save
                </Button>

                <Button
                  disabled={!canPublish}
                  bsStyle={sign.published ? 'warning' : 'success'}
                  onClick={this._onClickPublish}>
                  {sign.published ? 'Unpublish' : 'Publish'}</Button>
                <Button
                  title={deleteButtonMessage}
                  bsStyle='danger'
                  disabled={deleteIsDisabled}
                  onClick={this._onClickDelete}>
                  Delete
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={6} style={{marginTop: '10px'}}>
              <FormGroup controlId='formControlsName'>
                <ControlLabel>Configuration Name</ControlLabel>
                <FormControl
                  type='text'
                  bsSize='large'
                  placeholder='E.g., Civic Center surface bus services'
                  defaultValue={sign.title || ''}
                  onChange={this._onChangeTitle} />
              </FormGroup>
              <Panel header={<b><Glyphicon glyph='modal-window' /> Associated Displays for Sign Configuration</b>}>
                <Row>
                  <Col xs={12}>
                    <DisplaySelector
                      feeds={activeFeeds}
                      createDisplay={this._createDisplay}
                      placeholder='Click to add displays, or enter a new display name...'
                      sign={sign}
                      label='List of Signs'
                      clearable
                      toggleConfigForDisplay={toggleConfigForDisplay}
                      onChange={this._onChangeDisplay}
                      value={sign.displays
                        ? sign.displays.map(d => ({
                          display: d,
                          value: d.Id,
                          label: <span><strong>{d.DisplayTitle}</strong> {d.LocationDescription}</span>
                        }))
                        : ''
                      } />
                  </Col>
                </Row>
              </Panel>
              <Panel header={<b><Glyphicon glyph='th-list' /> Stops/Routes for Sign Configuration</b>}>
                <Row>
                  <Col xs={12}>
                    <Row style={{marginBottom: '15px'}}>
                      <Col xs={12}>
                        <GtfsSearch
                          feeds={activeFeeds}
                          placeholder='Click to add stops...'
                          limit={100}
                          entities={['stops']}
                          clearable
                          onChange={this._onSelectStop} />
                      </Col>
                    </Row>
                    {sign.affectedEntities
                      .sort((a, b) => b.id - a.id) // reverse sort by entity id
                      .map((entity) => (
                        <AffectedEntity
                          entity={entity}
                          key={entity.id}
                          activeFeeds={activeFeeds}
                          feeds={editableFeeds}
                          deleteActiveEntity={deleteActiveEntity}
                          updateActiveEntity={updateActiveEntity} />
                      ))
                    }
                  </Col>
                </Row>
              </Panel>
            </Col>
            <Col xs={12} sm={6}>
              <Row>
                <Col xs={12}>
                  <GlobalGtfsFilter />
                </Col>
              </Row>
              <GtfsMapSearch
                feeds={activeFeeds}
                onStopClick={this._onMapStopClick}
                popupAction='Add'
                newEntityId={this._getNewEntityId()} />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
