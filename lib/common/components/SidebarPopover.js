import Icon from '@conveyal/woonerf/components/icon'
import Pure from '@conveyal/woonerf/components/pure'
import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {Popover} from 'react-bootstrap'

export default class SidebarPopover extends Pure {
  static propTypes = {
    children: PropTypes.node,
    expanded: PropTypes.bool, // whether the sidebar is expanded, i.e. wider with labels and icons
    target: PropTypes.object, // the on-screen element (e.g. an icon) that the popover is triggered by
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
    this.reposition()
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

  reposition () {
    const padding = 10 // minimum space between popover and top/bottom of screen
    const minMarginBottom = this.props.minMarginBottom || 10

    // Get the height of the popover itself. Is either a fixed, property-defined
    // value or is the default height (i.e. scaled to fit content )
    const height = this.props.fixedHeight
      ? this.props.fixedHeight
      : ReactDOM.findDOMNode(this.refs.popover)
        ? ReactDOM.findDOMNode(this.refs.popover).offsetHeight
        : 0

    // Get location and height of the popover's target (i.e. trigger) element
    const target = ReactDOM.findDOMNode(this.props.target)
    const targetTop = target ? target.getBoundingClientRect().top : 0
    const targetHeight = target ? target.getBoundingClientRect().bottom - target.getBoundingClientRect().top : 0

    let arrowOffset = height / 2
    let top = targetTop - (height / 2) + (targetHeight / 2)

    if (top < padding) {
      arrowOffset = Math.max(padding + 5, arrowOffset - padding + top)
      top = padding
    }

    const maxTop = window.innerHeight - minMarginBottom - height
    if (top > maxTop) {
      arrowOffset = Math.min(window.innerHeight - minMarginBottom - 20, arrowOffset + (top - maxTop))
      top = maxTop
    }

    this.setState({ top, arrowOffset })
  }

  _close = () => {
    this.props.close()
  }

  render () {
    const { expanded, fixedHeight, visible } = this.props
    const style = {
      position: 'fixed',
      marginLeft: expanded ? 140 : 60,
      width: 276, // max from bootstrap
      top: this.state.top,
      visibility: visible ? 'visible' : 'hidden'
    }

    if (fixedHeight) style.height = fixedHeight

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
