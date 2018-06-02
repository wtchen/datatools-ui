// @flow

import {createAction} from 'redux-actions'

export const fetchingServices = createAction('FETCH_GRAPHQL_SERVICES')
export const clearServices = createAction('CLEAR_GRAPHQL_SERVICES')
export const errorFetchingServices = createAction('FETCH_GRAPHQL_SERVICES_REJECTED')
export const receiveServices = createAction('FETCH_GRAPHQL_SERVICES_FULFILLED')
