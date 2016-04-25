import React from 'react'
import { connect } from 'react-redux'

import AlertsViewer from '../components/AlertsViewer'

import { createAlert } from '../actions/alerts'
import { fetchProjects } from '../actions/projects'

import '../style.css'

const mapStateToProps = (state, ownProps) => {
  return {
    activeFeeds: state.gtfsFilter.activeFeeds,
    allFeeds: state.gtfsFilter.allFeeds,
    alerts: state.alerts.all,
    user: state.user,
    project: state.projects.active
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      console.log(initialProps)
      if (!initialProps.alerts || initialProps.alerts.length === 0 || !initialProps.project.feedSources) {
        console.log('fetching projects...')
        dispatch(fetchProjects())
      }

    },
    createAlert: () => dispatch(createAlert()),
    onStopClick: (stop, agency) => dispatch(createAlert(stop, agency)),
    onRouteClick: (route, agency) => dispatch(createAlert(route, agency)),
  }
}

const MainAlertsViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertsViewer)

export default MainAlertsViewer
