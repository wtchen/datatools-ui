// @flow

import { connect } from 'react-redux'

import SignupPage from '../components/SignupPage'
import { createPublicUser } from '../../manager/actions/user'

import type {AppState, RouterProps} from '../../types/reducers'

export type Props = RouterProps

const mapStateToProps = (state: AppState, ownProps: Props) => ({})

const mapDispatchToProps = {
  createPublicUser
}

const ActiveUserAccount = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignupPage)

export default ActiveUserAccount
