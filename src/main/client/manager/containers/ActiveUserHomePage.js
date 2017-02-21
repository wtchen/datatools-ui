import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import UserHomePage from '../components/UserHomePage'
import { getRecentActivity, logout } from '../actions/user'
import { fetchProjects } from '../actions/projects'
import { fetchProjectFeeds } from '../actions/feeds'
import { setVisibilitySearchText, setVisibilityFilter } from '../actions/visibilityFilter'

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    projects: state.projects.all ? state.projects.all.filter(p => p.isCreating || state.user.permissions && state.user.permissions.isApplicationAdmin() || state.user.permissions && state.user.permissions.hasProject(p.id, p.organizationId)) : [],
    project: ownProps.routeParams.projectId && state.projects.all ? state.projects.all.find(p => p.id === ownProps.routeParams.projectId) : null,
    visibilityFilter: state.projects.filter
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  let activeProjectId = ownProps.routeParams.projectId
  return {
    onComponentMount: (initialProps) => {
      dispatch(getRecentActivity(initialProps.user))
      // dispatch(fetchOrganizationForUser(initialProps.user))
      dispatch(fetchProjects())
      .then(projects => {
        if (!activeProjectId) {
          const userProjectIds = initialProps.user && projects.map(p => {
            if (initialProps.user.permissions.hasProject(p.id, p.organizationId)) {
              return p.id
            }
          })
          activeProjectId = userProjectIds && userProjectIds[0]
        }
        if (activeProjectId) {
          dispatch(fetchProjectFeeds(activeProjectId))
          .then(() => browserHistory.push(`/home/${activeProjectId}`))
        }
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
