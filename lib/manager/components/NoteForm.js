// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Button, Checkbox, Col, FormControl, Media, Panel } from 'react-bootstrap'

import {getComponentMessages} from '../../common/util/config'
import { getProfileLink } from '../../common/util/util'
import type {Feed} from '../../types'
import type {ManagerUserState} from '../../types/reducers'

type Props = {
  feedSource: Feed,
  newNotePosted: ({body: string}) => void,
  stacked?: boolean,
  user: ManagerUserState
}

type State = {
  adminOnly: boolean,
  body: string
}

const DEFAULT_STATE = {
  adminOnly: false,
  body: ''
}

export default class NoteForm extends Component<Props, State> {
  messages = getComponentMessages('NoteForm')
  state = DEFAULT_STATE

  _onChange = ({target}: {target: HTMLInputElement}) =>
    this.setState({[target.name]: target.type === 'checkbox' ? target.checked : target.value})

  _onClickPublish = () => {
    this.props.newNotePosted(this.state)
    this.setState(DEFAULT_STATE)
  }

  render () {
    const {
      feedSource,
      stacked,
      user
    } = this.props
    const {Body, Heading, Left} = Media
    const {adminOnly, body} = this.state
    const {profile} = user
    if (!profile) {
      console.warn('Could not locate user profile', user)
      return null
    }
    const isProjectAdmin = user.permissions && user.permissions.isProjectAdmin(
      feedSource.projectId, feedSource.organizationId
    )
    const userLink = user
      ? <a href={getProfileLink(profile.email)}>{profile.email}</a>
      : 'Unknown user'
    return (
      <Col xs={12} sm={stacked ? 12 : 4} md={stacked ? 12 : 6}>
        <h3>{this.messages('postComment')}</h3>
        <Media>
          <Left>
            <img
              alt={profile.email}
              width={64}
              height={64}
              src={user ? profile.picture : ''} />
          </Left>
          <Body>
            <Panel
              className='comment-panel'
              header={<Heading>{userLink}</Heading>}>
              <FormControl
                ref='newNoteBody'
                componentClass='textarea'
                name='body'
                value={body}
                onChange={this._onChange} />
              <Button
                className='pull-right'
                style={{marginTop: '10px'}}
                disabled={body === ''}
                onClick={this._onClickPublish}>
                {this.messages('new')}
              </Button>
              {isProjectAdmin &&
                <Checkbox
                  name='adminOnly'
                  onChange={this._onChange}
                  value={adminOnly}
                >
                  <Icon type='lock' /> {this.messages('adminOnly')}
                </Checkbox>
              }
            </Panel>
          </Body>
        </Media>
      </Col>
    )
  }
}
