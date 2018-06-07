import {createAction} from 'redux-actions'

import {secureFetch} from '../../common/actions'
import { compose, stopsFiltered } from '../../gtfs/util/graphql'
import { fetchPatterns } from './patterns'
import { updatePatternFilter, updateRouteFilter } from './filter'

export const fetchingStops = createAction('FETCH_GRAPHQL_STOPS')
export const clearStops = createAction('CLEAR_GRAPHQL_STOPS')
export const errorFetchingStops = createAction('FETCH_GRAPHQL_STOPS_REJECTED')
export const receiveStops = createAction('FETCH_GRAPHQL_STOPS_FULFILLED')

export function fetchStopsWithFilters (namespace) {
  return function (dispatch, getState) {
    const state = getState()
    const {date, from, to} = state.gtfs.filter.dateTimeFilter
    const routeId = state.gtfs.filter.routeFilter
    const patternId = state.gtfs.filter.patternFilter
    if (!routeId && !patternId) {
      return dispatch(receiveStops({namespace, routeId, patternId, data: {stops: []}}))
    }
    dispatch(fetchingStops({namespace, routeId, patternId, date, from, to, foo: 'bar'}))
    return dispatch(secureFetch(compose(stopsFiltered(namespace, routeId, patternId, date, from, to),
      {namespace,
        routeId,
        patternId,
        date,
        from,
        to}
    )))
      .then(response => response.json())
      .then(json => dispatch(receiveStops({namespace, routeId, patternId, data: json.data})))
  }
}

export function fetchStops (namespace, routeId, patternId, date, from, to) {
  return function (dispatch, getState) {
    dispatch(fetchingStops({namespace, routeId, patternId, date, from, to}))
    return dispatch(secureFetch(compose(stopsFiltered(namespace, routeId, patternId, date, from, to), {namespace, routeId, patternId, date, from, to})))
      .then(res => res.json())
      .then(json => dispatch(receiveStops({namespace, routeId, patternId, data: json.data})))
      .catch(err => {
        console.error(err)
        dispatch(errorFetchingStops({namespace}))
      })
  }
}

export function stopDateTimeFilterChange (feedId, props) {
  return function (dispatch, getState) {
    dispatch(fetchStopsWithFilters(feedId))
  }
}

export function stopPatternFilterChange (feedId, patternData) {
  return function (dispatch, getState) {
    const state = getState()
    const {date, from, to} = state.gtfs.filter.dateTimeFilter
    const patternId = (patternData && patternData.pattern_id) ? patternData.pattern_id : null
    const routeId = (patternData && patternData.route_id) ? patternData.route_id : null
    dispatch(updatePatternFilter(patternId))

    const routeFilter = state.gtfs.filter.routeFilter
    if (!routeFilter && patternId) {
      dispatch(updateRouteFilter(routeId))
    }
    if (patternId) {
      dispatch(fetchStops(feedId, null, patternId, date, from, to))
    } else if (routeFilter) { // fetch stops for route if route filter set and pattern filter set to null
      dispatch(fetchStops(feedId, routeFilter, null, date, from, to))
    }
  }
}

export function stopRouteFilterChange (feedId, routeData) {
  return function (dispatch, getState) {
    const routeId = (routeData && routeData.route_id) ? routeData.route_id : null
    dispatch(updateRouteFilter(routeId))
    dispatch(updatePatternFilter(null))
    dispatch(fetchPatterns(feedId, routeId, null))
    dispatch(fetchStopsWithFilters(feedId))
  }
}
