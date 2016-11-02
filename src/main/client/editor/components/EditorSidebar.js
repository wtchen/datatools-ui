import React, {Component, PropTypes} from 'react'
import { Nav, NavItem, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import {Icon} from '@conveyal/woonerf'
import { shallowEqual } from 'react-pure-render'

import { gtfsIcons } from '../util/gtfs'

import ActiveSidebarNavItem from '../../common/containers/ActiveSidebarNavItem'
import ActiveSidebar from '../../common/containers/ActiveSidebar'

export default class EditorSidebar extends Component {

  static propTypes = {
    activeComponent: PropTypes.string,
    feedSource: PropTypes.object,
    feedInfo: PropTypes.object,
    setActiveEntity: PropTypes.func
  }
  isActive (item, component) {
    return component === item.id || component === 'scheduleexception' && item.id === 'calendar'
  }
  render () {
    const { activeComponent, feedSource, setActiveEntity } = this.props

    return (
      <ActiveSidebar>
        <ActiveSidebarNavItem
          ref='backNav'
          icon='home'
          label='Back to Feed'
          link={feedSource ? `/feed/${feedSource.id}` : `/home`}
        />
        {gtfsIcons.map(item => {
          return item.hideSidebar
            ? null
            : <ActiveSidebarNavItem key={item.id}
                icon={item.icon} label={item.label}
                active={this.isActive(item, activeComponent)}
                link={!feedSource
                  ? '/home'
                  : activeComponent === item.id
                  ? `/feed/${feedSource.id}/edit/`
                  : `/feed/${feedSource.id}/edit/${item.id}`}
              />
        })}
      </ActiveSidebar>
    )
  }
}

/*
export default class EditorSidebar extends Component {

  static propTypes = {
    activeComponent: PropTypes.string,
    feedSource: PropTypes.object,
    feedInfo: PropTypes.object,
    setActiveEntity: PropTypes.func
  }

  constructor (props) {
    super(props)
  }
  shouldComponentUpdate (nextProps) {
    return !shallowEqual(nextProps, this.props)
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
        {sidebarItems.map(item => {
          if (item.hideSidebar) {
            return null
          }
          return (
            <OverlayTrigger key={item.id} placement='right' overlay={<Tooltip id={`${item.id}-tooltip`}>{item.title}</Tooltip>}>
              <NavItem
                active={activeComponent === item.id || activeComponent === 'scheduleexception' && item.id === 'calendar'}
                href={item.id}
                key={`nav-${item.id}`}
                disabled={['feedinfo', 'back'].indexOf(item.id) === -1 && !this.props.feedInfo}
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
          )
        }
      )}
      </Nav>
    )
  }

}*/
