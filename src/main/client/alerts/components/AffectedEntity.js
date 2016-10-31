import React from 'react'

import { ListGroupItem, Row, Col, ButtonGroup, Button, Glyphicon, FormControl, Label, Collapse } from 'react-bootstrap'
import Icon from 'react-fa'
import GtfsSearch from '../../gtfs/components/gtfssearch'

import modes from '../modes'

import { getFeed, getFeedId } from '../../common/util/modules'
import { getRouteNameAlerts } from '../../editor/util/gtfs'

export default class AffectedEntity extends React.Component {
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
    }
    else if (typeof entity.stop !== 'undefined' && entity.stop !== null) {
      const feed = getFeed(this.props.feeds, entity.stop.feed_id)
      agencyName = typeof feed !== 'undefined' ? feed.name : 'Unknown agency'
    }

    const routeName = entity.route ? getRouteNameAlerts(entity.route) : entity.route_id
    let stopName = entity.stop
      ? `${entity.stop.stop_name} (${entity.stop.stop_id}) ${agencyName}`
      : entity.stop_id
    let summary = ''
      switch (type) {
        case 'AGENCY' :
          return (
            <span>
              {agencyName}<br/>
              <small style={{marginLeft: '18px'}}>Note: this selection will apply to all stops and routes for {agencyName}.</small>
            </span>
          )
        case 'STOP' :
          summary = stopName
          if (routeName) {
            summary += ` for ${routeName}`
          }
          return <span><Glyphicon glyph="map-marker" /> {summary}</span>
        case 'ROUTE' :
          summary = routeName
          if (stopName) {
            summary += ` at ${stopName}`
          }
          return <span><Glyphicon glyph="option-horizontal" /> {summary}</span>
        case 'MODE' :
          summary = val.name
          if (stopName) {
            summary += ` at ${stopName}`
          }
          return (
            <span>
              {type}: {summary}<br/>
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
            <Icon fixedWidth name={this.state.active ? 'caret-down' : 'caret-right'}/>
            {this.getEntitySummary(this.props.entity)}
          </h5>
        </Col>
        <Col xs={2}>
          <Button
            bsSize='small'
            className='pull-right'
            style={{marginTop: '5px'}}
            onClick={() => this.props.onDeleteEntityClick(this.props.entity)}
          >
            <Glyphicon glyph='remove' />
          </Button>
        </Col>
      </Row>
    )
  }
  renderEntity () {
    var indent = {
      paddingLeft: '30px'
    }
    let selectedFeeds = [this.props.entity.agency] || this.props.activeFeeds
    let selectedRoute = this.props.entity.route
    let selectedStop = this.props.entity.stop
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
    const getMode = (id) => {
      return modes.find((mode) => mode.gtfsType === +id)
    }
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

class AgencySelector extends React.Component {
  render () {
    const getMode = (id) => {
      return modes.find((mode) => mode.gtfsType === +id )
    }
    return (
      <div>
        <FormControl
          componentClass='select'
          value={this.props.entity.agency && getFeedId(this.props.entity.agency)}
          onChange={(evt) => {
            this.props.entityUpdated(this.props.entity, 'AGENCY', getFeed(this.props.feeds, evt.target.value))
          }}
          //value={this.props.entity.type}
        >
          {this.props.feeds.map((feed) => {
            return <option key={getFeedId(feed)} value={getFeedId(feed)}>{feed.name}</option>
          })}
        </FormControl>
      </div>
    )
  }
}

class ModeSelector extends React.Component {
  render () {
    const getMode = (id) => {
      return modes.find((mode) => mode.gtfsType === +id )
    }
    return (
      <div>
        <FormControl
          componentClass='select'
          value={this.props.entity.mode.gtfsType}
          onChange={(evt) => {
            this.props.entityUpdated(this.props.entity, 'MODE', getMode(evt.target.value))
          }}
          //value={this.props.entity.type}
        >
          {modes.map((mode) => {
            return <option value={mode.gtfsType}>{mode.name}</option>
          })}
        </FormControl>
      </div>
    )
  }
}

class RouteSelector extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    const getMode = (id) => {
      return modes.find((mode) => mode.gtfsType === +id )
    }
    var routes = []
    const feed = this.props.route ? getFeed(this.props.feeds, this.props.route.feed_id) : null
    const agencyName = feed ? feed.name : 'Unknown agency'
    return (
      <div>
        <GtfsSearch
          feeds={this.props.feeds}
          limit={100}
          minimumInput={this.props.minimumInput}
          filterByStop={this.props.filterByStop}
          clearable={this.props.clearable}
          entities={['routes']}
          onChange={(evt) => {
            if (typeof evt !== 'undefined' && evt !== null)
              this.props.entityUpdated(this.props.entity, 'ROUTE', evt.route, evt.agency)
            else if (evt == null) {
              if (this.props.filterByStop) {
                this.props.entityUpdated(this.props.entity, 'ROUTE', null, feed)
              }
              else {
                this.props.entityUpdated(this.props.entity, 'ROUTE', null, null)
              }
            }
          }}
          value={
            this.props.route
            ? {
                route: this.props.route,
                'value': this.props.route.route_id,
                'label': `${getRouteNameAlerts(this.props.route)} (${agencyName})`
              }
            : ''
          }
        />
      </div>
    )
  }
}

class StopSelector extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    const getMode = (id) => {
      return modes.find((mode) => mode.gtfsType === +id )
    }
    var stops = []
    const feed = this.props.stop ? getFeed(this.props.feeds, this.props.stop.feed_id) : null
    const agencyName = feed ? feed.name : 'Unknown agency'
    return (
      <div>
        <GtfsSearch
          feeds={this.props.feeds}
          limit={100}
          minimumInput={this.props.minimumInput}
          filterByRoute={this.props.filterByRoute}
          entities={['stops']}
          clearable={this.props.clearable}
          onChange={(evt) => {
            if (evt)
              this.props.entityUpdated(this.props.entity, 'STOP', evt.stop, evt.agency)
            else if (evt == null)
              this.props.entityUpdated(this.props.entity, 'STOP', null, null)
          }}
          value={
            this.props.stop
            ? {
                stop: this.props.stop,
                value: this.props.stop.stop_id,
                label: `${this.props.stop.stop_name} (${agencyName})`
              }
            : ''
          }
        />

      </div>
    )
  }
}
