// @flow

import clone from 'lodash/cloneDeep'

import {feedSortOptions} from '../'
import {mockFeedWithVersion, mockFeedWithoutVersion} from '../../../mock-data'

// create a third mock feed for sorting
const mockFeedWithVersion2 = clone(mockFeedWithVersion)
mockFeedWithVersion2.id = 'another test feed with a version that ends later'
mockFeedWithVersion2.name = 'another test feed with a version that ends later'
mockFeedWithVersion2.lastUpdated += 86400000
// it exists, but flow needs to know for sure
if (mockFeedWithVersion2.latestValidation) {
  mockFeedWithVersion2.latestValidation.errorCount = 12345
  mockFeedWithVersion2.latestValidation.startDate = '20190801'
  mockFeedWithVersion2.latestValidation.endDate = '20200801'
}

const mockFeeds = [
  mockFeedWithVersion,
  mockFeedWithVersion2,
  mockFeedWithoutVersion
]

describe('manager > util > index >', () => {
  describe('feedSortOptions', () => {
    Object.keys(feedSortOptions).forEach(optionKey => {
      /**
       * Make sure sorting happens as expected. The snapshot created is based off
       * of an array of just the feed names.
       */
      it(`should sort ${optionKey}`, () => {
        expect(
          clone(mockFeeds)
            .sort(feedSortOptions[optionKey])
            .map(feed => feed.name)
        ).toMatchSnapshot()
      })
    })
  })
})
