// @flow

import React, { Component, PropTypes } from 'react'
import fetch from 'isomorphic-fetch'
import { Glyphicon, Label } from 'react-bootstrap'
import { connect } from 'react-redux'
import {Async} from 'react-select'

import {GTFS_GRAPHQL_PREFIX} from '../../common/constants'
import {getHeaders} from '../../common/util/util'
import {routeSearch, stopSearch} from '../util/graphql'

import type {Feed} from '../../types'

type Props = {
  entities: Array<string>,
  feeds: Array<Feed>,
  filterByRoute: any, // route object
  filterByStop: any, // stop object
  onChange: any => void,
  placeholder: ?string,
  user: any,
  value: string
}

type State = {
  value: string
}

/**
 * A component build with react-select that queries the GraphQL endpoint for
 * GTFS stops and routes using the user-inputted text.
 */
class GtfsSearch extends Component<Props, State> {
  static propTypes = {
    entities: PropTypes.array
  }

  // Used for caching options.
  options = {}

  state = {
    value: this.props.value
  }

  static defaultProps = {
    autoload: false, // prevent options from auto-loading, esp. when rendering multiple
    entities: ['routes', 'stops'],
    minimumInput: 1
  }

  cacheOptions (options) {
    options.forEach(o => { this.options[o.value] = o.feature })
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.value !== nextProps.value && typeof this.props.value !== 'undefined') {
      this.setState({value: nextProps.value})
    }
  }

  _renderOption (option) {
    return (
      <span style={{ color: 'black' }}>
        {option.stop
          ? <Glyphicon glyph='map-marker' />
          : <Glyphicon glyph='option-horizontal' />
        }
        {' '}{option.label}{' '}
        <Label>
          {option.agency && option.agency.name ? option.agency.name : ''}
        </Label>
        {' '}{option.link}
      </span>
    )
  }

  _sortOptions = (a, b, input) => {
    const aLabel = a.label.toLowerCase()
    const bLabel = b.label.toLowerCase()
    if (aLabel.startsWith(input)) {
      return bLabel.startsWith(input) ? aLabel.localeCompare(bLabel) : -1
    } else {
      return bLabel.startsWith(input) ? 1 : aLabel.localeCompare(bLabel)
    }
  }

  _entityToOption = (entity: any, feed: Feed) => {
    const type = entity.stop_id ? 'stop' : 'route'
    const stopCode = entity.stop_code ? entity.stop_code : entity.stop_id
    const label = type === 'stop'
      ? `${entity.stop_name} (${stopCode})`
      : `${this.getRouteName(entity)} (${entity.route_id})`
    return {
      [type]: entity,
      label,
      value: type === 'stop' ? entity.stop_id : entity.route_id,
      agency: feed
    }
  }

  getRouteName = (route) => {
    const {route_short_name: shortName, route_long_name: longName} = route
    const routeName = shortName && longName
      ? `${shortName} - ${longName}`
      : longName || shortName
    return routeName
  }

  /**
   * Request stop and route entities from GraphQL endpoint.
   * @param  {String} textInput search string
   * @param  {Object} feed      feed source to search
   * @param  {[type]} entities  entity types to search (stops and/or routes)
   * @return {[type]}           [description]
   */
  _searchEntitiesWithString = (textInput, feed, entities, filterByRoute, filterByStop) => {
    const namespace = feed.publishedVersionId
    const {user} = this.props
    // FIXME: Handle filter by route/stop (filter by route will query routes
    // with a specified route id and stops nested underneath)!!!
    const variables = {
      routeId: filterByStop ? filterByRoute.route_id : undefined,
      stopId: filterByStop ? filterByStop.stop_id : undefined,
      namespace,
      search: textInput
    }
    const queryForRoutes = entities.indexOf('routes') !== -1
    const queryForStops = entities.indexOf('stops') !== -1
    // console.log('routes stops', queryForRoutes, queryForStops, filterByRoute, filterByStop)
    // query routes if routes is included or (stops is included and filter by route)
    const body = JSON.stringify({
      query: `
  query (
    $namespace: String,
    $search: String
    ${filterByRoute ? ' $routeId: [String]' : ''}
    ${filterByStop ? ' $stopId: [String]' : ''}
  ) {
    feed(namespace: $namespace) {
      ${queryForRoutes || (filterByRoute && queryForStops) ? routeSearch(filterByRoute, 30) : ''}
      ${queryForStops || (filterByStop && queryForRoutes) ? stopSearch(filterByStop, 30) : ''}
    }
  }`,
      variables
    })
    // FIXME: replace with secure fetch
    return fetch(GTFS_GRAPHQL_PREFIX, {method: 'post', body, headers: getHeaders(user.token)})
      .then(res => res.json())
      .then(json => {
        const {data} = json
        return {results: data, feed, filterByRoute, filterByStop}
      })
  }

  /**
   * Make aync call to fetch GTFS entities via GraphQL endpoint.
   * @param  {String} input text string to search
   */
  _loadOptions = input => {
    const {entities, feeds, filterByRoute, filterByStop} = this.props
    const queries = feeds
      // FIXME: Need to filter on selected feeds?
      .filter(feed => feed.publishedVersionId)
      .map(feed => this._searchEntitiesWithString(input, feed, entities, filterByRoute, filterByStop))
    return Promise
      .all(queries)
      .then(responses => {
        const routeOptions = []
        const stopOptions = []
        responses.forEach(response => {
          const {results, feed} = response
          if (results.feed) {
            // Skip results if there was not a successful response
            const {stops, routes} = results.feed
            // Entities must be mapped to options here in order to make use of
            // feed references.
            stops && stopOptions.push(...stops.map(s => this._entityToOption(s, feed)))
            routes && routeOptions.push(...routes.map(r => this._entityToOption(r, feed)))
          } else {
            console.warn(`Could not search GTFS entities (query: "${input}") for ${feed.name}`, results)
          }
        })
        // Sort stop and route options independently (so that stops appear first)
        // using the input text string (so that options that begin with text
        // string bubble to the top).
        stopOptions.sort((a, b) => this._sortOptions(a, b, input))
        routeOptions.sort((a, b) => this._sortOptions(a, b, input))
        return {options: [...stopOptions, ...routeOptions]}
      })
  }

  _onChange = (value: any) => {
    this.props.onChange && this.props.onChange(value)
    this.setState({value})
  }

  _onFocus = (input) => {
    // Clear options onFocus to ensure only valid route/stop combinations are
    // selected.
    this.refs.gtfsSelect.loadOptions('')
  }

  render () {
    const {entities, placeholder: propsPlaceholder} = this.props
    const placeholder = propsPlaceholder || 'Begin typing to search for ' + entities.join(' or ') + '...'
    return (
      <Async
        {...this.props}
        ref='gtfsSelect'
        cache={false}
        onFocus={this._onFocus}
        filterOptions
        placeholder={placeholder}
        loadOptions={this._loadOptions}
        value={this.state.value}
        optionRenderer={this._renderOption}
        onChange={this._onChange} />
    )
  }
}

const mapDispatchToProps = {}

const mapStateToProps = (state, ownProps) => ({user: state.user})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsSearch)
