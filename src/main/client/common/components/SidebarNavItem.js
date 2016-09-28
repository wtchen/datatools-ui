import React, { Component, PropTypes } from 'react'
import { Icon } from 'react-fa'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'

export default class SidebarNavItem extends Component {

  static propTypes = {
    active: PropTypes.bool,
    expanded: PropTypes.bool,
    icon: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func,
    image: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = { hover: false }
  }

  toggleHover () {
    this.setState({ hover: !this.state.hover })
  }

  render () {
    const containerStyle = {
      marginBottom: 20,
      cursor: 'pointer',
      color: this.props.active ? '#0ff' : this.state.hover ? '#fff' : '#ccc'
    }

    const iconContainerStyle = {
      width: 20,
      height: 20,
      textAlign: 'center',
      float: 'left'
    }

    const imageContainerStyle = {
      width: 30,
      height: 30,
      textAlign: 'center',
      float: 'left'
    }

    const iconStyle = {
    }

    const labelStyle = {
      fontWeight: 'bold',
      marginLeft: 30
    }
    const icon = this.props.image
      ? <div style={imageContainerStyle}>
          <img width={40} height={40} src={this.props.image}/>
        </div>
      : <div style={iconContainerStyle}>
          <Icon name={this.props.icon} size='lg' style={iconStyle} ref='icon'/>
        </div>
    const tooltip = <Tooltip id={this.props.label}>{this.props.label}</Tooltip>
    return this.props.expanded
      ? <div style={containerStyle}
          onMouseEnter={() => this.toggleHover()} onMouseLeave={() => this.toggleHover()}
          onClick={() => this.props.onClick()}
        >
          {icon}
          <div style={labelStyle}>{this.props.label}</div>
          <div style={{ clear: 'both' }} />
        </div>
    : <OverlayTrigger overlay={this.props.expanded ? null : tooltip}>
        <div style={containerStyle}
          onMouseEnter={() => this.toggleHover()} onMouseLeave={() => this.toggleHover()}
          onClick={() => this.props.onClick()}
        >
          {icon}
          <div style={{ clear: 'both' }} />
        </div>
      </OverlayTrigger>
  }
}
