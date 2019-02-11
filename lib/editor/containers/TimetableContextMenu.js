// @flow

import {connect} from 'react-redux'

import {closeTimetableContextMenu} from '../actions/trip'
import ContextMenu from '../components/timetable/ContextMenu'

import type {AppState} from '../../types/reducers'

type Props = {}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    menuState: state.editor.timetable.contextMenu
  }
}

const mapDispatchToProps = {
  closeTimetableContextMenu
}

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu)
