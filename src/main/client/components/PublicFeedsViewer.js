import React from 'react'

import moment from 'moment'

import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon, Badge, ButtonInput, form } from 'react-bootstrap'

import { Link } from 'react-router'

import { LinkContainer } from 'react-router-bootstrap'

import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'

import PublicPage from '../components/PublicPage'

export default class PublicFeedsViewer extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    if (!this.props.projects) {
      return <PublicPage />
    }

    return (
      <PublicPage ref='publicPage'>
        <Grid>
          <Row>
            <Col xs={12}>
              <h2>
                Explore GTFS Feeds &nbsp;&nbsp;&nbsp;
                <LinkContainer to={{ pathname: '/project' }}>
                  <Button>View Projects</Button>
                </LinkContainer>
              </h2>
            </Col>
          </Row>

          <Row>
            <Col xs={12}>
              <h3>Feeds</h3>
            </Col>
          </Row>
          <FeedTable
            projects={this.props.projects}
          />
        </Grid>
      </PublicPage>
    )
  }
}

class FeedTable extends React.Component {
  feedFormat (cell, row) {
    return cell ? <Link to={'/public/feed/' + row.id}>{cell}</Link> : ''
  }
  dateFormat (cell, row) {
    return cell ? moment(cell).format('MMMM Do YYYY, h:mm a') : ''
  }

  urlFormat (cell, row) {
    return cell ? <a href={cell}><Glyphicon glyph='new-window' /></a> : ''
  }

  dateSort (a, b, order) {
    return b.lastUpdated - a.lastUpdated
  }

  constructor (props) {
    super(props)
  }

  render () {
    let feeds = []
    const feedArray = this.props.projects.map(p => {
      const regions = p.name.split(', ')
      if (p.feedSources){
        return p.feedSources.map(f => {
          const feed = {
            name: f.name,
            id: f.id,
            lastUpdated: moment(f.lastUpdated).format('MMMM Do YYYY, h:mm a'),
            region: regions[regions.length - 3],
            state: regions[regions.length - 2],
            country: regions[regions.length - 1],
            url: f.url
          }
          feeds.push(feed)
          return feed
        })
      }

    })
    console.log(feeds)
    console.log(feedArray)
    return (
      <BootstrapTable
        data={feeds}
        pagination={true}
        striped={true}
        hover={true}
        search={true}
      >
        <TableHeaderColumn isKey={true} dataSort={true} hidden={true} dataField="id">Feed ID</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField="name" dataFormat={this.feedFormat}>Feed Name</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField="region">Region</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField="state">State or Province</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField="country">Country</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField="lastUpdated" sortFunc={this.dateSort}>Last Updated</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField="lastUpdated" hidden={true}>last_update</TableHeaderColumn>
        <TableHeaderColumn dataField="url" dataFormat={this.urlFormat}>Link to GTFS</TableHeaderColumn>
      </BootstrapTable>
    )
  }
}

class FeedRow extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
    var buttons;
    if (this.props.feed.url){
      // buttons = <Button {this.props.feed.url ? disabled} href={this.props.feed.url}><Glyphicon glyph="new-window" /></Button>
    }
    return (
      <tr>
        <td>{this.props.feed.name}</td>
        <td>{moment(this.props.feed.lastUpdated).format('MMMM Do YYYY, h:mm:ss a')}</td>
        <td>
          <Button disabled={this.props.feed.url ? false : true} href={this.props.feed.url}><Glyphicon glyph="new-window" /></Button>
          <Button href="http://localhost:9001/"><Glyphicon glyph="edit" /></Button>
        </td>
      </tr>
    )
  }
}
