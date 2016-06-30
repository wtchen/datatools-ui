import React from 'react'
import { Map, Marker, CircleMarker, Popup, Polyline, TileLayer, Rectangle, GeoJson, FeatureGroup, ZoomControl, LayersControl } from 'react-leaflet'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { shallowEqual } from 'react-pure-render'
import {Icon} from 'react-fa'
import polyUtil from 'polyline-encoded'
import ll, {isEqual as coordinatesAreEqual} from 'lonlng'
import lineString from 'turf-linestring'

import CircleMarkerWithLabel from './CircleMarkerWithLabel'
import StopLayer from '../../scenario-editor/components/StopLayer'
import DirectionIcon from '../../scenario-editor/components/direction-icon'
import {polyline as getPolyline} from '../../scenario-editor/utils/valhalla'

export default class EditorMap extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      activeEntity: this.props.entity,
      activeSubEntity: this.props.activeSubEntity,
      // patternStops: this.props.activeSubEntity && this.props.stops || [] // this.props.activeSubEntity && this.props.entity ? this.props.entity.tripPatterns.find(p => p.id === this.props.activeSubEntity).patternStops : null
    }
  }
  updateDimensions () {
    this.setState({width: window.innerWidth, height: window.innerHeight})
  }
  componentWillMount () {
    this.updateDimensions()
  }
  componentDidMount () {
    window.addEventListener("resize", () => this.updateDimensions())
  }
  componentWillUnmount () {
    window.removeEventListener("resize", () => this.updateDimensions())
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.entity && this.props.entity && nextProps.entity.id === this.props.entity.id) {
      // this.setState({keepMapBounds: true})
    }
    if (!shallowEqual(nextProps.entity, this.props.entity)) {
      // this.zoomToEntity(nextProps.entity)
      this.updateDimensions()
      console.log('map active entity has changed')
      this.setState({activeEntity: nextProps.entity})
    }
    if (!shallowEqual(nextProps.entities, this.props.entities)) {
      console.log('entities have changed')
    }
    if (!nextProps.entityEdited && this.props.entityEdited) {
      console.log('resetting map')
      this.resetMap()
    }
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
        this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {stop_lat: e.latlng.lat, stop_lon: e.latlng.lng,})
      }
      else {
        this.props.newEntityClicked(this.props.feedSource.id, this.props.activeComponent, {stop_lat: e.latlng.lat, stop_lon: e.latlng.lng,})
      }
    }
  }
  mouseMoved (e) {
    // this.handlePatternEdit(e)
  }
  addControlPoint (e) {
    console.log('adding control point at ' + e.latlng)
  }
  async mapClicked (e) {
    console.log(e.latlng)
    if (this.props.activeComponent === 'stop') {
      // find stop based on latlng
      let selectedStop = this.props.entities.find(stop => Math.round(stop.stop_lat * 1000) / 1000 === Math.round(e.latlng.lat * 1000) / 1000 && Math.round(stop.stop_lon * 1000) / 1000 === Math.round(e.latlng.lng * 1000) / 1000)
      console.log('map click selected -->', selectedStop)
      if (selectedStop) {
        if (this.props.entity && this.props.entity.id === selectedStop.id) {
          // do nothing, the user just clicked the current stop
        }
        else {
          this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, selectedStop)
        }
      }
    }
    this.handlePatternEdit(e)
  }
  async handlePatternEdit (e) {
    let followRoad = !e.originalEvent.shiftKey
    if (this.props.isEditingGeometry) {
      // console.log(this.state)
      let activePattern = this.props.entity && this.props.entity.tripPatterns && this.props.activeSubEntity
        ? this.props.entity.tripPatterns.find(p => p.id === this.props.activeSubEntity)
        : null
      let leafletPattern = this.refs[activePattern.id].leafletElement
      let latLngs = leafletPattern.getLatLngs()
      let from = [latLngs[latLngs.length - 1].lng, latLngs[latLngs.length - 1].lat]
      let to = [e.latlng.lng, e.latlng.lat]
      let newSegment = await this.getSegment(from, to, followRoad)
      let coords = newSegment.coordinates.map(coord => ll.fromCoordinates(coord))
      let newPath = [...leafletPattern.getLatLngs(), ...coords]
      leafletPattern.setLatLngs(newPath)
      this.props.updateActiveEntity(activePattern, 'trippattern', {shape: polyUtil.encode(newPath)})

      // add last coordinate as "stop"
      let endPoint = newPath[newPath.length - 1]
      // this.setState({patternStops: })
    }
  }
  async getSegment (from, to, followRoad) {
    let geometry
    if (followRoad) { // if followRoad
        const coordinates = await getPolyline({lng: from[0], lat: from[1]}, {lng: to[0], lat: to[1]})
        const c0 = coordinates[0]
        const cy = coordinates[coordinates.length - 1]
        const epsilon = 1e-6
        if (!coordinatesAreEqual(c0, from, epsilon)) {
          coordinates.unshift(from)
        }
        // if (!coordinatesAreEqual(cy, to, epsilon)) {
        //   coordinates.push(to)
        // }

        geometry = {
          type: 'LineString',
          coordinates
        }
      } else {
        geometry = await lineString([from, to]).geometry
      }
      return geometry
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
            ? route.tripPatterns
              // sort trip patterns so that active pattern is always on top (for clicking purposes)
              // .sort((a, b) => {
              //   if(a.id === subEntity) return -1
              //   if(b.id === subEntity) return -1
              //   if(a.id > b.id) return 1
              //   return 0
              // })
              .map(pattern => {
                const latLngs = pattern.shape ? polyUtil.decode(pattern.shape) : []
                const isActive = subEntity === pattern.id
                // skip pattern if latlngs don't exist or some other pattern is active
                if (!latLngs || !isActive && subEntity)
                  return null
                return (
                  <Polyline
                    positions={latLngs}
                    ref={pattern.id}
                    key={pattern.id}
                    // draggable={this.props.isEditingGeometry && isActive}
                    onClick={(e) => {
                      if (isActive) {
                        console.log(e)
                        // this.props.toggleEditGeometry()
                        this.addControlPoint(e)
                      }
                    }}
                    color={this.props.isEditingGeometry && isActive
                      ? 'yellow'
                      : isActive
                      ? 'red'
                      : 'blue'
                    }
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
          const isActive = this.props.entity && this.props.entity.id === stop.id
          if (isNaN(stop.stop_lat) || isNaN(stop.stop_lon) || !isActive)
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

          const marker = (
            <CircleMarker
              center={this.state.editFinished === stop.id || (this.state.editStop === stop.id && this.state.editStopLatLng) ? this.state.editStopLatLng : stopLatLng}
              style={{cursor: 'move'}}
              fillOpacity={1.0}
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
                  this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {stop_lat: e.latlng.lat, stop_lon: e.latlng.lng})
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
    console.log(this.state)
    console.log(this.refs.map)
    const { feedSource, feedInfo, activeComponent, entities, entity, subComponent } = this.props
    // if (!feedSource) return null
    // console.log(entities)
    //const summary = version.validationSummary
    // const bounds = this.getBounds(this.props.activeComponent, this.props.entities) || [[34, -87], [33, -86]]
    const offset = 0.005

    let bounds = feedSource && feedSource.latestValidation && feedSource.latestValidation.bounds
      ? [[feedSource.latestValidation.bounds.north + offset, feedSource.latestValidation.bounds.west - offset], [feedSource.latestValidation.bounds.south - offset, feedSource.latestValidation.bounds.east + offset]]
      : [[90, -90], [-90, 90]]
    let stop = activeComponent === 'stop' && entity
    let route = activeComponent === 'route' && entity
    // don't adjust bounds if state tells us not to or editing is in progress because that's really annoying
    if (this.state.keepMapBounds && this.refs.map.leafletElement || this.props.isEditingGeometry) {
      let mapBounds = this.refs.map.leafletElement.getBounds()
      bounds = mapBounds
    }
    else if (entity && stop && activeComponent === 'stop' && !isNaN(stop.stop_lat) && !isNaN(stop.stop_lon)) {
      bounds = [[stop.stop_lat + offset, stop.stop_lon - offset], [stop.stop_lat - offset, stop.stop_lon + offset]]
    }
    else if (entity && route && activeComponent === 'route' && subComponent === 'trippattern') {
      if (this.refs.patterns) {
        let patternBounds = this.refs.patterns.leafletElement.getBounds()
        if (patternBounds && patternBounds.isValid()){
          bounds = [[patternBounds.getNorth() + offset, patternBounds.getWest() - offset], [patternBounds.getSouth() - offset, patternBounds.getEast() + offset]]
        }
      }
    }
    let mapWidth = this.state.width - this.props.offset
    console.log('map width' + mapWidth)
    const mapStyle = {
      height: '100%',
      width: `${mapWidth}px`,
      position: 'absolute',
      left: `${this.props.offset}px`
    }
    return (
      <Map
        ref='map'
        zoomControl={false}
        style={mapStyle}
        bounds={bounds}
        onContextMenu={(e) => this.mapRightClicked(e)}
        onClick={(e) => this.mapClicked(e)}
        onMouseMove={(e) => this.mouseMoved(e)}
        scrollWheelZoom={true}
      >
        <ZoomControl position='topright' />
        <TileLayer
          url='https://api.tiles.mapbox.com/v4/conveyal.ie3o67m0/{z}/{x}/{y}{retina}.png?access_token=pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
          retina='@2x'
          attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
        />
        {
          this.getMapComponents(this.props.activeComponent, this.props.entities, this.props.entity, this.props.activeSubEntity)
        }
        {this.props.activeComponent === 'stop' && this.props.entities
          ?
            <StopLayer
              stops={this.props.entities}
            />
          : null
        }
        <LayersControl position='topleft'>
          <LayersControl.Overlay name='Route Alignments'>
            <FeatureGroup>
              {this.props.tripPatterns ? this.props.tripPatterns.map((tp) => {
                if(!tp.latLngs) return null;
                return <Polyline positions={tp.latLngs} weight={2} color='#888' />
              }) : null}
            </FeatureGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </Map>
    )
  }
}
