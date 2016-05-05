import React from 'react'
import moment from 'moment'

import { Panel, Grid, Row, Col, ButtonGroup, Button, Glyphicon, Label } from 'react-bootstrap'
import { Link } from 'react-router'
import { checkEntitiesForFeeds } from '../../common/util/permissions'

export default class AlertPreview extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
    const canPublish = checkEntitiesForFeeds(this.props.alert.affectedEntities, this.props.publishableFeeds)
    const canEdit = checkEntitiesForFeeds(this.props.alert.affectedEntities, this.props.editableFeeds)

    const editingIsDisabled = this.props.alert.published && !canPublish ? true : !canEdit

    // if user has edit rights and alert is unpublished, user can delete alert, else check if they have publish rights
    const deleteIsDisabled = !editingIsDisabled && !this.props.alert.published ? false : !canPublish
    const deleteButtonMessage = this.props.alert.published && deleteIsDisabled ? 'Cannot delete because alert is published'
      : !canEdit ? 'Cannot alter alerts for other agencies' : 'Delete alert'

    const editButtonMessage = this.props.alert.published && deleteIsDisabled ? 'Cannot edit because alert is published'
      : !canEdit ? 'Cannot alter alerts for other agencies' : 'Edit alert'
    const publishedLabel = this.props.alert.published
      ? <Label title='Published' bsStyle="success"><Glyphicon glyph="ok" /></Label>
      : <Label title='Draft' bsStyle="warning"><Glyphicon glyph="pencil" /></Label>
    const entitiesLabel = this.props.alert.affectedEntities.length
      ? <Label title={`${this.props.alert.affectedEntities.length} affected service(s)`} bsStyle="danger"><Glyphicon glyph="alert" /> {this.props.alert.affectedEntities.length}</Label>
      : <Label>General alert</Label>
    return (
      <Panel collapsible header={
        <Row>
          <Col xs={8}>
            <p style={{margin: 0}}><strong>{this.props.alert.title}</strong></p>
            <p style={{margin: 0}}>ID: #{this.props.alert.id} {publishedLabel} {entitiesLabel}</p>
          </Col>
          <Col xs={4}>
            <ButtonGroup className='pull-right'>
              <Button title={editButtonMessage} disabled={editingIsDisabled} onClick={() => this.props.onEditClick(this.props.alert)}>
                <Glyphicon glyph="pencil" />
              </Button>
              <Button
                title={deleteButtonMessage}
                disabled={deleteIsDisabled}
                onClick={
                  (evt) => {
                    let r = confirm('Are you sure you want to delete this alert?')
                    if (r == true) {
                        this.props.onDeleteClick(this.props.alert)
                    } else {
                        return
                    }
                }}
              >
                <Glyphicon glyph="remove" />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      }>
        <p>
          <i>{moment(this.props.alert.start).format('MMM Do YYYY, h:mm:ssa')} to {moment(this.props.alert.end).format('MMM Do YYYY, h:mm:ssa')} </i>
          <span className='pull-right'>{publishedLabel} {this.props.alert.published ? 'Published' : 'Draft'}</span>
        </p>
        <p>{this.props.alert.description}</p>
        <p>URL: <a href={this.props.alert.url} target="_blank">{this.props.alert.url}</a></p>
        <p>
        <span className='pull-right'>{entitiesLabel} affected service(s)</span>
        </p>
      </Panel>
    )
  }
}
