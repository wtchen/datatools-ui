// @flow

import omit from 'lodash/omit'
import * as React from 'react'

type Props = {
  children: React.Node,
  handleEscape: boolean,
  onClickOutside: (MouseEvent | KeyboardEvent) => void
}

export default class ClickOutside extends React.Component<Props> {
  container = null

  static defaultProps = {
    handleEscape: true
  }

  componentDidMount () {
    document.addEventListener('click', this.handle, true)
    document.addEventListener('keydown', this.handleKeyDown, true)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handle, true)
    document.removeEventListener('keydown', this.handleKeyDown, true)
  }

  handle = (e: MouseEvent) => {
    const {onClickOutside} = this.props
    const el = this.container
    // $FlowFixMe
    if (!el.contains(e.target)) onClickOutside(e)
  }

  handleKeyDown = (e: KeyboardEvent) => {
    const {handleEscape, onClickOutside} = this.props
    if (handleEscape && e.keyCode === 27) onClickOutside(e)
  }

  render () {
    const {children, ...props} = this.props
    return <div
      {...(omit(props, Object.keys(ClickOutside.propTypes)))}
      ref={(ref) => { this.container = ref }}>
      {children}
    </div>
  }
}
