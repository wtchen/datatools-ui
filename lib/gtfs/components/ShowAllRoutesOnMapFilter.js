// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Checkbox} from 'react-bootstrap'

import * as shapesActions from '../actions/shapes'
import {getComponentMessages} from '../../common/util/config'

import type {FetchStatus} from '../../types'
import type {Props as ContainerProps} from '../containers/ShowAllRoutesOnMapFilter'

type Props = ContainerProps & {
  fetchStatus: FetchStatus,
  showAllRoutesOnMap: boolean,
  toggleShowAllRoutesOnMap: typeof shapesActions.toggleShowAllRoutesOnMap
}

export default class ShowAllRoutesOnMapFilter extends Component<Props> {
  messages = getComponentMessages('ShowAllRoutesOnMapFilter')

  onChange = () => {
    const {toggleShowAllRoutesOnMap, version} = this.props
    toggleShowAllRoutesOnMap(version.namespace)
  }

  render () {
    const {
      fetchStatus,
      showAllRoutesOnMap,
      version
    } = this.props
    // Disable if greater than one million records. We don't want to break
    // Data Tools because of this shapes GraphQL fetch. This is a somewhat
    // arbitrary limit. It may need to be adjusted...
    const tooManyShapeRecords = version.feedLoadResult.shapes.rowCount > 1000000
    return (
      <Checkbox
        checked={showAllRoutesOnMap}
        disabled={tooManyShapeRecords || fetchStatus.fetching}
        onChange={this.onChange}
      >
        {fetchStatus.fetching
          ? <span className='text-muted'>
            {this.messages('fetching')} <Icon className='fa-spin' type='refresh' />
          </span>
          : tooManyShapeRecords
            ? this.messages('tooManyShapeRecords')
            : this.messages('showAllRoutesOnMap')}
      </Checkbox>
    )
  }
}
