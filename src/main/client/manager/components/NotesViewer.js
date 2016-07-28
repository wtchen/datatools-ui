import React, {Component, PropTypes} from 'react'
import moment from 'moment'
import ReactDOM from 'react-dom'
import { Panel, Row, Col, Glyphicon, FormControl, Button, ButtonToolbar } from 'react-bootstrap'

import WatchButton from '../../common/containers/WatchButton'

export default class NotesViewer extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    notes: PropTypes.array,
    type: PropTypes.string,
    user: PropTypes.object,
    version: PropTypes.object,

    newNotePosted: PropTypes.func,
    notesRequested: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }
  }
  render () {
    const messages = window.DT_CONFIG.messages.active.NotesViewer

    const isWatchingComments = this.props.feedSource
      ? this.props.user.subscriptions.hasFeedSubscription(this.props.feedSource.projectId, this.props.feedSource.id, 'feed-commented-on')
      : false

    return (
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
          <FormControl
            ref='newNoteBody'
            type='textarea'
            value={this.state.value}
            onChange={(evt) => {
              this.setState({value: evt.target.value})
            }}
          />
          <Button
            className='pull-right'
            disabled={this.state.value === ''}
            onClick={() => {
              this.props.newNotePosted({
                body: this.state.value
              })
              this.setState({value: ''})
            }}
          >{messages.new}</Button>
        </Col>
      </Row>
    )
  }
}
