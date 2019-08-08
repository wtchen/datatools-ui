// @flow

import React, {Component} from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import * as signsActions from '../actions/signs'
import ManagerPage from '../../common/components/ManagerPage'
import CreateSign from '../components/CreateSign'
import VisibleSignsList from '../containers/VisibleSignsList'
import * as filterActions from '../../gtfs/actions/filter'
import GlobalGtfsFilter from '../../gtfs/containers/GlobalGtfsFilter'
import GtfsMapSearch from '../../gtfs/components/gtfsmapsearch'
import * as projectsActions from '../../manager/actions/projects'

import type {Props as ContainerProps} from '../containers/MainSignsViewer'
import type {Feed, Project, Sign} from '../../types'
import type {ManagerUserState} from '../../types/reducers'

type Props = ContainerProps & {
  activeFeeds: Array<Feed>,
  allFeeds: Array<Feed>,
  createSign: typeof signsActions.createSign,
  fetchProjects: typeof projectsActions.fetchProjects,
  fetchRtdSigns: typeof signsActions.fetchRtdSigns,
  fetched: boolean,
  permissionFilter: string,
  project: Project,
  signs: Array<Sign>,
  updatePermissionFilter: typeof filterActions.updatePermissionFilter,
  user: ManagerUserState
}

export default class SignsViewer extends Component<Props> {
  componentWillMount () {
    const {
      fetchProjects,
      fetchRtdSigns,
      permissionFilter,
      project,
      signs,
      updatePermissionFilter
    } = this.props
    if (!signs || signs.length === 0 || !project || !project.feedSources) {
      fetchProjects(true)
        // $FlowFixMe action wrapped in dispatch returns promise
        .then(project => {
          return fetchRtdSigns()
        })
    }
    if (permissionFilter !== 'edit-etid') {
      updatePermissionFilter('edit-etid')
    }
  }
  render () {
    const {
      activeFeeds,
      createSign,
      fetched,
      project,
      user
    } = this.props
    const createDisabled = project && user && user.permissions
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
                onStopClick={createSign}
                popupActionPrefix='Create Sign for' />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
