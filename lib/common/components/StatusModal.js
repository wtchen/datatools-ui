import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export default class StatusModal extends React.Component {
  state = {
    showModal: false
  }

  componentWillReceiveProps (newProps) {
    if (newProps.title) {
      this.setState({
        showModal: true,
        title: newProps.title,
        body: newProps.body
      })
    }
  }

  close = () => {
    this.setState({
      showModal: false
    })
    this.props.clearStatusModal()
  }

  open (props) {
    this.setState({
      showModal: true,
      title: props.title,
      body: props.body,
      onConfirm: props.onConfirm
    })
  }

  ok () {
    if (this.state.onConfirm) this.state.onConfirm()
    this.close()
  }

  render () {
    const {Body, Footer, Header, Title} = Modal
    return (
      <Modal
        show={this.state.showModal}
        onHide={this.close}>
        <Header>
          <Title>{this.state.title}</Title>
        </Header>
        <Body>
          <p>{this.state.body}</p>
        </Body>
        <Footer>
          <Button onClick={this.close}>Close</Button>
        </Footer>
      </Modal>
    )
  }
}
