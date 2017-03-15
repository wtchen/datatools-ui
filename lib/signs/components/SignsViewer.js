import React from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import ManagerPage from '../../common/components/ManagerPage'
import CreateSign from '../components/CreateSign'
import VisibleSignsList from '../containers/VisibleSignsList'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'

export default class SignsViewer extends React.Component {
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  render () {
    const createDisabled = this.props.project && this.props.user ? !this.props.user.permissions.hasProjectPermission(this.props.project.organizationId, this.props.project.id, 'edit-etid') : true
    return (
      <ManagerPage
        ref='page'
        title='eTID Config'
        >
        <Grid fluid>
          <Row>
            <Col xs={12}>
              <CreateSign
                disabled={createDisabled}
                createSign={this.props.createSign}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={6}>
              <VisibleSignsList />
            </Col>
            <Col xs={12} sm={6}>
              <Row>
                <Col xs={12}>
                  <GlobalGtfsFilter
                    permissionFilter='edit-etid'
                  />
                </Col>
              </Row>
              <GtfsMapSearch
                feeds={this.props.activeFeeds}
                onStopClick={this.props.onStopClick}
                popupAction='Create Sign for'
              />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
