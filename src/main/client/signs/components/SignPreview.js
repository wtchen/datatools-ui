import React from 'react'
import moment from 'moment'

import { Panel, Grid, Row, Col, ButtonGroup, Button, Glyphicon, Label } from 'react-bootstrap'
import { Link } from 'react-router'
import { checkEntitiesForFeeds } from '../../common/util/permissions'

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
      const publishedLabel = this.props.sign.published
        ? <Label title='Published' bsStyle="success"><Glyphicon glyph="ok" /></Label>
        : <Label title='Draft' bsStyle="warning"><Glyphicon glyph="pencil" /></Label>
      const displaysLabel = this.props.sign.displays
        ? <Label title={`${this.props.sign.displays.length} associated display(s)`} bsStyle="default"><Glyphicon glyph="modal-window" /> {this.props.sign.displays.length}</Label>
        : <Label title={`0 associated display(s)`} bsStyle="default"><Glyphicon glyph="modal-window" /> 0</Label>
    return (
      <Panel collapsible header={
        <Row>
          <Col xs={8}>
            <p style={{margin: 0}}><strong>{this.props.sign.title}</strong></p>
            <p style={{margin: 0}}>ID: #{this.props.sign.id} <span>{publishedLabel} {displaysLabel}</span></p>
          </Col>
          <Col xs={4}>
            <ButtonGroup className='pull-right'>
              <Button title={editButtonMessage} disabled={editingIsDisabled} onClick={() => this.props.onEditClick(this.props.sign)}>
                <Glyphicon glyph='pencil' />
              </Button>
              <Button
                title={deleteButtonMessage}
                disabled={deleteIsDisabled}
                onClick={
                  (evt) => {
                    let r = confirm('Are you sure you want to delete this sign configuration?')
                    if (r == true) {
                        this.props.onDeleteClick(this.props.sign)
                    } else {
                        return
                    }
                    // this.props.showConfirmModal({
                    //   title: 'Delete Configuration #' + this.props.sign.id + '?',
                    //   body: <p>Are you sure you want to delete <strong>Sign Configuration {this.props.sign.id}</strong>?</p>,
                    //   onConfirm: () => {
                    //     this.props.onDeleteClick(this.props.sign)
                    //   }
                    // })
                }}
              >
                <Glyphicon glyph='remove' />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      }>
        <p>
          <span className='pull-right'>{publishedLabel} {this.props.sign.published ? 'Published' : 'Draft'}</span>
        </p>
        <p>Stops:&nbsp;
        {this.props.sign.affectedEntities
          ? this.props.sign.affectedEntities.map((e, index) => {
            return e.stop
              ? (<span key={index}>{e.stop.stop_name} <Label bsStyle='primary'>{e.route.length} routes</Label></span>)
              : e.stop_id
          })
          : ''
        }
        </p>
        <p>
        <span className='pull-right'>{displaysLabel} associated display(s)</span>
        </p>
      </Panel>
    )
  }
}
