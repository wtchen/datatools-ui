import React, {Component, PropTypes} from 'react'

import { GTFS_ICONS } from '../util/ui'
import ActiveSidebarNavItem from '../../common/containers/ActiveSidebarNavItem'
import ActiveSidebar from '../../common/containers/ActiveSidebar'

export default class EditorSidebar extends Component {
  static propTypes = {
    activeComponent: PropTypes.string,
    feedSource: PropTypes.object,
    setActiveEntity: PropTypes.func
  }

  isActive (item, component) {
    return component === item.id || (component === 'scheduleexception' && item.id === 'calendar')
  }

  render () {
    const {activeComponent, editingIsDisabled, feedSource} = this.props

    return (
      <ActiveSidebar>
        <ActiveSidebarNavItem
          ref='backNav'
          icon='home'
          label='Back to Feed'
          link={feedSource ? `/feed/${feedSource.id}` : `/home`} />
        {GTFS_ICONS.map(item => {
          return item.hideSidebar
            ? null
            : <ActiveSidebarNavItem
              active={this.isActive(item, activeComponent)}
              data-test-id={`editor-${item.id}-nav-button`}
              disabled={editingIsDisabled}
              icon={item.icon}
              key={item.id}
              label={item.label}
              link={!feedSource
                ? '/home'
                : activeComponent === item.id
                ? `/feed/${feedSource.id}/edit/`
                : `/feed/${feedSource.id}/edit/${item.id}`} />
        })}
      </ActiveSidebar>
    )
  }
}
