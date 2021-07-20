// @flow

import React from 'react'
import { Modal } from 'react-bootstrap'

type LabelEditorProps = {
  label?: Label,
}

type LabelEditorState = {
  showModal: boolean,
}

export function LabelEditor ({label}) {
  return <div>{label.name}</div>
}
export class LabelEditorModal extends React.Component<LabelEditorProps, LabelEditorState> {
  state = {
    showModal: false
  }

   close = () => {
     this.setState({
       showModal: false
     })
   }

  open = () => {
    this.setState({
      showModal: true
    })
  }

  ok = () => {
    this.close()
  }

  render () {
    const {Body, Header, Title} = Modal
    const {label} = this.props
    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Header>
          <Title>Editing {label.name ? label.name : 'New Label'}</Title>
        </Header>

        <Body>
          <LabelEditor label={label} />
        </Body>
      </Modal>
    )
  }
}
