import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'
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
    const {
      project,
      user,
      createAlert,
      activeFeeds,
      fetched,
      onStopClick,
      onRouteClick
    } = this.props

    // disable alert creation if user does not have permission or if still fetching alerts (to prevent funky ui behavior)
    const createDisabled = project && user
      ? !user.permissions.hasProjectPermission(project.organizationId, project.id, 'edit-alert')
      : true
    return (
      <ManagerPage
        ref='page'
        title='Alerts'
        >
        <Grid fluid>
          <Row>
            <Col xs={12}>
              <h2>
                <Icon type='exclamation-circle' /> Service Alerts
                <CreateAlert
                  style={{marginTop: '-8px'}}
                  disabled={createDisabled}
                  fetched={fetched}
                  createAlert={createAlert}
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
                feeds={activeFeeds}
                onStopClick={onStopClick}
                onRouteClick={onRouteClick}
                popupAction='Create Alert for'
              />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
