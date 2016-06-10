import { connect } from 'react-redux'

import GtfsEditor  from '../components/GtfsEditor'
import { fetchFeedSourceAndProject, fetchFeedVersion } from '../../manager/actions/feeds'
import {
  addGtfsRow,
  updateGtfsField,
  deleteGtfsRow,
  saveGtfsRow,
  getGtfsTable,
  uploadGtfsFeed,
  downloadGtfsFeed,
  importGtfsFromGtfs,
  loadGtfsEntities,
  receiveGtfsEntities
} from '../actions/editor'

const mapStateToProps = (state, ownProps) => {
  console.log(ownProps)
  const feedSourceId = ownProps.routeParams.feedSourceId
  const feedVersionId = ownProps.routeParams.feedVersionId
  const activeComponent = ownProps.routeParams.subpage
  const activeEntity = ownProps.routeParams.entity
  const tableView = ownProps.location.query && ownProps.location.query.table === 'true'
  let user = state.user
  // find the containing project
  let project = state.projects.all
    ? state.projects.all.find(p => {
        if (!p.feedSources) return false
        return (p.feedSources.findIndex(fs => fs.id === feedSourceId) !== -1)
      })
    : null

  let feedSource
  if (project) {
    feedSource = project.feedSources.find(fs => fs.id === feedSourceId)
  }
  let version
  if (feedSource && feedSource.feedVersions) {
    version = feedSource.feedVersions.find(v => v.id === feedVersionId)
  }

  return {
    tableData: state.editor.tableData,
    // gtfsEntityLookup: state.editor.gtfsEntityLookup,
    // validation: state.editor.validation,
    // currentTable: state.routing.locationBeforeTransitions.hash ? state.routing.locationBeforeTransitions.hash.split('#')[1] : 'agency',
    feedSource,
    tableView,
    version,
    project,
    user,
    activeComponent,
    activeEntity
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
  const feedVersionId = ownProps.routeParams.feedVersionId
  const activeComponent = ownProps.routeParams.subpage

  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.feedSource) {
        dispatch(fetchFeedSourceAndProject(feedSourceId))
        .then((fs) => {
          dispatch(fetchFeedVersion(feedVersionId))
        })
      }
      if (activeComponent) {
        console.log(activeComponent)
        dispatch(getGtfsTable(activeComponent, feedSourceId))
      }
      // if(!initialProps.version) dispatch(fetchFeedVersion(feedVersionId))
      // if(!initialProps.tableData) dispatch(downloadGtfsFeed(feedVersionId))
      // if (initialProps.currentTable) dispatch(getGtfsTable(initialProps.currentTable, feedSourceId))
    },
    newRowClicked: (tableId) => {
      dispatch(addGtfsRow(tableId))
    },
    deleteRowClicked: (tableId, rowIndex) => {
      dispatch(deleteGtfsRow(tableId, rowIndex))
    },
    getGtfsTable: (tableId, feedId) => {
      dispatch(getGtfsTable(tableId, feedId))
    },
    saveRowClicked: (tableId, rowIndex, feedId) => {
      dispatch(saveGtfsRow(tableId, rowIndex, feedId))
    },
    fieldEdited: (tableId, rowIndex, fieldName, newValue) => {
      dispatch(updateGtfsField(tableId, rowIndex, fieldName, newValue))
    },
    feedSaved: (file) => {
      dispatch(uploadGtfsFeed(feedVersionId, file))
      .then(() => {
        console.log('re-downloading');
        dispatch(downloadGtfsFeed(feedVersionId))
      })
    },
    newRowsDisplayed: (tableId, rows, feedSource) => {
      if(feedSource) dispatch(loadGtfsEntities(tableId, rows, feedSource))
    },
    gtfsEntitySelected: (type, entity) => {
      dispatch(receiveGtfsEntities([entity]))
    }
  }
}

const ActiveGtfsEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsEditor)

export default ActiveGtfsEditor
