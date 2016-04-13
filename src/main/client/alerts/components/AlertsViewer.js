import React from 'react'

import { Grid, Row, Col, Button } from 'react-bootstrap'

import ManagerNavbar from '../../common/containers/ManagerNavbar'
import CreateAlert from '../containers/CreateAlert'
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
    return (
      <div>
        <ManagerNavbar/>
        <Grid>
          <Row>
            <Col xs={12}>
              <CreateAlert />
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <VisibleAlertsList />
            </Col>
            <Col xs={6}>
              <GlobalGtfsFilter />
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
