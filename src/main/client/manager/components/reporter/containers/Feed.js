import React from 'react'
import { connect } from 'react-redux'

import { fetchFeed } from '../../../../gtfs/actions/feed'
import FeedLayout from '../components/FeedLayout'


const mapStateToProps = (state, ownProps) => {
  return {
    feed: state.feed
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      console.log('feed mount')
      if(!initialProps.feed.fetchStatus.fetched) {
        console.log('do dispatch fetch feed')
        dispatch(fetchFeed())
      }
    }
  }
}

const Feed = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedLayout)

export default Feed
