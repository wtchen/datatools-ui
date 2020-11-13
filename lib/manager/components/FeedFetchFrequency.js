// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'
import {
  DropdownButton,
  MenuItem
} from 'react-bootstrap'

import {FREQUENCY_INTERVALS} from '../../common/constants'
import {getComponentMessages} from '../../common/util/config'

import type {FetchFrequency} from '../../types'

type Props = {
  fetchFrequency?: FetchFrequency,
  fetchInterval?: number,
  onSelectFetchFrequency: FetchFrequency => void,
  onSelectFetchInterval: number => void
}

const FeedFetchFrequency = (props: Props) => {
  const {onSelectFetchFrequency, onSelectFetchInterval} = props
  let {fetchFrequency, fetchInterval} = props
  // If frequency and interval are not defined, use default of one fetch per day.
  if (!fetchFrequency) fetchFrequency = 'DAYS'
  const intervals = FREQUENCY_INTERVALS[fetchFrequency]
  if (!fetchInterval) fetchInterval = intervals[0]
  const messages = getComponentMessages('FeedFetchFrequency')
  return (
    <div>
      <span>{messages('fetchFeedEvery')}</span>
      {' '}
      <DropdownButton
        title={fetchInterval}
        id='add-transformation-dropdown'
        onSelect={onSelectFetchInterval}>
        {intervals.map(value =>
          <MenuItem key={value} eventKey={value}>
            {value} {fetchInterval === value && <Icon type='check' />}
          </MenuItem>)
        }
      </DropdownButton>
      {' '}
      <DropdownButton
        title={fetchFrequency}
        id='add-transformation-dropdown'
        onSelect={onSelectFetchFrequency}>
        {Object.keys(FREQUENCY_INTERVALS).map((value) =>
          <MenuItem key={value} eventKey={value}>
            {value} {fetchFrequency === value && <Icon type='check' />}
          </MenuItem>)
        }
      </DropdownButton>
    </div>
  )
}

export default FeedFetchFrequency
