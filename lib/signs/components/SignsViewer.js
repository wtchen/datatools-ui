// @flow

import React, {Component} from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import ManagerPage from '../../common/components/ManagerPage'
import CreateSign from '../components/CreateSign'
import VisibleSignsList from '../containers/VisibleSignsList'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'

import type {Props as ContainerProps} from '../containers/MainSignsViewer'

type Props = ContainerProps & {}

export default class SignsViewer extends Component<Props> {
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  render () {
    const {
      activeFeeds,
      createSign,
      fetched,
      onStopClick,
      project,
      user
    } = this.props
    const createDisabled = project && user
      ? !user.permissions.hasProjectPermission(project.organizationId, project.id, 'edit-etid')
      : true
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
                fetched={fetched}
                createSign={createSign} />
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={6}>
              <VisibleSignsList />
            </Col>
            <Col xs={12} sm={6}>
              <Row>
                <Col xs={12}>
                  <GlobalGtfsFilter />
                </Col>
              </Row>
              <GtfsMapSearch
                feeds={activeFeeds}
                onStopClick={onStopClick}
                popupAction='Create Sign for' />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
