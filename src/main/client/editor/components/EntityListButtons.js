import React, {Component} from 'react'
import { ButtonToolbar, Tooltip, OverlayTrigger, Button } from 'react-bootstrap'
import {Icon} from '@conveyal/woonerf'

export default class EntityListButtons extends Component {
  render () {
    const {
      activeComponent,
      cloneEntity,
      feedSource,
      showConfirmModal,
      deleteEntity,
      setActiveEntity,
      entities,
      newGtfsEntity,
      toIndex,
      fromIndex,
      activeEntity,
      list,
      updateIndexes
    } = this.props
    return (
      <div>
        <ButtonToolbar
          className='pull-right'
        >
          {activeComponent === 'route'
            ? <OverlayTrigger placement='bottom' overlay={<Tooltip id={`merge-route`}>Merge routes</Tooltip>}>
              <Button
                bsSize='small'
                disabled={toIndex - fromIndex !== 1}
                onClick={() => {
                  // cloneEntity(feedSource.id, activeComponent, activeEntity.id)
                }}
              >
                <Icon type='compress' />
              </Button>
            </OverlayTrigger>
            : null
          }
          <OverlayTrigger placement='bottom' overlay={<Tooltip id={`duplicate-${activeComponent}`}>Duplicate {activeComponent}</Tooltip>}>
            <Button
              bsSize='small'
              disabled={!activeEntity}
              onClick={() => {
                cloneEntity(feedSource.id, activeComponent, activeEntity.id)
              }}
            >
              <Icon type='clone' />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement='bottom' overlay={<Tooltip id={`delete-${activeComponent}`}>Delete {activeComponent}</Tooltip>}>
            <Button
              bsSize='small'
              disabled={!activeEntity && typeof fromIndex === 'undefined'}
              bsStyle='danger'
              onClick={() => {
                let fromIndex, toIndex
                if (activeEntity) {
                  showConfirmModal({
                    title: `Delete ${activeComponent}?`,
                    body: `Are you sure you want to delete this ${activeComponent}?`,
                    onConfirm: () => {
                      deleteEntity(feedSource.id, activeComponent, activeEntity.id)
                      updateIndexes(fromIndex, toIndex)
                      setActiveEntity(feedSource.id, activeComponent)
                    }
                  })
                  // deleteEntity(feedSource.id, activeComponent, activeEntity.id)
                } else {
                  showConfirmModal({
                    title: `Delete ${+toIndex - +fromIndex} ${activeComponent}s?`,
                    body: `Are you sure you want to delete these ${toIndex - fromIndex} ${activeComponent}s?`,
                    onConfirm: () => {
                      for (var i = 0; i < list.length; i++) {
                        if (list[i].isSelected) {
                          deleteEntity(feedSource.id, activeComponent, list[i].id)
                        }
                      }
                      updateIndexes(fromIndex, toIndex)
                      setActiveEntity(feedSource.id, activeComponent)
                    }
                  })
                }
              }}
            >
              <Icon type='trash' />
            </Button>
          </OverlayTrigger>
        </ButtonToolbar>
        {// Create new entity
          activeComponent === 'stop'
          ? <span className='small'>Right-click map for new stop</span>
          : <Button
            bsSize='small'
            disabled={entities && entities.findIndex(e => e.id === 'new') !== -1}
            onClick={() => {
              newGtfsEntity(feedSource.id, activeComponent)
            }}
          ><Icon type='plus' /> New {activeComponent === 'scheduleexception' ? 'exception' : activeComponent}
          </Button>
        }
      </div>
    )
  }
}
