// @flow

import fetch from 'isomorphic-fetch'
import get from 'lodash/get'
import {createAction} from 'redux-actions'

import {
  updateArrivalDisplay,
  updatePatternFilter,
  updateRouteFilter,
  updateServiceFilter,
  updateTimepointFilter
} from './filter'
import {compose, services, timetables} from '../../gtfs/util/graphql'
import {fetchPatterns} from './patterns'
import {fetchingServices, receiveServices} from './services'

import type {dispatchFn, getStateFn} from '../../types'

export const fetchingTimetables = createAction('FETCH_GRAPHQL_TIMETABLES')
export const clearTimetables = createAction('CLEAR_GRAPHQL_TIMETABLES')
export const errorFetchingTimetables = createAction(
  'FETCH_GRAPHQL_TIMETABLES_REJECTED'
)
export const receiveTimetables = createAction(
  'FETCH_GRAPHQL_TIMETABLES_FULFILLED'
)

export function fetchTimetablesWithFilters (namespace: string) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    const state = getState()
    const {
      patternFilter: patternId,
      routeFilter: routeId,
      serviceFilter: serviceId
    } = state.gtfs.filter
    if (!routeId || !patternId || !serviceId) {
      return dispatch(receiveTimetables({data: {trips: []}}))
    }
    dispatch(fetchingTimetables())
    const params = {namespace, routeId, patternId, serviceId}
    fetch(compose(timetables, params))
      .then(response => response.json())
      .then(json => dispatch(receiveTimetables({data: json.data})))
  }
}

export function timetablePatternFilterChange (feedId: string, patternData: any) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    const patternId = get(patternData, 'pattern_id')
    dispatch(updatePatternFilter(patternId))
    dispatch(fetchingServices(feedId))
    // make
    fetch(compose(services, {namespace: feedId, patternId}))
      .then(response => response.json())
      .then(json => {
        const serviceIdLookup = {}
        json.data.feed.patterns.forEach(pattern => {
          pattern.trips.forEach(trip => {
            serviceIdLookup[trip.service_id] = true
          })
        })
        const services = Object.keys(serviceIdLookup).map(serviceId => {
          return {serviceId}
        })
        dispatch(receiveServices({services}))
        dispatch(
          updateServiceFilter(
            services.length === 1 ? services[0].serviceId : null
          )
        )
        dispatch(fetchTimetablesWithFilters(feedId))
      })
  }
}

export function timetableRouteFilterChange (feedId: string, routeData: any) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    const routeId = routeData && routeData.route_id ? routeData.route_id : null
    dispatch(updateRouteFilter(routeId))
    dispatch(updatePatternFilter(null))
    dispatch(updateServiceFilter(null))
    dispatch(fetchPatterns(feedId, routeId, null))
    dispatch(fetchTimetablesWithFilters(feedId))
  }
}

export function timetableServiceFilterChange (feedId: string, serviceData: any) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    dispatch(updateServiceFilter(get(serviceData, 'serviceId')))
    dispatch(fetchTimetablesWithFilters(feedId))
  }
}

export function timetableShowArrivalToggle (feedId: string) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    const state = getState()
    dispatch(updateArrivalDisplay(!state.gtfs.filter.showArrivals))
    dispatch(fetchTimetablesWithFilters(feedId))
  }
}

export function timetableTimepointToggle (feedId: string) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    const state = getState()
    dispatch(updateTimepointFilter(!state.gtfs.filter.timepointFilter))
    dispatch(fetchTimetablesWithFilters(feedId))
  }
}
