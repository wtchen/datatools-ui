// @flow

import Menu, {SubMenu, MenuItem} from 'rc-menu'
import React, {Component} from 'react'
import {Clearfix} from 'react-bootstrap'

import * as tripActions from '../../actions/trip'
// import {SHORTCUTS} from '../../util/timetable'

import type {TimetableContextMenuState} from '../../../types/reducers'

type Props = {
  activeCell: ?string,
  calculateAllStopsOnCellTrip: typeof tripActions.calculateStopsWithoutTimesOnSelectedTrips,
  calculateAllStopsOnSelectedTrips: typeof tripActions.calculateStopsWithoutTimesOnSelectedTrips,
  calculateSingleStopTime: typeof tripActions.calculateStopsWithoutTimesOnSelectedTrips,
  calculateStopOnSelectedTrips: typeof tripActions.calculateStopsWithoutTimesOnSelectedTrips,
  calculateStopsWithoutTimesOnCellTrip: typeof tripActions.calculateStopsWithoutTimesOnSelectedTrips,
  calculateStopsWithoutTimesOnSelectedTrips: typeof tripActions.calculateStopsWithoutTimesOnSelectedTrips,
  closeTimetableContextMenu: typeof tripActions.closeTimetableContextMenu,
  menuState: TimetableContextMenuState,
  selected: Array<number>
}

type State = {}

/**
 * A context menu for doing various actions to the timetable.
 */
export default class ContextMenu extends Component<Props, State> {
  /**
   * Close the context menu (handle clicking anywhere outside menu)
   */
  _close = (e: SyntheticMouseEvent<HTMLInputElement>) => {
    this.props.closeTimetableContextMenu()
    e.preventDefault()
  }

  /**
   * Delete the selected trips
   */
  _deleteSelectedTrips = () => {

    this.props.closeTimetableContextMenu()
  }

  /**
   * Duplicate either the first or selected trip(s)
   */
  _duplicate = () => {

    this.props.closeTimetableContextMenu()
  }

  render () {
    const {
      calculateAllStopsOnCellTrip,
      calculateAllStopsOnSelectedTrips,
      calculateSingleStopTime,
      calculateStopOnSelectedTrips,
      calculateStopsWithoutTimesOnCellTrip,
      calculateStopsWithoutTimesOnSelectedTrips,
      menuState,
      selected
    } = this.props
    const {context, display, top, left} = menuState
    const atLeastOneTripSelected = selected.length > 0

    if (!display || (context === 'header-cell' && !atLeastOneTripSelected)) {
      return null
    }

    const cellContext = context === 'editable-cell'
    const selectedTripsText = `${selected.length} selected trip${selected.length > 1 ? 's' : ''}`

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
          // <SubMenu title='Offset stop times using a constant'>
          //   <MenuItem>Add 1 minute</MenuItem>
          //   <MenuItem>Remove 1 minute</MenuItem>
          //   ...
          // </SubMenu> */}
          <SubMenu title='Update stop times using pattern defaults'>
            {cellContext &&
              <MenuItem onClick={calculateSingleStopTime}>
                ...for this stop on this trip
              </MenuItem>
            }
            {cellContext &&
              atLeastOneTripSelected &&
              <MenuItem onClick={calculateStopOnSelectedTrips}>
                ...for this stop on the {selectedTripsText}
              </MenuItem>
            }
            {cellContext &&
              <MenuItem onClick={calculateStopsWithoutTimesOnCellTrip}>
                ...for stops without times on this trip
              </MenuItem>
            }
            {atLeastOneTripSelected &&
              <MenuItem onClick={calculateStopsWithoutTimesOnSelectedTrips}>
                ...for stops without times on the {selectedTripsText}
              </MenuItem>
            }
            {cellContext &&
              <MenuItem onClick={calculateAllStopsOnCellTrip}>
                ...for all stops on this trip
              </MenuItem>
            }
            {atLeastOneTripSelected &&
              <MenuItem onClick={calculateAllStopsOnSelectedTrips}>
                ...for all stops on the {selectedTripsText}
              </MenuItem>
            }
          </SubMenu>
          <MenuItem onClick={this._duplicate}>
            {atLeastOneTripSelected
              ? 'Duplicate selected trip(s)'
              : 'Duplicate first trip'}
          </MenuItem>
          {atLeastOneTripSelected &&
            <MenuItem onClick={this._deleteSelectedTrips}>
              Delete selected trip(s)
            </MenuItem>
          }
        </Menu>
        {/* the following is an overlay to capture any clicks out of the menu
          meant to deactivate the menu */}
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
