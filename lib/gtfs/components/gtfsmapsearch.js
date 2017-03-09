import React, { Component, PropTypes } from 'react'
import fetch from 'isomorphic-fetch'
import { Button } from 'react-bootstrap'

import ActiveGtfsMap from '../containers/ActiveGtfsMap'
import GtfsSearch from './gtfssearch'

export default class GtfsMapSearch extends Component {
  static propTypes = {
    placeholder: PropTypes.string
  }
  state = {
    stop: null,
    pattern: null,
    message: '',
    searching: ['stops', 'routes'],
    map: {}
  }
  getPatterns (input) {
    return fetch(`/api/manager/patterns?route=${input.route.route_id}&feed=${input.route.feed_id}`)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      const pattern = json[0]
      // hack to associate route to pattern
      pattern.route = input.route
      return pattern
    })
  }
  handleSelection (input) {
    if (!input) {
      this.setState({stop: null, pattern: null, searchFocus: null})
    } else if (input && input.stop) {
      const pattern = null
      const stop = input.stop
      this.setState({ stop, pattern, searchFocus: stop.stop_id })
    } else if (input && input.route) {
      // TODO: replace with GraphQL
      return Promise.all([this.getPatterns(input)]).then((results) => {
        const pattern = results[0]
        const stop = null
        this.setState({ pattern, stop, searchFocus: pattern.pattern_id })
      })
    }
  }
  render () {
    let zoomMessage = 'Zoom in to view ' + this.state.searching.join(' and ')
    if (this.refs.map && this.refs.map.refs.map) {
      const mapZoom = this.refs.map.refs.map.leafletElement.getZoom()
      zoomMessage = mapZoom <= 13 ? zoomMessage : ''
    }
    const searchProps = {
      stop: this.state.stop,
      pattern: this.state.pattern,
      searchFocus: this.state.searchFocus,
      entities: this.state.searching
    }
    return (
      <div>
        <GtfsSearch
          ref='mapSearch'
          feeds={this.props.feeds}
          limit={100}
          placeholder={this.props.placeholder}
          onChange={(input) => this.handleSelection(input)}
          entities={this.state.searching}
        />
        <ul style={{marginBottom: 0}} className='list-inline'>
          <li style={{width: '50%'}} className='text-left'>
            <Button
              bsSize='xsmall'
              style={{marginTop: '5px', marginBottom: '5px'}}
              onClick={() => {
                this.state.searching.indexOf('routes') > -1 && this.state.searching.indexOf('stops') > -1
                ? this.setState({searching: ['routes']})
                : this.state.searching.indexOf('stops') === -1
                ? this.setState({searching: ['stops']})
                : this.setState({searching: ['stops', 'routes']})
              }}
            >
              Searching {this.state.searching.join(' and ')}
            </Button>
          </li>
          <li style={{width: '50%'}} className='text-right'>{zoomMessage}</li>
        </ul>
        <ActiveGtfsMap
          ref='map'
          version={null}
          feeds={this.props.feeds}
          onStopClick={this.props.onStopClick}
          onRouteClick={this.props.onRouteClick}
          newEntityId={this.props.newEntityId}
          popupAction={this.props.popupAction}
          width={`100%`}
          height={400}
          {...searchProps}
        />
      </div>
    )
  }
}
