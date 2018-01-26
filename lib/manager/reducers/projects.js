import update from 'react-addons-update'
import {getConfigProperty} from '../../common/util/config'
import {defaultSorter} from '../../common/util/util'

const defaultState = {
  isFetching: false,
  all: null,
  active: null,
  filter: {
    searchText: null
  }
}

// FIXME Use handleActions to simplify reducer syntax
const projects = (state = defaultState, action) => {
  // let projects, projectIndex, sourceIndex, versionIndex, activeProject, activeIndex, feeds, activeProjectId, project, newState, deployment
  switch (action.type) {
    case 'SET_PROJECT_VISIBILITY_SEARCH_TEXT':
      return update(state, {filter: {searchText: {$set: action.text}}})
    case 'SET_PROJECT_VISIBILITY_FILTER':
      return update(state, {filter: {filter: {$set: action.filter}}})
    case 'CREATE_PROJECT': {
      const projects = [{
        isCreating: true,
        name: '',
        ...action.payload
      }, ...state.all]
      return update(state, { all: { $set: projects } })
    }
    case 'CREATE_FEEDSOURCE': {
      const {projectIndex} = state.all.findIndex(p => p.id === action.projectId)
      const project = state.all[projectIndex]
      let newState = null
      // console.log('adding fs to project', state.all[projectIndex])

      // if project's feedSources array is undefined, add it
      if (!project.feedSources) {
        // console.log('adding new fs array')
        newState = update(state, {all: {[projectIndex]: {$merge: {feedSources: []}}}})
      }

      // add new empty feed source to feedSources array
      const feedSource = {
        isCreating: true,
        name: '',
        projectId: project.id
      }
      return update(newState || state, {
        all: {[projectIndex]: {feedSources: {$unshift: [feedSource]}}}
      })
    }
    case 'CREATE_DEPLOYMENT': {
      const projectIndex = state.all.findIndex(p => p.id === action.projectId)
      const project = state.all[projectIndex]
      let newState
      // if project's deployment array is undefined, add it
      if (!project.deployments) {
        newState = update(state, {
          all: {[projectIndex]: {$merge: {deployments: []}}}
        })
      }
      // add new empty feed source to feedSources array
      const deployment = {
        isCreating: true,
        name: '',
        project: project
      }
      return update(newState || state, {
        all: {[projectIndex]: {deployments: {$unshift: [deployment]}}}
      })
    }
    case 'REQUESTING_FEEDSOURCE':
    case 'REQUESTING_FEEDSOURCES':
    case 'REQUEST_PROJECTS': {
      return update(state, { isFetching: { $set: true } })
    }
    case 'RECEIVE_PROJECTS': {
      const activeProjectId = state.active
        ? state.active.id
        : getConfigProperty('application.active_project')
      let activeIndex = action.payload.findIndex(p => p.id === activeProjectId)
      if (activeIndex === -1) {
        activeIndex = 0
      }
      return {
        isFetching: false,
        all: action.payload,
        active: action.payload[activeIndex] && action.payload[activeIndex].id,
        filter: {
          searchText: null
        }
      }
    }
    case 'SET_ACTIVE_PROJECT': {
      return update(state, {
        active: { $set: action.payload && action.payload.id }
      })
    }
    // case 'DELETED_PROJECT':
    //   projectIndex = state.all.findIndex(p => p.id === action.payload.id)
    //   return update(state, {
    //     active: { $set: activeProject }, all: { splice: projects }
    //   })
    case 'RECEIVE_PROJECT': {
      let projects, projectIndex
      if (!action.payload) {
        return state
      }
      if (!state.all) {
        // there are no current projects loaded
        projects = [action.payload]
      } else {
        // projects already loaded
        projectIndex = state.all.findIndex(p => p.id === action.payload.id)
        if (projectIndex === -1) {
          // projects loaded but not this one; add it
          projects = [
            ...state.all,
            action.payload
          ]
        } else {
          // FIXME: Use $splice
          // projects loaded including this one, replace it
          projects = [
            ...state.all.slice(0, projectIndex),
            action.payload,
            ...state.all.slice(projectIndex + 1)
          ]
        }
      }
      const activeProjectId = state.active
        ? state.active.id
        : getConfigProperty('application.active_project')
      let activeProject = action.project.id === activeProjectId
        ? action.payload
        : null
      if (state.active && !activeProject) {
        // Active project already exists and received project does not match
        // active project.
        activeProject = state.active
      }
      return update(state, {active: { $set: activeProject }, all: { $set: projects }})
    }
    case 'RECEIVE_FEEDSOURCES': {
      const projectIndex = state.all.findIndex(p => p.id === action.projectId)
      let sourceIndex, feeds
      // If lazy fetching the rest of the feed sources, don't overwrite current
      // feed source.
      if (
        state.all[projectIndex] &&
        state.all[projectIndex].feedSources &&
        state.all[projectIndex].feedSources.length === 1
      ) {
        sourceIndex = action.feedSources
          .findIndex(fs => fs.id === state.all[projectIndex].feedSources[0].id)
        action.feedSources.splice(sourceIndex, 1)
        feeds = [
          ...state.all[projectIndex].feedSources,
          ...action.feedSources
        ]
      } else {
        feeds = action.feedSources
      }
      feeds = feeds.sort(defaultSorter)
      if (state.active && action.projectId === state.active.id) {
        return update(state, {
          isFetching: {$set: false},
          active: {$merge: {feedSources: feeds}},
          all: {
            [projectIndex]: {$merge: {feedSources: feeds}}
          }
        })
      } else if (feeds.length) {
        // If projectId does not match active project
        return update(state, {
          isFetching: {$set: false},
          all: {
            [projectIndex]: {$merge: {feedSources: feeds}}
          }
        })
      } else {
        return update(state, {isFetching: {$set: false}})
      }
    }
    case 'RECEIVE_FEEDSOURCE': {
      if (!action.feedSource) {
        return update(state, {isFetching: {$set: false}})
      }
      const projectIndex = state.all.findIndex(p => p.id === action.feedSource.projectId)
      const existingSources = state.all[projectIndex].feedSources || []
      const sourceIndex = existingSources.findIndex(s => s.id === action.feedSource.id)
      const updatedSources = sourceIndex !== -1
        ? {[sourceIndex]: {$set: action.feedSource}}
        : {$set: [action.feedSource]}
      return update(state, {
        all: {
          [projectIndex]: {
            feedSources: updatedSources
          }
        },
        isFetching: { $set: false }
      })
    }
    case 'RECEIVE_FEEDVERSIONS': {
      const projectIndex = state.all.findIndex(p => p.id === action.feedSource.projectId)
      const sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.feedSource.id)
      const versionSort = (a, b) => {
        if (a.version < b.version) return -1
        if (a.version > b.version) return 1
        return 0
      }
      return update(state, {
        all: {[projectIndex]: {feedSources: {[sourceIndex]: {$merge: {
          feedVersions: action.feedVersions.sort(versionSort)
        }}}}}
      })
    }
    case 'RECEIVE_FEEDVERSION': {
      const projectIndex = state.all.findIndex(p => p.id === action.feedVersion.feedSource.projectId)
      const sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.feedVersion.feedSource.id)
      // console.log(sourceIndex)
      const versionIndex = state.all[projectIndex].feedSources[sourceIndex].feedVersions
        ? state.all[projectIndex].feedSources[sourceIndex].feedVersions.findIndex(v => v.id === action.feedVersion.id)
        : -1
      const updatedVersions = versionIndex !== -1
        ? {[versionIndex]: {$set: action.feedVersion}}
        : {$set: [action.feedVersion]}
      return update(state, {
        all: {[projectIndex]: {feedSources: {[sourceIndex]: {
          feedVersions: updatedVersions
        }}}}
      })
    }
    case 'PUBLISHED_FEEDVERSION': {
      const projectIndex = state.all.findIndex(p => p.id === action.feedVersion.feedSource.projectId)
      const sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.feedVersion.feedSource.id)
      return update(state, {
        all: {[projectIndex]: {feedSources: {[sourceIndex]: {
          publishedVersionId: {$set: action.feedVersion.id}
        }}}}
      })
    }
    case 'RECEIVE_VALIDATION_RESULT': {
      const projectIndex = state.all.findIndex(p => p.id === action.payload.feedVersion.feedSource.projectId)
      const sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.payload.feedVersion.feedSource.id)
      const versionIndex = state.all[projectIndex].feedSources[sourceIndex].feedVersions.findIndex(v => v.id === action.payload.feedVersion.id)
      // let result = {}
      // action.validationResult.map(error => {
      //   if (!result[error.file]) {
      //     result[error.file] = []
      //   }
      //   result[error.file].push(error)
      // })
      return update(state, {
        all: {[projectIndex]: {feedSources: {[sourceIndex]: {feedVersions: {
          [versionIndex]: {$merge: {validationResult: action.payload.validationResult}
          }}}}}}
      })
    }
    case 'RECEIVE_VALIDATION_ERRORS': {
      const projectIndex = state.all.findIndex(p => p.id === action.payload.feedVersion.feedSource.projectId)
      const sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.payload.feedVersion.feedSource.id)
      const versionIndex = state.all[projectIndex].feedSources[sourceIndex].feedVersions.findIndex(v => v.id === action.payload.feedVersion.id)
      const errorIndex = state.all[projectIndex].feedSources[sourceIndex].feedVersions[versionIndex].validationResult.error_counts.findIndex(e => e.type === action.payload.errorType)
      const newErrors = state.all[projectIndex].feedSources[sourceIndex].feedVersions[versionIndex].validationResult.error_counts[errorIndex].errors
        ? {$push: action.payload.errors}
        : {$set: action.payload.errors}
      return update(state, {
        all: {[projectIndex]: {feedSources: {[sourceIndex]: {feedVersions: {
          [versionIndex]: {validationResult: {error_counts: {
            [errorIndex]: {errors: newErrors}
          }}}}}}}
        }
      })
    }
    case 'RECEIVE_FEEDVERSION_ISOCHRONES': {
      const projectIndex = state.all.findIndex(p => p.id === action.feedSource.projectId)
      const sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.feedSource.id)
      const versionIndex = state.all[projectIndex].feedSources[sourceIndex].feedVersions.findIndex(v => v.id === action.feedVersion.id)
      const { fromLat, fromLon, date, fromTime, toTime } = action
      action.isochrones.properties = { fromLat, fromLon, date, fromTime, toTime }
      action.isochrones.features = action.isochrones && action.isochrones.features
        ? action.isochrones.features.map(f => {
          f.type = 'Feature'
          return f
        })
        : null
      return update(state, {
        all: {[projectIndex]: {feedSources: {[sourceIndex]: {feedVersions: {
          [versionIndex]: {$merge: {isochrones: action.isochrones
          }}}}}}}
      })
    }
    case 'RECEIVE_DEPLOYMENTS': {
      const projectIndex = state.all.findIndex(p => p.id === action.projectId)
      if (state.active && action.projectId === state.active.id) {
        return update(state, {
          active: {$merge: {deployments: action.deployments}},
          all: {[projectIndex]: {$merge: {deployments: action.deployments}}}
        })
      } else {
        // if projectId does not match active project
        return update(state, {
          all: {[projectIndex]: {$merge: {deployments: action.deployments}}}
        })
      }
    }
    case 'RECEIVE_DEPLOYMENT': {
      const projectIndex = state.all
        .findIndex(p => p.id === action.deployment.project.id)
      const existingDeployments = state.all[projectIndex].deployments || []
      let updatedDeployments
      const sourceIndex = existingDeployments
        .findIndex(s => s.id === action.deployment.id)
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
      return update(state, {
        all: {[projectIndex]: {$merge: {deployments: updatedDeployments}}}
      })
    }
    case 'RECEIVE_NOTES_FOR_FEEDSOURCE': {
      const projectIndex = state.all.findIndex(p => p.id === action.feedSource.projectId)
      const sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.feedSource.id)
      const {notes} = action
      return update(state, {
        all: {[projectIndex]: {feedSources: {[sourceIndex]: {$merge: {notes}}}}}
      })
    }
    case 'RECEIVE_NOTES_FOR_FEEDVERSION': {
      const projectIndex = state.all.findIndex(p => p.id === action.feedVersion.feedSource.projectId)
      const sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.feedVersion.feedSource.id)
      const versionIndex = state.all[projectIndex].feedSources[sourceIndex].feedVersions.findIndex(v => v.id === action.feedVersion.id)
      return update(state, {all: {
        [projectIndex]: {feedSources: {[sourceIndex]: {feedVersions: {
          [versionIndex]: {$merge: {notes: action.notes}
          }}}}}}
      })
    }
    case 'RECEIVE_GTFSEDITOR_SNAPSHOTS': {
      const projectIndex = state.all.findIndex(p => p.id === action.payload.feedSource.projectId)
      const sourceIndex = state.all[projectIndex].feedSources.findIndex(s => s.id === action.payload.feedSource.id)
      return update(state, {
        all: {
          [projectIndex]: {
            feedSources: {
              [sourceIndex]: {
                $merge: {
                  editorSnapshots: action.payload.snapshots
                }
              }
            }
          }
        }
      })
    }
    default:
      return state
  }
}

// TODO: Use this function to get indexes (perhaps set to idx variable?)
// function getIndexesFromFeed ({state, feedVersion, feedSource, projectId}) {
//   if (!feedSource && feedVersion) ({feedSource} = feedVersion)
//   if (!projectId) ({projectId} = feedSource)
//   const projectIndex = state.all.findIndex(p => p.id === projectId)
//   const sources = state.all[projectIndex].feedSources || []
//   const sourceIndex = feedSource && sources.findIndex(s => s.id === feedSource.id)
//   const versionIndex = feedVersion && sources[sourceIndex].feedVersions
//     ? sources[sourceIndex].feedVersions.findIndex(v => v.id === feedVersion.id)
//     : -1
//   return {
//     projectIndex,
//     sourceIndex,
//     versionIndex
//   }
// }

export default projects
