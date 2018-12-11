// @flow

import React, {Component} from 'react'
import {Checkbox} from 'react-bootstrap'

import * as shapesActions from '../actions/shapes'

type Props = {
  showAllRoutesOnMap: boolean,
  toggleShowAllRoutesOnMap: typeof shapesActions.toggleShowAllRoutesOnMap
}

export default class ShowAllRoutesOnMapFilter extends Component<Props> {
  render () {
    const {
      showAllRoutesOnMap,
      toggleShowAllRoutesOnMap
    } = this.props

    return (
      <Checkbox
        checked={showAllRoutesOnMap}
        onChange={toggleShowAllRoutesOnMap}
      >
        Show all routes
      </Checkbox>
    )
  }
}
