import React from 'react'

import CurrentStatusMessage from '../../common/containers/CurrentStatusMessage'
import ConfirmModal from '../../common/components/ConfirmModal'
import SelectFileModal from '../../common/components/SelectFileModal'
import Title from '../../common/components/Title'
import ActivePublicHeader from '../containers/ActivePublicHeader'
import { getConfigProperty } from '../../common/util/config'

export default class PublicPage extends React.Component {
  showConfirmModal (props) {
    this.refs.confirmModal.open(props)
  }
  showSelectFileModal (props) {
    this.refs.selectFileModal.open(props)
  }
  render () {
    return (
      <div>
        <Title>{getConfigProperty('application.title')}</Title>
        <ActivePublicHeader />
        {this.props.children}
        <CurrentStatusMessage />
        <ConfirmModal ref='confirmModal' />
        <SelectFileModal ref='selectFileModal' />
      </div>
    )
  }
}
