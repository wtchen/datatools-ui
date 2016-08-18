import { connect } from 'react-redux'
import UserHomePage from '../components/UserHomePage'
import { getRecentActivity } from '../actions/user'

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (props) => { dispatch(getRecentActivity(props.user)) }
  }
}

const ActiveUserHomePage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHomePage)

export default ActiveUserHomePage
