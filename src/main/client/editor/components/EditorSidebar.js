import React, {Component, PropTypes} from 'react'
import { Nav, NavItem, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import {Icon} from 'react-fa'
import { shallowEqual } from 'react-pure-render'

import { gtfsIcons } from '../util/gtfs'

export default class EditorSidebar extends Component {

  static propTypes = {
    activeComponent: PropTypes.string,
    feedSource: PropTypes.object,
    setActiveEntity: PropTypes.func
  }

  constructor (props) {
    super(props)
  }
  shouldComponentUpdate (nextProps) {
    return nextProps.activeComponent !== this.props.activeComponent || !shallowEqual(nextProps.feedSource, this.props.feedSource)
  }
  render () {
    const sidebarItems = [
      {
        id: 'back',
        icon: 'reply',
        title: 'Back to feed source'
      },
      ...gtfsIcons
    ]
    const { activeComponent, feedSource, setActiveEntity } = this.props
    return (
      <Nav stacked bsStyle='pills' activeKey={activeComponent}>
        {sidebarItems.map(item => (
          <OverlayTrigger placement='right' overlay={<Tooltip id={`${item.id}-tooltip`}>{item.title}</Tooltip>}>
            <NavItem
              active={activeComponent === item.id || activeComponent === 'scheduleexception' && item.id === 'calendar'}
              href={item.id}
              key={item.id}
              className='text-center'
              title={item.title}
              onClick={(e) => {
                e.preventDefault()
                if (item.id === 'back') {
                  browserHistory.push(`/feed/${feedSource.id}`)
                }
                else if (activeComponent === item.id) {
                  browserHistory.push(`/feed/${feedSource.id}/edit/`)
                }
                else {
                  setActiveEntity(feedSource.id, item.id)
                  // browserHistory.push(`/feed/${feedSource.id}/edit/${item.id}`)
                }
              }}
            >
              <Icon name={item.icon} fixedWidth={true} size='lg' />
            </NavItem>
          </OverlayTrigger>
        ))}
      </Nav>
    )
  }

}
