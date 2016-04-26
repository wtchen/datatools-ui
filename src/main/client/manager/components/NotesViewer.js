import React, {Component, PropTypes} from 'react'
import moment from 'moment'

import { Panel, Row, Col, Glyphicon, Input, Button } from 'react-bootstrap'

export default class NotesViewer extends Component {

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  componentWillReceiveProps (nextProps) {
    if(!nextProps.notes) this.setState({ expanded: false })
  }

  noteCount () {
    if(this.props.notes) return this.props.notes.length
    if(this.props.noteCount != null) return this.props.noteCount
    return null
  }

  render () {

    const header = (
      <h3 onClick={() => {
        if(!this.props.notes) this.props.notesRequested()
        this.setState({ expanded: !this.state.expanded })
      }}>
        <Glyphicon glyph='comment' /> {this.props.title} {this.noteCount() !== null ? `(${this.noteCount()})` : ''}
      </h3>
    )
    const isWatchingComments = this.props.feedSource ? this.props.user.subscriptions.hasFeedSubscription(this.props.feedSource.projectId, this.props.feedSource.id, 'feed-commented-on') : false
    return (
      <Panel
        header={header}
        collapsible
        expanded={this.state.expanded}
      >
        <Row>
          <Col xs={12} sm={8} md={6}>
            <h3>
              All Comments
              <Button
                className='pull-right'
                title='Refresh comments'
                onClick={() => { this.props.notesRequested() }}
              >
                <Glyphicon glyph='refresh' /><span className='hidden-xs'> Refresh</span>
              </Button>
              {
                DT_CONFIG.application.notifications_enabled ?
                <Button
                  title={isWatchingComments ? 'Unwatch comments' : 'Watch comments'}
                  className='pull-right'
                  onClick={() => { this.props.updateUserSubscription(this.props.user.profile, this.props.feedSource.id, 'feed-commented-on') }}
                >
                  {
                    isWatchingComments ? <span><Glyphicon glyph='eye-close'/><span className='hidden-xs'> Unwatch</span></span>
                    : <span><Glyphicon glyph='eye-open'/><span className='hidden-xs'> Watch</span></span>
                  }
                </Button>
                : ''
              }
            </h3>
            {this.props.notes && this.props.notes.length > 0
              ? this.props.notes.map(note => {
                  return (
                    <Panel>
                      <p><i>{note.body || '(no content)'}</i></p>
                      <p style={{ textAlign: 'right' }}>- <b>{note.userEmail}</b> at {moment(note.date).format("h:MMa, MMM. DD YYYY")}</p>
                    </Panel>
                  )
                })
              : <p><i>No comments.</i></p>

            }
          </Col>
          <Col xs={12} sm={4} md={6}>
            <h3>Post a New Comment</h3>
            <Input
              ref='newNoteBody'
              type='textarea'
            />
            <Button
              className='pull-right'
              onClick={() => {
                console.log('posting new note', this.refs.newNoteBody.getValue());
                this.props.newNotePosted({
                  body: this.refs.newNoteBody.getValue()
                })
              }}
            >Post</Button>
          </Col>
        </Row>

      </Panel>
    )
  }
}
