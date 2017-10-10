import { createSelector } from 'reselect'

const getActiveProjectId = (state) => state.projects.active
const getAllProjects = (state) => state.projects.all

export const getActiveProject = createSelector(
  [ getActiveProjectId, getAllProjects ],
  (activeProjectId, projects) => {
    return projects && projects.find(p => p.id === activeProjectId)
  }
)

export const getProjects = createSelector(
  [getAllProjects, state => state.user.permissions],
  (allProjects, permissions) => {
    return allProjects
      ? allProjects.filter(
          p =>
            permissions.isApplicationAdmin() ||
            permissions.hasProject(p.id, p.organizationId)
        )
      : []
  }
)
