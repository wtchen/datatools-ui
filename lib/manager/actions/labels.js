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
export function createLabel (label: Label) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    return dispatch(secureFetch(LABEL_URL, 'post', label))
      .then((res) => res.json())
      .then((createdLabel) => {
        dispatch(fetchProject(createdLabel.projectId))
        dispatch(fetchProjectFeeds(createdLabel.projectId))
      })
  }
}

/**
 * Update existing label with provided properties.
 */
export function updateLabel (label: Label, properties: {[string]: any}) {
  // remove keys which the server doesn't like
  // TODO: is there a cleaner/more dynamic way to do this? Properties can't be guaranteed to
  // include all the keys we need, so can't use that
  delete label.organizationId
  delete label.user

  return function (dispatch: dispatchFn, getState: getStateFn) {
    return dispatch(secureFetch(`${LABEL_URL}/${label.id}`, 'put', {...label}))
      .then((res) => dispatch(fetchProject(label.projectId)))
      .then(() => dispatch(fetchProjectFeeds(label.projectId)))
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
