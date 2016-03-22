import React from 'react'

import { Grid, Row, Col } from 'react-bootstrap'

import ManagerNavbar from '../containers/ManagerNavbar'
import CurrentStatusMessage from '../containers/CurrentStatusMessage'
import ConfirmModal from '../components/ConfirmModal'

export default class ManagerPage extends React.Component {

  constructor (props) {
    super(props)
  }

  showConfirmModal (props) {
    this.refs.confirmModal.open(props)
  }

  render () {
    return (
      <div>
        <ManagerNavbar />
          {this.props.children}
        <CurrentStatusMessage />
        <ConfirmModal ref='confirmModal'/>
      </div>
    )
  }
}
