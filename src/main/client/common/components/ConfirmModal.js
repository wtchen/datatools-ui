import React  from 'react'
import { Modal, Button, Glyphicon } from 'react-bootstrap'

export default class ConfirmModal extends React.Component {

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

    if (props) { // TODO: get rid of this, open should not accepts any props
      this.setState({
        showModal: true,
        title: props.title,
        body: props.body,
        onConfirm: props.onConfirm,
        onClose: props.onClose,
        confirmButtonStyle: props.confirmButtonStyle,
        confirmButtonText: props.confirmButtonText,
      })
    } else {
      this.setState({ showModal: true })
    }
  }

  ok () {
    if (this.props.onConfirm) this.props.onConfirm()
    else if (this.state.onConfirm) this.state.onConfirm()
    this.close()
  }

  render () {
    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header>
          <Modal.Title>{this.props.title || this.state.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>{this.props.body || this.state.body}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            onClick={() => this.ok()}
            bsStyle={this.state.confirmButtonStyle ? this.state.confirmButtonStyle : 'default'}
          >
            {this.state.confirmButtonText ? this.state.confirmButtonText : 'OK'}
          </Button>
          <Button onClick={() => this.close()}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
