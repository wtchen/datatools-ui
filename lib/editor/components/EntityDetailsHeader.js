import React, {Component, PropTypes} from 'react'
import update from 'react-addons-update'
import {Icon} from '@conveyal/woonerf'
import { Button, ButtonToolbar, Tooltip, OverlayTrigger, Nav, NavItem } from 'react-bootstrap'

import { getEntityBounds, getEntityName } from '../util/gtfs'
import { gtfsIcons } from '../util/ui'

export default class EntityDetailsHeader extends Component {
  static propTypes = {
    activeComponent: PropTypes.string
  }
  render () {
    const {
      activeComponent,
      subComponent,
      mapState,
      subEntityId,
      updateMapSetting,
      entityEdited,
      resetActiveEntity,
      saveActiveEntity,
      activeEntity,
      activePattern,
      validationErrors,
      setActiveEntity,
      feedSource,
      tableData,
      editFareRules,
      toggleEditFareRules
    } = this.props
    const entityName = activeComponent === 'feedinfo' ? 'Feed Info' : getEntityName(activeComponent, activeEntity)
    const icon = gtfsIcons.find(i => i.id === activeComponent)
    const iconName = icon ? icon.icon : null
    return (
      <div style={{height: '100px'}}>
        <h5 style={{width: '100%', minHeight: '30px'}}>
          <ButtonToolbar className='pull-right'>
            {activeComponent === 'stop' || activeComponent === 'route'
              ? <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Zoom to {activeComponent}</Tooltip>}>
                <Button
                  bsSize='small'
                  disabled={activeEntity && !subComponent
                    ? mapState.target === activeEntity.id
                    : mapState.target === subEntityId
                  }
                  onClick={(e) => {
                    if (subEntityId) {
                      const pattern = activeEntity.tripPatterns.find(p => p.id === subEntityId)
                      updateMapSetting({bounds: getEntityBounds(pattern), target: subEntityId})
                    } else {
                      updateMapSetting({bounds: getEntityBounds(activeEntity), target: activeEntity.id})
                    }
                  }}>
                  <Icon type='search' />
                </Button>
              </OverlayTrigger>
              : null
            }
            <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Undo changes</Tooltip>}>
              <Button
                bsSize='small'
                disabled={!entityEdited}
                onClick={(e) => {
                  if (subComponent === 'trippattern') {
                    const pattern = activeEntity.tripPatterns.find(p => p.id === activePattern.id)
                    resetActiveEntity(pattern, 'trippattern')
                  } else {
                    resetActiveEntity(activeEntity, activeComponent)
                  }
                  const stateUpdate = {}
                  for (var key in this.state) {
                    stateUpdate[key] = {$set: null}
                  }
                  this.setState(update(this.state, stateUpdate))
                }}
              >
                <Icon type='undo' />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Save changes</Tooltip>}>
              <Button
                bsSize='small'
                bsStyle='primary'
                disabled={!entityEdited || validationErrors.length > 0}
                onClick={(e) => {
                  if (subComponent === 'trippattern') {
                    saveActiveEntity('trippattern')
                  } else {
                    saveActiveEntity(activeComponent)
                  }
                }}
              >
                <Icon type='floppy-o' />
              </Button>
            </OverlayTrigger>
          </ButtonToolbar>
          {activeComponent === 'route' && activeEntity
            ? <span className='fa-stack'>
              <Icon type='square' style={{color: `#${activeEntity.route_color ? activeEntity.route_color : 'fff'}`}} className='fa-stack-2x' />
              <Icon type='bus' style={{color: `#${activeEntity.route_text_color ? activeEntity.route_text_color : '000'}`}} className='fa-stack-1x' />
            </span>
            : iconName
            ? <span className='fa-stack'>
              <Icon type='square' className='fa-stack-2x' />
              <Icon type={iconName} className='fa-inverse fa-stack-1x' />
            </span>
            // schedule exception icon if no icon founds
            : <span className='fa-stack'>
              <Icon type='calendar' className='fa-stack-1x' />
              <Icon type='ban' className='text-danger fa-stack-2x' />
            </span>
          }
          {'  '}
          <span title={entityName}>
            {
              `${entityName && entityName.length > 18 ? entityName.substr(0, 18) + '...' : entityName}`
            }
          </span>
        </h5>
        {!tableData[activeComponent] && activeComponent === 'feedinfo'
          ? <small>Complete feed info to begin editing GTFS.</small>
          : null
        }
        {validationErrors.length > 0
          ? <small className='pull-right text-danger'>Fix validation issues before saving</small>
          : null
        }
        {activeComponent === 'route'
          ? <Nav style={{marginBottom: '5px'}} bsStyle='pills' justified>
            <NavItem
              eventKey={'route'}
              active={subComponent !== 'trippattern'}
              onClick={() => {
                setActiveEntity(feedSource.id, activeComponent, activeEntity)
                // browserHistory.push(`/feed/${feedSource.id}/edit/${activeComponent}/${activeEntity.id}`)
              }}>
              Route details
            </NavItem>
            <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>A route&rsquo;s trip patterns show where it goes.</Tooltip>}>
              <NavItem
                eventKey={'trippattern'}
                disabled={!activeEntity || activeEntity.id === 'new'}
                active={subComponent === 'trippattern'}
                onClick={() => {
                  if (subComponent !== 'trippattern') {
                    setActiveEntity(feedSource.id, activeComponent, activeEntity, 'trippattern')
                  }
                }}>
                Trip patterns
              </NavItem>
            </OverlayTrigger>
          </Nav>
          : activeComponent === 'fare'
          ? <Nav style={{marginBottom: '5px'}} bsStyle='pills' justified>
            <NavItem
              eventKey={'fare'}
              active={!editFareRules}
              onClick={() => {
                toggleEditFareRules(false)
              }}>
              Attributes
            </NavItem>
            <NavItem
              eventKey={'rules'}
              disabled={!activeEntity || activeEntity.id === 'new'}
              active={editFareRules}
              onClick={() => {
                toggleEditFareRules(true)
              }}
            >
              Rules
            </NavItem>
          </Nav>
          : null
        }
      </div>
    )
  }
}
