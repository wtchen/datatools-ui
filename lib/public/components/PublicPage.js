// @flow

import * as React from 'react'

import CurrentStatusMessage from '../../common/containers/CurrentStatusMessage'
import ConfirmModal from '../../common/components/ConfirmModal'
import SelectFileModal from '../../common/components/SelectFileModal'
import Title from '../../common/components/Title'
import ActivePublicHeader from '../containers/ActivePublicHeader'
import { getConfigProperty } from '../../common/util/config'

export default class PublicPage extends React.Component<{children: React.Node}> {
  showConfirmModal (props: any) {
    this.refs.confirmModal.open(props)
  }

  showSelectFileModal (props: any) {
    this.refs.selectFileModal.open(props)
  }

  render () {
    const appTitle = getConfigProperty('application.title') || 'Data Tools'
    return (
      <div>
        <Title>{appTitle}</Title>
        <ActivePublicHeader />
        {this.props.children}
        <CurrentStatusMessage />
        <ConfirmModal ref='confirmModal' />
        <SelectFileModal ref='selectFileModal' />
      </div>
    )
  }
}
