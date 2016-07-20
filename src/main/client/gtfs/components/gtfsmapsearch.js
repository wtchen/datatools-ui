import React, { PropTypes } from 'react'

import fetch from 'isomorphic-fetch'

import { Button } from 'react-bootstrap'

import { PureComponent, shallowEqual } from 'react-pure-render'

import GtfsMap from './gtfsmap'
import GtfsSearch from './gtfssearch'

export default class GtfsMapSearch extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      stops: [],
      routes: [],
      patterns: [],
      position: null,
      message: '',
      searching: ['stops', 'routes'],
      map: {}
    }
  }

  componentDidMount() {
    // this.fetchUsers()
    console.log(this.props)
  }

  render() {
    let zoomMessage = 'Zoom in to view ' + this.state.searching.join(' and ')
    if (this.refs.map && this.refs.map.refs.map) {
      let mapZoom = this.refs.map.refs.map.leafletElement.getZoom()
      zoomMessage = mapZoom <= 13 ? zoomMessage : ''
    }
    console.log(zoomMessage)
    const onZoomChange = (e) => {
      let mapZoom = e.target._zoom
      zoomMessage = mapZoom <= 13 ? zoomMessage : ''
    }
    const {attribution, centerCoordinates, geojson, markers, transitive, url, zoom} = this.props
    const getPatterns = (input) => {
      return fetch(`/api/manager/patterns?route=${input.route.route_id}&feed=${input.route.feed_id}`)
      .then((response) => {
        return response.json()
      })
      .then((json) => {

        const pattern = json[0]
        console.log(pattern)
        // hack to associate route to pattern
        pattern.associatedRoutes = []
        pattern.associatedRoutes.push(input.route)
        return pattern
      })
    }
    const handleSelection = (input) => {
      if (!input) {
        this.setState({stops: null, routes: null, patterns: null, searchFocus: false})
      }
      else if (input && input.stop) {
        this.setState(Object.assign({}, this.state, { stops: [input.stop], position: [input.stop.stop_lat, input.stop.stop_lon], routes: null, patterns: null, searchFocus: true }))
      }
      else if (input && input.route) {
        return Promise.all([getPatterns(input)]).then((results) => {
          const patterns = results[0]
          console.log('patterns for route ' + input.route.route_id, patterns)
          this.setState(Object.assign({}, this.state, { routes: [input.route], patterns: [patterns], stops: null, searchFocus: true }))
        })
      }
    }

    return (
    <div>
      <GtfsSearch
        ref='mapSearch'
        feeds={this.props.feeds}
        limit={100}
        placeholder={this.props.placeholder}
        onChange={handleSelection}
        entities={this.state.searching}
      />
      <ul style={{marginBottom: 0}} className='list-inline'>
        <li style={{width:'50%'}} className='text-left'>
          <Button
            bsSize='xsmall'
            style={{marginTop: '5px', marginBottom: '5px'}}
            onClick={() => {
              this.state.searching.indexOf('routes') > -1 && this.state.searching.indexOf('stops') > -1
              ? this.setState({searching: ['routes']})
              : this.state.searching.indexOf('stops') === -1
              ? this.setState({searching: ['stops']}) : this.setState({searching: ['stops', 'routes']})
            }}
          >
            Searching {this.state.searching.join(' and ')}
          </Button>
        </li>
        <li style={{width:'50%'}} className='text-right'>{zoomMessage}</li>
      </ul>
      <GtfsMap
        ref='map'
        feeds={this.props.feeds}
        position={this.state.position}
        onStopClick={this.props.onStopClick}
        onRouteClick={this.props.onRouteClick}
        newEntityId={this.props.newEntityId}
        onZoomChange={onZoomChange}
        stops={this.state.stops}
        searchFocus={this.state.searchFocus}
        patterns={this.state.patterns}
        entities={this.state.searching}
        popupAction={this.props.popupAction}
      />
    </div>
    )
  }
}
