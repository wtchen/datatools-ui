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
    case 'FETCH_GRAPHQL_TIMETABLES':
      return update(state, {
        fetchStatus: {
          $set: {
            fetched: false,
            fetching: true,
            error: false
          }
        },
        data: {$set: []}
      })
    case 'FETCH_GRAPHQL_TIMETABLES_REJECTED':
      return update(state, {
        fetchStatus: {
          $set: {
            fetched: false,
            fetching: false,
            error: true
          },
          data: {$set: []}
        }
      })
    case 'FETCH_GRAPHQL_TIMETABLES_FULFILLED':
      const {data} = action.payload

      return update(state, {
        fetchStatus: {
          $set: {
            fetched: true,
            fetching: false,
            error: false
          }
        },
        data: {$set: data}
      })
    default:
      return state
  }
}
