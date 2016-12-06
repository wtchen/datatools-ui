import React from 'react'
import Helmet from 'react-helmet'
import {Icon} from '@conveyal/woonerf'
import { Grid, Row, Col } from 'react-bootstrap'

import ManagerPage from '../../common/components/ManagerPage'
import CreateAlert from '../components/CreateAlert'
import VisibleAlertsList from '../containers/VisibleAlertsList'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'

export default class AlertsViewer extends React.Component {
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  render () {
    const createDisabled = this.props.project && this.props.user ? !this.props.user.permissions.hasProjectPermission(this.props.project.id, 'edit-alert') : true
    return (
      <ManagerPage ref='page'>
        <Helmet
          title='Alerts'
        />
        <Grid>
          <Row>
            <Col xs={12}>
              <h2>
                <Icon type='exclamation-circle' /> Service Alerts
                <CreateAlert
                  style={{marginTop: '-8px'}}
                  disabled={createDisabled}
                  createAlert={this.props.createAlert}
                />
              </h2>
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={6}>
              <VisibleAlertsList />
            </Col>
            <Col xs={12} sm={6}>
              <Row>
                <Col xs={12}>
                  <GlobalGtfsFilter
                    permissionFilter='edit-alert'
                  />
                </Col>
              </Row>
              <GtfsMapSearch
                feeds={this.props.activeFeeds}
                onStopClick={this.props.onStopClick}
                onRouteClick={this.props.onRouteClick}
                popupAction='Create Alert for'
              />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
