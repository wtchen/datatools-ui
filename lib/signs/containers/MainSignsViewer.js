import { connect } from 'react-redux'

import SignsViewer from '../components/SignsViewer'
import { createSign } from '../actions/signs'
import { fetchProjects } from '../actions/projects'

const mapStateToProps = (state, ownProps) => {
  return {
    activeFeeds: state.gtfs.filter.activeFeeds,
    allFeeds: state.gtfs.filter.allFeeds,
    signs: state.signs.all,
    user: state.user,
    project: state.projects.active
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.signs || initialProps.signs.length === 0 || !initialProps.project.feedSources) {
        dispatch(fetchProjects())
      }
    },
    onStopClick: (stop, agency) => dispatch(createSign(stop, agency)),
    onRouteClick: (route, agency) => dispatch(createSign(route, agency)),
    createSign: () => dispatch(createSign())
  }
}

const MainSignsViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignsViewer)

export default MainSignsViewer
