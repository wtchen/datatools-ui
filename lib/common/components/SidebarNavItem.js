import Icon from '@conveyal/woonerf/components/icon'
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'

export default class SidebarNavItem extends Component {
  static propTypes = {
    active: PropTypes.bool,
    expanded: PropTypes.bool,
    icon: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func,
    image: PropTypes.string,
    link: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = { hover: false }
  }

  toggleHover () {
    this.setState({ hover: !this.state.hover })
  }

  render () {
    const activeColor = this.props.active ? '#fff' : this.state.hover ? '#fff' : '#ccc'
    const containerStyle = {
      paddingTop: 10,
      paddingBottom: 10,
      paddingRight: this.props.expanded ? 10 : 10,
      paddingLeft: 10,
      marginTop: 5,
      marginBottom: 5,
      marginLeft: -15,
      cursor: 'pointer',
      color: activeColor,
      borderLeft: this.props.active ? '4px solid #2889CA' : '4px solid rgba(0,0,0,0)',
      textDecoration: 'none',
      borderRight: this.props.active ? '5px solid rgba(0,0,0,0)' : '5px solid rgba(0,0,0,0)',
      backgroundColor: this.props.active ? '#313131' : 'rgba(0,0,0,0)'
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
      marginTop: 3,
      fontSize: 12,
      marginLeft: 30
    }
    const icon = this.props.image
      ? <div style={imageContainerStyle}>
        <img alt='App logo' width={40} height={40} src={this.props.image} />
      </div>
      : <div style={iconContainerStyle}>
        <Icon
          type={this.props.icon}
          size='lg'
          style={iconStyle}
          ref='icon'
          className={this.props.loading
            ? 'fa-spin fa-lg'
            : 'fa-lg'
          }
        />
      </div>
    const tooltip = <Tooltip id={this.props.label}>{this.props.label}</Tooltip>
    const containerProps = {
      onMouseEnter: () => this.toggleHover(),
      onMouseLeave: () => this.toggleHover()
    }
    if (!this.props.link) {
      containerProps.onClick = () => this.props.onClick()
    }
    const container = (
      <div style={containerStyle}
        {...containerProps}
      >
        {icon}
        {this.props.expanded
          ? <div style={labelStyle}>{this.props.label}</div>
          : null
        }
        <div style={{ clear: 'both' }} />
      </div>
    )
    const navItem = this.props.link
      ? <Link to={this.props.link} style={{textDecoration: 'none'}}>
        {container}
      </Link>
      : container
    return this.props.expanded
      ? navItem
      : <OverlayTrigger overlay={this.props.expanded ? null : tooltip}>
        {navItem}
      </OverlayTrigger>
  }
}
