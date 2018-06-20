// @flow

import update from 'react-addons-update'

export type OrganizationsState = {
  isFetching: boolean,
  data: any,
  userQueryString: ?string
}

export const defaultState = {
  isFetching: false,
  data: null,
  userQueryString: null
}

const users = (state: OrganizationsState = defaultState, action: any) => {
  switch (action.type) {
    case 'REQUESTING_ORGANIZATIONS':
      return update(state, {isFetching: { $set: true }})
    case 'RECEIVE_ORGANIZATIONS':
      return update(state, {
        isFetching: { $set: false },
        data: { $set: action.organizations },
        userCount: { $set: action.totalUserCount }
      })
    case 'CREATED_ORGANIZATION':
      if (state.data) {
        return update(state, {data: { $push: [action.organization] }})
      }
      break
    case 'SET_ORGANIZATION_QUERY_STRING':
      return update(state, {userQueryString: { $set: action.queryString }})
    default:
      return state
  }
}

export default users
