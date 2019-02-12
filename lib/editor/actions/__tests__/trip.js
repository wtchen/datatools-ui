// @flow

import {getMockEditorState, makeMockStore} from '../../../mock-data'
import * as tripActions from '../trip'

/**
 * Performs a snapshot assertion on just the timetable part of the store state
 */
function expectTimetableStateToMatchSnapshot (store) {
  expect(store.getState().editor.timetable).toMatchSnapshot()
}

/**
 * Returns a mock store that has a feed loaded in the editor. Also, the current
 * state of the editor has a mock pattern loaded in the timetable editor.
 */
function makeMockEditorStore () {
  return makeMockStore(getMockEditorState())
}

describe('editor > actions > trip >', () => {
  describe('showTimetableContextMenu', () => {
    it('can dispatch an action to show the context menu', () => {
      const store = makeMockEditorStore()
      store.dispatch(tripActions.showTimetableContextMenu({
        context: 'editable-cell',
        left: 1,
        top: 2
      }))
      expectTimetableStateToMatchSnapshot(store)
    })
  })

  /**
   * Stop time calculations
   */
  // describe('calculateAllStopsOnCellTrip', () => {
  //   it('can update the stop time of trip', () => {
  //     // setup
  //     const store = makeMockEditorStore()
  //
  //     // dispatch action
  //
  //     // make sure resulting state matches snapshot
  //     expectTimetableStateToMatchSnapshot(store)
  //   })
  // })
  describe('calculateSingleStopTime', () => {
    it('can update properly', () => {
      // setup
      const store = makeMockEditorStore()

      // dispatch action
      store.dispatch(tripActions.calculateSingleStopTime())

      // make sure resulting state matches snapshot
      expectTimetableStateToMatchSnapshot(store)
    })
  })
})
