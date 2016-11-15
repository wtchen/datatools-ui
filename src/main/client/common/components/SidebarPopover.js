import {Icon, Pure} from '@conveyal/woonerf'
import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {Popover} from 'react-bootstrap'

export default class SidebarPopover extends Pure {
  static propTypes = {
    children: PropTypes.node,
    expanded: PropTypes.bool,
    target: PropTypes.object,
    title: PropTypes.string,
    close: PropTypes.func,
    visible: PropTypes.bool.isRequired
  }

  state = {
    top: 0,
    arrowOffset: 0
  }
  _onResize = () => {
    this.setState({width: window.innerWidth, height: window.innerHeight})
  }
  componentWillMount () {
    this._onResize()
  }
  componentDidMount () {
    window.addEventListener('resize', this._onResize)
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this._onResize)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.visible) this.reposition()
  }

  _onResize = () => {
    this.reposition()
  }

  reposition () {
    const padding = 10 // minimum space between popover and top/bottom of screen

    const height = ReactDOM.findDOMNode(this.refs.popover) ? ReactDOM.findDOMNode(this.refs.popover).offsetHeight : 0
    const target = ReactDOM.findDOMNode(this.props.target)
    const targetTop = target ? target.getBoundingClientRect().top : 0
    const targetHeight = target ? target.getBoundingClientRect().bottom - target.getBoundingClientRect().top : 0

    let arrowOffset = height / 2
    let top = targetTop - height / 2 + targetHeight / 2

    if (top < padding) {
      arrowOffset = Math.max(padding + 5, arrowOffset - padding + top)
      top = padding
    }

    const maxTop = window.innerHeight - padding - height
    if (top > maxTop) {
      arrowOffset = Math.min(window.innerHeight - padding - 20, arrowOffset + (top - maxTop))
      top = maxTop
    }

    this.setState({ top, arrowOffset })
  }

  _close = () => {
    this.props.close()
  }

  render () {
    const style = {
      position: 'fixed',
      marginLeft: this.props.expanded ? 160 : 60,
      width: 276, // max from bootstrap
      top: this.state.top,
      visibility: this.props.visible ? 'visible' : 'hidden'
    }

    const title = (
      <div>
        <span>{this.props.title}</span>
        <Icon
          type='remove'
          className='pull-right'
          style={{cursor: 'pointer'}}
          onClick={this._close} />
      </div>
    )

    return (
      <Popover
        id='ptest'
        style={style}
        ref='popover'
        title={title}
        arrowOffsetTop={this.state.arrowOffset}>
        {this.props.children}
      </Popover>
    )
  }
}
