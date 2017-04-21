import React, {PropTypes, Component} from 'react'
import { Nav, NavItem } from 'react-bootstrap'

import VirtualizedEntitySelect from './VirtualizedEntitySelect'

export default class EntityListSecondaryActions extends Component {
  static propTypes = {
    activeComponent: PropTypes.string,
    activeEntity: PropTypes.object,
    entities: PropTypes.array,
    feedSource: PropTypes.object,
    setActiveEntity: PropTypes.func
  }

  _onChangeEntity = (value) => {
    const {activeComponent, feedSource, setActiveEntity} = this.props
    if (!value) {
      setActiveEntity(feedSource.id, activeComponent)
    } else {
      setActiveEntity(feedSource.id, activeComponent, value.entity)
    }
  }

  _onSelectCalendar = () => {
    if (this.props.activeComponent !== 'calendar') {
      this.props.setActiveEntity(this.props.feedSource.id, 'calendar')
    }
  }

  _onSelectException = () => {
    if (this.props.activeComponent !== 'scheduleexception') {
      this.props.setActiveEntity(this.props.feedSource.id, 'scheduleexception')
    }
  }

  render () {
    const {
      activeComponent,
      activeEntity,
      entities
    } = this.props
    switch (activeComponent) {
      case 'calendar':
      case 'scheduleexception':
        return (
          <Nav
            style={{marginBottom: '5px'}}
            bsStyle='pills'
            justified
            activeKey={activeComponent}
            onSelect={this.handleSelect}>
            <NavItem
              eventKey={'calendar'}
              onClick={this._onSelectCalendar}>
              Calendars
            </NavItem>
            <NavItem
              eventKey={'scheduleexception'}
              onClick={this._onSelectException}>
              Exceptions
            </NavItem>
          </Nav>
        )
      case 'route':
      case 'stop':
        return (
          <VirtualizedEntitySelect
            value={activeEntity && activeEntity.id}
            optionRenderer={this._optionRenderer}
            component={activeComponent}
            entities={entities}
            onChange={this._onChangeEntity} />
        )
      default:
        return null
    }
  }
}
