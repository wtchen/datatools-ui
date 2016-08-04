import React from 'react'
import Helmet from 'react-helmet'
import { browserHistory } from 'react-router'

import CurrentStatusMessage from '../containers/CurrentStatusMessage'
import CurrentStatusModal from '../containers/CurrentStatusModal'
import ConfirmModal from './ConfirmModal.js'
import SelectFileModal from './SelectFileModal.js'
import InfoModal from './InfoModal.js'
import ActiveSidebar from '../containers/ActiveSidebar'
import ActiveSidebarNavItem from '../containers/ActiveSidebarNavItem'
import PageContent from '../containers/PageContent'

import { getConfigProperty } from '../util/config'

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
          defaultTitle={getConfigProperty('application.title')}
          titleTemplate={`${getConfigProperty('application.title')} - %s`}
        />
        <CurrentStatusMessage />
        <ConfirmModal ref='confirmModal'/>
        <InfoModal ref='infoModal'/>
        <SelectFileModal ref='selectFileModal'/>
        <CurrentStatusModal ref='statusModal'/>
        <ActiveSidebar>
          <ActiveSidebarNavItem icon='list' label='Projects'
            onClick={() => browserHistory.push(`/project`) } />
          <ActiveSidebarNavItem icon='users' label='User Admin'
            onClick={() => browserHistory.push(`/admin`) } />
          <ActiveSidebarNavItem icon='globe' label='Public Site'
            onClick={() => browserHistory.push(`/`) } />
        </ActiveSidebar>
        <PageContent>
            <div style={{ padding: 20 }}>
              {this.props.children}
            </div>

            <footer className='footer'>
              <div className='container'>
                <ul className='list-inline text-center text-muted'>
                  <li><a href={getConfigProperty('application.changelog_url')}>Changelog</a></li>
                  <li><a href={getConfigProperty('application.docs_url')}>Guide</a></li>
                  <li><a href={`mailto:${getConfigProperty('application.support_email')}`}>Contact</a></li>
                </ul>
                <p className='text-center text-muted'>&copy; <a href='http://conveyal.com'>Conveyal</a></p>
              </div>
            </footer>
        </PageContent>

      </div>
    )
  }
}
