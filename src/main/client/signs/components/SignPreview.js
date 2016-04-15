import React from 'react'
import moment from 'moment'

import { Panel, Grid, Row, Col, ButtonGroup, Button, Glyphicon, Label } from 'react-bootstrap'
import { Link } from 'react-router'
import { checkEntitiesForFeeds } from '../util/util'

export default class SignPreview extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
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
      <Panel collapsible header={
        <Row>
          <Col xs={8}>
            <strong>{this.props.sign.title} (#{this.props.sign.id})</strong>
          </Col>
          <Col xs={4}>
            <ButtonGroup className='pull-right'>
              <Button title={editButtonMessage} disabled={editingIsDisabled} onClick={() => this.props.onEditClick(this.props.sign)}>
                <Glyphicon glyph="pencil" />
              </Button>
              <Button title={deleteButtonMessage} disabled={deleteIsDisabled} onClick={() => this.props.onDeleteClick(this.props.sign)}>
                <Glyphicon glyph="remove" />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      }>
        <p>
          <i>{moment(this.props.sign.start).format('MMM Do YYYY, h:mm:ssa')} to {moment(this.props.sign.end).format('MMM Do YYYY, h:mm:ssa')} </i>
          {this.props.sign.published
            ? <Label bsStyle="success" className='pull-right'>published</Label>
            : <Label bsStyle="warning" className='pull-right'>unpublished</Label>
          }
        </p>
        <p>{this.props.sign.description}</p>
        <p>URL: <a href={this.props.sign.url} target="_blank">{this.props.sign.url}</a></p>
        <p>
        {this.props.sign.affectedEntities.length
          ? <Label bsStyle="danger" className='pull-right'>{this.props.sign.affectedEntities.length} affected service(s)</Label>
          : <Label className='pull-right'>General sign</Label>
        }
        </p>
      </Panel>
    )
  }
}
