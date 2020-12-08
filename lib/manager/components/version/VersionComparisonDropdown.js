// @flow

import React, {Component} from 'react'
import {MenuItem} from 'react-bootstrap'
import {connect} from 'react-redux'

import * as versionsActions from '../../actions/versions'
import VersionSelectorDropdown, {DefaultItemFormatter} from './VersionSelectorDropdown'

import type {Feed, FeedVersion} from '../../../types'
import type {AppState} from '../../../types/reducers'

type Props = {
  comparedVersionIndex?: number,
  feedSource: Feed,
  setComparedVersionIndex: typeof versionsActions.setComparedVersionIndex,
  version: FeedVersion,
  versions: Array<FeedVersion>
}

/**
 * Renders a dropdown selector for choosing a version with which to compare the
 * active version.
 */
class VersionComparisonDropdown extends Component<Props> {
  _onSelectComparedVersion = (index: number) => {
    const {comparedVersionIndex, feedSource, setComparedVersionIndex} = this.props
    if (index !== comparedVersionIndex) {
      setComparedVersionIndex(feedSource, index)
    } else {
      setComparedVersionIndex(feedSource, null)
    }
  }

  render () {
    const {
      comparedVersionIndex,
      versions,
      version
    } = this.props
    let title = 'Compare versions'
    let comparedFeedVersion
    if (comparedVersionIndex !== null && comparedVersionIndex !== undefined) {
      comparedFeedVersion = versions[comparedVersionIndex - 1]
      title = `Comparing to version ${comparedVersionIndex}`
    }

    // This custom formatter adds and hides the active version in the list to
    // preserve version indexes.
    const itemFormatter = (itemVersion: FeedVersion, activeVersion: ?FeedVersion) => (
      itemVersion === version
        ? <MenuItem key={itemVersion.id} style={{display: 'none'}} />
        : DefaultItemFormatter(itemVersion, activeVersion)
    )

    return (
      <VersionSelectorDropdown
        dropdownProps={{
          id: 'prevVersionSelector',
          onSelect: this._onSelectComparedVersion
        }}
        header={versions.length < 2
          ? 'Load another version to enable comparison'
          : 'Select a version to compare with'
        }
        itemFormatter={itemFormatter}
        title={title}
        version={comparedFeedVersion}
        versions={versions}
      />
    )
  }
}

const mapStateToProps = (state: AppState, ownProps: {}) => {
  return {}
}

const {
  setComparedVersionIndex
} = versionsActions

const mapDispatchToProps = {
  setComparedVersionIndex
}

export default connect(mapStateToProps, mapDispatchToProps)(VersionComparisonDropdown)
