import omit from 'lodash/omit'
import React, {Component, PropTypes} from 'react'

export default class ClickOutside extends Component {
  static propTypes = {
    handleEscape: PropTypes.bool,
    onClickOutside: PropTypes.func.isRequired
  }

  static defaultProps = {
    handleEscape: true
  }

  render () {
    const {children, ...props} = this.props
    return <div
      {...(omit(props, Object.keys(ClickOutside.propTypes)))}
      ref={(ref) => { this.container = ref }}
      >{children}
    </div>
  }

  componentDidMount () {
    document.addEventListener('click', this.handle, true)
    document.addEventListener('keydown', this.handleKeyDown, true)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handle, true)
    document.removeEventListener('keydown', this.handleKeyDown, true)
  }

  handle = (e) => {
    const {onClickOutside} = this.props
    const el = this.container
    if (!el.contains(e.target)) onClickOutside(e)
  }

  handleKeyDown = (e) => {
    const {handleEscape, onClickOutside} = this.props
    if (handleEscape && e.keyCode === 27) onClickOutside(e)
  }
}
