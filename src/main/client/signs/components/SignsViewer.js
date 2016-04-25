import React from 'react'

import { Grid, Row, Col, Button } from 'react-bootstrap'

import ManagerPage from '../../common/components/ManagerPage'
import CreateSign from '../components/CreateSign'
import VisibleSignsList from '../containers/VisibleSignsList'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'

import { Link } from 'react-router'

export default class SignsViewer extends React.Component {

  constructor (props) {
    super(props)
    //console.log("AV activeFeeds", this.props.activeFeeds);
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    const createDisabled = this.props.project && this.props.user ? !this.props.user.permissions.hasProjectPermission(this.props.project.id, 'edit-etid') : true
    return (
      <ManagerPage ref='page'>
        <Grid>
          <Row>
            <Col xs={12}>
              <CreateSign
                disabled={createDisabled}
                createSign={this.props.createSign}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <VisibleSignsList />
            </Col>
            <Col xs={6}>
              <GlobalGtfsFilter
                permissionFilter='edit-etid'
              />
              <GtfsMapSearch
                feeds={this.props.activeFeeds}
                onStopClick={this.props.onStopClick}
                onRouteClick={this.props.onRouteClick}
                popupAction='Create Sign for'
              />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
