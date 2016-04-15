import React from 'react'
import { connect } from 'react-redux'

import { fetchProjects } from '../actions/projects'
import { saveSign, deleteSign, createSign, setActiveSign } from '../actions/signs'
import { setActiveTitle, setActiveDescription, setActiveUrl, setActiveCause,
  setActiveEffect, setActiveStart, setActiveEnd, setActivePublished,
  addActiveEntity, deleteActiveEntity, updateActiveEntity, updateDisplays,
  toggleAssociatedSign } from '../actions/activeSign'

import SignEditor from '../components/SignEditor'

import { getFeedsForPermission } from '../util/util'

import '../style.css'

const agencyCompare = function(a, b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}
const mapStateToProps = (state, ownProps) => {
  return {
    sign: state.activeSign,
    activeFeeds: state.gtfsFilter.activeFeeds,
    project: state.projects.active,
    user: state.user,
    editableFeeds: getFeedsForPermission(state.projects.active, state.user, 'edit-sign'),
    publishableFeeds: getFeedsForPermission(state.projects.active, state.user, 'approve-sign')
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      const signId = initialProps.location.pathname.split('/sign/')[1]
      console.log(signId)
      if (initialProps.sign)
        return

      if (!signId) {
        console.log('sign', initialProps.sign)
        dispatch(fetchProjects())
        .then(() => {
          console.log('done fetching projects')
          return dispatch(createSign())
        })
      }
      else {
        console.log('need to set active sign')
        dispatch(fetchProjects())
        .then(() => {
          console.log('done fetching projects')
          console.log('getting', signId)
          dispatch(setActiveSign(+signId))
        })
      }
    },
    updateDisplays: (displayList) => dispatch(updateDisplays(displayList)),
    handleDisplayClick: (display, draftConfigId) => dispatch(toggleAssociatedSign(display, draftConfigId)),
    onSaveClick: (sign) => dispatch(saveSign(sign)),
    onDeleteClick: (sign) => dispatch(deleteSign(sign)),
    onPublishClick: (sign, published) => dispatch(setActivePublished(published)),
    titleChanged: (title) => dispatch(setActiveTitle(title)),
    // descriptionChanged: (description) => dispatch(setActiveDescription(description)),
    urlChanged: (title) => dispatch(setActiveUrl(title)),
    causeChanged: (cause) => dispatch(setActiveCause(cause)),
    effectChanged: (effect) => dispatch(setActiveEffect(effect)),
    startChanged: (start) => dispatch(setActiveStart(start)),
    endChanged: (end) => dispatch(setActiveEnd(end)),
    onAddEntityClick: (type, value, agency) => dispatch(addActiveEntity(type, value, agency)),
    onDeleteEntityClick: (entity) => dispatch(deleteActiveEntity(entity)),
    entityUpdated: (entity, field, value, agency) => dispatch(updateActiveEntity(entity, field, value, agency)),

    editorStopClick: (stop, agency) => dispatch(addActiveEntity('STOP', stop, agency)),
    editorRouteClick: (route, agency) => dispatch(addActiveEntity('ROUTE', route, agency))
  }
}

const ActiveSignEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignEditor)

export default ActiveSignEditor
