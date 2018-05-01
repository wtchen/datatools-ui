import {createAction} from 'redux-actions'

import {secureFetch} from '../../common/actions'
import {SECURE_API_PREFIX} from '../../common/constants'

const requestingNotes = createAction('REQUESTING_NOTES')
const creatingNote = createAction('CREATING_NOTE')
const receiveNotesForFeedSource = createAction('RECEIVE_NOTES_FOR_FEEDSOURCE')
const receiveNotesForFeedVersion = createAction('RECEIVE_NOTES_FOR_FEEDVERSION')

export function fetchNotesForFeedSource (feedSource) {
  return function (dispatch, getState) {
    dispatch(requestingNotes({feedSource}))
    const url = `${SECURE_API_PREFIX}note?type=FEED_SOURCE&objectId=${feedSource.id}`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(notes => dispatch(receiveNotesForFeedSource({feedSource, notes})))
  }
}

export function postNoteForFeedSource (feedSource, note) {
  return function (dispatch, getState) {
    dispatch(creatingNote({feedSource, note}))
    const url = `${SECURE_API_PREFIX}note?type=FEED_SOURCE&objectId=${feedSource.id}`
    return dispatch(secureFetch(url, 'post', note))
      .then(response => response.json())
      .then(note => dispatch(fetchNotesForFeedSource(feedSource)))
  }
}

export function fetchNotesForFeedVersion (feedVersion) {
  return function (dispatch, getState) {
    dispatch(requestingNotes({feedVersion}))
    const url = `${SECURE_API_PREFIX}note?type=FEED_VERSION&objectId=${feedVersion.id}`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(notes => dispatch(receiveNotesForFeedVersion({feedVersion, notes})))
  }
}

export function postNoteForFeedVersion (feedVersion, note) {
  return function (dispatch, getState) {
    dispatch(creatingNote({feedVersion, note}))
    const url = `${SECURE_API_PREFIX}note?type=FEED_VERSION&objectId=${feedVersion.id}`
    return dispatch(secureFetch(url, 'post', note))
      .then(response => response.json())
      .then(note => dispatch(fetchNotesForFeedVersion(feedVersion)))
  }
}
