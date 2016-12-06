export const getFeedsBounds = (feeds) => {
  let feedsWithBounds = feeds.filter(feed => feed.latestValidation && feed.latestValidation.bounds)
  if (feedsWithBounds.length === 1) {
    return feedsWithBounds[0].latestValidation.bounds
  } else if (feedsWithBounds.length === 0) {
    return null
  } else {
    return feedsWithBounds.reduce((previousFeed, currentFeed) => {
      if (previousFeed.latestValidation) {
        return {
          east: currentFeed.latestValidation.bounds.east > previousFeed.latestValidation.bounds.east ? currentFeed.latestValidation.bounds.east : previousFeed.latestValidation.bounds.east,
          west: currentFeed.latestValidation.bounds.west < previousFeed.latestValidation.bounds.west ? currentFeed.latestValidation.bounds.west : previousFeed.latestValidation.bounds.west,
          north: currentFeed.latestValidation.bounds.north > previousFeed.latestValidation.bounds.north ? currentFeed.latestValidation.bounds.north : previousFeed.latestValidation.bounds.north,
          south: currentFeed.latestValidation.bounds.south < previousFeed.latestValidation.bounds.south ? currentFeed.latestValidation.bounds.south : previousFeed.latestValidation.bounds.south
        }
      } else {
        return {
          east: currentFeed.latestValidation.bounds.east,
          west: currentFeed.latestValidation.bounds.west,
          north: currentFeed.latestValidation.bounds.north,
          south: currentFeed.latestValidation.bounds.south
        }
      }
    })
  }
}
