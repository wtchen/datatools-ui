import React from 'react'

import { Grid, Row, Col, Button, Table, Input, Panel } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerNavbar from '../containers/ManagerNavbar'
import CurrentStatusMessage from '../containers/CurrentStatusMessage'
import EditableTextField from './EditableTextField'

export default class ProjectsList extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props.routeParams.projectId)
  }

  render () {
    return (
      <div>
        <ManagerNavbar />
        <Grid>
          <Row>
            <Col xs={12}>
              <ul className='breadcrumb'>
                <li><Link to='/'>Projects</Link></li>
                <li className='active'>{this.props.project.name}</li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <h2>{this.props.project.name}</h2>
            </Col>
          </Row>

          <Panel
            header={(<b>Project Settings</b>)}
            collapsible
          >
            <Row>
              <Col xs={12}>
                Settings
              </Col>
            </Row>
          </Panel>

          <Panel
            header={(<b>Feed Sources</b>)}
            collapsible
            defaultExpanded={true}
          >
            <Row>
              <Col xs={4}>
                <Input
                  type="text"
                  placeholder="Search by Feed Source Name"
                  onChange={evt => this.props.searchTextChanged(evt.target.value)}
                />
              </Col>
              <Col xs={8}>
                <Button
                  bsStyle="primary"
                  className="pull-right"
                  onClick={() => this.props.onNewFeedSourceClick()}
                >
                  New Feed Source
                </Button>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th className='col-md-4'>Name</th>
                      <th>Public?</th>
                      <th>Retrieval Method</th>
                      <th>Last Updated</th>
                      <th>Error<br/>Count</th>
                      <th>Valid Range</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.props.project.feedSources
                      ? this.props.project.feedSources.map((feedSource) => {
                          return <FeedSourceTableRow
                            feedSource={feedSource}
                            newFeedSourceNamed={this.props.newFeedSourceNamed}
                            feedSourceNameChanged={this.props.feedSourceNameChanged}
                            key={feedSource.id}
                          />
                        })
                      : null
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Panel>
        </Grid>
        <CurrentStatusMessage />
      </div>
    )
  }
}

class FeedSourceTableRow extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
    const fs = this.props.feedSource
    return (
      <tr key={fs.id}>
        <td className="col-md-4">
          <div>
            <EditableTextField
              isEditing={(fs.isCreating === true)}
              value={fs.name}
              onChange={(value) => {
                if(fs.isCreating) this.props.newFeedSourceNamed(value)
                else this.props.feedSourceNameChanged(fs, value)
              }}
              link={`/feed/${fs.id}`}
            />
          </div>
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    )
  }
}
