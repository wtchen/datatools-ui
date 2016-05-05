import React from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import ManagerNavbar from '../containers/ManagerNavbar'
import CurrentStatusMessage from '../containers/CurrentStatusMessage'
import ConfirmModal from './ConfirmModal.js'
import SelectFileModal from './SelectFileModal.js'
import InfoModal from './InfoModal.js'

export default class ManagerPage extends React.Component {

  constructor (props) {
    super(props)
  }

  showInfoModal (props) {
    this.refs.infoModal.open(props)
  }

  showConfirmModal (props) {
    this.refs.confirmModal.open(props)
  }

  showSelectFileModal (props) {
    this.refs.selectFileModal.open(props)
  }

  render () {
    return (
      <div>
        <ManagerNavbar noMargin={this.props.noMargin}/>
          {this.props.children}
        <CurrentStatusMessage />
        <ConfirmModal ref='confirmModal'/>
        <InfoModal ref='infoModal'/>
        <SelectFileModal ref='selectFileModal'/>
      </div>
    )
  }
}
