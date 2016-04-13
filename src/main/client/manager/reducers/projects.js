import update from 'react-addons-update'

const projects = (state = {
  isFetching: false,
  all: null,
  active: null
}, action) => {
  let projects, sources, projectIndex, sourceIndex, versionIndex, activeProject, activeIndex, feeds
  switch (action.type) {
    case 'CREATE_PROJECT':
      projects = [{
        isCreating: true,
        name: ''
      }, ...state.all]
      return update(state, { all: { $set: projects }})

    case 'CREATE_FEEDSOURCE':
        projectIndex = state.all.findIndex(p => p.id === action.projectId)
        const project = state.all[projectIndex]
        let newState = null
        console.log("adding fs to project", state.all[projectIndex]);


        // if project's feedSources array is undefined, add it
        if(!project.feedSources) {
          console.log('adding new fs array');
          newState = update(state, {all: {[projectIndex]: {$merge: {feedSources: []}}}})
        }

        // add new empty feed source to feedSources array
        const feedSource = {
          isCreating: true,
          name: ''
        }
        return update(newState || state, {all: {[projectIndex]: {feedSources: {$unshift: [feedSource]}}}})

    case 'REQUEST_PROJECTS':
      return update(state, { isFetching: { $set: true }})

    case 'RECEIVE_PROJECTS':
      activeIndex = action.projects.findIndex(p => p.id === DT_CONFIG.modules.alerts.active_project)
      return {
        isFetching: false,
        all: action.projects,
        active: activeIndex !== -1 ? action.projects[activeIndex] : null
      }

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
      activeProject = action.project.id === DT_CONFIG.modules.alerts.active_project ? action.project : null
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
      let existingSources = state.all[projectIndex].feedSources, updatedSources
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

    default:
      return state
  }
}

export default projects
