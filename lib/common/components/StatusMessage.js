import React from 'react'
import { Button } from 'react-bootstrap'

export default class StatusMessage extends React.Component {
  state = {
    visible: true
  }

  clear = () => {
    this.setState({
      visible: false
    })
  }

  componentWillReceiveProps (newProps) {
    this.setState({
      visible: true
    })
  }

  render () {
    const { message, sidebarExpanded } = this.props
    const styles = {
      position: 'fixed',
      left: sidebarExpanded ? '140px' : '60px',
      bottom: '0px',
      height: '60px',
      zIndex: 1000
    }

    return (
      <div style={styles}>
        {message && this.state.visible
          ? <Button
            bsStyle='info'
            bsSize='large'
            onClick={this.clear}>
            {message}
          </Button>
          : null
        }
      </div>
    )
  }
}
