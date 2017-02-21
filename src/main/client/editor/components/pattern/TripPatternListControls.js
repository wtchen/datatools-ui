import React, { Component } from 'react'
import { Icon } from '@conveyal/woonerf'

import { OverlayTrigger, Tooltip, ButtonToolbar, Button } from 'react-bootstrap'

export default class TripPatternListControls extends Component {
  render () {
    const { activePattern, activePatternId, feedSource, activeEntity } = this.props
    return (
      <div
        style={{paddingRight: '5px', marginBottom: '5px'}}
      >
        <h3>
          <ButtonToolbar
            className='pull-right'
          >
            <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Reverse trip pattern</Tooltip>}>
              <Button
                bsSize='small'
                disabled={!activePatternId}
                bsStyle='warning'
                onClick={() => {
                  this.props.showConfirmModal({
                    title: `Reverse trip pattern?`,
                    body: `Are you sure you want to reverse this trip pattern?`,
                    onConfirm: () => {
                      const newCoords = [...activePattern.shape.coordinates].reverse()
                      const newStops = [...activePattern.patternStops].reverse()
                      this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: newStops, shape: {type: 'LineString', coordinates: newCoords}})
                      this.props.saveActiveEntity('trippattern')
                    }
                  })
                }}
              >
                <Icon type='exchange' />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Duplicate trip pattern</Tooltip>}>
              <Button
                bsSize='small'
                disabled={!activePatternId}
                onClick={() => {
                  this.props.cloneEntity(feedSource.id, 'trippattern', activePattern.id, true)
                }}
              >
                <Icon type='clone' />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Delete trip pattern</Tooltip>}>
              <Button
                bsSize='small'
                disabled={!activePatternId}
                bsStyle='danger'
                onClick={() => {
                  this.props.showConfirmModal({
                    title: `Delete trip pattern?`,
                    body: `Are you sure you want to delete this trip pattern? This will delete all trips associated with this pattern.`,
                    onConfirm: () => {
                      this.props.deleteEntity(feedSource.id, 'trippattern', activePattern.id, activePattern.routeId)
                      this.props.setActiveEntity(feedSource.id, 'route', activeEntity, 'trippattern')
                    },
                    confirmButtonStyle: 'danger',
                    confirmButtonText: 'Delete pattern'
                  })
                }}
              >
                <Icon type='trash' />
              </Button>
            </OverlayTrigger>
          </ButtonToolbar>
          <Button
            bsSize='small'
            disabled={activeEntity.tripPatterns && activeEntity.tripPatterns.findIndex(e => e.id === 'new') !== -1}
            onClick={() => {
              this.props.newGtfsEntity(feedSource.id, 'trippattern', {routeId: activeEntity.id, patternStops: [], name: 'New Pattern', feedId: this.props.feedSource.id, id: 'new'}, true)
            }}
          >
            <Icon type='plus' /> New pattern
          </Button>
        </h3>
      </div>
    )
  }
}
