// @flow

import React from 'react'

import FeedLabel from '../../common/components/FeedLabel'
import { stringifyLabels } from '../util'
import type { Feed, Project } from '../../types'

type Props = {
 feedSource: Feed,
 project: Project,
 updateFeedSource: Function
}

export default class LabelAssigner extends React.Component<Props> {
  onLabelClick = (labelId: String) => {
    const {feedSource} = this.props
    const updatedLabels = stringifyLabels(feedSource.labels)

    const labelIndex = updatedLabels.indexOf(labelId)

    // Either remove the label from the list, or add it
    if (labelIndex < 0) {
      updatedLabels.push(labelId)
    } else {
      updatedLabels.splice(labelIndex, 1)
    }

    this.props.updateFeedSource(feedSource, { labels: updatedLabels })
  }

  render () {
    const { project, feedSource } = this.props
    const projectLabels = project.labels
    const fsLabelIds = feedSource.labels.map((label) => label.id)

    return (
      <div className='feedLabelContainer large'>
        {projectLabels.map((label) => (
          <FeedLabel
            key={label.id}
            label={label}
            checked={fsLabelIds.find((id) => id === label.id) !== undefined}
            small
            onClick={this.onLabelClick}
          />
        ))}
      </div>
    )
  }
}
