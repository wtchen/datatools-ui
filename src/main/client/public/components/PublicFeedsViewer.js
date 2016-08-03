import React from 'react'
import moment from 'moment'
import { Grid, Row, Col, Button, Input, Glyphicon, form } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'
import RegionSearch from './RegionSearch'

import PublicPage from './PublicPage'
import FeedsMap from './FeedsMap'
import { isModuleEnabled, isExtensionEnabled, getComponentMessages } from '../../common/util/config'

export default class PublicFeedsViewer extends React.Component {

  constructor (props) {
    super(props)
    this.state = {

    }
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    const messages = getComponentMessages('PublicFeedsViewer')
    if (!this.props.projects) {
      return <PublicPage />
    }
    let position = this.state.position
    // let explore =
    //   <Row>
    //     <Col xs={12} sm={6} md={4}>
    //       Explore Transit Data
    //     </Col>
    //     <Col xs={12} sm={6} md={4}>
    //       <Input type='text' bsSize='large' placeholder='Search for regions or agencies' />
    //     </Col>
    //   </Row>
    // let exploreHeader =
    //   <span>
    //     Explore Transit Data
    //     <Input style={{width: '300px'}} type='text' bsSize='large' placeholder='Search for regions or agencies' />
    //   </span>
    let feeds = []
    const feedArray = this.props.projects.map(p => {
      const regions = p.name.split(', ')
      if (p.feedSources) {
        return p.feedSources.map(f => {
          feeds.push(f)
          return f
        })
      }
    })
    return (
      <PublicPage ref='publicPage'>
        <Grid>
          <Row>
            <Col xs={12} sm={6} md={4}>
              <RegionSearch
                feeds={feeds}
                limit={100}
                entities={['regions', 'feeds']}
                minimumInput={0}
                bsSize='large'
                clearable={true}
                onChange={(evt) => {
                  console.log(evt)
                  if (evt && evt.region) {
                    this.setState({
                      position: [evt.region.lat, evt.region.lon],
                      bounds: [[evt.region.north, evt.region.east], [evt.region.south, evt.region.west]]
                    })
                  }
                  if (evt && evt.feed) {
                    browserHistory.push('/public/feed/' + evt.feed.id)
                  }
                  else if (evt == null)
                    this.setState({position: null, bounds: null})
                }}
              />
            </Col>
          </Row>
        </Grid>
        <FeedsMap
          projects={this.props.projects}
          onFeedClick={(feedId) => browserHistory.push('/public/feed/' + feedId) }
          bounds={this.state.bounds}
        />
        <Grid>
          <Row>
            <Col xs={12}>

            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              {isExtensionEnabled('mtc')
                ? null
                : <PublicFeedsTable projects={this.props.projects} />
              }

            </Col>
          </Row>
        </Grid>
      </PublicPage>
    )
  }
}

class PublicFeedsTable extends React.Component {
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
    const messages = getComponentMessages('PublicFeedsTable')
    const feedArray = this.props.projects.map(p => {
      const regions = p.name.split(', ')
      if (p.feedSources) {
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
    return  (
      <BootstrapTable
        data={feeds}
        pagination={true}
        striped={true}
        hover={true}
        search={true}
      >
        <TableHeaderColumn isKey={true} dataSort={true} hidden={true} dataField='id'>Feed ID</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='name' dataFormat={this.feedFormat}>{messages.name}</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='region'>{messages.region}</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='state'>{messages.stateProvince}</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='country'>{messages.country}</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='lastUpdated' sortFunc={this.dateSort}>{messages.lastUpdated}</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='lastUpdated' hidden={true}>last_update</TableHeaderColumn>
        <TableHeaderColumn dataField='url' dataFormat={this.urlFormat}>{messages.link}</TableHeaderColumn>
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
      // buttons = <Button {this.props.feed.url ? disabled} href={this.props.feed.url}><Glyphicon glyph='new-window' /></Button>
    }
    return (
      <tr>
        <td>{this.props.feed.name}</td>
        <td>{moment(this.props.feed.lastUpdated).format('MMMM Do YYYY, h:mm:ss a')}</td>
        <td>
          <Button disabled={this.props.feed.url ? false : true} href={this.props.feed.url}><Glyphicon glyph='new-window' /></Button>
          <Button href='http://localhost:9001/'><Glyphicon glyph='edit' /></Button>
        </td>
      </tr>
    )
  }
}
