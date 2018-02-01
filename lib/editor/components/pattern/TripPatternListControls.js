import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import { OverlayTrigger, Tooltip, ButtonGroup, Button } from 'react-bootstrap'

import {ENTITY} from '../../constants'
import {generateUID} from '../../../common/util/util'
import {entityIsNew} from '../../util/objects'

export default class TripPatternListControls extends Component {
  _onClickClone = () => {
    const {activePattern, cloneEntity, feedSource} = this.props
    cloneEntity(feedSource.id, 'trippattern', activePattern.id, true)
  }

  _onClickDelete = () => {
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

  _onClickReverse = () => {
    const {
      activePattern,
      saveActiveEntity,
      showConfirmModal,
      updateActiveEntity
    } = this.props
    showConfirmModal({
      title: `Reverse trip pattern?`,
      body: `Are you sure you want to reverse this trip pattern?`,
      onConfirm: () => {
        const coordinates = [...activePattern.shape.coordinates].reverse()
        const patternStops = [...activePattern.patternStops].reverse()
        const props = {patternStops, shape: {type: 'LineString', coordinates}}
        updateActiveEntity(activePattern, 'trippattern', props)
        saveActiveEntity('trippattern')
      }
    })
  }

  render () {
    const {activePatternId, activeEntity} = this.props
    const {tripPatterns} = activeEntity
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
                disabled={!activePatternId}
                onClick={this._onClickReverse}>
                <Icon type='exchange' />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement='bottom'
              overlay={<Tooltip id='tooltip'>Duplicate trip pattern</Tooltip>}>
              <Button
                bsSize='small'
                disabled={!activePatternId}
                onClick={this._onClickClone}>
                <Icon type='clone' />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement='bottom'
              overlay={<Tooltip id='tooltip'>Delete trip pattern</Tooltip>}>
              <Button
                bsSize='small'
                disabled={!activePatternId}
                onClick={this._onClickDelete}>
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
