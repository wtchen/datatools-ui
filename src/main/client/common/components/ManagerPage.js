import React, {Component, PropTypes} from 'react'
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
import ManagerNavbar from '../containers/ManagerNavbar'

import { getConfigProperty, isModuleEnabled } from '../util/config'

export default class ManagerPage extends Component {
  static propTypes = {
    children: PropTypes.object
  }
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
          {/* <ActiveSidebarNavItem icon='home' label='Home'
            onClick={() => browserHistory.push(`/project`) } />
          <ActiveSidebarNavItem icon='users' label='Users'
            onClick={() => browserHistory.push(`/admin`) } />
          <ActiveSidebarNavItem icon='globe' label='Explore'
            onClick={() => browserHistory.push(`/`) } />*/}
          {isModuleEnabled('alerts')
            ? <ActiveSidebarNavItem
                icon='exclamation-circle'
                label='Alerts'
                onClick={() => browserHistory.push(`/alerts`) }
              />
            : null
          }
          {isModuleEnabled('sign_config')
            ? <ActiveSidebarNavItem
                icon='television'
                label='eTID Config'
                onClick={() => browserHistory.push(`/signs`) }
              />
            : null
          }
        </ActiveSidebar>
        <PageContent>
            {/*<ManagerNavbar breadcrumbs={this.props.breadcrumbs}/>*/}
            <div
              style={{
                padding: '20px',
                paddingBottom: '140px',
                // paddingTop: '60px',
                minHeight: '100%',
                marginBottom: '-140px',
                position: 'relative'
              }}
            >
              {this.props.children}
            </div>

            <footer
              className='footer'
              style={{
                position: 'relative',
                bottom: 0,
                width: '100%',
                marginTop: '40px',
                height: '100px',
                backgroundColor: '#f5f5f5'
              }}
            >
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
