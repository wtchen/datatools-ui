import update from 'react-addons-update'

const projects = (state = {
  isFetching: false,
  all: null,
  active: null,
  filter: {
    searchText: null
  }
}, action) => {
  console.log(action)
  let projects, sources, projectIndex, sourceIndex, versionIndex, activeProject, activeIndex, feeds, activeProjectId, project, newState, deployment
  switch (action.type) {
    case 'SET_PROJECT_VISIBILITY_SEARCH_TEXT':
      return update(state, {filter: {searchText: {$set: action.text}}})
    case 'CREATE_PROJECT':
      projects = [{
        isCreating: true,
        name: ''
      }, ...state.all]
      return update(state, { all: { $set: projects }})

    case 'CREATE_FEEDSOURCE':
      projectIndex = state.all.findIndex(p => p.id === action.projectId)
      project = state.all[projectIndex]
      newState = null
      console.log("adding fs to project", state.all[projectIndex]);


      // if project's feedSources array is undefined, add it
      if(!project.feedSources) {
        console.log('adding new fs array');
        newState = update(state, {all: {[projectIndex]: {$merge: {feedSources: []}}}})
      }

      // add new empty feed source to feedSources array
      const feedSource = {
        isCreating: true,
        name: '',
        projectId: project.id
      }
      return update(newState || state, {all: {[projectIndex]: {feedSources: {$unshift: [feedSource]}}}})

    case 'CREATE_DEPLOYMENT':
      projectIndex = state.all.findIndex(p => p.id === action.projectId)
      project = state.all[projectIndex]
      newState = null
      console.log("adding fs to project", state.all[projectIndex]);


      // if project's deployment array is undefined, add it
      if(!project.deployments) {
        console.log('adding new fs array');
        newState = update(state, {all: {[projectIndex]: {$merge: {deployments: []}}}})
      }

      // add new empty feed source to feedSources array
      deployment = {
        isCreating: true,
        name: '',
        project: project
      }
      return update(newState || state, {all: {[projectIndex]: {deployments: {$unshift: [deployment]}}}})

    case 'REQUEST_PROJECTS':
      return update(state, { isFetching: { $set: true }})

    case 'RECEIVE_PROJECTS':
      activeProjectId = state.active ? state.active.id : DT_CONFIG.application.active_project
      activeIndex = action.projects.findIndex(p => p.id === activeProjectId)
      return {
        isFetching: false,
        all: action.projects,
        active: activeIndex !== -1 ? action.projects[activeIndex] : null,
        filter: {
          searchText: null
        }
      }
    case 'SET_ACTIVE_PROJECT':
      return update(state, { active: { $set: action.project }})
    case 'RECEIVE_PROJECT':
      if (!state.all) { // there are no current projects loaded
        projects = [action.project]
      } else { // projects already loaded
        projectIndex = state.all.findIndex(p => p.id === action.project.id)
        if (projectIndex === -1) { // projects loaded but not this one; add it
          projects = [
            ...state.all,
            action.project
          ]
        } else { // projects loaded including this one, replace it
          projects = [
            ...state.all.slice(0, projectIndex),
            action.project,
            ...state.all.slice(projectIndex + 1)
          ]
        }
      }
      activeProjectId = state.active ? state.active.id : DT_CONFIG.application.active_project
      activeProject = action.project.id === activeProjectId ? action.project : null
      if (state.active && !activeProject) { // active project already exists and received project does not match active project
        activeProject = state.active
      }
      return update(state, {active: { $set: activeProject }, all: { $set: projects }})

    case 'RECEIVE_FEEDSOURCES':
      projectIndex = state.all.findIndex(p => p.id === action.projectId)
      if (state.active && action.projectId === state.active.id) {
        return update(state,
        {
          active: {$merge: {feedSources: action.feedSources}},
          all: {
            [projectIndex]: {$merge: {feedSources: action.feedSources}}
          }
        })
      } else { // if projectId does not match active project
        return update(state,
          {
            all: {
              [projectIndex]: {$merge: {feedSources: action.feedSources}}
            }
          }
        )
      }

    case 'RECEIVE_FEEDSOURCE':
      projectIndex = state.all.findIndex(p => p.id === action.feedSource.projectId)
      let existingSources = state.all[projectIndex].feedSources || [], updatedSources
      sourceIndex = existingSources.findIndex(s => s.id === action.feedSource.id)
      if (sourceIndex === -1) { // source does not currently; add it
        updatedSources = [
          ...existingSources,
          action.feedSource
        ]
      } else { // existing feedsource array includes this one, replace it
        updatedSources = [
          ...existingSources.slice(0, sourceIndex),
          action.feedSource,
          ...existingSources.slice(sourceIndex + 1)
        ]
      }
      return update(state,
        {all:
          {[projectIndex]:
            {$merge: {feedSources: updatedSources}}
          }
        }
      )

    case 'RECEIVE_FEEDVERSIONS':
      projectIndex = state.all.findIndex(p => p.id === action.feedSource.projectId)
      sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.feedSource.id)
      return update(state,
        {all:
          {[projectIndex]:
            {feedSources:
              {[sourceIndex]:
                {$merge: {feedVersions: action.feedVersions}}
              }
            }
          }
        }
      )

    case 'RECEIVE_VALIDATION_RESULT':
      projectIndex = state.all.findIndex(p => p.id === action.feedSource.projectId)
      sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.feedSource.id)
      versionIndex = state.all[projectIndex].feedSources[sourceIndex].feedVersions.findIndex(v => v.id === action.feedVersion.id)
      // let result = {}
      // action.validationResult.map(error => {
      //   if (!result[error.file]) {
      //     result[error.file] = []
      //   }
      //   result[error.file].push(error)
      // })
      return update(state,
        {all:
          {[projectIndex]:
            {feedSources:
              {[sourceIndex]:
                {feedVersions:
                  {[versionIndex]:
                    {$merge: {validationResult: action.validationResult}}
                  }
                }
              }
            }
          }
        }
      )
    case 'RECEIVE_FEEDVERSION_ISOCHRONES':
      projectIndex = state.all.findIndex(p => p.id === action.feedSource.projectId)
      sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.feedSource.id)
      versionIndex = state.all[projectIndex].feedSources[sourceIndex].feedVersions.findIndex(v => v.id === action.feedVersion.id)
      return update(state,
        {all:
          {[projectIndex]:
            {feedSources:
              {[sourceIndex]:
                {feedVersions:
                  {[versionIndex]:
                    {$merge: {isochrones: action.isochrones}}
                  }
                }
              }
            }
          }
        }
      )

      case 'RECEIVE_DEPLOYMENTS':
        projectIndex = state.all.findIndex(p => p.id === action.projectId)
        if (state.active && action.projectId === state.active.id) {
          return update(state,
          {
            active: {$merge: {deployments: action.deployments}},
            all: {
              [projectIndex]: {$merge: {deployments: action.deployments}}
            }
          })
        } else { // if projectId does not match active project
          return update(state,
            {
              all: {
                [projectIndex]: {$merge: {deployments: action.deployments}}
              }
            }
          )
        }

      case 'RECEIVE_DEPLOYMENT':
        projectIndex = state.all.findIndex(p => p.id === action.deployment.project.id)
        let existingDeployments = state.all[projectIndex].deployments || [], updatedDeployments
        sourceIndex = existingDeployments.findIndex(s => s.id === action.deployment.id)
        if (sourceIndex === -1) { // source does not currently; add it
          updatedDeployments = [
            ...existingDeployments,
            action.deployment
          ]
        } else { // existing feedsource array includes this one, replace it
          updatedDeployments = [
            ...existingDeployments.slice(0, sourceIndex),
            action.deployment,
            ...existingDeployments.slice(sourceIndex + 1)
          ]
        }
        return update(state,
          {all:
            {[projectIndex]:
              {$merge: {deployments: updatedDeployments}}
            }
          }
        )

    case 'RECEIVE_NOTES_FOR_FEEDSOURCE':
      projectIndex = state.all.findIndex(p => p.id === action.feedSource.projectId)
      sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.feedSource.id)
      return update(state,
        {all:
          {[projectIndex]:
            {feedSources:
              {[sourceIndex]:
                {$merge: {notes: action.notes}}
              }
            }
          }
        }
      )

    case 'RECEIVE_NOTES_FOR_FEEDVERSION':
      projectIndex = state.all.findIndex(p => p.id === action.feedVersion.feedSource.projectId)
      sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.feedVersion.feedSource.id)
      versionIndex = state.all[projectIndex].feedSources[sourceIndex].feedVersions.findIndex(v => v.id === action.feedVersion.id)
      return update(state,
        {all:
          {[projectIndex]:
            {feedSources:
              {[sourceIndex]:
                {feedVersions:
                  {[versionIndex]:
                    {$merge: {notes: action.notes}}
                  }
                }
              }
            }
          }
        }
      )

    default:
      return state
  }
}

export default projects
