// @flow

import React, {Component} from 'react'

import {Panel, Row, Col, ButtonGroup, Button, Glyphicon, Label} from 'react-bootstrap'

import * as activeSignActions from '../actions/activeSign'
import {getFeed} from '../../common/util/modules'
import GtfsSearch from '../../gtfs/components/gtfs-search'

import type {Feed} from '../../types'

type Props = {
  activeFeeds: Array<Feed>,
  deleteActiveEntity: typeof activeSignActions.deleteActiveEntity,
  entity: any, // should be Entity, but too many FlowFixMes are needed
  feeds: Array<Feed>,
  updateActiveEntity: typeof activeSignActions.updateActiveEntity
}

export default class AffectedEntity extends Component<Props> {
  getEntitySummary = (entity: any, feeds: Array<Feed>) => {
    let agencyName = ''
    if (entity.agency) {
      agencyName = entity.agency.name
    } else if (entity.stop) {
      const feed = getFeed(feeds, entity.stop.feed_id)
      agencyName = feed ? feed.name : 'Unknown agency'
    }
    const labelComponents = []
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

  _onClickDelete = () => {
    this.props.deleteActiveEntity(this.props.entity)
  }

  render () {
    const {
      activeFeeds,
      entity,
      updateActiveEntity,
      feeds
    } = this.props
    var indent = {paddingLeft: '30px'}
    const selectedFeeds = [entity.agency] || activeFeeds
    const selectedStop = entity.stop
    return (
      <Panel
        collapsible
        header={
          <Row>
            <Col xs={10}>
              <span><Glyphicon glyph='map-marker' /> {this.getEntitySummary(entity, feeds)}</span>
            </Col>
            <Col xs={2}>
              <ButtonGroup className='pull-right'>
                <Button bsSize='small' onClick={this._onClickDelete}>
                  <Glyphicon glyph='remove' />
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        }>
        {/* Panel Body */}
        <div>
          <span><b>Stop:</b></span>
          <StopSelector
            feeds={activeFeeds}
            stop={entity.stop}
            clearable={false}
            updateActiveEntity={updateActiveEntity}
            entity={entity} />
          <div style={indent}>
            <span><i>Refine by Route:</i></span>
            <RouteSelector
              feeds={selectedFeeds}
              minimumInput={0}
              filterByStop={selectedStop}
              route={entity.route}
              updateActiveEntity={updateActiveEntity}
              entity={entity} />
          </div>
        </div>
      </Panel>
    )
  }
}

type RouteSelectorProps = {
  clearable?: boolean,
  entity: any,
  feeds: Array<Feed>,
  filterByStop: any,
  minimumInput: number,
  route: any,
  updateActiveEntity: typeof activeSignActions.updateActiveEntity
}

class RouteSelector extends Component<RouteSelectorProps> {
  getRouteName = (route) => {
    const routeName = route.route_short_name && route.route_long_name
      ? `${route.route_short_name} - ${route.route_long_name}`
      : route.route_long_name
        ? route.route_long_name
        : route.route_short_name
          ? route.route_short_name
          : route.RouteId
            ? route.RouteId
            : '?'
    return routeName
  }

  _onChangeRoute = (input) => {
    if (input) {
      const routes = input.map(e => e.route)
      this.props.updateActiveEntity(this.props.entity, 'ROUTES', routes)
    } else {
      this.props.updateActiveEntity(this.props.entity, 'ROUTES', [])
    }
  }

  render () {
    const {
      clearable,
      feeds,
      filterByStop,
      minimumInput,
      route
    } = this.props
    return (
      <GtfsSearch
        feeds={feeds}
        limit={100}
        multi
        minimumInput={minimumInput}
        filterByStop={filterByStop}
        clearable={clearable}
        entities={['routes']}
        onChange={this._onChangeRoute}
        value={route
          ? route.map(r => ({
            route: r,
            value: r.route_id,
            label: `${this.getRouteName(r)}`
          }))
          : ''
        } />
    )
  }
}

type StopSelectorProps = {
  clearable: boolean,
  entity: any,
  feeds: Array<Feed>,
  filterByRoute?: any,
  minimumInput?: number,
  stop: any,
  updateActiveEntity: typeof activeSignActions.updateActiveEntity
}

class StopSelector extends Component<StopSelectorProps> {
  _onChangeStop = (input) => {
    if (typeof input !== 'undefined' && input !== null) {
      this.props.updateActiveEntity(this.props.entity, 'STOP', input.stop, input.agency)
    } else if (input === null) {
      this.props.updateActiveEntity(this.props.entity, 'STOP', null, null)
    }
  }

  render () {
    const {clearable, feeds, filterByRoute, minimumInput, stop} = this.props
    const feed = stop ? getFeed(feeds, stop.feed_id) : null
    const agencyName = feed ? feed.name : 'Unknown agency'
    return (
      <GtfsSearch
        feeds={feeds}
        limit={100}
        minimumInput={minimumInput}
        filterByRoute={filterByRoute}
        entities={['stops']}
        clearable={clearable}
        onChange={this._onChangeStop}
        value={stop
          ? {
            stop,
            value: stop.stop_id,
            label: `${stop.stop_name} (${agencyName})`
          }
          : ''
        } />
    )
  }
}
