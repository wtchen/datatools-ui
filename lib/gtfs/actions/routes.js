import {createAction} from 'redux-actions'

import {secureFetch} from '../../common/actions'
import { compose, routes } from '../../gtfs/util/graphql'

export const fetchingRoutes = createAction('FETCH_GRAPHQL_ROUTES')
export const clearRoutes = createAction('CLEAR_GRAPHQL_ROUTES')
export const errorFetchingRoutes = createAction('FETCH_GRAPHQL_ROUTES_REJECTED')
const receiveRoutes = createAction('FETCH_GRAPHQL_ROUTES_FULFILLED')

export function fetchRoutes (namespace) {
  return function (dispatch, getState) {
    dispatch(fetchingRoutes(namespace))
    return dispatch(secureFetch(compose(routes, { namespace })))
      .then(response => response.json())
      .then(json => {
        const {routes} = json.data.feed
        dispatch(receiveRoutes({namespace, routes}))
      })
  }
}
