import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import update from 'react-addons-update'
import {Badge, Button, ButtonToolbar, Tooltip, OverlayTrigger, Nav, NavItem} from 'react-bootstrap'

import { getEntityBounds, getEntityName } from '../util/gtfs'
import { gtfsIcons } from '../util/ui'

export default class EntityDetailsHeader extends Component {
  static propTypes = {
    activeComponent: PropTypes.string,
    activeEntity: PropTypes.object,
    activePattern: PropTypes.object,
    editFareRules: PropTypes.bool,
    entityEdited: PropTypes.bool,
    feedSource: PropTypes.object,
    mapState: PropTypes.object,
    resetActiveEntity: PropTypes.func,
    saveActiveEntity: PropTypes.func,
    setActiveEntity: PropTypes.func,
    subEntityId: PropTypes.string,
    subComponent: PropTypes.string,
    tableData: PropTypes.object,
    toggleEditFareRules: PropTypes.func,
    updateMapSetting: PropTypes.func,
    validationErrors: PropTypes.array
  }

  _onClickSave = () => {
    if (this.props.subComponent === 'trippattern') {
      this.props.saveActiveEntity('trippattern')
    } else {
      this.props.saveActiveEntity(this.props.activeComponent)
    }
  }

  _onClickUndo = () => {
    if (this.props.subComponent === 'trippattern') {
      const pattern = this.props.activeEntity.tripPatterns.find(p => p.id === this.props.activePattern.id)
      this.props.resetActiveEntity(pattern, 'trippattern')
    } else {
      this.props.resetActiveEntity(this.props.activeEntity, this.props.activeComponent)
    }
    const stateUpdate = {}
    for (var key in this.state) {
      stateUpdate[key] = {$set: null}
    }
    this.setState(update(this.state, stateUpdate))
  }

  _onClickZoom = (e) => {
    const {activeEntity, subEntityId, updateMapSetting} = this.props
    if (subEntityId) {
      const pattern = activeEntity.tripPatterns.find(p => p.id === subEntityId)
      updateMapSetting({bounds: getEntityBounds(pattern), target: subEntityId})
    } else {
      updateMapSetting({bounds: getEntityBounds(activeEntity), target: activeEntity.id})
    }
  }

  _showFareAttributes = () => this.props.toggleEditFareRules(false)

  _showFareRules = () => this.props.toggleEditFareRules(true)

  _showRoute = () => {
    const {activeComponent, activeEntity, feedSource, setActiveEntity, subComponent} = this.props
    if (subComponent === 'trippattern') {
      setActiveEntity(feedSource.id, activeComponent, activeEntity)
    }
  }

  _showTripPatterns = () => {
    const {activeComponent, activeEntity, feedSource, setActiveEntity, subComponent} = this.props
    if (subComponent !== 'trippattern') {
      setActiveEntity(feedSource.id, activeComponent, activeEntity, 'trippattern')
    }
  }

  render () {
    const {
      activeComponent,
      activeEntity,
      editFareRules,
      entityEdited,
      mapState,
      subComponent,
      subEntityId,
      tableData,
      validationErrors
    } = this.props
    const validationTooltip = (
      <Tooltip id='tooltip'>
        {validationErrors.map(v => (
          <p>{v.field}: {v.reason}</p>
        ))}
      </Tooltip>
    )
    const entityName = activeComponent === 'feedinfo' ? 'Feed Info' : getEntityName(activeComponent, activeEntity)
    const icon = gtfsIcons.find(i => i.id === activeComponent)
    const zoomDisabled = activeEntity && !subComponent ? mapState.target === activeEntity.id : mapState.target === subEntityId
    const iconName = icon ? icon.icon : null
    const nameWidth = activeComponent === 'stop' || activeComponent === 'route'
      ? '130px'
      : '170px'
    const entityNameStyle = {
      width: nameWidth,
      paddingTop: '8px',
      display: 'inline-block',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    }
    return (
      <div style={{height: '100px'}}>
        <h5 style={{width: '100%', marginBottom: '0px'}}>
          {/* Zoom, undo, and save buttons */}
          <ButtonToolbar className='pull-right'>
            {activeComponent === 'stop' || activeComponent === 'route'
              ? <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Zoom to {activeComponent}</Tooltip>}>
                <Button
                  bsSize='small'
                  disabled={zoomDisabled}
                  onClick={this._onClickZoom}>
                  <Icon type='search' />
                </Button>
              </OverlayTrigger>
              : null
            }
            <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Undo changes</Tooltip>}>
              <Button
                bsSize='small'
                disabled={!entityEdited}
                onClick={this._onClickUndo}>
                <Icon type='undo' />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Save changes</Tooltip>}>
              <Button
                bsSize='small'
                bsStyle='primary'
                disabled={!entityEdited || validationErrors.length > 0}
                onClick={this._onClickSave}>
                <Icon type='floppy-o' />
              </Button>
            </OverlayTrigger>
          </ButtonToolbar>
          {/* Entity Icon */}
          <span style={{position: 'relative', top: '-4px'}}>
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
              // schedule exception icon if no icon found
              : <span className='fa-stack'>
                <Icon type='calendar' className='fa-stack-1x' />
                <Icon type='ban' className='text-danger fa-stack-2x' />
              </span>
            }
          </span>
          {'  '}
          {/* Entity name */}
          <span
            title={entityName}
            style={entityNameStyle}>
            {entityName}
          </span>
        </h5>
        {!tableData[activeComponent] && activeComponent === 'feedinfo'
          ? <small>Complete feed info to begin editing GTFS.</small>
          : null
        }
        {/* Validation issues */}
        <p style={{marginBottom: '2px'}}>
          <small className={`${validationErrors.length > 0 ? ' text-danger' : ' text-success'}`}>
            {validationErrors.length > 0
              ? <span>
                <Icon type='times-circle' />
                {' '}
                Fix
                {' '}
                <OverlayTrigger
                  placement='bottom'
                  overlay={validationTooltip}>
                  <span style={{borderBottom: '1px dotted #000'}}>{validationErrors.length} validation issue(s)</span>
                </OverlayTrigger>
                {' '}
                before saving
              </span>
              : <span><Icon type='check-circle' /> No validation issues</span>
            }
          </small>
        </p>
        <div className='clearfix' />
        {activeComponent === 'route'
          ? <Nav style={{marginBottom: '5px'}} bsStyle='pills' justified>
            <NavItem
              eventKey={'route'}
              active={subComponent !== 'trippattern'}
              onClick={this._showRoute}>
              Route details
            </NavItem>
            <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Trip patterns define a route&rsquo;s unique stop sequences and timings.</Tooltip>}>
              <NavItem
                eventKey={'trippattern'}
                disabled={!activeEntity || activeEntity.id === 'new'}
                active={subComponent === 'trippattern'}
                onClick={this._showTripPatterns}>
                Trip patterns <Badge>{activeEntity.tripPatterns ? activeEntity.tripPatterns.length : 0}</Badge>
              </NavItem>
            </OverlayTrigger>
          </Nav>
          : activeComponent === 'fare'
          ? <Nav style={{marginBottom: '5px'}} bsStyle='pills' justified>
            <NavItem
              eventKey={'fare'}
              active={!editFareRules}
              onClick={this._showFareAttributes}>
              Attributes
            </NavItem>
            <NavItem
              eventKey={'rules'}
              disabled={!activeEntity || activeEntity.id === 'new'}
              active={editFareRules}
              onClick={this._showFareRules}
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
