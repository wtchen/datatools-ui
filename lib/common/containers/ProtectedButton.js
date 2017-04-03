import React, {PropTypes, Component} from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

class ProtectedButton extends Component {
  static propTypes = {
    user: PropTypes.object
  }
  render () {
    // const {user} = this.props
    // const disabled = user.permissions
    return (
      <Button {...this.props}>
        {this.props.title || ''}
      </Button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  console.log(ownProps)
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProtectedButton)
