import React, {Component, PropTypes} from 'react'
import {Modal, Button} from 'react-bootstrap'

export default class StatusModal extends Component {
  static propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    action: PropTypes.string,
    onConfirm: PropTypes.func
  }

  state = {
    showModal: false
  }

  componentWillReceiveProps (newProps) {
    if (newProps.title) {
      this.setState({
        showModal: true,
        ...newProps
      })
    }
  }

  close = () => {
    this.setState({
      showModal: false
    })
    this.props.clearStatusModal()
  }

  _handleLogin = () => {
    this.props.login()
      .then((success) => {
        if (success) {
          this.close()
        }
      }, failure => {
        console.log(failure)
      })
  }

  _handleReLock = () => {
    // Calling removeEditorLock with null feedId will use current editor feedSourceId
    // found in store.
    this.props.removeEditorLock(null, true)
      .then((success) => {
        if (success) {
          this.setState({
            action: 'RELOAD',
            title: 'Success!',
            body: 'Reload page to begin editing.'
          })
        } else {
          this.setState({
            title: 'Attempt to take over editing failed!',
            disabled: true,
            body: this.state.body + '\n\n' +
              'Re-locking feed is only permitted if another editing session is in progress for you (not another user). You can try again later or contact the current editor to request that they wrap up their session.'
          })
        }
      }, failure => {
        console.log(failure)
      })
  }

  _handleReload = () => window.location.reload()

  open (props) {
    this.setState({
      showModal: true,
      ...props
    })
  }

  ok () {
    this.state.onConfirm && this.state.onConfirm()
    this.close()
  }

  _renderAction = (action, disabled) => {
    switch (action) {
      case 'LOG_IN':
        return <Button
          bsStyle='primary'
          disabled={disabled}
          onClick={this._handleLogin}>
          Log in
        </Button>
      case 'RE_LOCK':
        return <Button
          bsStyle='danger'
          disabled={disabled}
          onClick={this._handleReLock}>
          Re-lock feed
        </Button>
      case 'RELOAD':
        return <Button
          bsStyle='success'
          disabled={disabled}
          onClick={this._handleReload}>
          Reload page
        </Button>
      default:
        return null
    }
  }

  render () {
    const {Body, Footer, Header, Title} = Modal
    const {title, body, action, detail, disabled} = this.state
    return (
      <Modal
        show={this.state.showModal}
        onHide={this.close}>
        <Header>
          <Title>{title}</Title>
        </Header>
        <Body>
          <p style={{whiteSpace: 'pre-wrap'}}>{body}</p>
          <small style={{whiteSpace: 'pre-wrap'}}>{detail}</small>
        </Body>
        <Footer>
          {this._renderAction(action, disabled)}
          <Button onClick={this.close}>Close</Button>
        </Footer>
      </Modal>
    )
  }
}
