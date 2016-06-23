import React from 'react'
import { Map, Marker, CircleMarker, Popup, Polyline, TileLayer, Rectangle, GeoJson, FeatureGroup, ZoomControl } from 'react-leaflet'
import { browserHistory, Link } from 'react-router'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { PureComponent, shallowEqual } from 'react-pure-render'
import {Icon} from 'react-fa'
import polyUtil from 'polyline-encoded'

import CircleMarkerWithLabel from './CircleMarkerWithLabel'

export default class EditorMap extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      activeEntity: this.props.entity,
      activeSubEntity: this.props.activeSubEntity,
      // patternStops: this.props.activeSubEntity && this.props.stops || [] // this.props.activeSubEntity && this.props.entity ? this.props.entity.tripPatterns.find(p => p.id === this.props.activeSubEntity).patternStops : null
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!shallowEqual(nextProps.entity, this.props.entity)) {
      // this.zoomToEntity(nextProps.entity)
      this.setState({activeEntity: nextProps.entity})
    }
    if (!shallowEqual(nextProps.entities, this.props.entities)) {
      console.log('entities have changed')
    }
    if (!nextProps.entityEdited && this.props.entityEdited) {
      this.resetMap()
    }
    // if (nextProps.activeSubEntity !== this.props.activeSubEntity) {
    //   this.setState({patternStops: nextProps.activeSubEntity ? nextProps.stops : []})
    // }
  }
  shouldComponentUpdate (nextProps) {
    return true
  }
  zoomToEntity (entity) {
    if (entity && entity.id) {
      this.refs.map.getLeafletElement().panTo([entity.stop_lat, entity.stop_lon])
    }
  }
  resetMap () {
    // reset previously active stop
    if (this.state.activeEntity && !isNaN(this.state.activeEntity.stop_lat) && !isNaN(this.state.activeEntity.stop_lon))
      this.refs[this.state.activeEntity.id].leafletElement.setLatLng([this.state.activeEntity.stop_lat, this.state.activeEntity.stop_lon])

    // reset state
    this.setState({editStop: null, editFinished: null, editStopLatLng: null})
  }

  mapRightClicked (e) {
    console.log(e.latlng)
    if (this.props.activeComponent === 'stop') {
      // if newly created stop is selected
      if (this.props.entity && this.props.entity.id === 'new') {
        this.props.updateActiveEntity({stop_lat: e.latlng.lat, stop_lon: e.latlng.lng,})
      }
      else {
        this.props.newEntityClicked(this.props.feedSource.id, this.props.activeComponent, {stop_lat: e.latlng.lat, stop_lon: e.latlng.lng,})
      }
    }

  }

  getMapComponents (component, entities, entity, subEntity) {
    // console.log(component, entities, entity, subEntity)
    switch (component) {
      case 'route':
        let route = entity
        console.log('rendering trip patterns')
        let activePattern = route && route.tripPatterns && this.props.activeSubEntity
          ? route.tripPatterns.find(p => p.id === this.props.activeSubEntity)
          : null
        const patternStopPopup = (
          <Popup>
            <div>
              <Button>
                Edit stop
              </Button>
              <Button
                bsStyle='danger'
              >
                <Icon name='times'/> Remove
              </Button>
            </div>
          </Popup>
        )
        console.log('active trip pattern', activePattern)
        if (!route)
          return null
        return (
          <FeatureGroup>
          <FeatureGroup ref='patterns'>
          {route && route.tripPatterns
            ? route.tripPatterns.map(pattern => {
                const latLngs = pattern.shape ? polyUtil.decode(pattern.shape) : []
                const isActive = subEntity === pattern.id
                if (!latLngs)
                  return null
                return (
                  <Polyline
                    positions={latLngs}
                    key={pattern.id}
                    color={isActive ? 'red' : 'blue'}
                    opacity={isActive ? 0.8 : 0.1}
                  />
                )
              })
            : null}
            </FeatureGroup>
            {this.props.stops.length && activePattern
              ? activePattern.patternStops.map((s, index) => {
                const stop = this.props.stops.find(ps => ps.id === s.stopId)
                if (!stop) return null
                return (
                  <CircleMarkerWithLabel
                    center={[stop.stop_lat, stop.stop_lon]}
                    style={{cursor: 'move'}}
                    radius={4}
                    label={`${index + 1} - ${stop.stop_name}`}
                    // labelOptions={{
                    //   // noHide: true,
                    //   direction: 'right'
                    // }}
                    // onClick={(e) => {
                    //
                    // }}
                    ref={`${activePattern.id}-${s.stopId}`}
                    key={`${activePattern.id}-${s.stopId}`}
                  >
                    {
                      patternStopPopup
                    }
                  </CircleMarkerWithLabel>
                )
              })
              : null
            }
          </FeatureGroup>
        )
      case 'stop':
        return entities ? entities.map(stop => {
          if (isNaN(stop.stop_lat) || isNaN(stop.stop_lon))
            return null
          const stopLatLng = [stop.stop_lat, stop.stop_lon]
          const editingStop = this.state.editStop === stop.id
          const escapeListener = (e) => {
            console.log(e)
            // [Esc] is pressed
            if (e.keyCode === 27 && this.props.entityEdited) {
              console.log('escape pressed')

              this.setState({editStop: null, editFinished: null, editStopLatLng: null})

              // reset latlng
              this.refs[stop.id].leafletElement.setLatLng(stopLatLng)

              // set active entity
              this.props.setActiveEntity(this.props.feedSource.id, 'stop', stop)

              // remove listeners
              this.refs.map.getLeafletElement().removeEventListener('mousemove')
              document.removeEventListener('keydown', escapeListener, false)
            }
          }
          const popup = (
            <Popup
              closeButton={false}
              closeOnClick={false}
            >
              <div>
              <h4>Keep edits?</h4>
              <ButtonToolbar>
                <Button
                  bsStyle='primary'
                  bsSize='xsmall'
                  onClick={(e) => {
                    this.refs[stop.id].leafletElement.closePopup()
                    this.setState({editAccepted: stop.id, editFinished: null})
                    // TODO: UPDATE ACTIVE ENTITY WITH LATLNG VALUE
                  }}
                >
                  <Icon name='check'/>
                </Button>
                <Button
                  bsStyle='danger'
                  bsSize='xsmall'
                  onClick={(e) => {
                    this.refs[stop.id].leafletElement.closePopup()
                    this.setState({editFinished: null, editStopLatLng: null, editAccepted: null})
                  }}
                >
                  <Icon name='times'/>
                </Button>
                </ButtonToolbar>
              </div>
            </Popup>
          )

          const isActive = this.props.entity && this.props.entity.id === stop.id
          const marker = (
            <CircleMarker
              center={this.state.editFinished === stop.id || (this.state.editStop === stop.id && this.state.editStopLatLng) ? this.state.editStopLatLng : stopLatLng}
              style={{cursor: 'move'}}
              radius={4}
              ref={stop.id}
              key={`${stop.id}`}
              color={ editingStop
                // yellow means actively changing position
                ? 'yellow'
                : this.state.editFinished === stop.id && isActive
                // red means position has been edited
                ? 'red'
                : this.props.entity && isActive
                // green means stop is active
                ? 'green'
                // blue is default
                : 'blue'
              }
              onMouseDown={(e) => {

              }}
              // onMouseUp={(e) => {
              //   this.refs.map.getLeafletElement().removeEventListener('mousemove')
              // }}
              onDblClick={(e) => {
                this.setState({editStop: null, editFinished: null, editStopLatLng: null})

                // reset latlng
                this.refs[stop.id].leafletElement.setLatLng(stopLatLng)

                // set active entity
                this.props.setActiveEntity(this.props.feedSource.id, 'stop', stop)
              }}
              onClick={(e) => {
                document.removeEventListener('keydown', escapeListener, false)
                // if editing of this stop just finished, open popup
                if (this.state.editFinished === stop.id) {
                  console.log('begin editing again?')
                  // set current location
                  this.refs[stop.id].leafletElement.setLatLng(e.latlng)
                  this.setState({editStop: stop.id, editFinished: null, editStopLatLng: e.latlng})
                  this.refs.map.getLeafletElement()
                    .on('mousemove', (e) => {
                      this.refs[stop.id].leafletElement.setLatLng(e.latlng)
                    })
                  document.addEventListener('keydown', escapeListener, false)
                }
                // click while actively editing: stop editing and fire update action
                else if (editingStop) {
                  console.log('stop editing')
                  this.setState({editStop: null, editFinished: stop.id, editStopLatLng: e.latlng})
                  this.refs.map.getLeafletElement().removeEventListener('mousemove')
                  document.removeEventListener('keydown', escapeListener, false)
                  this.props.updateActiveEntity({stop_lat: e.latlng.lat, stop_lon: e.latlng.lng})
                }
                // if active stop, begin editing
                else if (isActive) {
                  this.setState({editStop: stop.id})
                  this.refs.map.getLeafletElement()
                    .on('mousemove', (e) => {
                      this.refs[stop.id].leafletElement.setLatLng(e.latlng)
                    })
                  document.addEventListener('keydown', escapeListener, false)
                }
                // else, set as active stop
                else {
                  console.log('resetting active stop')
                  this.resetMap()

                  // set active entity
                  this.props.setActiveEntity(this.props.feedSource.id, 'stop', stop)
                }
              }}
            >
              {this.state.editFinished === stop.id
                ? null
                : null
              }
            </CircleMarker>
          )
          return marker
        })
        : null
      default:
        return null
    }
  }

  getBounds(component, entities) {
    switch (component) {
      // case 'route':
      //   return entities.map(route => {
      //     return (
      //       null
      //     )
      //   })
      // case 'stop':
      //   return entities.map(stop => {
      //     return (
      //       null
      //     )
      //   })
      default:
        return null
    }
  }

  render () {
    const { feedSource, feedInfo, activeComponent, entities, entity, subComponent } = this.props
    // if (!feedSource) return null
    // console.log(entities)
    //const summary = version.validationSummary
    // const bounds = this.getBounds(this.props.activeComponent, this.props.entities) || [[34, -87], [33, -86]]
    const offset = 0.005
    let bounds = feedSource
      ? [[feedSource.latestValidation.bounds.north + offset, feedSource.latestValidation.bounds.west - offset], [feedSource.latestValidation.bounds.south - offset, feedSource.latestValidation.bounds.east + offset]]
      : [[90, -90], [-90, 90]]
    let stop = activeComponent === 'stop' && entity
    if (entity && stop && activeComponent === 'stop' && !isNaN(stop.stop_lat) && !isNaN(stop.stop_lon)) {
      bounds = [[stop.stop_lat + offset, stop.stop_lon - offset], [stop.stop_lat - offset, stop.stop_lon + offset]]
    }
    let route = activeComponent === 'route' && entity
    if (entity && route && activeComponent === 'route' && subComponent === 'trippattern') {
      if (this.refs.patterns) {
        let patternBounds = this.refs.patterns.leafletElement.getBounds()
        if (patternBounds && patternBounds.isValid()){
          bounds = [[patternBounds.getNorth() + offset, patternBounds.getWest() - offset], [patternBounds.getSouth() - offset, patternBounds.getEast() + offset]]
        }
      }
    }
    const mapStyle = {
      height: '100%',
    }
    return (
      <Map
        ref='map'
        zoomControl={false}
        style={mapStyle}
        bounds={bounds}
        onContextMenu={(e) => this.mapRightClicked(e)}
        scrollWheelZoom={true}
      >
        <ZoomControl position='topright' />
        <TileLayer
          url='https://api.tiles.mapbox.com/v4/conveyal.ie3o67m0/{z}/{x}/{y}{retina}.png?access_token=pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
          retina='@2x'
          attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
        />
          {this.getMapComponents(this.props.activeComponent, this.props.entities, this.props.entity, this.props.activeSubEntity)}
      </Map>
    )
  }
}
