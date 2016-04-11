import React from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import CurrentStatusMessage from '../../common/containers/CurrentStatusMessage'
import ConfirmModal from '../../common/components/ConfirmModal'
import SelectFileModal from '../../common/components/SelectFileModal'
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
