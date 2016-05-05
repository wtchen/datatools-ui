import React from 'react'

import { Grid, Row, Col, Button } from 'react-bootstrap'

import ManagerNavbar from '../../common/containers/ManagerNavbar'
import CreateAlert from '../components/CreateAlert'
import VisibleAlertsList from '../containers/VisibleAlertsList'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'

import { Link } from 'react-router'

export default class AlertsViewer extends React.Component {

  constructor (props) {
    super(props)
    //console.log("AV activeFeeds", this.props.activeFeeds);
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    const createDisabled = this.props.project && this.props.user ? !this.props.user.permissions.hasProjectPermission(this.props.project.id, 'edit-alert') : true
    return (
      <div>
        <ManagerNavbar/>
        <Grid>
          <Row>
            <Col xs={12}>
              <CreateAlert
                disabled={createDisabled}
                createAlert={this.props.createAlert}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={6}>
              <VisibleAlertsList />
            </Col>
            <Col xs={12} sm={6}>
              <GlobalGtfsFilter
                permissionFilter='edit-alert'
              />
              <GtfsMapSearch
                feeds={this.props.activeFeeds}
                onStopClick={this.props.onStopClick}
                onRouteClick={this.props.onRouteClick}
                popupAction='Create Alert for'
              />
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
