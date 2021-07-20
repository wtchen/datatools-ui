// @flow

import {secureFetch} from '../../common/actions'
import type {dispatchFn, getStateFn} from '../../types/reducers'

import { fetchProject } from './projects'
import {fetchProjectFeeds} from './feeds'

// Public action used by component or other actions

const LABEL_URL = '/api/manager/secure/label'

/**
 * Create new label from provided properties.
 */
export function createLabel (newLabel: Label) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    return dispatch(secureFetch(LABEL_URL, 'post', newLabel))
      .then((res) => res.json())
      .then((createdLabel) => {
        // TODO
      })
  }
}

/**
 * Update existing label with provided properties.
 */
export function updateLabel (label: Label, properties: {[string]: any}) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    return dispatch(secureFetch(`${LABEL_URL}/${label.id}`, 'put', {...label, ...properties}))
      .then((res) => dispatch(fetchProject(label.projectId)))
  }
}

/**
 * Permanently delete single label */
export function deleteLabel (label: Label) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    return dispatch(secureFetch(`${LABEL_URL}/${label.id}`, 'delete'))
      .then((res) => dispatch(fetchProject(label.projectId)))
      .then(() => dispatch(fetchProjectFeeds(label.projectId)))
  }
}
