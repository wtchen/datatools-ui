// @flow

import type {Bounds, Feed} from '../types'

export function getFeedsBounds (feeds: Array<Feed>): ?Bounds {
  const feedsWithBounds: Array<Feed> = feeds.filter(
    (feed: Feed) => feed.latestValidation && feed.latestValidation.bounds
  )
  if (feedsWithBounds.length === 1) {
    return feedsWithBounds[0].latestValidation.bounds
  } else if (feedsWithBounds.length === 0) {
    return null
  } else {
    return feedsWithBounds.reduce(
      (previousFeed: Feed, currentFeed: Feed): Bounds => {
        if (previousFeed.latestValidation) {
          return {
            east:
              currentFeed.latestValidation.bounds.east >
              previousFeed.latestValidation.bounds.east
                ? currentFeed.latestValidation.bounds.east
                : previousFeed.latestValidation.bounds.east,
            west:
              currentFeed.latestValidation.bounds.west <
              previousFeed.latestValidation.bounds.west
                ? currentFeed.latestValidation.bounds.west
                : previousFeed.latestValidation.bounds.west,
            north:
              currentFeed.latestValidation.bounds.north >
              previousFeed.latestValidation.bounds.north
                ? currentFeed.latestValidation.bounds.north
                : previousFeed.latestValidation.bounds.north,
            south:
              currentFeed.latestValidation.bounds.south <
              previousFeed.latestValidation.bounds.south
                ? currentFeed.latestValidation.bounds.south
                : previousFeed.latestValidation.bounds.south
          }
        } else {
          return currentFeed.latestValidation.bounds
        }
      }
    )
  }
}
