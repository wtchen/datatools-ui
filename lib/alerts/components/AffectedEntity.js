import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'

import { ListGroupItem, Row, Col, Button, Collapse, Glyphicon, Label } from 'react-bootstrap'
import { getFeed } from '../../common/util/modules'
import { getRouteNameAlerts } from '../../editor/util/gtfs'
import AgencySelector from './AgencySelector'
import ModeSelector from './ModeSelector'
import StopSelector from './StopSelector'
import RouteSelector from './RouteSelector'

export default class AffectedEntity extends Component {
  constructor (props) {
    super(props)
    this.state = {
      active: false
    }
  }
  getEntitySummary (entity) {
    const type = entity.type
    const val = entity[type.toLowerCase()]
    let agencyName = ''
    if (typeof entity.agency !== 'undefined' && entity.agency !== null) {
      agencyName = entity.agency.name
    } else if (typeof entity.stop !== 'undefined' && entity.stop !== null) {
      const feed = getFeed(this.props.feeds, entity.stop.feed_id)
      agencyName = typeof feed !== 'undefined' ? feed.name : 'Unknown agency'
    }
    const routeName = entity.route ? getRouteNameAlerts(entity.route) : entity.route_id
    const stopName = entity.stop
      ? `${entity.stop.stop_name} (${entity.stop.stop_id}) ${agencyName}`
      : entity.stop_id
    let summary = ''
    switch (type) {
      case 'AGENCY' :
        return (
          <span>
            <Label bsStyle='warning'><Icon type='building' /></Label>{' '}
            {agencyName}<br />
            <small style={{marginLeft: '18px'}}>Note: this selection will apply to all stops and routes for {agencyName}.</small>
          </span>
        )
      case 'STOP' :
        summary = stopName
        if (routeName) {
          summary += ` for ${routeName}`
        }
        return <span><Icon type='map-marker' /> {summary}</span>
      case 'ROUTE' :
        summary = routeName
        if (stopName) {
          summary += ` at ${stopName}`
        }
        return <span><Glyphicon glyph='option-horizontal' /> {summary}</span>
      case 'MODE' :
        summary = val.name
        if (stopName) {
          summary += ` at ${stopName}`
        }
        return (
          <span>
            {type}: {summary}<br />
            <small style={{marginLeft: '18px'}}>Note: this selection will apply to all {val.name.toLowerCase()} routes{stopName && ` stopping at ${stopName}`}.</small>
          </span>
        )
    }
  }
  renderHeader () {
    return (
      <Row
        onClick={() => this.setState({active: !this.state.active})}
        style={{cursor: 'pointer'}}
      >
        <Col xs={10}>
          <h5>
            <Icon type={this.state.active ? 'caret-down' : 'caret-right'} />
            {this.getEntitySummary(this.props.entity)}
          </h5>
        </Col>
        <Col xs={2}>
          <Button
            bsSize='small'
            className='pull-right'
            style={{marginTop: '5px'}}
            onClick={() => this.props.onDeleteEntityClick(this.props.entity)}>
            <Icon type='remove' />
          </Button>
        </Col>
      </Row>
    )
  }
  renderEntity () {
    var indent = {
      paddingLeft: '30px'
    }
    const selectedFeeds = [this.props.entity.agency] || this.props.activeFeeds
    const selectedRoute = this.props.entity.route
    const selectedStop = this.props.entity.stop
    switch (this.props.entity.type) {
      case 'AGENCY':
        return (
          <div>
            <span><b>Agency:</b></span>
            <AgencySelector
              feeds={this.props.feeds}
              entityUpdated={this.props.entityUpdated}
              entity={this.props.entity}
            />
          </div>
        )
      case 'MODE':
        return (
          <div>
            <span><b>Mode:</b></span>
            <ModeSelector
              entityUpdated={this.props.entityUpdated}
              value={this.props.entity.type}
              entity={this.props.entity}
            />
            <div style={indent}>
              <span><i>Refine by Agency:</i></span>
              <AgencySelector
                feeds={this.props.feeds}
                entityUpdated={this.props.entityUpdated}
                entity={this.props.entity}
              />
              <span><i>Refine by Stop:</i></span>
              <StopSelector
                feeds={selectedFeeds}
                stop={this.props.entity.stop}
                entityUpdated={this.props.entityUpdated}
                entity={this.props.entity}
              />
            </div>
          </div>
        )
      case 'STOP':
        return (
          <div>
            <span><b>Stop:</b></span>
            <StopSelector
              feeds={this.props.activeFeeds}
              stop={this.props.entity.stop}
              clearable={false}
              entityUpdated={this.props.entityUpdated}
              entity={this.props.entity}
            />
            <div style={indent}>
              <span><i>Refine by Route:</i></span>
              <RouteSelector
                feeds={selectedFeeds}
                minimumInput={0}
                filterByStop={selectedStop}
                route={this.props.entity.route}
                entityUpdated={this.props.entityUpdated}
                entity={this.props.entity}
              />
            </div>
          </div>
        )
      case 'ROUTE':
        return (
          <div>
            <span><b>Route:</b></span>
            <RouteSelector
              feeds={this.props.activeFeeds}
              route={this.props.entity.route}
              clearable={false}
              entityUpdated={this.props.entityUpdated}
              entity={this.props.entity}
            />
            <div style={indent}>
              <span><i>Refine by Stop:</i></span>
              <StopSelector
                feeds={selectedFeeds}
                minimumInput={0}
                filterByRoute={selectedRoute}
                stop={this.props.entity.stop}
                entityUpdated={this.props.entityUpdated}
                entity={this.props.entity}
              />
            </div>
          </div>
        )
    }
  }
  render () {
    return (
      <ListGroupItem
        bsStyle={this.props.entity && this.props.entity.type === 'AGENCY' || this.props.entity && this.props.entity.type === 'MODE' ? 'warning' : 'default'}
        header={this.renderHeader()}
      >
        <Collapse in={this.state.active}>
          {this.renderEntity()}
        </Collapse>
      </ListGroupItem>
    )
  }
}
