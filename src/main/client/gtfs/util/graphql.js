export function compose (query, variables) {
  return `/api/manager/graphql?query=${encodeURIComponent(query)}&variables=${encodeURIComponent(JSON.stringify(variables))}`
}

export const feed = `
query feedQuery($feedId: [String]) {
  feeds (feed_id: $feedId) {
    feed_id,
    # feed_publisher_name,
    # feed_publisher_url,
    # feed_lang,
    # feed_version,
    # route_count,
    # stop_count,
    mergedBuffer
  }
}
`

export const routes = `
query routeQuery($feedId: [String]) {
  routes(feed_id: $feedId) {
    route_id
    route_short_name
    route_long_name,
    route_desc,
    route_url,
    trip_count,
    pattern_count
  }
}
`

export const patterns = `
query patternsQuery($feedId: [String], $routeId: [String], $date: String, $from: Long, $to: Long) {
  routes (feed_id: $feedId, route_id: $routeId) {
    route_id,
    route_short_name,
    route_long_name,
    patterns {
      pattern_id,
      name,
      geometry,
      stop_count,
      trip_count,
      stats(date: $date, from: $from, to: $to){
        headway,
        avgSpeed
      },
    }
  }
}
`

export const stops = () => {
  return `
  query allStopsQuery($feedId: [String]) {
    stops(feed_id: $feedId) {
      stops {
        stop_id,
        stop_name,
        stop_name,
        stop_code,
        stop_desc,
        stop_lon,
        stop_lat,
        zone_id,
        stop_url,
        stop_timezone
      }
    }
  }
  `
}

export const allStops = `
query allStopsQuery($feedId: [String]) {
  stops(feed_id: $feedId) {
    stops {
      stop_id,
      stop_name,
      stop_name,
      stop_code,
      stop_desc,
      stop_lon,
      stop_lat,
      zone_id,
      stop_url,
      stop_timezone
    }
  }
}
`

// TODO: add back in patternId filter
export const stopsFiltered = (feedId, routeId, patternId, date, from, to) => {
  const hasFrom = typeof from !== 'undefined' && from !== null
  const hasTo = typeof to !== 'undefined' && to !== null
  let query = `
  query filteredStopsQuery(
    ${feedId ? '$feedId: [String],' : ''}
    ${routeId ? '$routeId: [String],' : ''}
    ${patternId ? '$patternId: [String],' : ''}
    ${date ? '$date: String,' : ''}
    ${hasFrom ? '$from: Long,' : ''}
    ${hasTo ? '$to: Long' : ''}
    ) {
    stops(${feedId ? 'feed_id: $feedId,' : ''} ${routeId ? 'route_id: $routeId,' : ''} ${patternId ? 'pattern_id: $patternId,' : ''}) {
      stop_id,
      stop_name,
      stop_name,
      stop_code,
      stop_desc,
      stop_lon,
      stop_lat,
       ${date && hasFrom && hasTo
          ? `
          stats(date: $date, from: $from, to: $to){
            headway,
            tripCount
          },
          transferPerformance(date: $date, from: $from, to: $to){
            fromRoute,
            toRoute,
            bestCase,
            worstCase,
            typicalCase
          },
          `
        : ''}
      # zone_id,
      # stop_url,
      # stop_timezone
    }
  }
  `
  return query
}
