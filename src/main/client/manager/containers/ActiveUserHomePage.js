import { connect } from 'react-redux'

import UserHomePage from '../components/UserHomePage'
import { getRecentActivity, logout } from '../actions/user'
import { fetchProjects } from '../actions/projects'
import { fetchProjectFeeds } from '../actions/feeds'
import { setVisibilitySearchText, setVisibilityFilter } from '../actions/visibilityFilter'

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    projects: state.projects.all ? state.projects.all.filter(p => p.isCreating || state.user.permissions.isApplicationAdmin() || state.user.permissions.hasProject(p.id)) : [],
    project: ownProps.routeParams.projectId && state.projects.all ? state.projects.all.find(p => p.id === ownProps.routeParams.projectId) : null,
    visibilityFilter: state.projects.filter
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const activeProjectId = ownProps.routeParams.projectId
  return {
    onComponentMount: (props) => {
      dispatch(getRecentActivity(props.user))
      dispatch(fetchProjects())
      .then(projects => {
        if (activeProjectId) {
          dispatch(fetchProjectFeeds(activeProjectId))
        }
        // for (var i = 0; i < projects.length; i++) {
        //   dispatch(fetchProjectFeeds(projects[i].id))
        // }
      })
    },
    fetchProjectFeeds: (projectId) => { dispatch(fetchProjectFeeds(projectId)) },
    logoutHandler: () => { dispatch(logout()) },
    searchTextChanged: (text) => { dispatch(setVisibilitySearchText(text)) },
    visibilityFilterChanged: (filter) => dispatch(setVisibilityFilter(filter))
  }
}

const ActiveUserHomePage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHomePage)

export default ActiveUserHomePage
