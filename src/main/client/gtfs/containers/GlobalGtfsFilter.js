import React from 'react'
import { connect } from 'react-redux'

import GtfsFilter from '../components/GtfsFilter'

import { addActiveFeed, removeActiveFeed, addAllActiveFeeds,
  removeAllActiveFeeds, setPermissionFilter, updateGtfsFilter } from '../actions/gtfsFilter'

const mapStateToProps = (state, ownProps) => {
  return {
    activeFeeds: state.gtfsFilter.activeFeeds,
    allFeeds: state.gtfsFilter.allFeeds,
    loadedFeeds: state.gtfsFilter.loadedFeeds,
    user: state.user,
    project: state.projects.active
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      let filter = initialProps.permissionFilter || 'view-feed'
      dispatch(setPermissionFilter(filter))
      if (initialProps.project && initialProps.user)
        dispatch(updateGtfsFilter(initialProps.project, initialProps.user))
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
