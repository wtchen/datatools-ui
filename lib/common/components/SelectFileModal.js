import React, { Component } from 'react'
import { Modal, Button, FormControl } from 'react-bootstrap'
import ReactDOM from 'react-dom'

export default class SelectFileModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showModal: false
    }
  }

  close () {
    if (this.props.onClose) this.props.onClose()
    this.setState({
      showModal: false
    })
  }

  open (props) {
    if (props) {
      this.setState({
        showModal: true,
        title: props.title,
        body: props.body,
        onConfirm: props.onConfirm,
        onClose: props.onClose,
        errorMessage: props.errorMessage
      })
    } else {
      this.setState({ showModal: true })
    }
  }

  ok () {
    if (this.props.onConfirm) {
      if (this.props.onConfirm(ReactDOM.findDOMNode(this.refs.fileInput).files)) {
        this.close()
      } else {
        this.setState({error: this.props.errorMessage || this.state.errorMessage})
      }
    } else if (this.state.onConfirm) {
      if (this.state.onConfirm(ReactDOM.findDOMNode(this.refs.fileInput).files)) {
        this.close()
      } else {
        this.setState({error: this.props.errorMessage || this.state.errorMessage})
      }
    } else {
      this.close()
    }
  }

  render () {
    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header>
          <Modal.Title>{this.props.title || this.state.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>{this.props.body || this.state.body}</p>
          {this.state.error
            ? <p>{this.state.error}</p>
            : null
          }
          <FormControl ref='fileInput' type='file' />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => this.ok()}>OK</Button>
          <Button onClick={() => this.close()}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
