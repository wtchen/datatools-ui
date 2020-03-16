// @flow

import Icon from '@conveyal/woonerf/components/icon'
import * as React from 'react'
import { Badge } from 'react-bootstrap'

import toSentenceCase from '../../../common/util/to-sentence-case'

import type { FeedVersion, RetrievalMethod } from '../../../types'

type Props = {version: FeedVersion}

const iconForRetrievalMethod = (retrievalMethod: RetrievalMethod | 'UNKNOWN') => {
  switch (retrievalMethod) {
    case 'SERVICE_PERIOD_MERGE':
      return 'code-fork'
    case 'REGIONAL_MERGE':
      return 'globe'
    case 'PRODUCED_IN_HOUSE':
      return 'pencil'
    case 'MANUALLY_UPLOADED':
      return 'upload'
    case 'FETCHED_AUTOMATICALLY':
      return 'cloud-download'
    default:
      return 'file-archive-o'
  }
}

export default class VersionRetrievalBadge extends React.Component<Props> {
  render () {
    const { version } = this.props
    const retrievalMethod = version.retrievalMethod || 'UNKNOWN'
    return (
      <Icon
        title={toSentenceCase(retrievalMethod.replace(/_/g, ' '))}
        type={iconForRetrievalMethod(retrievalMethod)}
      />
    )
  }
}
