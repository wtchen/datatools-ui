// @flow

import Menu, {SubMenu, MenuItem} from 'rc-menu'
import React, {Component} from 'react'
import {Clearfix} from 'react-bootstrap'

import * as tripActions from '../../actions/trip'
// import {SHORTCUTS} from '../../util/timetable'

import type {TimetableContextMenuState} from '../../../types/reducers'

type Props = {
  closeTimetableContextMenu: typeof tripActions.closeTimetableContextMenu,
  menuState: TimetableContextMenuState
}

type State = {}

/**
 * A context menu for doing various actions to the timetable.
 */
export default class ContextMenu extends Component<Props, State> {
  _close = (e: SyntheticMouseEvent<HTMLInputElement>) => {
    this.props.closeTimetableContextMenu()
    e.preventDefault()
  }

  render () {
    const {display, top, left} = this.props.menuState

    if (!display) return null

    // const activeCell = false
    return (
      <Clearfix>
        <Menu
          style={{
            background: '#fff',
            display: 'block',
            left,
            padding: 0,
            position: 'absolute',
            top,
            width: 330,
            zIndex: 100
          }}
        >
          {/* Might be a good idea to also have all the offset items here as well,
          // but it's a nightmare to refactor the TimetableHelpModal messages
          // into a common interface
          // <li className='dropdown-submenu'>
          //   <a tabIndex='-1' href='#'>Offset Stop Times</a>
          //   <ul className='dropdown-menu'>
          //     <li><a tabIndex='-1' href='#'>Add offset time to all selected trips' stop times</a></li>
          //     <li><a href='#'>Subtract offset time to all selected trips' stop times</a></li>
          //     <li><a href='#'>Second level</a></li>
          //   </ul>
          // </li> */}
          <SubMenu title='Update stop times using pattern defaults'>
            <MenuItem>Recalculate all stop times</MenuItem>
            <MenuItem>Calculate stop times for all stops with interpolated or missing stop times</MenuItem>
            <MenuItem>Calculate all stop times for this stop only</MenuItem>
          </SubMenu>
          <MenuItem>Clone Trip</MenuItem>
          <MenuItem>Delete Trip</MenuItem>
        </Menu>
        <div
          onClick={this._close}
          onContextMenu={this._close}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 99
          }}
        />
      </Clearfix>
    )
  }
}
