import {Component, PropTypes} from 'react'

export default class Title extends Component {
  static propTypes = {
    children: PropTypes.string.isRequired
  }

  componentWillMount () {
    this.oldTitle = document.title
    document.title = this.props.children
  }

  componentWillUnmount () {
    document.title = this.oldTitle
  }

  shouldComponentUpdate (nextProps) {
    if (nextProps.children !== this.props.children) {
      document.title = nextProps.children
    }

    return false
  }

  render () {
    return null
  }
}
