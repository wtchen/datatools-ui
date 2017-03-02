import {Component, PropTypes} from 'react'

export default class Title extends Component {
  static propTypes = {
    children: PropTypes.string.isRequired
  }

  componentWillMount () {
    console.log('setting title from', document.title, 'to', this.props.children)
    this.oldTitle = document.title
    document.title = this.props.children
  }

  componentWillUnmount () {
    document.title = this.oldTitle
  }

  shouldComponentUpdate (nextProps) {
    console.log('updating title', this.props.children, nextProps.children)
    if (nextProps.children !== this.props.children) {
      document.title = nextProps.children
    }

    return false
  }

  render () {
    return null
  }
}
