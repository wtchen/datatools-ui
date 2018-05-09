import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import moment from 'moment'
import { Link } from 'react-router'

export default class RecentActivity extends Component {
  static propTypes = {
    currentUser: PropTypes.object,
    item: PropTypes.object
  }

  render () {
    const { item, currentUser } = this.props
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
      marginLeft: 50,
      padding: 10,
      fontSize: 13,
      borderRadius: 4,
      color: '#444'
    }

    // Helper function to create comment item
    const createCommentItem = (item) => {
      const commentLink = item.feedVersionIndex
        ? `/feed/${item.feedSourceId}/version/${item.feedVersionIndex}/comments`
        : `/feed/${item.feedSourceId}/comments`
      return (
        <div style={containerStyle}>
          <div style={iconStyle}>
            <Icon type='comment' />
          </div>
          <div style={innerContainerStyle}>
            <div style={dateStyle}>{moment(item.date).fromNow()}</div>
            <div>
              {currentUser.profile.name === item.userName
                ? 'You'
                : <b>{item.userName}</b>
              }
              {' commented on feed '}
              <Link to={`/feed/${item.feedSourceId}`}><b>{item.feedSourceName}</b></Link>
              {item.feedVersionIndex && item.feedSourceName && (
                <span>
                  {', version '}
                  <Link to={`/feed/${item.feedSourceId}/versions/${item.feedVersionIndex}`}><b>{item.feedVersionName}</b></Link>
                </span>
              )}
              {`:`}
            </div>

            <div>
              <Link to={commentLink}>
                <div style={commentStyle}><i>{item.body}</i></div>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    switch (item.type) {
      case 'feed-commented-on':
      case 'version-commented-on':
        return createCommentItem(item)
      case 'feed-created': return (
        <div style={containerStyle}>
          <div style={iconStyle}>
            <Icon type='bus' />
          </div>
          <div style={innerContainerStyle}>
            <div style={dateStyle}>{moment(item.date).fromNow()}</div>
            <div>
              {'New feed '}
              <Link to={`/feed/${item.feedSourceId}`}><b>{item.feedSourceName}</b></Link>
              {' created in project '}
              <Link to={`/project/${item.projectId}`}><b>{item.projectName}</b></Link>
            </div>
          </div>
        </div>
      )
      case 'version-created': return (
        <div style={containerStyle}>
          <div style={iconStyle}>
            <Icon type='list' />
          </div>
          <div style={innerContainerStyle}>
            <div style={dateStyle}>{moment(item.date).fromNow()}</div>
            <div>
              {'New version '}
              <Link to={`/feed/${item.feedSourceId}/versions/${item.feedVersionIndex}`}>
                <b>{item.feedVersionName}</b>
              </Link>
              {' created for feed '}
              <Link to={`/feed/${item.feedSourceId}`}><b>{item.feedSourceName}</b></Link>
            </div>
          </div>
        </div>
      )
    }

    return null
  }
}
