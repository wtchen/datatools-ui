// @flow

import React, {Component} from 'react'
import {Modal, Button} from 'react-bootstrap'

import {getComponentMessages, getMessage} from '../../../common/util/config'
import {SHORTCUTS} from '../../util/timetable'

type Props = {
  onClose: () => void,
  show: boolean
}

type State = {
  showModal: boolean
}

export default class TimetableHelpModal extends Component<Props, State> {
  state = {
    showModal: this.props.show
  }

  messages = getComponentMessages('TimetableHelpModal')

  _close = () => {
    const {onClose} = this.props
    onClose && onClose()
  }

  render () {
    const {Body, Footer, Header, Title} = Modal
    return (
      <Modal
        show={this.props.show}
        onHide={this._close}>
        <Header closeButton>
          <Title>{getMessage(this.messages, 'title')}</Title>
        </Header>
        <Body>
          {Object.keys(SHORTCUTS).map(key => {
            return (
              <div key={key}>
                <h4>{getMessage(this.messages, `shortcuts.${key}.title`)}</h4>
                <ul>
                  {SHORTCUTS[key].map((item, i) => {
                    const keys = item.split(':')
                    const extraKeys = keys.length === 3
                      ? <span>{' '}{keys[1]} <kbd>{keys[2]}</kbd></span>
                      : ''
                    return (
                      <li key={i}>
                        <kbd>{keys[0]}</kbd>{extraKeys}:{' '}
                        {getMessage(this.messages, `shortcuts.${key}.desc.${i}`)}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </Body>
        <Footer>
          <span className='pull-left'>
            <small>Press <kbd>?</kbd> to view shortcuts</small>
          </span>
          <Button onClick={this._close}>Close</Button>
        </Footer>
      </Modal>
    )
  }
}
