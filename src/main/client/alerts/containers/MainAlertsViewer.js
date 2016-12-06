import { connect } from 'react-redux'

import AlertsViewer from '../components/AlertsViewer'
import { createAlert } from '../actions/alerts'
import { fetchProjects } from '../actions/projects'

const mapStateToProps = (state, ownProps) => {
  return {
    activeFeeds: state.gtfs.filter.activeFeeds,
    allFeeds: state.gtfs.filter.allFeeds,
    alerts: state.alerts.all,
    user: state.user,
    project: state.projects.active
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.alerts || initialProps.alerts.length === 0 || !initialProps.project.feedSources) {
        dispatch(fetchProjects())
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
