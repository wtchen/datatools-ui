import { connect } from 'react-redux'

import { fetchFeed } from '../../../../gtfs/actions/feed'
import FeedLayout from '../components/FeedLayout'

const mapStateToProps = (state, ownProps) => {
  return {
    feed: state.gtfs.feed
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedId = ownProps.version.id.replace('.zip', '')
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.feed.fetchStatus.fetched) {
        dispatch(fetchFeed(feedId))
      }
    }
  }
}

const Feed = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedLayout)

export default Feed
