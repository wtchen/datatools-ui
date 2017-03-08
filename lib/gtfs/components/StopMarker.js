import Icon from '@conveyal/woonerf/components/icon'
import React, { Component, PropTypes } from 'react'
import { Marker, Popup } from 'react-leaflet'
import { Button } from 'react-bootstrap'
import { getFeed } from '../../common/util/modules'
import { divIcon } from 'leaflet'

import TransferPerformance from './TransferPerformance'

export default class StopMarker extends Component {
  static propTypes = {
    stop: PropTypes.object
  }
  render () {
    const { stop, feeds, renderTransferPerformance, onStopClick, newEntityId, popupAction, routes } = this.props
    if (!stop) {
      return null
    }
    const feedId = stop.feed_id || (stop.feed && stop.feed.feed_id)
    const feed = getFeed(feeds, feedId)
    const busIcon = divIcon({
      html: `<span title="${stop.stop_name}" class="fa-stack bus-stop-icon" style="opacity: 0.6">
              <i class="fa fa-circle fa-stack-2x" style="color: #ffffff"></i>
              <i class="fa fa-bus fa-stack-1x" style="color: #000000"></i>
            </span>`,
      className: '',
      iconSize: [24, 24]
    })
    return (
      <Marker
        ref={`marker-${stop.stop_id}`}
        icon={busIcon}
        position={[stop.stop_lat, stop.stop_lon]}>
        <Popup>
          <div>
            <p><Icon type='map-marker' /> <strong>{stop.stop_name} ({stop.stop_id})</strong></p>
            {renderTransferPerformance && <TransferPerformance stop={stop} routes={routes} />}
            {onStopClick && (
              <Button
                bsStyle='primary'
                block
                onClick={() => onStopClick(stop, feed, newEntityId)}>
                <Icon type='map-marker' /> {popupAction} stop
              </Button>
            )}
          </div>
        </Popup>
      </Marker>
    )
  }
}
