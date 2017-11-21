import update from 'react-addons-update'

import {getEntityGraphQLRoot, getEntityIdField} from '../../gtfs/util'

const defaultState = {
  fetchStatus: {
    fetched: false,
    fetching: false,
    error: false
  },
  data: []
}

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case 'SET_ACTIVE_FEEDVERSION':
      return defaultState
    case 'FETCH_GRAPHQL_ROUTES':
      return {
        fetchStatus: {
          fetched: false,
          fetching: true,
          error: false
        },
        data: []
      }
    case 'FETCH_GRAPHQL_ROUTES_REJECTED':
      return update(state, {
        fetchStatus: {
          $set: {
            fetched: false,
            fetching: false,
            error: true
          }
        }
      })
    case 'RECEIVE_GTFS_ENTITIES':
      const type = action.payload.type
      const entities = action.payload.data.feed[getEntityGraphQLRoot(type)]
      entities.forEach(entity => {
        const id = entity[getEntityIdField(type)]
        entity._id = `${type}:${id}`
      })
      return update(state, {
        data: {$push: entities}
      })
    default:
      return state
  }
}
