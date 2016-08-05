import React from 'react'
import { Grid, Row, Col, Table, Panel, Glyphicon } from 'react-bootstrap'
import { Link } from 'react-router'

import PublicPage from './PublicPage'
import ActiveFeedVersionNavigator from '../../manager/containers/ActiveFeedVersionNavigator'

export default class PublicFeedSourceViewer extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    const fs = this.props.feedSource

    if (!fs) {
      return <PublicPage></PublicPage>
    }

    return (
      <PublicPage>
        <Grid>
          <Row>
            <Col xs={12}>
            { this.props.user.profile !== null ?
              <ul className='breadcrumb'>
                <li><Link to='/'>Explore</Link></li>
                <li><Link to='/project'>Projects</Link></li>
                <li><Link to={`/project/${this.props.project.id}`}>{this.props.project.name}</Link></li>
                <li className='active'>{fs.name}</li>
              </ul>
              : <ul className='breadcrumb'>
                  <li><Link to='/'>Explore</Link></li>
                  <li className='active'>{fs.name}</li>
                </ul>
            }

            </Col>
          </Row>

          <Row>
            <Col xs={12}>
              <h2>
              {fs.name} <small>Public view
              { this.props.user.profile !== null ?
                <span> (<Link to={`/feed/${fs.id}`}>View private page</Link>)</span>
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
                  versions={fs.feedVersions}
                  feedSource={fs}
                  versionIndex={fs.feedVersions.length}
                  isPublic
                />
              : <span>No Feed Versions to show.</span>
            }
          </Panel>
        </Grid>
      </PublicPage>
    )
  }
}
