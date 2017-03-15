import { connect } from 'react-redux'

import GtfsFilter from '../components/GtfsFilter'
import { addActiveFeed,
  removeActiveFeed,
  addAllActiveFeeds,
  removeAllActiveFeeds,
  updateGtfsFilter,
  updatePermissionFilter
} from '../actions/filter'

const mapStateToProps = (state, ownProps) => {
  return {
    activeFeeds: state.gtfs.filter.activeFeeds,
    allFeeds: state.gtfs.filter.allFeeds,
    loadedFeeds: state.gtfs.filter.loadedFeeds,
    user: state.user,
    project: state.projects.active
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      let filter = initialProps.permissionFilter || 'view-feed'
      dispatch(updatePermissionFilter(filter))
      if (initialProps.project && initialProps.user) {
        dispatch(updateGtfsFilter(initialProps.project, initialProps.user))
      }
    },
    onAddFeed: (feed) => dispatch(addActiveFeed(feed)),
    onRemoveFeed: (feed) => dispatch(removeActiveFeed(feed)),
    onAddAllFeeds: () => dispatch(addAllActiveFeeds()),
    onRemoveAllFeeds: () => dispatch(removeAllActiveFeeds())
  }
}

const GlobalGtfsFilter = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsFilter)

export default GlobalGtfsFilter
