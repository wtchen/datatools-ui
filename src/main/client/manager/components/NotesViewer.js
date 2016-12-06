import React, {Component, PropTypes} from 'react'
import moment from 'moment'
import gravatar from 'gravatar'
import { Panel, Row, Col, Glyphicon, FormControl, Button, ButtonToolbar, Media } from 'react-bootstrap'

import WatchButton from '../../common/containers/WatchButton'
import { getComponentMessages, getMessage } from '../../common/util/config'
import { getProfileLink } from '../../common/util/util'

export default class NotesViewer extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    notes: PropTypes.array,
    type: PropTypes.string,
    user: PropTypes.object,
    version: PropTypes.object,
    stacked: PropTypes.bool,

    newNotePosted: PropTypes.func,
    notesRequested: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }
  }
  componentWillMount () {
    this.props.notesRequested(this.props.feedSource)
  }
  render () {
    const messages = getComponentMessages('NotesViewer')
    const userLink = this.props.user ? <a href={getProfileLink(this.props.user.profile.email)}>{this.props.user.profile.email}</a> : 'Unknown user'
    const isWatchingComments = this.props.feedSource
      ? this.props.user.subscriptions.hasFeedSubscription(this.props.feedSource.projectId, this.props.feedSource.id, 'feed-commented-on')
      : false

    return (
      <Row>
        <Col xs={12} sm={this.props.stacked ? 12 : 8} md={this.props.stacked ? 12 : 6}>
          <h3>
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
                title={getMessage(messages, 'refresh')}
                onClick={() => { this.props.notesRequested() }}
              >
                <Glyphicon glyph='refresh' /><span className='hidden-xs'> {getMessage(messages, 'refresh')}</span>
              </Button>
            </ButtonToolbar>
            {getMessage(messages, 'all')}
          </h3>
          {this.props.notes && this.props.notes.length > 0
            ? this.props.notes.map(note => {
              return (
                <Media>
                  <Media.Left>
                    <img width={64} height={64} src={`${gravatar.url(note.userEmail, {protocol: 'https', s: '100'})}`} alt={note.userEmail} />
                  </Media.Left>
                  <Media.Body>
                    <Panel
                      className='comment-panel'
                      header={
                        <Media.Heading>
                          <a href={getProfileLink(this.props.user.profile.email)}>{this.props.user.profile.email}</a> <small title={moment(note.date).format('h:MMa, MMM. DD YYYY')}>commented {moment(note.date).fromNow()}</small>
                        </Media.Heading>
                      }
                    >
                      <p>{note.body || '(no content)'}</p>
                    </Panel>
                  </Media.Body>
                </Media>
              )
            })
            : <p><i>{getMessage(messages, 'none')}</i></p>

          }
        </Col>
        <Col xs={12} sm={this.props.stacked ? 12 : 4} md={this.props.stacked ? 12 : 6}>
          <h3>{getMessage(messages, 'postComment')}</h3>
          <Media>
            <Media.Left>
              <img width={64} height={64} src={this.props.user ? this.props.user.profile.picture : ''} />
            </Media.Left>
            <Media.Body>
              <Panel className='comment-panel' header={<Media.Heading>{userLink}</Media.Heading>}>
                <FormControl
                  ref='newNoteBody'
                  componentClass='textarea'
                  value={this.state.value}
                  onChange={(evt) => {
                    this.setState({value: evt.target.value})
                  }}
                />
                <Button
                  className='pull-right'
                  style={{marginTop: '10px'}}
                  disabled={this.state.value === ''}
                  onClick={() => {
                    this.props.newNotePosted({
                      body: this.state.value
                    })
                    this.setState({value: ''})
                  }}
                >{getMessage(messages, 'new')}</Button>
              </Panel>
            </Media.Body>
          </Media>
        </Col>
      </Row>
    )
  }
}
