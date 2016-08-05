import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export default class StatusModal extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      showModal: false
    }
  }
  componentWillReceiveProps (newProps) {
    if (newProps.title) {
      this.setState({
        showModal: true,
        title: newProps.title,
        body: newProps.body,
      })
    }
  }
  close () {
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
    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header>
          <Modal.Title>{this.state.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>{this.state.body}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => this.close()}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
