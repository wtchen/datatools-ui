// @flow

import update from 'react-addons-update'

import type {createAction} from '../../types'

export type RoutesState = {
  allRoutes: {
    fetchStatus: {
      fetched: boolean,
      fetching: boolean,
      error: boolean
    },
    data: Array<any>
  },
  routeDetails: {
    fetchStatus: {
      fetched: boolean,
      fetching: boolean,
      error: boolean
    },
    data: any
  }
}

const defaultState = {
  allRoutes: {
    fetchStatus: {
      fetched: false,
      fetching: false,
      error: false
    },
    data: []
  },
  routeDetails: {
    fetchStatus: {
      fetched: false,
      fetching: false,
      error: false
    },
    data: {}
  }
}

export default function reducer (
  state: RoutesState = defaultState,
  action: createAction
): RoutesState {
  switch (action.type) {
    case 'SET_ACTIVE_FEEDVERSION':
      return defaultState
    case 'FETCH_GRAPHQL_ROUTES':
      return update(state, {
        allRoutes: {
          $set: {
            fetchStatus: {
              fetched: false,
              fetching: true,
              error: false
            },
            data: []
          }
        }
      })
    case 'FETCH_GRAPHQL_ROUTES_REJECTED':
      return update(state, {
        allRoutes: {
          fetchStatus: {
            $set: {
              fetched: false,
              fetching: false,
              error: true
            }
          }
        }
      })
    case 'FETCH_GRAPHQL_ROUTES_FULFILLED':
      return update(state, {
        allRoutes: {
          $set: {
            fetchStatus: {
              fetched: true,
              fetching: false,
              error: false
            },
            data: action.payload
          }
        }
      })
    case 'FETCH_GRAPHQL_ROUTE_DETAILS':
      return update(state, {
        routeDetails: {
          $set: {
            fetchStatus: {
              fetched: false,
              fetching: true,
              error: false
            },
            data: []
          }
        }
      })
    case 'FETCH_GRAPHQL_ROUTE_DETAILS_REJECTED':
      return update(state, {
        routeDetails: {
          fetchStatus: {
            $set: {
              fetched: false,
              fetching: false,
              error: true
            }
          }
        }
      })
    case 'FETCH_GRAPHQL_ROUTE_DETAILS_FULFILLED':
      return update(state, {
        routeDetails: {
          $set: {
            fetchStatus: {
              fetched: true,
              fetching: false,
              error: false
            },
            data: action.payload
          }
        }
      })
    default:
      return state
  }
}
