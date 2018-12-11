// @flow

import {connect} from 'react-redux'

import GtfsPlusVersionSummary from '../components/GtfsPlusVersionSummary'

import {downloadGtfsPlusFeed, publishGtfsPlusFeed} from '../actions/gtfsplus'

import type {FeedVersion} from '../../types'
import type {AppState} from '../../types/reducers'

export type Props = {
  version: FeedVersion
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    gtfsplus: state.gtfsplus,
    user: state.user
  }
}

const mapDispatchToProps = {
  downloadGtfsPlusFeed,
  publishGtfsPlusFeed
}

const ActiveGtfsPlusVersionSummary = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsPlusVersionSummary)

export default ActiveGtfsPlusVersionSummary
