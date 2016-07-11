import React from 'react'
import { Map, Marker, CircleMarker, Popup, Polyline, TileLayer, Rectangle, GeoJson, FeatureGroup, ZoomControl, LayersControl } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { shallowEqual } from 'react-pure-render'
import {Icon} from 'react-fa'
import polyUtil from 'polyline-encoded'
import ll, {isEqual as coordinatesAreEqual} from 'lonlng'
import moment from 'moment'
import lineString from 'turf-linestring'
import bearing from 'turf-bearing'
import point from 'turf-point'
import along from 'turf-along'
import lineDistance from 'turf-line-distance'
import lineSlice from 'turf-line-slice'
import pointOnLine from 'turf-point-on-line'

import { EditControl } from 'react-leaflet-draw'

// import CircleMarkerWithLabel from './CircleMarkerWithLabel'
// import MarkerWithLabel from './MarkerWithLabel'
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
    this.refs.map && this.refs.map.leafletElement.invalidateSize()
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
  handleControlPointDragEnd (e, timer, controlPointRef) {
    let activePattern = this.props.entity && this.props.entity.tripPatterns && this.props.activeSubEntity
      ? this.props.entity.tripPatterns.find(p => p.id === this.props.activeSubEntity)
      : null
    let patternGeojson = this.refs[activePattern.id].leafletElement.toGeoJSON()

    // snap control point to line
    let controlPointLocation = e.target.toGeoJSON()
    let snapPoint = pointOnLine(patternGeojson, controlPointLocation)
    this.refs[controlPointRef].leafletElement.setLatLng(ll.toLatlng(snapPoint.geometry.coordinates))

    this.props.updateActiveEntity(activePattern, 'trippattern', {shape: {type: 'LineString', coordinates: patternGeojson.geometry.coordinates}})

    // clear timer
    if (timer) clearInterval(timer)
    console.log(timer)
    // this.setState({coordinates})
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
  }
  mapBoundsChanged (e) {
    console.log(e.target.getZoom())
    this.setState({zoom: e.target.getZoom()})
  }
  async handlePatternEdit (controlPointRef, begin, end) {
    let followRoad = true // !e.originalEvent.shiftKey
    if (this.props.isEditingGeometry) {
      // console.log(this.state)
      let activePattern = this.props.entity && this.props.entity.tripPatterns && this.props.activeSubEntity
        ? this.props.entity.tripPatterns.find(p => p.id === this.props.activeSubEntity)
        : null
      let leafletPattern = this.refs[activePattern.id].leafletElement
      let originalLatLngs
      let originalEndPoint
      let from, to
      let markerLatLng = this.refs[controlPointRef].leafletElement.getLatLng()

      // set from, to for endPoint
      if (begin) {
        console.log('use beginning')
        from = begin
        to = [markerLatLng.lng, markerLatLng.lat]
      }
      // set from for beginPoint
      else if (end) {
        from = [markerLatLng.lng, markerLatLng.lat]
      }
      // if pattern has been previously edited, use that endpoint
      else if (this.state.newLatLngs) {
        originalLatLngs = this.state.newLatLngs
        originalEndPoint = originalLatLngs[originalLatLngs.length - 1]
        from = [originalEndPoint.lng, originalEndPoint.lat]
        leafletPattern.setLatLngs(originalLatLngs)
        console.log(originalEndPoint)
      }
      // // otherwise use the original endpoint
      else {
        originalLatLngs = activePattern.shape.coordinates.map(c => ([c[1], c[0]]))
        console.log(originalLatLngs)
        originalEndPoint = originalLatLngs[originalLatLngs.length - 1]
        from = [originalEndPoint[1], originalEndPoint[0]] // [latLngs[latLngs.length - 1].lng, latLngs[latLngs.length - 1].lat]
        leafletPattern.setLatLngs(originalLatLngs)
        console.log(originalEndPoint)
      }


      let latLngs = leafletPattern.toGeoJSON().geometry.coordinates
      console.log(leafletPattern)

      if (
        from
        // !coordinatesAreEqual(to, from, epsilon)
      ) {
        let points = [
          from.geometry ? from.geometry.coordinates : from
        ]
        if (to) {
          points.push(to)
        }
        if (end) {
          points.push(end.geometry.coordinates)
        }
        console.log(points)
        let newPath
        let newSegment = await this.getSegment(points, followRoad)
        let originalSegment = lineString(latLngs)
        let coords = newSegment.coordinates.map(coord => ll.fromCoordinates(coord))

        // slice line if middle control point
        if (end && to) {
          let beginPoint = point(latLngs[0])
          let beginSlice = lineSlice(beginPoint, from, originalSegment)
          let endPoint = point(latLngs[latLngs.length - 1])
          let endSlice = lineSlice(end, endPoint, originalSegment)
          console.log(beginSlice, coords, endSlice)
          newPath = [
            ...beginSlice.geometry.coordinates.map(coord => ll.fromCoordinates(coord)),
            ...coords,
            ...endSlice.geometry.coordinates.map(coord => ll.fromCoordinates(coord))
          ]
        }
        // handle begin control point
        else if (end) {
          let endPoint = point(latLngs[latLngs.length - 1])
          let endSlice = lineSlice(end, endPoint, originalSegment)
          newPath = [
            ...coords,
            ...endSlice.geometry.coordinates.map(coord => ll.fromCoordinates(coord))
          ]
        }
        // append latlngs if end control point
        else {
          newPath = [
            ...leafletPattern.getLatLngs(),
            ...coords,
          ]
        }
        leafletPattern.setLatLngs(newPath)

        // add last coordinate as "stop"
        let endPoint = newPath[newPath.length - 1]
        // this.setState({patternStops: })
      }
    }
  }
  async getSegment (points, followRoad) {
    let geometry
    if (followRoad) { // if followRoad
        const coordinates = await getPolyline(points.map(p => ({lng: p[0], lat: p[1]}))) // [{lng: from[0], lat: from[1]}, {lng: to[0], lat: to[1]}])
        if (!coordinates) {
          geometry = await lineString(points).geometry
        }
        else {
          const c0 = coordinates[0]
          const cy = coordinates[coordinates.length - 1]
          const epsilon = 1e-6
          if (!coordinatesAreEqual(c0, points[0], epsilon)) {
            coordinates.unshift(points[0])
          }
          // if (!coordinatesAreEqual(cy, to, epsilon)) {
          //   coordinates.push(to)
          // }

          geometry = {
            type: 'LineString',
            coordinates
          }
        }
      } else {
        geometry = await lineString(points).geometry
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

        let patternLength = activePattern && activePattern.shape ? lineDistance(activePattern.shape, 'meters') : 0
        let numIcons = 10
        let directionIconInterval = patternLength / numIcons // 2000 // meters
        let lengthsAlongPattern = []
        for (var i = 0; i < Math.floor(patternLength / directionIconInterval); i++) {
          lengthsAlongPattern.push(directionIconInterval * i)
        }
        const circleIcon = divIcon({
          className: '',
          iconAnchor: [0, 7],
          // iconSize: [24, 24],
          html: `<i class="fa fa-times"/>`
        })
        console.log('active trip pattern', activePattern)
        let endPoint
        let beginPoint
        if (!route)
          return null
        let timer = null
        return (
          [
            <FeatureGroup ref='patterns'>
              {// don't include edit control
                false
                ? <EditControl
                  position='bottomleft'
                  // onEdited={this._onEditPath}
                  // onCreated={this._onCreate}
                  // onDeleted={this._onDeleted}
                  draw={{polyline: false, circle: false, polygon: false, rectangle: false, marker: false}}
                />
                : null
              }
              {route && route.tripPatterns
                ?
                route.tripPatterns
                  // sort trip patterns so that active pattern is always on top (for clicking purposes)
                  // .sort((a, b) => {
                  //   if(a.id === subEntity) return -1
                  //   if(b.id === subEntity) return -1
                  //   if(a.id > b.id) return 1
                  //   return 0
                  // })
                  .map(pattern => {
                    const latLngs = pattern.shape ? pattern.shape.coordinates.map(c => ([c[1], c[0]])) : []
                    const isActive = subEntity === pattern.id
                    // skip pattern if latlngs don't exist or some other pattern is active
                    if (!latLngs || !isActive && subEntity)
                      return null
                    beginPoint = latLngs[0]
                    endPoint = latLngs[latLngs.length - 1]
                    console.log(this.state.newLatLngs)
                    return (
                      <Polyline
                        positions={this.state.newLatLngs || latLngs}
                        ref={pattern.id}
                        key={pattern.id}
                        // draggable={this.props.isEditingGeometry && isActive}
                        // onMouseOver={(e) => {
                        //   if (isActive) {
                        //     console.log(e)
                        //     // this.props.toggleEditGeometry()
                        //     // this.addControlPoint(e)
                        //     // this.setState({editable: this.refs[pattern.id].leafletElement})
                        //     // this.refs[pattern.id].leafletElement.enableEdit()
                        //   }
                        // }}
                        onClick={(e) => {
                          if (isActive) {
                            console.log(e)
                            // this.props.toggleEditGeometry()
                            this.addControlPoint(e)
                            this.setState({editable: this.refs[pattern.id].leafletElement})
                            // this.refs[pattern.id].leafletElement.enableEdit()
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
                : null
              }
            </FeatureGroup>
            ,
            <FeatureGroup
              ref='directionIcons'
            >
            {lengthsAlongPattern.length
            ?
              lengthsAlongPattern.map((distance, index) => {
                let nextPatternCoord
                let position = along(activePattern.shape, distance, 'meters')
                let nextPosition = along(activePattern.shape, distance + 5, 'meters')
                const dir = position && nextPosition ? bearing(position, nextPosition) : 0
                const cos = Math.cos(bearing * (Math.PI / 180))
                const sin = Math.sin(bearing * (Math.PI / 180))
                const icon = divIcon({
                  className: '',
                  iconAnchor: [50 * cos, 50 * sin],
                  iconSize: [24, 24],
                  html: `<i class="fa fa-circle"/>`
                })
                const color = '#000'
                const arrowIcon = divIcon({
                  html: `<i class="fa fa-caret-up" style="color: ${color}; transform: rotate(${dir}deg)"></i>`,
                  className: ''
                })
                if (!position || !position.geometry || !position.geometry.coordinates) {
                  return null
                }
                return (
                  <Marker
                    position={[position.geometry.coordinates[1], position.geometry.coordinates[0]]}
                    icon={arrowIcon}
                    ref={`directionIcon-${index}`}
                    onClick={(e) => {
                      console.log('control point clicked', e)
                    }}
                    color='black'
                  >
                  </Marker>
                )
              })
            : null
            }
            </FeatureGroup>
            ,
            <FeatureGroup ref='controlPoints'>
              {
                this.props.stops.length && activePattern && activePattern.shape && this.props.isEditingGeometry
              ?
              activePattern.patternStops.map((s, index) => {
                let nextStop = activePattern.patternStops[index + 1]
                if (typeof nextStop === 'undefined')
                  return null
                let nextPatternCoord
                let distance = (s.shapeDistTraveled + activePattern.patternStops[index + 1].shapeDistTraveled) / 2
                let begin = along(activePattern.shape, s.shapeDistTraveled, 'meters')
                let end
                if (nextStop.shapeDistTraveled){
                  end = along(activePattern.shape, nextStop.shapeDistTraveled, 'meters')
                }
                let position = along(activePattern.shape, distance, 'meters')
                let nextPosition = along(activePattern.shape, distance + 5, 'meters')
                const dir = position && nextPosition ? bearing(position, nextPosition) : 0
                const color = '#000'
                if (!position || !position.geometry || !position.geometry.coordinates) {
                  return null
                }
                return (
                  <Marker
                    position={[position.geometry.coordinates[1], position.geometry.coordinates[0]]}
                    icon={circleIcon}
                    ref={`controlPoint-${index}`}
                    draggable={true}
                    onDragStart={(e) => {
                      console.log('set timeout for valhalla routing', e)
                      const timerFunction = () => {
                        this.handlePatternEdit(`controlPoint-${index}`, begin, end)
                      }
                      timerFunction()
                      timer = setInterval(timerFunction, 1000)
                    }}
                    onDragEnd={(e) => {
                      this.handleControlPointDragEnd(e, timer, `controlPoint-${index}`)
                    }}
                    onClick={(e) => {
                      console.log('control point clicked', e)
                    }}
                    color='black'
                  >
                  </Marker>
                )
              })
              : null
              }
              {this.state.handle}
              {endPoint && this.props.isEditingGeometry && activePattern
              ? <Marker
                  position={endPoint}
                  icon={circleIcon}
                  ref='controlPointEnd'
                  draggable={true}
                  onDrag={(e) => {

                  }}
                  onDragStart={(e) => {
                    console.log('set timeout for valhalla routing', e)
                    const timerFunction = () => {
                      this.handlePatternEdit('controlPointEnd')
                    }
                    timerFunction()
                    timer = setInterval(timerFunction, 1000)
                  }}
                  onDragEnd={(e) => {
                    this.handleControlPointDragEnd(e, timer, 'controlPointEnd')
                  }}
                  onClick={(e) => {
                    console.log('control point clicked', e)
                  }}
                  color='black'
                >
                </Marker>
              : null
              }
              {beginPoint && this.props.isEditingGeometry && activePattern
              ? <Marker
                  position={beginPoint}
                  icon={circleIcon}
                  ref='controlPointBegin'
                  draggable={true}
                  onDrag={(e) => {

                  }}
                  onDragStart={(e) => {
                    console.log('set timeout for valhalla routing', e)
                    let beginStop = this.props.stops.find(s => s.id === activePattern.patternStops[0].stopId)
                    let begin = point([beginStop.stop_lon, beginStop.stop_lat])
                    const timerFunction = () => {
                      this.handlePatternEdit('controlPointBegin', null, begin)
                    }
                    timerFunction()
                    timer = setInterval(timerFunction, 1000)
                  }}
                  onDragEnd={(e) => {
                    this.handleControlPointDragEnd(e, timer, 'controlPointBegin')
                  }}
                  onClick={(e) => {
                    console.log('control point clicked', e)
                  }}
                  color='black'
                >
                </Marker>
              : null
              }
            </FeatureGroup>
            ,
            <FeatureGroup
              ref='patternStops'
            >
              {this.props.stops.length && activePattern
                ?
                activePattern.patternStops.map((s, index) => {
                  const stop = this.props.stops.find(ps => ps.id === s.stopId)
                  if (!stop) return null
                  const color = '#000'
                  const busIcon = divIcon({
                    html: `<i class="fa fa-bus" style="color: ${color}"></i>`,
                    className: ''
                  })
                  return (
                    <Marker
                      position={[stop.stop_lat, stop.stop_lon]}
                      // center={[stop.stop_lat, stop.stop_lon]}
                      style={{cursor: 'move'}}
                      // radius={4}
                      icon={busIcon}
                      // label={`${index + 1} - ${stop.stop_name}`}
                      // labelOptions={{
                      //   // noHide: true,
                      //   direction: 'right'
                      // }}
                      // onClick={(e) => {
                      //
                      // }}
                      ref={`${activePattern.id}-${s.stopId}-${index}`}
                      key={`${activePattern.id}-${s.stopId}-${index}`}
                    >
                      <Popup>
                        <div>
                          <h5>{index + 1}. {stop.stop_name}</h5>
                          <Button
                            onClick={() => {
                              this.props.setActiveEntity(this.props.feedSource.id, 'stop', stop)
                            }}
                          >
                            Edit stop
                          </Button>
                          <Button
                            bsStyle='danger'
                            onClick={() => {
                              let patternStops = [...activePattern.patternStops]
                              patternStops.splice(index, 1)
                              this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                              this.props.saveActiveEntity('trippattern')
                            }}
                          >
                            <Icon name='times'/> Remove
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })
                : null
              }
            </FeatureGroup>
            ,
            <FeatureGroup
              ref='addableStops'
            >
              {
                this.props.stops.length && activePattern && this.props.isAddingStops && this.state.zoom > 14
                ?
                this.props.stops
                .filter(stop => {
                  let bounds = this.refs.map && this.refs.map.leafletElement.getBounds()
                  if (!bounds) return false
                  if (stop.stop_lat > bounds.getNorth() || stop.stop_lat < bounds.getSouth() || stop.stop_lon > bounds.getEast() || stop.stop_lon < bounds.getWest()) {
                    return false
                  }
                  else {
                    console.log('adding stop', stop)
                    return true
                  }
                })
                .map((stop, index) => {
                  if (!stop) return null
                  let patternStop = activePattern.patternStops.find(ps => ps.stopId === stop.id)
                  if (patternStop) return null
                  const color = 'blue'
                  const busIcon = divIcon({
                    html: `<i class="fa fa-bus" style="color: ${color}"></i>`,
                    className: ''
                  })
                  return (
                    <Marker
                      position={[stop.stop_lat, stop.stop_lon]}
                      // center={[stop.stop_lat, stop.stop_lon]}
                      style={{cursor: 'move'}}
                      // radius={4}
                      icon={busIcon}
                      // label={`${index + 1} - ${stop.stop_name}`}
                      ref={`${stop.id}-${index}`}
                      key={`${stop.id}-${index}`}
                    >
                      <Popup>
                        <div>
                          <h5>{stop.stop_name}</h5>
                          <Button
                            bsStyle='success'
                            onClick={() => {
                              console.log(stop)
                              let patternStops = [...activePattern.patternStops]
                              let coordinates = activePattern.shape ? [...activePattern.shape.coordinates, [stop.stop_lon, stop.stop_lat]] : [[stop.stop_lon, stop.stop_lat]]
                              patternStops.push({stopId: stop.id, defaultDwellTime: 0, defaultTravelTime: 0})
                              this.props.updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}})
                              this.props.saveActiveEntity('trippattern')
                              // this.props.setActiveEntity(this.props.feedSource.id, 'stop', stop)
                            }}
                          >
                            Add stop
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })
                : null
              }
            </FeatureGroup>
          ]
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
    if (this.state.keepMapBounds && this.refs.map && this.refs.map.leafletElement || this.props.isEditingGeometry) {
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
    let mapWidth = this.state.width - this.props.offset - 54
    console.log('map width' + mapWidth)
    const mapStyle = {
      height: '100%',
      width: `${mapWidth}px`,
      position: 'absolute',
      left: `${this.props.offset}px`
    }
    if (this.props.hidden) {
      mapStyle.display = 'none'
    }
    return (
      <Map
        ref='map'
        zoomControl={false}
        style={mapStyle}
        bounds={bounds}
        onContextMenu={(e) => this.mapRightClicked(e)}
        onClick={(e) => this.mapClicked(e)}
        onZoomEnd={(e) => this.mapBoundsChanged(e)}
        onMoveEnd={(e) => this.mapBoundsChanged(e)}
        // onMouseMove={(e) => this.mouseMoved(e)}
        scrollWheelZoom={true}
      >
        <ZoomControl position='topright' />
        <LayersControl position='topleft'>
          <LayersControl.Overlay name='Route Alignments'>
            <FeatureGroup>
              {this.props.tripPatterns ? this.props.tripPatterns.map((tp) => {
                if(!tp.latLngs) return null;
                return <Polyline positions={tp.latLngs} weight={2} color='#888' />
              }) : null}
            </FeatureGroup>
          </LayersControl.Overlay>
          <LayersControl.BaseLayer name='Streets' checked>
            <TileLayer
              url='https://api.tiles.mapbox.com/v4/conveyal.ie3o67m0/{z}/{x}/{y}{retina}.png?access_token=pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
              retina='@2x'
              attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name='Satellite'>
            <TileLayer
              url='https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}{retina}.png?access_token=pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
              retina='@2x'
              attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
            />
          </LayersControl.BaseLayer>
        </LayersControl>
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
      </Map>
    )
  }
}
