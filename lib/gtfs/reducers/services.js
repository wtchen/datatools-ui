// @flow

import update from 'react-addons-update'

import type {createAction} from '../../types'

type State = {
  fetchStatus: {
    fetched: boolean,
    fetching: boolean,
    error: boolean
  },
  data: Array<any>
}

const defaultState = {
  fetchStatus: {
    fetched: false,
    fetching: false,
    error: false
  },
  data: []
}

export default function reducer (
  state: State = defaultState,
  action: createAction
): State {
  switch (action.type) {
    case 'SET_ACTIVE_FEEDVERSION':
      return defaultState
    case 'FETCH_GRAPHQL_SERVICES':
      return {
        fetchStatus: {
          fetched: false,
          fetching: true,
          error: false
        },
        data: []
      }
    case 'FETCH_GRAPHQL_SERVICES_REJECTED':
      return update(state, {
        fetchStatus: {
          $set: {
            fetched: false,
            fetching: false,
            error: true
          }
        }
      })
    case 'FETCH_GRAPHQL_SERVICES_FULFILLED':
      return {
        fetchStatus: {
          fetched: true,
          fetching: false,
          error: false
        },
        data: action.payload.services
      }
    default:
      return state
  }
}
