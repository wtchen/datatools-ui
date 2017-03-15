import React, {PropTypes, Component} from 'react'
import { Nav, NavItem } from 'react-bootstrap'

import VirtualizedEntitySelect from './VirtualizedEntitySelect'

export default class EntityListSecondaryActions extends Component {
  static propTypes = {
    activeComponent: PropTypes.string
  }
  render () {
    const {
      activeComponent,
      feedSource,
      setActiveEntity,
      activeEntity,
      entities
    } = this.props
    switch (activeComponent) {
      case 'calendar':
      case 'scheduleexception':
        return (
          <Nav style={{marginBottom: '5px'}} bsStyle='pills' justified activeKey={activeComponent} onSelect={this.handleSelect}>
            <NavItem
              eventKey={'calendar'}
              onClick={() => {
                if (activeComponent !== 'calendar') {
                  // browserHistory.push(`/feed/${feedSource.id}/edit/calendar`)
                  setActiveEntity(feedSource.id, 'calendar')
                }
              }}
            >
              Calendars
            </NavItem>
            <NavItem
              eventKey={'scheduleexception'}
              onClick={() => {
                if (activeComponent !== 'scheduleexception') {
                  // browserHistory.push(`/feed/${feedSource.id}/edit/scheduleexception`)
                  setActiveEntity(feedSource.id, 'scheduleexception')
                }
              }}
            >
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
            onChange={(value) => {
              if (!value) {
                setActiveEntity(feedSource.id, activeComponent)
              } else {
                setActiveEntity(feedSource.id, activeComponent, value.entity)
              }
            }}
          />
        )
      default:
        return null
    }
  }
}
