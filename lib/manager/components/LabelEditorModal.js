import React from 'react'
import {Modal} from 'react-bootstrap'

// @flow

import LabelEditor from '../containers/LabelEditor'
import type {Label} from '../../types'

type LabelEditorModalProps = {
    label?: Label,
    projectId?: String
  }

  type LabelEditorModalState = {
    showModal: boolean,
  }

export default class LabelEditorModal extends React.Component<LabelEditorModalProps, LabelEditorModalState> {
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
      const label = this.props.label || {}
      const { projectId } = this.props
      return (
        <Modal show={this.state.showModal} onHide={this.close}>
          <Header>
            <Title>{label.name ? 'Edit Label' : 'Create New Label'}</Title>
          </Header>

          <Body>
            <LabelEditor label={label} onDone={this.close} projectId={projectId} />
          </Body>
        </Modal>
      )
    }
}
