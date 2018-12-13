// @flow

import React, {Component} from 'react'
import { Grid, Row, Col, Table, Panel, Glyphicon } from 'react-bootstrap'
import { Link } from 'react-router'

import * as feedsActions from '../../manager/actions/feeds'
import * as versionsActions from '../../manager/actions/versions'
import ActiveFeedVersionNavigator from '../../manager/containers/ActiveFeedVersionNavigator'
import PublicPage from './PublicPage'

import type {Props as ContainerProps} from '../containers/ActivePublicFeedSourceViewer'
import type {Feed, Project} from '../../types'
import type {ManagerUserState} from '../../types/reducers'

type Props = ContainerProps & {
  feedSource: Feed,
  fetchFeedSourceAndProject: typeof feedsActions.fetchFeedSourceAndProject,
  fetchFeedVersions: typeof versionsActions.fetchFeedVersions,
  project: Project,
  runFetchFeed: typeof feedsActions.runFetchFeed,
  updateFeedSource: typeof feedsActions.updateFeedSource,
  uploadFeed: typeof versionsActions.uploadFeed,
  user: ManagerUserState
}

export default class PublicFeedSourceViewer extends Component<Props> {
  componentWillMount () {
    const {
      feedSource,
      fetchFeedSourceAndProject,
      fetchFeedVersions,
      routeParams,
      user
    } = this.props
    let unsecured = true
    if (user.profile !== null) {
      unsecured = false
    }
    if (!feedSource && routeParams.feedSourceId) {
      fetchFeedSourceAndProject(routeParams.feedSourceId, unsecured)
        // $FlowFixMe action is wrapped in dispatch which returns a promise
        .then((feedSource) => {
          console.log('fetch versions')
          fetchFeedVersions(feedSource, unsecured)
        })
    // $FlowFixMe FIXME does this variable still exist in the feedSource type?
    } else if (!feedSource.versions) {
      fetchFeedVersions(feedSource, unsecured)
    }
  }

  render () {
    const fs = this.props.feedSource
    if (!fs) {
      return <PublicPage />
    }
    return (
      <PublicPage>
        <Grid>
          <Row>
            <Col xs={12}>
              <ul className='breadcrumb'>
                <li><Link to='/'>Explore</Link></li>
                <li className='active'>{fs.name}</li>
              </ul>
            </Col>
          </Row>

          <Row>
            <Col xs={12}>
              <h2>
                {fs.name}{' '}
                <small>
                  Public view
                  {this.props.user.profile
                    ? <span>(<Link to={`/feed/${fs.id}`}>View private page</Link>)</span>
                    : null
                  }
                </small>
              </h2>
            </Col>
          </Row>

          <Panel header={(<h3><Glyphicon glyph='cog' /> Feed Source Properties</h3>)}>
            <Row>
              <Col xs={6}>
                <Table striped>
                  <thead>
                    <tr>
                      <th className='col-md-4'>Property</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Name</td>
                      <td>
                        {fs.name}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Panel>

          <Panel header={(<h3><Glyphicon glyph='list' /> Feed Versions</h3>)}>
            {fs.feedVersions && fs.feedVersions.length > 0
              ? <ActiveFeedVersionNavigator
                feedSource={fs}
                routeParams={this.props.routeParams}
                isPublic />
              : <span>No Feed Versions to show.</span>
            }
          </Panel>
        </Grid>
      </PublicPage>
    )
  }
}
