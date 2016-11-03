import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export default class InfoModal extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      showModal: false
    }
  }

  close () {
    this.setState({
      showModal: false
    })
  }

  open (props) {
    this.setState({
      showModal: true,
      title: props.title,
      body: props.body
    })
  }

  ok () {
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
          <Button onClick={() => this.ok()}>OK</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
