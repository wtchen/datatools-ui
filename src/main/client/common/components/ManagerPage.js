import React from 'react'
import { Grid } from 'react-bootstrap'
import Helmet from 'react-helmet'

import ManagerNavbar from '../containers/ManagerNavbar'
import CurrentStatusMessage from '../containers/CurrentStatusMessage'
import CurrentStatusModal from '../containers/CurrentStatusModal'
import ConfirmModal from './ConfirmModal.js'
import SelectFileModal from './SelectFileModal.js'
import InfoModal from './InfoModal.js'
import ManagerSidebar from '../containers/ManagerSidebar'

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
        <Helmet
          defaultTitle={DT_CONFIG.application.title}
          titleTemplate={`${DT_CONFIG.application.title} - %s`}
        />
        <CurrentStatusMessage />
        <ConfirmModal ref='confirmModal'/>
        <InfoModal ref='infoModal'/>
        <SelectFileModal ref='selectFileModal'/>
        <CurrentStatusModal ref='statusModal'/>

        <ManagerSidebar />
        {/*<ManagerNavbar noMargin={this.props.noMargin}/>*/}
        <div className='page'>
          {this.props.children}

          <footer className='footer'>
            <div className='container'>
              <ul className='list-inline text-center text-muted'>
                <li><a href={DT_CONFIG.application.changelog_url}>Changelog</a></li>
                <li><a href={DT_CONFIG.application.docs_url}>Guide</a></li>
                <li><a href={`mailto:${DT_CONFIG.application.support_email}`}>Contact</a></li>
              </ul>
              <p className='text-center text-muted'>&copy; <a href='http://conveyal.com'>Conveyal</a></p>
            </div>
          </footer>
        </div>
      </div>
    )
  }
}
