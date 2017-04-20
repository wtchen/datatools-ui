import React, {PropTypes, Component} from 'react'
import {Button, ButtonGroup, ListGroupItem} from 'react-bootstrap'

import ActiveGtfsMap from '../../../gtfs/containers/ActiveGtfsMap'

const MAP_HEIGHTS = [200, 400]

export default class FeedVersionMap extends Component {
  static propTypes = {
    version: PropTypes.object
  }

  state = {
    mapHeight: MAP_HEIGHTS[0]
  }

  render () {
    const {version} = this.props
    const itemStyle = {
      maxHeight: `${this.state.mapHeight}px`,
      overflowY: 'hidden',
      padding: '0px'
    }
    const buttonGroupStyle = {
      position: 'absolute',
      zIndex: 20000,
      right: 5,
      top: 5
    }
    return (
      <ListGroupItem style={itemStyle}>
        {/* Map size buttons */}
        <ButtonGroup bsSize='small' style={buttonGroupStyle}>
          <Button
            active={this.state.mapHeight === MAP_HEIGHTS[0]}
            onClick={() => this.setState({mapHeight: MAP_HEIGHTS[0]})}>
            Slim
          </Button>
          <Button
            active={this.state.mapHeight === MAP_HEIGHTS[1]}
            onClick={() => this.setState({mapHeight: MAP_HEIGHTS[1]})}>
            Large
          </Button>
        </ButtonGroup>
        {/* Primary map component */}
        <ActiveGtfsMap
          ref='map'
          version={version}
          disableRefresh
          disableScroll
          disablePopup
          renderTransferPerformance
          showBounds={this.props.tab === 'feed' || this.props.tab === 'accessibility'}
          showIsochrones={this.props.tab === 'accessibility'}
          isochroneBand={this.props.isochroneBand}
          height={this.state.mapHeight}
          width='100%' />
      </ListGroupItem>
    )
  }
}
