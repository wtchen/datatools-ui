import React, { Component, PropTypes } from 'react'
import { Icon } from 'react-fa'

export default class SidebarNavItem extends Component {

  static propTypes = {
    active: PropTypes.bool,
    expanded: PropTypes.bool,
    icon: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func
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

    const iconStyle = {
    }

    const labelStyle = {
      fontWeight: 'bold',
      marginLeft: 30
    }

    return (
      <div style={containerStyle}
        onMouseEnter={() => this.toggleHover()} onMouseLeave={() => this.toggleHover()}
        onClick={() => this.props.onClick()}
      >
        <div style={iconContainerStyle}>
          <Icon name={this.props.icon} size='lg' style={iconStyle} ref='icon'

          />
        </div>
        {this.props.expanded
          ? <div style={labelStyle}>{this.props.label}</div>
          : null
        }
        <div style={{ clear: 'both' }} />
      </div>
    )
  }
}
