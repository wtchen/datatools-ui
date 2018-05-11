import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import moment from 'moment'
import { Link } from 'react-router'

const dateFormat = 'MMM. DD, YYYY'
const timeFormat = 'h:mma'

export default class RecentActivity extends Component {
  static propTypes = {
    currentUser: PropTypes.object,
    item: PropTypes.object
  }

  _primaryURL = (feedSourceId, feedVersionIndex) => feedVersionIndex
    ? this._versionURL(feedSourceId, feedVersionIndex)
    : this._feedSourceURL(feedSourceId)

  _feedSourceURL = (id) => `/feed/${id}`

  _versionURL = (feedSourceId, versionIndex) =>
    `/feed/${feedSourceId}/version/${versionIndex}`

  _getPrimaryBlock = (item) => {
    const commentStyle = {
      backgroundColor: '#f0f0f0',
      marginTop: 8,
      padding: 10,
      fontSize: 13,
      borderRadius: 4,
      color: '#444'
    }
    const {
      feedVersionIndex,
      feedVersionName,
      feedSourceId,
      type,
      feedSourceName,
      projectName,
      projectId,
      body
    } = item
    const primaryURL = this._primaryURL(feedSourceId, feedVersionIndex)
    const primaryName = feedVersionIndex
      ? feedVersionName
      : feedSourceName
    switch (type) {
      case 'feed-commented-on':
      case 'version-commented-on':
        return (
          <div>
            <Link to={`${primaryURL}/comments`}>
              <div style={commentStyle}><i>{body}</i></div>
            </Link>
          </div>
        )
      case 'version-created':
      case 'feed-created':
        return (
          <div>
            {`New ${feedVersionIndex ? 'version' : 'feed'} `}
            <Link to={primaryURL}>
              <b>{primaryName}</b>
            </Link>
            {feedVersionIndex
              ? <span>
                {' created for feed '}
                <Link to={this._feedSourceURL(feedSourceId)}>
                  <b>{feedSourceName}</b>
                </Link>
              </span>
              : <span>
                {' created in project '}
                <Link to={`/project/${projectId}`}>
                  <b>{projectName}</b>
                </Link>
              </span>
            }
          </div>
        )
      default:
        return null
    }
  }

  _getMetaBlock = (item, currentUser) => {
    // TODO: Refactor below switch to share more of the common JSX with certain
    // items (e.g., links, text) conditionally dependent on recent activity type.
    const {
      feedVersionIndex,
      feedVersionName,
      feedSourceId,
      type,
      feedSourceName,
      userName
    } = item
    switch (type) {
      case 'feed-commented-on':
      case 'version-commented-on':
        return (
          <div>
            {currentUser.profile.name === userName
              ? 'You'
              : <b>{userName}</b>
            }
            {' commented on feed '}
            <Link to={this._feedSourceURL(feedSourceId)}>
              <b>{feedSourceName}</b>
            </Link>
            {feedVersionIndex && feedSourceName && (
              <span>
                {', version '}
                <Link to={this._versionURL(feedSourceId, feedVersionIndex)}>
                  <b>{feedVersionName}</b>
                </Link>
              </span>
            )}
            {`:`}
          </div>
        )
      default:
        return null
    }
  }

  _getIconType = type => {
    switch (type) {
      case 'feed-commented-on':
      case 'version-commented-on':
        return 'comment'
      case 'feed-created':
        return 'bus'
      case 'version-created':
        return 'list'
      default:
        return null
    }
  }

  render () {
    // TODO: Move styles into css
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
    const { item, currentUser } = this.props
    const {date, type} = item
    const activityDate = moment(date)
    return (
      <div style={containerStyle}>
        <div style={iconStyle}>
          <Icon type={this._getIconType(type)} />
        </div>
        <div style={innerContainerStyle}>
          <div
            style={dateStyle}
            title={activityDate.format(dateFormat + ', ' + timeFormat)}>
            {activityDate.fromNow()}
          </div>
          {this._getMetaBlock(item, currentUser)}
          {this._getPrimaryBlock(item)}
        </div>
      </div>
    )
  }
}
