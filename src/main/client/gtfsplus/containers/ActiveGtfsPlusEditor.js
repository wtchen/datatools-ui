import { connect } from 'react-redux'

import GtfsPlusEditor  from '../components/GtfsPlusEditor'
import { fetchFeedSourceAndProject } from '../../manager/actions/feeds'
import {
  addGtfsPlusRow,
  updateGtfsPlusField,
  deleteGtfsPlusRow,
  uploadGtfsPlusFeed,
  downloadGtfsPlusFeed,
  importGtfsPlusFromGtfs
} from '../actions/gtfsplus'

const mapStateToProps = (state, ownProps) => {

  let feedSourceId = ownProps.routeParams.feedSourceId
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

  return {
    tableData: state.gtfsplus.tableData,
    feedSource,
    project,
    user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
  return {
    onComponentMount: (initialProps) => {
      dispatch(fetchFeedSourceAndProject(feedSourceId))

      if(initialProps.location.query.version) { // init from a full GTFS feed
        console.log();
        dispatch(importGtfsPlusFromGtfs(initialProps.location.query.version))

      } else { // download the latest saved GTFS+
        dispatch(downloadGtfsPlusFeed(feedSourceId))
      }
    },
    newRowClicked: (tableId) => {
      dispatch(addGtfsPlusRow(tableId))
    },
    deleteRowClicked: (tableId, rowIndex) => {
      dispatch(deleteGtfsPlusRow(tableId, rowIndex))
    },
    fieldEdited: (tableId, rowIndex, fieldName, newValue) => {
      dispatch(updateGtfsPlusField(tableId, rowIndex, fieldName, newValue))
    },
    feedSaved: (file) => {
      console.log('dispatching upload');
      dispatch(uploadGtfsPlusFeed(feedSourceId, file))
    }
  }
}

const ActiveGtfsPlusEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsPlusEditor)

export default ActiveGtfsPlusEditor
