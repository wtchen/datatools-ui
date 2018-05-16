import Icon from '@conveyal/woonerf/components/icon'
import clone from 'lodash.clonedeep'
import React, {Component} from 'react'
import {OverlayTrigger, Tooltip, ButtonGroup, Button} from 'react-bootstrap'

import {ENTITY} from '../../constants'
import {generateUID} from '../../../common/util/util'
import {entityIsNew} from '../../util/objects'

export default class TripPatternListControls extends Component {
  _onClickClonePattern = () => {
    const {activePattern, cloneEntity, feedSource} = this.props
    cloneEntity(feedSource.id, 'trippattern', activePattern.id, true)
  }

  _onClickDeletePattern = () => {
    const {
      activeEntity,
      activePattern,
      deleteEntity,
      feedSource,
      setActiveEntity,
      showConfirmModal
    } = this.props
    const {id: patternId} = activePattern
    const {id: routeId} = activeEntity
    showConfirmModal({
      title: `Delete trip pattern?`,
      body: `Are you sure you want to delete this trip pattern? This will delete all trips associated with this pattern.`,
      onConfirm: () => {
        // Delete trip pattern. After deletion/refetch, set active entity
        deleteEntity(feedSource.id, 'trippattern', patternId, routeId)
          .then(() => setActiveEntity(feedSource.id, 'route', activeEntity, 'trippattern'))
      },
      confirmButtonStyle: 'danger',
      confirmButtonText: 'Delete pattern'
    })
  }

  _onClickNew = () => {
    const {activeEntity, feedSource, newGtfsEntity} = this.props
    const newPattern = {
      // FIXME: There is no table object in gtfs.yml for trippattern. Should there be?
      // ...generateNullProps('trippattern'),
      routeId: activeEntity.route_id,
      directionId: null,
      patternStops: [],
      name: 'New Pattern',
      // FIXME should we be using some other method to generate ID?
      patternId: generateUID(),
      shapeId: generateUID(),
      useFrequency: 0,
      shapePoints: [],
      id: ENTITY.NEW_ID
    }
    newGtfsEntity(feedSource.id, 'trippattern', newPattern, true)
  }

  /**
   * Reverse trip pattern by reversing both the order of the pattern stops and
   * the order of the shape points. NOTE: this does not change the travel times
   * for the pattern stops.
   */
  _onClickReversePattern = () => {
    const {
      activePattern,
      controlPoints,
      patternSegments,
      saveActiveEntity,
      showConfirmModal,
      updateActiveEntity,
      updatePatternGeometry
    } = this.props
    showConfirmModal({
      title: `Reverse trip pattern?`,
      body: `Are you sure you want to reverse this trip pattern?`,
      onConfirm: () => {
        // Order of pattern stops is irrelevant. Stop sequence must be updated.
        const patternStops = [...activePattern.patternStops]
          // Reverse sort on existing stopSequence values
          .sort((a, b) => b.stopSequence - a.stopSequence)
          // Update sequence for new order.
          .map((ps, i) => ({
            ...ps,
            stopSequence: i
          }))
        updatePatternGeometry({
          // Reverse control points
          controlPoints: clone(controlPoints).reverse(),
          // Reverse order of segments and each segment's coordinate list.
          patternSegments: clone(patternSegments)
            .map(seg => seg.reverse())
            .reverse()
        })
        updateActiveEntity(activePattern, 'trippattern', {patternStops})
        saveActiveEntity('trippattern')
      }
    })
  }

  render () {
    const {activeEntity, activePatternId, activePatternTripCount} = this.props
    const {tripPatterns} = activeEntity
    const patternHasTrips = activePatternTripCount > 0
    const createPatternDisabled = tripPatterns && tripPatterns.findIndex(entityIsNew) !== -1
    return (
      <div
        style={{paddingRight: '5px', marginBottom: '5px'}}>
        <h3>
          <ButtonGroup
            className='pull-right'>
            <OverlayTrigger
              placement='bottom'
              overlay={<Tooltip id='tooltip'>Reverse trip pattern</Tooltip>}>
              <Button
                bsSize='small'
                title={patternHasTrips
                  ? 'Cannot reverse patterns that have trips'
                  : 'Select pattern to reverse'}
                // Do not allow reversing trip pattern if it has trips
                disabled={!activePatternId || patternHasTrips}
                onClick={this._onClickReversePattern}>
                <Icon type='exchange' />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement='bottom'
              overlay={<Tooltip id='tooltip'>Duplicate trip pattern</Tooltip>}>
              <Button
                bsSize='small'
                disabled={!activePatternId}
                onClick={this._onClickClonePattern}>
                <Icon type='clone' />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement='bottom'
              overlay={<Tooltip id='tooltip'>Delete trip pattern</Tooltip>}>
              <Button
                bsSize='small'
                disabled={!activePatternId}
                onClick={this._onClickDeletePattern}>
                <Icon type='trash' />
              </Button>
            </OverlayTrigger>
          </ButtonGroup>
          <Button
            bsSize='small'
            disabled={createPatternDisabled}
            onClick={this._onClickNew}>
            <Icon type='plus' /> New pattern
          </Button>
        </h3>
      </div>
    )
  }
}
