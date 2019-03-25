// @flow

import mockData from '../../../../__tests__/test-utils/mock-data'
import * as projectsActions from '../projects'

const {getMockInitialState, makeMockStore} = mockData.store

function makeMockManagerStore () {
  return makeMockStore(getMockInitialState())
}

describe('manager > actions > projects >', () => {
  it('should set a new feed source sort order', () => {
    const store = makeMockManagerStore()
    store.dispatch(projectsActions.setFeedSort('alphabetically-desc'))
    store.expectStateToMatchSnapshot('projects')
  })
})
