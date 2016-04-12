import { connect } from 'react-redux'

import GtfsPlusEditor  from '../components/GtfsPlusEditor'
import { fetchFeedSourceAndProject } from '../../manager/actions/feeds'
import { addGtfsPlusRow, updateGtfsPlusField, deleteGtfsPlusRow } from '../actions/gtfsplus'

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
    },
    newRowClicked: (tableId) => {
      dispatch(addGtfsPlusRow(tableId))
    },
    deleteRowClicked: (tableId, rowIndex) => {
      dispatch(deleteGtfsPlusRow(tableId, rowIndex))
    },
    fieldEdited: (tableId, rowIndex, fieldName, newValue) => {
      dispatch(updateGtfsPlusField(tableId, rowIndex, fieldName, newValue))
    }
  }
}

const ActiveGtfsPlusEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsPlusEditor)

export default ActiveGtfsPlusEditor
