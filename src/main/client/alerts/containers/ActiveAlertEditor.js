import { connect } from 'react-redux'

import { fetchProjects } from '../actions/projects'
import { saveAlert, deleteAlert, createAlert, setActiveAlert } from '../actions/alerts'
import { setActiveTitle, setActiveDescription, setActiveUrl, setActiveCause,
  setActiveEffect, setActiveStart, setActiveEnd, setActivePublished,
  addActiveEntity, deleteActiveEntity, updateActiveEntity } from '../actions/activeAlert'
import AlertEditor from '../components/AlertEditor'
import { browserHistory } from 'react-router'
import { getFeedsForPermission } from '../../common/util/permissions'

const mapStateToProps = (state, ownProps) => {
  return {
    alert: state.activeAlert,
    activeFeeds: state.gtfs.filter.activeFeeds,
    project: state.projects.active,
    user: state.user,
    editableFeeds: getFeedsForPermission(state.projects.active, state.user, 'edit-alert'),
    publishableFeeds: getFeedsForPermission(state.projects.active, state.user, 'approve-alert')
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      const alertId = initialProps.location.pathname.split('/alert/')[1]
      if (initialProps.alert) return

      if (!alertId) {
        dispatch(fetchProjects())
        .then((activeProject) => {
          if (!initialProps.user.permissions.hasProjectPermission(activeProject.id, 'edit-alert')) {
            console.log('cannot create alert!')
            browserHistory.push('/alerts')
            return
          }
          dispatch(createAlert())
        })
      } else {
        dispatch(fetchProjects())
        .then((activeProject) => {
          if (!initialProps.user.permissions.hasProjectPermission(activeProject.id, 'edit-alert')) {
            console.log('cannot create alert!')
            browserHistory.push('/alerts')
            return
          }
          dispatch(setActiveAlert(+alertId))
        })
      }
    },
    onSaveClick: (alert) => dispatch(saveAlert(alert)),
    onDeleteClick: (alert) => dispatch(deleteAlert(alert)),
    onPublishClick: (alert, published) => dispatch(setActivePublished(published)),
    titleChanged: (title) => dispatch(setActiveTitle(title)),
    descriptionChanged: (title) => dispatch(setActiveDescription(title)),
    urlChanged: (title) => dispatch(setActiveUrl(title)),
    causeChanged: (cause) => dispatch(setActiveCause(cause)),
    effectChanged: (effect) => dispatch(setActiveEffect(effect)),
    startChanged: (start) => dispatch(setActiveStart(start)),
    endChanged: (end) => dispatch(setActiveEnd(end)),
    onAddEntityClick: (type, value, agency, newEntityId) => dispatch(addActiveEntity(type, value, agency, newEntityId)),
    onDeleteEntityClick: (entity) => dispatch(deleteActiveEntity(entity)),
    entityUpdated: (entity, field, value, agency) => dispatch(updateActiveEntity(entity, field, value, agency)),

    editorStopClick: (stop, agency, newEntityId) => dispatch(addActiveEntity('STOP', stop, agency, newEntityId)),
    editorRouteClick: (route, agency, newEntityId) => dispatch(addActiveEntity('ROUTE', route, agency, newEntityId))
  }
}

const ActiveAlertEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertEditor)

export default ActiveAlertEditor
