// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Button, Grid, Row, Col } from 'react-bootstrap'

import * as alertActions from '../actions/alerts'
import ManagerPage from '../../common/components/ManagerPage'
import CreateAlert from '../components/CreateAlert'
import VisibleAlertsList from '../containers/VisibleAlertsList'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'

import type {Props as ContainerProps} from '../containers/MainAlertsViewer'
import type {Alert, Feed, Project} from '../../types'
import type {ManagerUserState} from '../../types/reducers'

type Props = ContainerProps & {
  activeFeeds: Array<Feed>,
  alerts: Array<Alert>,
  createAlert: typeof alertActions.createAlert,
  fetchRtdAlerts: typeof alertActions.fetchRtdAlerts,
  fetched: boolean,
  isFetching: boolean,
  onAlertsViewerMount: typeof alertActions.onAlertsViewerMount,
  permissionFilter: string,
  project: Project,
  user: ManagerUserState
}

export default class AlertsViewer extends Component<Props> {
  componentWillMount () {
    const {alerts, onAlertsViewerMount, permissionFilter, project} = this.props
    onAlertsViewerMount(alerts, permissionFilter, project)
  }

  _onClickRefresh = () => this.props.fetchRtdAlerts()

  render () {
    const {
      activeFeeds,
      createAlert,
      fetched,
      isFetching,
      project,
      user
    } = this.props

    // disable alert creation if user does not have permission or if still
    // fetching alerts (to prevent funky ui behavior)
    const createDisabled = project && user.permissions
      ? !user.permissions.hasProjectPermission(
        project.organizationId,
        project.id,
        'edit-alert'
      )
      : true
    return (
      <ManagerPage
        ref='page'
        title='Alerts'
      >
        <Grid fluid>
          <Row>
            <Col xs={6}>
              <h2>
                <Button
                  className='pull-right'
                  disabled={isFetching}
                  onClick={this._onClickRefresh}>
                  <Icon type='refresh' className={isFetching ? 'fa-spin' : ''} />
                </Button>
                <Icon type='exclamation-circle' /> Service Alerts
              </h2>
            </Col>
            <Col xs={6}>
              <h2>
                <CreateAlert
                  disabled={createDisabled}
                  fetched={fetched}
                  createAlert={createAlert} />
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
                  <GlobalGtfsFilter />
                </Col>
              </Row>
              <GtfsMapSearch
                feeds={activeFeeds}
                onStopClick={createAlert}
                onRouteClick={createAlert}
                popupAction='Create Alert for' />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
