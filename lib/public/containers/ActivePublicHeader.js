// @flow

import { connect } from 'react-redux'

import PublicHeader from '../components/PublicHeader'

import { logout } from '../../manager/actions/user'
import { getConfigProperty } from '../../common/util/config'

import type {AppState} from '../../types/reducers'

export type Props = {}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    title: getConfigProperty('application.title'),
    managerUrl: '/project',
    editorUrl: null,
    userAdminUrl: null,
    alertsUrl: null,
    signConfigUrl: null,
    username: state.user.profile ? state.user.profile.email : null,
    userPicture: state.user.profile ? state.user.profile.picture : null
  }
}

const mapDispatchToProps = {
  logout
}

const ActivePublicHeader = connect(
  mapStateToProps,
  mapDispatchToProps
)(PublicHeader)

export default ActivePublicHeader
