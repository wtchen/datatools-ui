// @flow

import {getMockInitialState, makeMockStore} from '../../../mock-data'
import * as projectsActions from '../projects'

function makeMockManagerStore () {
  return makeMockStore(getMockInitialState())
}

describe('manager > actions > projects >', () => {
  it('should set a new feed source display type', () => {
    const store = makeMockManagerStore()
    store.dispatch(projectsActions.toggleFeedTableViewType())
    store.expectStateToMatchSnapshot('projects')
  })

  it('should set a new feed source sort order', () => {
    const store = makeMockManagerStore()
    store.dispatch(projectsActions.setFeedSort('alphabetically-desc'))
    store.expectStateToMatchSnapshot('projects')
  })
})
