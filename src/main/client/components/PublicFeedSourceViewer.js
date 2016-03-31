import React from 'react'
import fetch from 'isomorphic-fetch'

import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerPage from '../components/ManagerPage'
import FeedVersionNavigator from './FeedVersionNavigator'

import { retrievalMethodString } from '../util/util'

const retrievalMethods = [
  'FETCHED_AUTOMATICALLY',
  'MANUALLY_UPLOADED',
  'PRODUCED_IN_HOUSE'
]

export default class PublicFeedSourceViewer extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      snapshotVersions: []
    }

    if(this.props.feedSource) this.updateSnapshotVersions(this.props.feedSource)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if(nextProps.feedSource) this.updateSnapshotVersions(nextProps.feedSource)
  }

  updateSnapshotVersions (feedSource) {
    const url = this.props.editorUrl + '/api/mgrsnapshot?sourceId=' + feedSource.id
    fetch(url)
      .then(res => res.json())
      .then(snapshots => {
        this.setState({
          snapshotVersions: snapshots
        })
      })
  }

  render () {
    const fs = this.props.feedSource

    if(!fs) {
      return <ManagerPage />
    }

    return (
      <ManagerPage ref='page'>
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

                    <tr>
                      <td>Retrieval Method</td>
                      <td>
                        {fs.retrievalMethod}
                      </td>
                    </tr>

                    {fs.retrievalMethod === 'FETCHED_AUTOMATICALLY'
                      ? <tr>
                          <td>Retrieval URL</td>
                          <td>
                            <a href={fs.url}>{fs.url}</a>
                          </td>
                        </tr>
                      : null
                    }

                    {fs.retrievalMethod === 'PRODUCED_IN_HOUSE'
                      ? <tr>
                          <td>Editor Snapshot</td>
                          <td>
                            <Input type='select'
                              value={fs.snapshotVersion}
                              onChange={(evt) => {
                                console.log(evt.target.value);
                                this.props.feedSourcePropertyChanged(fs, 'snapshotVersion', evt.target.value)
                              }}
                            >
                              {this.state.snapshotVersions.map(snapshot => {
                                return <option value={snapshot.id} key={snapshot.id}>
                                  {snapshot.name}
                                </option>
                              })}
                            </Input>
                          </td>
                        </tr>
                      : null
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Panel>

          <Panel header={(<h3><Glyphicon glyph='list' /> Feed Versions</h3>)}>
            <FeedVersionNavigator
              versions={fs.feedVersions}
              feedSource={fs}
            />
          </Panel>
        </Grid>
      </ManagerPage>
    )
  }
}
