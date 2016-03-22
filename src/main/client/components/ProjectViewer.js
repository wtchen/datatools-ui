import React from 'react'

import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerNavbar from '../containers/ManagerNavbar'
import CurrentStatusMessage from '../containers/CurrentStatusMessage'
import EditableTextField from './EditableTextField'
import ConfirmModal from './ConfirmModal'

import defaultSorter from '../util/util'

export default class ProjectsList extends React.Component {

  constructor (props) {
    super(props)
  }

  deleteFeedSource (feedSource) {
    this.refs['confirmModal'].open({
      title: 'Delete Feed Source?',
      body: `Are you sure you want to delete the feed source ${feedSource.name}?`,
      onConfirm: () => {
        console.log('OK, deleting')
        this.props.deleteFeedSourceConfirmed(feedSource)
      }
    })
  }
  componentWillMount () {
    this.props.onComponentMount(this.props.routeParams.projectId)
  }

  render () {

    const filteredFeedSources = this.props.project.feedSources
      ? this.props.project.feedSources.filter(feedSource => {
          if(feedSource.isCreating) return true // feeds actively being created are always visible
          return feedSource.name.toLowerCase().indexOf((this.props.visibilitySearchText || '').toLowerCase()) !== -1
        }).sort(defaultSorter)
      : []

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
                    {filteredFeedSources.map((feedSource) => {
                      return <FeedSourceTableRow
                        feedSource={feedSource}
                        key={feedSource.id}
                        newFeedSourceNamed={this.props.newFeedSourceNamed}
                        feedSourceNameChanged={this.props.feedSourceNameChanged}
                        deleteFeedSourceClicked={() => this.deleteFeedSource(feedSource)}
                      />
                    })}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Panel>
        </Grid>
        <CurrentStatusMessage />
        <ConfirmModal ref='confirmModal'/>
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
        <td>
          <Button
            bsStyle='danger'
            bsSize='small'
            className='pull-right'
            onClick={this.props.deleteFeedSourceClicked}
          >
            <Glyphicon glyph='remove' />
          </Button>
        </td>
      </tr>
    )
  }
}
