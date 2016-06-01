import React, {Component, PropTypes} from 'react'
import moment from 'moment'

import { Panel, Row, Col, Glyphicon, Input, Button, ButtonToolbar } from 'react-bootstrap'
import WatchButton from '../../common/containers/WatchButton'

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
    const messages = DT_CONFIG.messages.NotesViewer
    const type = this.props.type === 'feed-source'
      ? messages.feedSource
      : messages.feedVersion
    const header = (
      <h3 onClick={() => {
        if(!this.props.notes) this.props.notesRequested()
        this.setState({ expanded: !this.state.expanded })
      }}>
        <Glyphicon glyph='comment' /> {messages.title} {type} {this.noteCount() !== null ? `(${this.noteCount()})` : ''}
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
              {messages.all}
              <ButtonToolbar
                className='pull-right'
              >
                <WatchButton
                  isWatching={isWatchingComments}
                  user={this.props.user}
                  target={this.props.version ? this.props.version.id : this.props.feedSource.id}
                  subscriptionType={this.props.version ? 'feedversion-commented-on' : 'feed-commented-on'}
                />
                <Button
                  title={messages.refresh}
                  onClick={() => { this.props.notesRequested() }}
                >
                  <Glyphicon glyph='refresh' /><span className='hidden-xs'> {messages.refresh}</span>
                </Button>
              </ButtonToolbar>
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
              : <p><i>{messages.none}</i></p>

            }
          </Col>
          <Col xs={12} sm={4} md={6}>
            <h3>{messages.postComment}</h3>
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
            >{messages.new}</Button>
          </Col>
        </Row>

      </Panel>
    )
  }
}
