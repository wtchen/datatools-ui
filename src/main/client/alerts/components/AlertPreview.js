import React, {Component} from 'react'
import {Icon} from '@conveyal/woonerf'
import moment from 'moment'

import { Panel, Row, Col, ButtonGroup, Button, Label } from 'react-bootstrap'
import { checkEntitiesForFeeds } from '../../common/util/permissions'

export default class AlertPreview extends Component {
  render () {
    const {
      alert,
      publishableFeeds,
      editableFeeds,
      onEditClick,
      onDeleteClick
    } = this.props
    const canPublish = checkEntitiesForFeeds(alert.affectedEntities, publishableFeeds)
    const canEdit = checkEntitiesForFeeds(alert.affectedEntities, editableFeeds)

    const editingIsDisabled = alert.published && !canPublish ? true : !canEdit

    // if user has edit rights and alert is unpublished, user can delete alert, else check if they have publish rights
    const deleteIsDisabled = !editingIsDisabled && !alert.published ? false : !canPublish
    const deleteButtonMessage = alert.published && deleteIsDisabled ? 'Cannot delete because alert is published'
      : !canEdit ? 'Cannot alter alerts for other agencies' : 'Delete alert'

    const editButtonMessage = alert.published && deleteIsDisabled ? 'Cannot edit because alert is published'
      : !canEdit ? 'Cannot alter alerts for other agencies' : 'Edit alert'
    const publishedLabel = alert.published
      ? <Label title='Published' bsStyle='success'><Icon type='check' /></Label>
      : <Label title='Draft' bsStyle='warning'><Icon type='pencil' /></Label>
    const entitiesLabel = alert.affectedEntities.length
      ? <Label title={`${alert.affectedEntities.length} affected service(s)`} bsStyle='danger'><Icon type='exclamation-triangle' /> {alert.affectedEntities.length}</Label>
      : <Label>General alert</Label>
    const header = (
      <Row>
        <Col xs={8}>
          <p style={{margin: 0}}><strong>{alert.title}</strong></p>
          <p style={{margin: 0}}>ID: #{alert.id} {publishedLabel} {entitiesLabel}</p>
        </Col>
        <Col xs={4}>
          <ButtonGroup className='pull-right'>
            <Button title={editButtonMessage} disabled={editingIsDisabled} onClick={() => onEditClick(alert)}>
              <Icon type='pencil' />
            </Button>
            <Button
              title={deleteButtonMessage}
              disabled={deleteIsDisabled}
              onClick={(evt) => {
                let r = window.confirm('Are you sure you want to delete this alert?')
                if (r === true) {
                  onDeleteClick(alert)
                } else {
                  return
                }
              }}
            >
              <Icon type='remove' />
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
    )
    return (
      <Panel collapsible header={header}>
        <p>
          <i>{moment(alert.start).format('MMM Do YYYY, h:mm:ssa')} to {moment(alert.end).format('MMM Do YYYY, h:mm:ssa')} </i>
          <span className='pull-right'>{publishedLabel} {alert.published ? 'Published' : 'Draft'}</span>
        </p>
        <p style={{whiteSpace: 'pre-wrap'}}>{alert.description}</p>
        <p>URL: <a href={alert.url} target='_blank'>{alert.url}</a></p>
        <p>
          <span className='pull-right'>{entitiesLabel} affected service(s)</span>
        </p>
      </Panel>
    )
  }
}
