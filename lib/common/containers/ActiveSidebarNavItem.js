// @flow

import { connect } from 'react-redux'

import SidebarNavItem, {type Props} from '../components/SidebarNavItem'

import type {AppState} from '../../types/reducers'

type PropsFromState = {
  expanded: boolean
}

const mapStateToProps = (
  state: AppState,
  ownProps: $Diff<Props, PropsFromState>
) => {
  return {
    expanded: state.ui.sidebarExpanded
  }
}

const mapDispatchToProps = {}

var ActiveSidebarNavItem = connect(
  mapStateToProps,
  mapDispatchToProps
)(SidebarNavItem)

export default ActiveSidebarNavItem
