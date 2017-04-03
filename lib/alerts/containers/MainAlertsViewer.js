import { connect } from 'react-redux'

import { createAlert, fetchRtdAlerts } from '../actions/alerts'
import AlertsViewer from '../components/AlertsViewer'
import {fetchProjects} from '../../manager/actions/projects'
import {getActiveProject} from '../../manager/selectors'

const mapStateToProps = (state, ownProps) => {
  return {
    activeFeeds: state.gtfs.filter.activeFeeds,
    allFeeds: state.gtfs.filter.allFeeds,
    alerts: state.alerts.all,
    fetched: state.alerts.fetched,
    user: state.user,
    project: getActiveProject(state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      const {alerts, project} = initialProps
      if (!alerts || alerts.length === 0 || !project || !project.feedSources) {
        dispatch(fetchProjects(true))
        .then(project => {
          return dispatch(fetchRtdAlerts())
        })
      }
    },
    createAlert: () => dispatch(createAlert()),
    onStopClick: (stop, agency) => dispatch(createAlert(stop, agency)),
    onRouteClick: (route, agency) => dispatch(createAlert(route, agency))
  }
}

const MainAlertsViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertsViewer)

export default MainAlertsViewer
