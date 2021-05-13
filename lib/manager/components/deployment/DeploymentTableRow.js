// @flow

import React, {Component} from 'react'
import {Button, Badge, Glyphicon, ButtonToolbar} from 'react-bootstrap'
import {connect} from 'react-redux'
import { Link } from 'react-router'

import {
  deleteFeedVersion,
  togglePinFeedVersion,
  updateVersionForFeedSource
} from '../../actions/deployments'
import {formatTimestamp, fromNow} from '../../../common/util/date-time'
import {
  versionHasExpired,
  versionHasNotBegun,
  versionIsPinnedInDeployment
} from '../../util/version'

import type {
  Deployment,
  Feed,
  Project,
  SummarizedFeedVersion
} from '../../../types'
import type {AppState} from '../../../types/reducers'

function addClassIfFalsy (val, className) {
  return !val ? ` ${className}` : ''
}

function warnIfFalsy (val) {
  return addClassIfFalsy(val, 'warning')
}

function dangerIfTruthy (val) {
  return addClassIfFalsy(!val, 'danger')
}

type RowProps = {
  deployment: Deployment,
  feedSource: Feed,
  project: Project,
  version: SummarizedFeedVersion
}

type ConnectedRowProps = RowProps & {
  deleteFeedVersion: typeof deleteFeedVersion,
  feedVersionPinned: boolean,
  togglePinFeedVersion: typeof togglePinFeedVersion,
  updateVersionForFeedSource: typeof updateVersionForFeedSource,
  userCanDecrementVersion: boolean,
  userCanEditDeployment: boolean,
  userCanIncrementVersion: boolean,
  userCanRemoveVersion: boolean
}

class DeploymentTableRow extends Component<ConnectedRowProps> {
  _decrementVersion = () => {
    const {deployment, feedSource, updateVersionForFeedSource, version} = this.props
    const {previousVersionId: id} = version
    if (!id) {
      console.warn('No previous version ID exists for version', version)
      return
    }
    updateVersionForFeedSource(deployment, feedSource, {id})
  }

  _incrementVersion = () => {
    const {
      deployment,
      feedSource,
      updateVersionForFeedSource,
      version
    } = this.props
    const {nextVersionId: id} = version
    if (!id) {
      console.warn('No next version ID exists for version', version)
      return
    }
    updateVersionForFeedSource(deployment, feedSource, {id})
  }

  _incrementVersionToLatest = () => {
    const {deployment, feedSource, updateVersionForFeedSource} = this.props
    if (!feedSource.latestVersionId) {
      console.warn('No latest version ID exists for feedSource', feedSource)
      return
    }
    updateVersionForFeedSource(
      deployment,
      feedSource,
      {id: feedSource.latestVersionId}
    )
  }

  _togglePinFeedVersion = () => {
    const {togglePinFeedVersion, deployment, version} = this.props
    togglePinFeedVersion(deployment, version)
  }

  _removeVersion = () => {
    const {deleteFeedVersion, deployment, version} = this.props
    deleteFeedVersion(deployment, version)
  }

  render () {
    const {
      feedSource,
      feedVersionPinned,
      userCanDecrementVersion,
      userCanEditDeployment,
      userCanIncrementVersion,
      userCanRemoveVersion,
      version
    } = this.props
    const {validationResult: result} = version
    const hasVersionStyle = {cursor: 'pointer'}
    const noVersionStyle = {color: 'lightGray'}
    const expired = versionHasExpired(version)
    const future = versionHasNotBegun(version)
    return (
      <tr>
        <td>
          <Link to={`/feed/${feedSource.id}`}>{feedSource.name}</Link>
          {feedVersionPinned && (
            <div style={{ fontSize: 12, fontStyle: 'italic', margin: 5 }}>
              <Glyphicon
                glyph='star'
                style={hasVersionStyle}
                alt='star'
              />
              {' '}
              Version pinned for auto-deployment
            </div>
          )}
        </td>
        <td className='col-md-1 col-xs-2'>
          <Link to={`/feed/${feedSource.id}/version/${version.version}`}>
            <small>Version {version.version}</small>
          </Link>
          <ButtonToolbar>
            <Button
              bsSize='xsmall'
              bsStyle='default'
              style={{color: 'black'}}
              disabled={!userCanDecrementVersion}
              onClick={this._decrementVersion}>
              <Glyphicon
                glyph='menu-left'
                style={userCanDecrementVersion ? hasVersionStyle : noVersionStyle}
                title={version.previousVersionId ? 'Previous version' : 'No previous versions'}
                alt='Previous version' />
            </Button>
            <Button
              bsSize='xsmall'
              bsStyle='default'
              style={{color: 'black'}}
              disabled={!userCanIncrementVersion}
              onClick={this._incrementVersion}>
              <Glyphicon
                glyph='menu-right'
                style={userCanIncrementVersion ? hasVersionStyle : noVersionStyle}
                title={version.nextVersionId ? 'Next version' : 'No newer versions'}
                alt='Next Version' />
            </Button>
            <Button
              bsSize='xsmall'
              bsStyle='default'
              disabled={!userCanEditDeployment}
              style={{color: 'black'}}
              onClick={this._togglePinFeedVersion}>
              <Glyphicon
                glyph={feedVersionPinned ? 'star-empty' : 'star'}
                style={hasVersionStyle}
                title={feedVersionPinned
                  ? 'Unpin version in auto-deployments'
                  : 'Pin version in auto-deployments'
                }
                alt='Toggle pin version' />
            </Button>
            <Button
              bsSize='xsmall'
              bsStyle='default'
              style={{color: 'black'}}
              disabled={!userCanIncrementVersion}
              onClick={this._incrementVersionToLatest}>
              <Glyphicon
                glyph='fast-forward'
                style={userCanIncrementVersion ? hasVersionStyle : noVersionStyle}
                title={version.nextVersionId ? 'Latest version' : 'No newer versions'}
                alt='Latest Version' />
            </Button>
          </ButtonToolbar>
        </td>
        <td className='hidden-xs'>
          <Badge>{result.loadStatus}</Badge>
        </td>
        <td className={`hidden-xs${warnIfFalsy(!result.errorCount)}`}>
          {result.errorCount}
        </td>
        <td className={`hidden-xs${warnIfFalsy(result.routeCount)}`}>
          {result.routeCount}
        </td>
        <td className={`hidden-xs${warnIfFalsy(result.tripCount)}`}>
          {result.tripCount}
        </td>
        <td className={`hidden-xs${warnIfFalsy(result.stopTimesCount)}`}>
          {result.stopTimesCount}
        </td>
        <td className={dangerIfTruthy(future)}>
          {formatTimestamp(result.startDate, false)} ({fromNow(result.startDate)})
        </td>
        <td className={dangerIfTruthy(expired)}>
          {formatTimestamp(result.endDate, false)} ({fromNow(result.endDate)})
        </td>
        <td>
          <Button
            bsStyle='danger'
            bsSize='xsmall'
            disabled={!userCanRemoveVersion}
            className='pull-right'
            onClick={this._removeVersion}>
            <Glyphicon glyph='remove' />
          </Button>
        </td>
      </tr>
    )
  }
}

const mapStateToProps = (state: AppState, ownProps: RowProps) => {
  const {deployment, feedSource, project, version} = ownProps
  const feedVersionPinned = versionIsPinnedInDeployment(deployment, version)
  const user = state.user
  const userCanEditDeployment = user.permissions &&
    user.permissions.hasFeedPermission(
      project.organizationId,
      project.id,
      feedSource.id,
      'manage-feed'
    )
  const isVersionEditable = userCanEditDeployment && !feedVersionPinned
  const userCanDecrementVersion = isVersionEditable && version.previousVersionId
  const userCanIncrementVersion = isVersionEditable && version.nextVersionId

  // Cannot remove feed source if the deployment is feed-specific or it is
  // pinned
  const userCanRemoveVersion = isVersionEditable &&
    deployment.feedSourceId !== feedSource.id

  return {
    feedVersionPinned,
    userCanDecrementVersion,
    userCanEditDeployment,
    userCanIncrementVersion,
    userCanRemoveVersion
  }
}

const mapDispatchToProps = {
  deleteFeedVersion,
  togglePinFeedVersion,
  updateVersionForFeedSource
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeploymentTableRow)
