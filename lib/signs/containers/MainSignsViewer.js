import { connect } from 'react-redux'

import SignsViewer from '../components/SignsViewer'
import { createSign, fetchRtdSigns } from '../actions/signs'
import { fetchProjects } from '../../manager/actions/projects'
import {getActiveProject} from '../../manager/selectors'

const mapStateToProps = (state, ownProps) => {
  return {
    activeFeeds: state.gtfs.filter.activeFeeds,
    allFeeds: state.gtfs.filter.allFeeds,
    fetched: state.signs.fetched,
    project: getActiveProject(state),
    signs: state.signs.all,
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      const {signs, project} = initialProps
      if (!signs || signs.length === 0 || !project || !project.feedSources) {
        dispatch(fetchProjects(true))
        .then(project => {
          return dispatch(fetchRtdSigns())
        })
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
