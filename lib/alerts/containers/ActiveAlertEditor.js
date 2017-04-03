import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import {
  createAlert,
  deleteAlert,
  fetchRtdAlerts,
  saveAlert,
  setActiveAlert
} from '../actions/alerts'
import {
  setActiveTitle,
  setActiveDescription,
  setActiveUrl,
  setActiveCause,
  setActiveEffect,
  setActiveStart,
  setActiveEnd,
  setActivePublished,
  addActiveEntity,
  deleteActiveEntity,
  updateActiveEntity
} from '../actions/activeAlert'
import AlertEditor from '../components/AlertEditor'
import { getFeedsForPermission } from '../../common/util/permissions'
import {fetchProjects} from '../../manager/actions/projects'
import {getActiveProject} from '../../manager/selectors'

const mapStateToProps = (state, ownProps) => {
  return {
    alert: state.alerts.active,
    activeFeeds: state.gtfs.filter.activeFeeds,
    project: getActiveProject(state),
    user: state.user,
    editableFeeds: getFeedsForPermission(getActiveProject(state), state.user, 'edit-alert'),
    publishableFeeds: getFeedsForPermission(getActiveProject(state), state.user, 'approve-alert')
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      const {location, alert, user} = initialProps
      const alertId = location.pathname.split('/alert/')[1]
      if (alert) return
      let activeProject
      dispatch(fetchProjects(true))
      .then(project => {
        activeProject = project
        return dispatch(fetchRtdAlerts())
      })
      // logic for creating new alert or setting active alert (and checking project permissions)
      .then(() => {
        if (!user.permissions.hasProjectPermission(activeProject.organizationId, activeProject.id, 'edit-alert')) {
          console.log('cannot create alert!')
          browserHistory.push('/alerts')
          return
        }
        if (!alertId) {
          dispatch(createAlert())
        } else {
          dispatch(setActiveAlert(+alertId))
        }
      })
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
