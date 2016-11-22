import React, { Component, PropTypes } from 'react'

import { Panel, Row, Col, ButtonGroup, Button, Glyphicon, Label } from 'react-bootstrap'

import GtfsSearch from '../../gtfs/components/gtfssearch'

import { getFeed } from '../../common/util/modules'

export default class AffectedEntity extends Component {
  static propTypes = {
    feeds: PropTypes.array
  }
  render () {
    const getEntitySummary = (entity) => {
      let agencyName = ''
      if (entity.agency) {
        agencyName = entity.agency.name
      } else if (entity.stop) {
        const feed = getFeed(this.props.feeds, entity.stop.feed_id)
        agencyName = typeof feed !== 'undefined' ? feed.name : 'Unknown agency'
      }
      let labelComponents = []
      const stopName = entity.stop
        ? <span key='stop-name'>{entity.stop.stop_name} ({entity.stop.stop_id}) <Label>{agencyName}</Label></span>
        : <span key='stop-id'>entity.stop_id</span>
      labelComponents.push(stopName)

      const routes = entity.route
        ? <span key='for-routes'> for {entity.route.length} routes</span>
        : entity.route_id
        ? <span key='for-routes'> for {entity.route_id}</span>
        : <span key='add-routes'>[add routes]</span>
      labelComponents.push(routes)
      return (
        <span>
          {labelComponents ? labelComponents.map(l => (l)) : null}
        </span>
      )
    }

    return (
      <Panel collapsible header={
        <Row>
          <Col xs={10}>
            <span><Glyphicon glyph='map-marker' /> {getEntitySummary(this.props.entity)}</span>
          </Col>
          <Col xs={2}>
            <ButtonGroup className='pull-right'>
              <Button bsSize='small' onClick={() => this.props.onDeleteEntityClick(this.props.entity)}>
                <Glyphicon glyph='remove' />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      }>

        {(() => {
          var indent = {
            paddingLeft: '30px'
          }
          let selectedFeeds = [this.props.entity.agency] || this.props.activeFeeds
          let selectedStop = this.props.entity.stop
          switch (this.props.entity.type) {
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
          }
        })()}

      </Panel>
    )
  }
}

class RouteSelector extends Component {
  render () {
    const getRouteName = (route) => {
      let routeName = route.route_short_name && route.route_long_name
        ? `${route.route_short_name} - ${route.route_long_name}`
        : route.route_long_name ? route.route_long_name
        : route.route_short_name ? route.route_short_name
        : route.RouteId ? route.RouteId
        : null
      return routeName
    }
    return (
      <div>
        <GtfsSearch
          feeds={this.props.feeds}
          limit={100}
          multi
          minimumInput={this.props.minimumInput}
          filterByStop={this.props.filterByStop}
          clearable={this.props.clearable}
          entities={['routes']}
          onChange={(evt) => {
            if (evt) {
              let routes = evt.map(e => e.route)
              this.props.entityUpdated(this.props.entity, 'ROUTES', routes)
            } else {
              this.props.entityUpdated(this.props.entity, 'ROUTES', [])
            }
          }}
          value={
            this.props.route
            ? this.props.route.map(r => ({'route': r, 'value': r.route_id, 'label': `${getRouteName(r)}`}))
            : ''
          }
        />
      </div>
    )
  }
}

class StopSelector extends Component {
  render () {
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
            if (typeof evt !== 'undefined' && evt !== null) {
              this.props.entityUpdated(this.props.entity, 'STOP', evt.stop, evt.agency)
            } else if (evt === null) {
              this.props.entityUpdated(this.props.entity, 'STOP', null, null)
            }
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
