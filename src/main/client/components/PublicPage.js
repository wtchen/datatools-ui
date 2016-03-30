import React from 'react'

import { Grid, Row, Col } from 'react-bootstrap'

import CurrentStatusMessage from '../containers/CurrentStatusMessage'
import ConfirmModal from '../components/ConfirmModal'
import SelectFileModal from '../components/SelectFileModal'

import ManagerPublicNavbar from '../containers/ManagerPublicNavbar'

export default class PublicPage extends React.Component {

  constructor (props) {
    super(props)
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
        <ManagerPublicNavbar
        />
        {this.props.children}
        <CurrentStatusMessage />
        <ConfirmModal ref='confirmModal'/>
        <SelectFileModal ref='selectFileModal'/>
      </div>
    )
  }
}
