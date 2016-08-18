import React, {Component, PropTypes} from 'react'
import { Grid, Row, Col, Panel, Button, Jumbotron, Badge } from 'react-bootstrap'
import Icon from 'react-fa'
import { browserHistory } from 'react-router'
import moment from 'moment'

import ManagerPage from '../../common/components/ManagerPage'
import { getConfigProperty } from '../../common/util/config'

export default class UserHomePage extends Component {

  static propTypes = {
    user: PropTypes.object
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    const sortByDate = (a, b) => {
      if (a.date < b.date) return 1
      if (a.date > b.date) return -1
      return 0
    }

    return (
      <ManagerPage ref='page'>
        <Grid fluid>

          {/* Top Welcome Box */}
          <Jumbotron style={{ padding: 30 }}>
            <h2>Welcome to {getConfigProperty('application.title')}!</h2>
            <p>This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>
            <p><Button bsStyle='primary' bsSize='large'><Icon name='info-circle' /> Take a Tour</Button></p>
          </Jumbotron>

          <Row>
            {/* Recent Activity List */}
            <Col md={8} xs={12}>
              <h3 style={{ marginTop: 0, paddingBottom: 5, borderBottom: '2px solid #ddd' }}>
                <Icon name='comments-o' /> Recent Activity
              </h3>
              {this.props.user.recentActivity
                ? this.props.user.recentActivity.sort(sortByDate).map(item => renderRecentActivity(item))
                : <span>No Recent Activity for your subscriptions</span>

              }
            </Col>

            <Col md={4} xs={12}>
              {/* User Account Info Panel */}
              <Panel>
                <h4 style={{ marginTop: 0, marginBottom: 15, textAlign: 'center' }}>
                  Hello, {this.props.user.profile.nickname}.
                </h4>
                <Row>
                  <Col xs={4}>
                    <img style={{ width: '100%', borderRadius: '50%' }} src={this.props.user.profile.picture} />
                  </Col>
                  <Col md={8}>
                    <div style={{ color: '#666' }}><Icon name='user' /> {this.props.user.profile.email}</div>
                    <div><Badge style= {{ backgroundColor: '#bbb' }}>Application Admin</Badge></div>
                    <div style={{ marginTop: 15 }}>
                      <Button bsStyle='primary'
                        onClick={() => { browserHistory.push('/account') }}
                      >
                        <Icon name='cog' /> Manage Account
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Panel>

              {/* Starred Feeds Panel */}
              <Panel header={(<h3><Icon name='star' /> Your Starred Feeds</h3>)}>
                <Icon name='database' />
                <span style={{ fontSize: 16, marginLeft: 10, fontWeight: 500 }}>
                  <a href='#'>Some Feed</a>
                </span>
              </Panel>
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}

function renderRecentActivity (item) {
  const containerStyle = {
    marginTop: 10,
    paddingBottom: 12,
    borderBottom: '1px solid #ddd'
  }

  const iconStyle = {
    float: 'left',
    fontSize: 20,
    color: '#bbb'
  }

  const dateStyle = {
    color: '#999',
    fontSize: 11,
    marginBottom: 2
  }

  const innerContainerStyle = {
    marginLeft: 36
  }

  const commentStyle = {
    backgroundColor: '#f0f0f0',
    marginTop: 8,
    padding: 8,
    fontSize: 12
  }

  switch (item.type) {
    case 'feed-commented-on':
      return (
        <div style={containerStyle}>
          <div style={iconStyle}>
            <Icon name='comment' />
          </div>
          <div style={innerContainerStyle}>
            <div style={dateStyle}>{moment(item.date).fromNow()}</div>
            <div><a href="#"><b>{item.userName}</b></a> commented on feed <a href="#"><b>{item.targetName}</b></a>:</div>
            <div style={commentStyle}><i>{item.body}</i></div>
          </div>
        </div>
      )
  }
}
