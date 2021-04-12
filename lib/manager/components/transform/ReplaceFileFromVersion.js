// @flow

import React, {Component} from 'react'

import VersionSelectorDropdown from '../version/VersionSelectorDropdown'

import type {
  Feed,
  FeedTransformation as FeedTransformationType
} from '../../../types'

type Props = {
  feedSource: Feed,
  index: number,
  onSave: (any, number) => void,
  transformation: FeedTransformationType
}

export function getReplaceFileFromVersionValidationIssues (transformation: FeedTransformationType, feedSource: Feed) {
  // Get selected version (if applicable).
  const version = feedSource.feedVersions &&
    feedSource.feedVersions.find(v => v.id === transformation.sourceVersionId)
  const issues: Array<string> = []

  // Only trigger validation issue if versions have been loaded.
  if (!version && feedSource.feedVersions) {
    issues.push('Version must be defined')
  }

  return issues
}

/**
 * Component that renders fields for ReplaceFileFromVersionTransformation.
 */
export default class ReplaceFileFromVersion extends Component<Props> {
  _onSelectVersion = (versionIndex: number) => {
    const {feedSource, onSave} = this.props
    if (feedSource.feedVersions) {
      const version = feedSource.feedVersions[versionIndex - 1]
      onSave({sourceVersionId: version.id}, this.props.index)
    } else {
      console.warn('Feed source does not have list of feed versions')
    }
  }

  render () {
    const {feedSource, transformation} = this.props
    // Get selected version (if applicable).
    const version = feedSource.feedVersions &&
      feedSource.feedVersions.find(v => v.id === transformation.sourceVersionId)

    return (
      <VersionSelectorDropdown
        dropdownProps={{
          id: 'merge-versions-dropdown',
          onSelect: this._onSelectVersion
        }}
        title={version
          ? `From source version ${version.version}`
          : 'Select a source version'
        }
        version={version}
        versions={feedSource.feedVersions}
      />
    )
  }
}
