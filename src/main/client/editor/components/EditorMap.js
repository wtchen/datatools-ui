import React from 'react'
import { Map, Marker, CircleMarker, Popup, Polyline, TileLayer, Rectangle, GeoJson, FeatureGroup, ZoomControl, LayersControl } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { Button, ButtonToolbar, ButtonGroup, MenuItem, SplitButton } from 'react-bootstrap'
import { shallowEqual } from 'react-pure-render'
import {Icon, IconStack} from 'react-fa'
import polyUtil from 'polyline-encoded'
import ll, {isEqual as coordinatesAreEqual} from 'lonlng'
import moment from 'moment'
import update from 'react-addons-update'
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
import {polyline as getPolyline, getSegment} from '../../scenario-editor/utils/valhalla'

export default class EditorMap extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      controlPoints: this.props.editSettings.controlPoints && this.props.editSettings.controlPoints.length ? this.props.editSettings.controlPoints[this.props.editSettings.controlPoints.length - 1] : []
    }
  }
  updateDimensions () {
    this.setState({width: window.innerWidth, height: window.innerHeight})
    this.refs.map && setTimeout(() => this.refs.map.leafletElement.invalidateSize(), 500)
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
    if (nextProps.editSettings.controlPoints && nextProps.editSettings.controlPoints.length && !shallowEqual(nextProps.editSettings.controlPoints, this.props.editSettings.controlPoints)) {
      this.setState({controlPoints: nextProps.editSettings.controlPoints[nextProps.editSettings.controlPoints.length - 1]})
    }
  }
  shouldComponentUpdate (nextProps) {
    // return true
    const shouldUpdate =
            this.props.hidden !== nextProps.hidden ||
            (nextProps.activeComponent === 'stop' || nextProps.activeComponent === 'route') && nextProps.activeEntityId !== this.props.activeEntityId ||
            nextProps.activeEntity && this.props.activeEntity && nextProps.activeEntity.tripPatterns && !this.props.activeEntity.tripPatterns ||
            !shallowEqual(nextProps.feedSource, this.props.feedSource) ||
            nextProps.activeComponent !== this.props.activeComponent ||
            !this.props.activeEntity && nextProps.activeEntity ||
            // TODO: add bounds to shouldComponentUpdate and move mapZoom/bounds to mapState reducer
            !shallowEqual(nextProps.mapState, this.props.mapState) ||
            !shallowEqual(nextProps.editSettings, this.props.editSettings) ||
            !shallowEqual(nextProps.activeSubEntity, this.props.activeSubEntity) ||
            nextProps.activeComponent === 'stop' && this.props.mapState.zoom !== nextProps.mapZoom ||
            nextProps.activeComponent === 'stop' && this.props.activeEntity && nextProps.activeEntity && (this.props.activeEntity.stop_lon !== nextProps.activeEntity.stop_lon || this.props.activeEntity.stop_lat !== nextProps.activeEntity.stop_lat) ||
            nextProps.activeEntityId !== this.props.activeEntityId

    // return at this point
    if (shouldUpdate) {
      return shouldUpdate
    }
    else {
      let nextActivePattern = nextProps.activeEntity && nextProps.activeEntity.tripPatterns && nextProps.activeSubEntity
        ? nextProps.activeEntity.tripPatterns.find(p => p.id === nextProps.activeSubEntity)
        : null
      let prevActivePattern = this.props.activeEntity && this.props.activeEntity.tripPatterns && this.props.activeSubEntity
        ? this.props.activeEntity.tripPatterns.find(p => p.id === this.props.activeSubEntity)
        : null
      if (!shallowEqual(nextActivePattern, prevActivePattern)) {
        return true
      }
    }
    return shouldUpdate
  }
  zoomToEntity (entity) {
    if (entity && entity.id) {
      this.refs.map.leafletElement.panTo([entity.stop_lat, entity.stop_lon])
    }
  }
  async extendPatternToStop (pattern, endPoint, stop) {
    let newShape = await getPolyline([endPoint, stop])
    if (newShape) {
      this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: [...pattern.shape.coordinates, ...newShape]}})
      this.props.saveActiveEntity('trippattern')
      return true
    }
    else {
      this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: [...pattern.shape.coordinates, ll.toCoordinates(stop)]}})
      this.props.saveActiveEntity('trippattern')
      return false
    }
  }
  async addStopToPattern (pattern, stop, index) {
    let patternStops = [...pattern.patternStops]

    let coordinates = pattern.shape && pattern.shape.coordinates
    let newStop = {stopId: stop.id, defaultDwellTime: 0, defaultTravelTime: 0}
    // if adding stop to end
    if (typeof index === 'undefined') {
      // if shape coordinates already exist, just extend them
      if (coordinates) {
        let endPoint = ll.toLatlng(coordinates[coordinates.length - 1])
        this.extendPatternToStop(pattern, endPoint, {lng: stop.stop_lon, lat: stop.stop_lat})
        .then(() => {
          patternStops.push(newStop)
          this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
          this.props.saveActiveEntity('trippattern')
        })
      }
      // if shape coordinates do not exist, add pattern stop and get shape between stops (if multiple stops exist)
      else {
        patternStops.push(newStop)
        if (patternStops.length > 1) {
          let previousStop = this.props.stops.find(s => s.id === patternStops[patternStops.length - 2].stopId)
          console.log(previousStop)
          let geojson = await getSegment([[previousStop.stop_lon, previousStop.stop_lat], [stop.stop_lon, stop.stop_lat]], this.props.editSettings.followStreets)
          this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: geojson.coordinates}})
          this.props.saveActiveEntity('trippattern')
        }
        else {
          this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
          this.props.saveActiveEntity('trippattern')
        }
      }

      // if not following roads
      // this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}})
    }
    // if adding stop in middle
    else {
      patternStops.splice(index, 0, newStop)
      this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
      this.props.saveActiveEntity('trippattern')
    }
    // TODO: add strategy for stop at beginning


  }
  async removeStopFromPattern (pattern, stop, index) {
    let patternGeojson = this.refs[pattern.id].leafletElement.toGeoJSON()
    console.log(patternGeojson.geometry.coordinates.length)

    let controlPointIndex = this.state.controlPoints.findIndex(cp => cp.stopId === stop.id)
    console.log('stop is controlPoint #' + controlPointIndex)
    let begin = this.state.controlPoints[controlPointIndex - 2] ? this.state.controlPoints[controlPointIndex - 1].point : null
    let end = this.state.controlPoints[controlPointIndex + 2] ? this.state.controlPoints[controlPointIndex + 1].point : null

    let coordinates = await this.handlePatternEdit(null, begin, end)
    console.log(coordinates.length)
    // // update pattern
    // let patternGeojson = this.refs[pattern.id].leafletElement.toGeoJSON()
    // this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: coordinates}})

    let patternStops = [...pattern.patternStops]
    patternStops.splice(index, 1)
    this.props.updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}})
    this.props.saveActiveEntity('trippattern')
  }
  handleControlPointDragEnd (e, timer, controlPointRef, controlPointIndex) {
    let activePattern = this.props.activeEntity && this.props.activeEntity.tripPatterns && this.props.activeSubEntity
      ? this.props.activeEntity.tripPatterns.find(p => p.id === this.props.activeSubEntity)
      : null
    let patternGeojson = this.refs[activePattern.id].leafletElement.toGeoJSON()

    // snap control point to line
    let controlPointLocation = e.target.toGeoJSON()
    let snapPoint = pointOnLine(patternGeojson, controlPointLocation)
    this.refs[controlPointRef].leafletElement.setLatLng(ll.toLatlng(snapPoint.geometry.coordinates))

    this.props.updateActiveEntity(activePattern, 'trippattern', {shape: {type: 'LineString', coordinates: patternGeojson.geometry.coordinates}})

    if (typeof controlPointIndex !== 'undefined') {
      let lineSegment = lineSlice(point(patternGeojson.geometry.coordinates[0]), snapPoint, patternGeojson)

      // measure line segment
      let distTraveled = lineDistance(lineSegment, 'meters')
      this.props.updateControlPoint(controlPointIndex, snapPoint, distTraveled)
      // var stateUpdate = { controlPoints: {[controlPointIndex]: {point: { $set : snapPoint }, distance: {$set: distTraveled} }}}
      // this.setState(update(this.state, stateUpdate))
    }
    // clear timer
    if (timer) clearInterval(timer)
    console.log(timer)
    // this.setState({coordinates})
  }
  mapRightClicked (e) {
    console.log(e.latlng)
    if (this.props.activeComponent === 'stop') {
      // if newly created stop is selected
      if (this.props.activeEntity && this.props.activeEntity.id === 'new') {
        this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {stop_lat: e.latlng.lat, stop_lon: e.latlng.lng,})
      }
      else {
        this.props.newEntityClicked(this.props.feedSource.id, this.props.activeComponent, {stop_lat: e.latlng.lat, stop_lon: e.latlng.lng,})
      }
    }
  }
  addControlPoint (pattern, latlng) {
    console.log('adding control point at ' + latlng)
    // slice line
    let beginPoint = point(pattern.shape.coordinates[0])
    let clickPoint = point(ll.toCoordinates(latlng))
    let snapPoint = pointOnLine(pattern.shape, clickPoint)
    let lineSegment = lineSlice(beginPoint, clickPoint, pattern.shape)

    // measure line segment
    let distTraveled = lineDistance(lineSegment, 'meters')
    let controlPoint = {distance: distTraveled, point: clickPoint}

    // find splice index based on shape dist traveled
    let index = 0
    for (var i = 0; i < this.state.controlPoints.length; i++) {
      if (distTraveled > this.state.controlPoints[i].distance) {
        index = i + 1
      }
      else {
        break
      }
    }
    // add control point
    this.props.addControlPoint(controlPoint, index)
    // var stateUpdate = { controlPoints: { $splice : [[index, 0, controlPoint]] } }
    // this.setState(update(this.state, stateUpdate))
  }
  async removeControlPoint (pattern, index, begin, end) {
    let coordinates = await this.handlePatternEdit(null, begin, end)

    // update pattern
    let patternGeojson = this.refs[pattern.id].leafletElement.toGeoJSON()
    this.props.updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: coordinates}})

    // remove controlPoint
    this.props.removeControlPoint(index)
    // var stateUpdate = { controlPoints: { $splice : [[index, 1]] } }
    // this.setState(update(this.state, stateUpdate))
  }
  async mapClicked (e) {
    // console.log(e.latlng)
    if (this.props.activeComponent === 'stop') {
      // find stop based on latlng
      let selectedStop = this.props.entities.find(stop => Math.round(stop.stop_lat * 1000) / 1000 === Math.round(e.latlng.lat * 1000) / 1000 && Math.round(stop.stop_lon * 1000) / 1000 === Math.round(e.latlng.lng * 1000) / 1000)
      console.log('map click selected -->', selectedStop)
      if (selectedStop) {
        if (this.props.activeEntity && this.props.activeEntity.id === selectedStop.id) {
          // do nothing, the user just clicked the current stop
        }
        else {
          this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, selectedStop)
        }
      }
    }
  }
  mapBoundsChanged (e) {
    const zoom = e.target.getZoom()
    const bounds = e.target.getBounds()
    if (this.props.mapState.zoom !== zoom) {
      this.props.updateMapSetting('zoom', zoom)
    }
    if (!bounds.equals(this.props.mapState.bounds)) {
      this.props.updateMapSetting('bounds', e.target.getBounds())
    }
  }
  async handlePatternEdit (controlPointRef, begin, end) {
    let followRoad = this.props.editSettings.followStreets // !e.originalEvent.shiftKey
    // if (this.props.editSettings.editGeometry) {
      // console.log(this.state)
      let activePattern = this.props.activeEntity && this.props.activeEntity.tripPatterns && this.props.activeSubEntity
        ? this.props.activeEntity.tripPatterns.find(p => p.id === this.props.activeSubEntity)
        : null
      let leafletPattern = this.refs[activePattern.id].leafletElement
      let originalLatLngs
      let originalEndPoint
      let from, to
      let markerLatLng

      if(controlPointRef !== null)
        markerLatLng= this.refs[controlPointRef].leafletElement.getLatLng()

      // set from, to for endPoint if we have markerLatLng
      if (begin && markerLatLng) {
        from = begin
        to = [markerLatLng.lng, markerLatLng.lat]
      }
      // set just from (when controlPoint is removed)
      else if (begin) {
        from = begin
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
      }
      // // otherwise use the original endpoint
      else {
        originalLatLngs = activePattern.shape.coordinates.map(c => ([c[1], c[0]]))
        originalEndPoint = originalLatLngs[originalLatLngs.length - 1]
        from = [originalEndPoint[1], originalEndPoint[0]] // [latLngs[latLngs.length - 1].lng, latLngs[latLngs.length - 1].lat]
        to = [markerLatLng.lng, markerLatLng.lat]
      }


      let latLngs = leafletPattern.toGeoJSON().geometry.coordinates

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
        let newCoordinates
        let newSegment = await getSegment(points, followRoad)
        let originalSegment = lineString(latLngs)

        // slice line if middle control point
        if (end && begin) {
          let beginPoint = point(latLngs[0])
          let beginSlice = lineSlice(beginPoint, from, originalSegment)
          let endPoint = point(latLngs[latLngs.length - 1])
          let endSlice = lineSlice(end, endPoint, originalSegment)
          newCoordinates = [
            ...beginSlice.geometry.coordinates,
            ...newSegment.coordinates,
            ...endSlice.geometry.coordinates
          ]
        }
        // handle begin control point
        else if (end) {
          let endPoint = point(latLngs[latLngs.length - 1])
          let endSlice = lineSlice(end, endPoint, originalSegment)
          newCoordinates = [
            ...newSegment.coordinates,
            ...endSlice.geometry.coordinates
          ]
        }
        // append latlngs if end control point
        else {
          let beginPoint = point(latLngs[0])
          let beginSlice = lineSlice(beginPoint, from, originalSegment)
          newCoordinates = [
            ...beginSlice.geometry.coordinates,
            ...newSegment.coordinates,
          ]
        }
        let leafletCoords = newCoordinates.map(coord => ll.fromCoordinates(coord))
        leafletPattern.setLatLngs(leafletCoords)
        // // add last coordinate as "stop"
        // let endPoint = newPath[newPath.length - 1]
        // // this.setState({patternStops: })

        return newCoordinates
      }
    // }
  }
  getMapComponents (component, entities, entity, subEntity) {
    // console.log(component, entities, entity, subEntity)
    switch (component) {
      case 'route':
        let route = entity
        let activePattern = route && route.tripPatterns && this.props.activeSubEntity
          ? route.tripPatterns.find(p => p.id === this.props.activeSubEntity)
          : null

        let bounds = this.refs.map && this.refs.map.leafletElement.getBounds()
        // get intervals along path for arrow icons
        let patternLength = activePattern && activePattern.shape ? lineDistance(activePattern.shape, 'meters') : 0
        let zoom = this.refs.map ? this.refs.map.leafletElement.getZoom() : 11
        let iconInterval = zoom > 15
                      ? 200
                      : zoom > 14
                      ? 500
                      : zoom > 12
                      ? 2000
                      : zoom > 10
                      ? 4000
                      : zoom > 6
                      ? 8000
                      : 10000
                      // : 0.001 * Math.exp(zoom - 6) < 3 ? 3 : 0.001 * Math.exp(zoom - 3)

        // let directionIconInterval = patternLength / iconInterval // 2000 // meters
        let lengthsAlongPattern = []
        for (var i = 0; i < Math.floor(patternLength / iconInterval); i++) {
          let distance = i ? iconInterval * i : iconInterval / 2
          let position = along(activePattern.shape, distance, 'meters')
          if (!bounds) continue
          if (position.geometry.coordinates[1] > bounds.getNorth() || position.geometry.coordinates[1] < bounds.getSouth() || position.geometry.coordinates[0] > bounds.getEast() || position.geometry.coordinates[0] < bounds.getWest()) {
            continue
          }
          lengthsAlongPattern.push([distance, position])
        }
        const circleIcon = divIcon({
          className: '',
          iconSize: [24, 24],
          html: `<i class="fa fa-times"/>`
        })
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
                    // console.log(this.state.newLatLngs)
                    let lineColor = route.route_color && this.props.editSettings.editGeometry
                      ? `#${(0xffffff ^ parseInt(route.route_color)).toString(16)}`
                      : route.route_color
                      ? `#${route.route_color}`
                      : this.props.editSettings.editGeometry
                      ? 'red'
                      : 'blue'
                      // this.props.editSettings.editGeometry && isActive
                      // ? 'yellow'
                      // : isActive
                      // ? 'red'
                      // : 'blue'
                    return (
                      <Polyline
                        positions={this.state.newLatLngs || latLngs}
                        ref={pattern.id}
                        key={pattern.id}
                        // draggable={this.props.editSettings.editGeometry && isActive}
                        // onMouseOver={(e) => {
                        //   if (isActive) {
                        //     console.log(e)
                        //     // this.props.toggleEditSetting('editGeometry')
                        //     // this.setState({editable: this.refs[pattern.id].leafletElement})
                        //     // this.refs[pattern.id].leafletElement.enableEdit()
                        //   }
                        // }}
                        onClick={(e) => {
                          if (isActive) {
                            console.log(e)
                            this.addControlPoint(pattern, e.latlng)
                            this.setState({editable: this.refs[pattern.id].leafletElement})
                          }
                        }}
                        dashArray={
                          null
                          // this.props.editSettings.editGeometry && isActive
                          // ? '12,12'
                          // : null
                        }
                        lineCap='butt'
                        lineJoin='miter'
                        color={lineColor
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
            {lengthsAlongPattern.length && this.refs[activePattern.id] // && false
            ?
              lengthsAlongPattern.map((length, index) => {
                let distance = length[0]
                let position = length[1]
                let nextPatternCoord

                // let patternGeojson = this.refs[activePattern.id].leafletElement.toGeoJSON()
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
                  // html: `<span class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x" style="color: #ffc0ff"></i><i class="fa fa-stack-1x fa-arrow-up" style="color: ${color}; transform: rotate(${dir}deg)"></i></span>`,
                  html: `<i class="fa fa-arrow-up" style="color: ${color}; transform: rotate(${dir}deg)"></i>`,
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
                this.props.stops.length && activePattern && activePattern.shape && this.props.editSettings.editGeometry
              ?
              this.state.controlPoints.map((s, index) => {
                // don't include controlPoint on end of segment (for now) or hidden controlPoints
                if (s.stopId && this.props.editSettings.snapToStops)
                  return null
                let nextStop
                let prevControlPoint = this.state.controlPoints[index - 1]
                let nextControlPoint = this.state.controlPoints[index + 1]
                if (index === this.state.controlPoints.length - 1) {

                }
                for (var i = index + 1; i < this.state.controlPoints.length; i++) {
                  if (this.state.controlPoints[i].stopId) {
                    nextStop = this.state.controlPoints[i]
                  }
                }
                let nextPatternCoord

                let begin = prevControlPoint
                          ? prevControlPoint.point
                          : along(activePattern.shape, 0, 'meters')
                let end
                if (nextControlPoint){
                  end = nextControlPoint.point
                }
                let position = s.point
                if (index === this.state.controlPoints.length - 1)
                  console.log([position.geometry.coordinates[1], position.geometry.coordinates[0]])

                const color = s.permanent ? '#000' : '#888'
                const iconType = s.stopId ? 'fa-square' : 'fa-times'
                if (!position || !position.geometry || !position.geometry.coordinates) {
                  return null
                }
                const timesIcon = divIcon({
                  className: '',
                  // iconAnchor: [0, 7],
                  iconSize: [24, 24],
                  html: `<i class="fa ${iconType}" style="color: ${color}"/>`
                })
                return (
                  <Marker
                    position={[position.geometry.coordinates[1], position.geometry.coordinates[0]]}
                    icon={timesIcon}
                    zIndexOffset={1000}
                    // key={Math.random()}
                    ref={`controlPoint-${index}`}
                    draggable={
                      true
                      // !s.hidden
                    }
                    onDragStart={(e) => {
                      const timerFunction = () => {
                        this.handlePatternEdit(`controlPoint-${index}`, begin, end)
                      }
                      timerFunction()
                      timer = setInterval(timerFunction, 500)
                    }}
                    onDragEnd={(e) => {
                      this.handleControlPointDragEnd(e, timer, `controlPoint-${index}`, index)
                    }}
                    onClick={(e) => {
                      console.log('control point clicked', e)
                      // only remove controlPoint if it's not based on pattern stop (i.e., has permanent prop)
                      if (!s.permanent)
                        this.removeControlPoint(activePattern, index, begin, end)
                    }}
                    color='black'
                  >
                  </Marker>
                )
              })
              : null
              }
              {beginPoint && this.props.editSettings.editGeometry && activePattern
              ? <Marker
                  position={beginPoint}
                  icon={circleIcon}
                  ref='controlPointBegin'
                  draggable={true}
                  onDrag={(e) => {

                  }}
                  onDragStart={(e) => {
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
              {this.props.stops.length && activePattern && !this.props.editSettings.hideStops
                ?
                activePattern.patternStops && activePattern.patternStops.map((s, index) => {
                  const stop = this.props.stops.find(ps => ps.id === s.stopId)
                  if (!stop) return null
                  const color = '#000'
                  const patternStopIcon = divIcon({
                    html: `<span class="fa-stack">
                            <i class="fa fa-circle fa-stack-2x"></i>
                            <strong class="fa-stack-1x fa-inverse calendar-text">${index + 1}</strong>
                          </span>`,
                    // html: `<span class="fa-stack fa-3x">
                    //         <i class="fa fa-bus fa-stack-2x" style="background-color: white"></i>
                    //         <strong class="fa-stack-1x fa-inverse calendar-text">27</strong>
                    //       </span>`,
                    // html: `<i class="fa fa-bus" style="color: ${color} border: 10px solid white"></i>`,
                    className: '',
                    iconSize: [24, 24],
                  })
                  return (
                    <Marker
                      position={[stop.stop_lat, stop.stop_lon]}
                      // center={[stop.stop_lat, stop.stop_lon]}
                      style={{cursor: 'move'}}
                      // radius={4}
                      icon={patternStopIcon}
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
                          <ButtonGroup>
                          <Button
                            onClick={() => {
                              this.props.setActiveEntity(this.props.feedSource.id, 'stop', stop)
                            }}
                          >
                            <Icon name='pencil'/>
                          </Button>
                          <Button
                            bsStyle='danger'
                            onClick={() => {
                              this.removeStopFromPattern(activePattern, stop, index)
                            }}
                          >
                            <Icon name='trash'/>
                          </Button>
                          </ButtonGroup>
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
                this.props.stops.length && activePattern && this.props.editSettings.addStops && this.props.mapState.zoom > 14
                ?
                this.props.stops
                .filter(stop => {
                  if (!bounds) return false
                  if (stop.stop_lat > bounds.getNorth() || stop.stop_lat < bounds.getSouth() || stop.stop_lon > bounds.getEast() || stop.stop_lon < bounds.getWest()) {
                    return false
                  }
                  else {
                    return true
                  }
                })
                .map((stop, index) => {
                  if (!stop) return null
                  let patternStop = activePattern.patternStops.find(ps => ps.stopId === stop.id)
                  if (patternStop) return null
                  const color = 'blue'
                  const busIcon = divIcon({
                    html: `<span class="fa-stack" style="opacity: 0.3">
                            <i class="fa fa-circle fa-stack-2x" style="color: #ffffff"></i>
                            <i class="fa fa-bus fa-stack-1x" style="color: ${color}"></i>
                          </span>`,
                    // html: `<i class="fa fa-bus" style="color: ${color} border: 10px solid white"></i>`,
                    className: '',
                    iconSize: [24, 24],
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
                          <SplitButton
                            title={<span><Icon name='plus'/> Add stop</span>}
                            id={`split-button-basic-${i}`}
                            bsStyle='success'
                            onSelect={(key) => {
                              this.addStopToPattern(activePattern, stop, key)
                            }}
                            onClick={(e) => {
                              this.addStopToPattern(activePattern, stop)
                            }}
                          >
                            <MenuItem value={activePattern.patternStops.length} eventKey={activePattern.patternStops.length}>
                              Add to end (default)
                            </MenuItem>
                            {activePattern.patternStops && activePattern.patternStops.map((stop, i) => {
                              let index = activePattern.patternStops.length - i
                              return (
                                <MenuItem value={index - 1} eventKey={index - 1}>
                                  {index === 1 ? 'Add to beginning' : `Insert as stop #${index}`}
                                </MenuItem>
                              )
                            })}
                          </SplitButton>
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
        // console.log(entities)
        return entities ? entities.map(stop => {
          const isActive = this.props.activeEntity && this.props.activeEntity.id === stop.id

          if (!isActive) {
            if (!this.props.mapState.zoom || this.props.mapState.zoom < 14) {
              return null
            }
            if (stop.stop_lat > this.props.mapState.bounds.getNorth() || stop.stop_lat < this.props.mapState.bounds.getSouth() || stop.stop_lon > this.props.mapState.bounds.getEast() || stop.stop_lon < this.props.mapState.bounds.getWest()) {
              return null
            }
          }
          if (isNaN(stop.stop_lat) || isNaN(stop.stop_lon)) {
            return null
          }
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
              this.refs.map.leafletElement.removeEventListener('mousemove')
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
          const color = editingStop
            // yellow means actively changing position
            ? 'yellow'
            : this.state.editFinished === stop.id && isActive
            // red means position has been edited
            ? 'red'
            : this.props.activeEntity && isActive
            // green means stop is active
            ? 'green'
            // blue is default
            : 'blue'
          const busIcon = divIcon({
            html: `<span class="fa-stack bus-stop-icon">
                    <i class="fa fa-circle fa-stack-2x" style="color: ${color}"></i>
                    <i class="fa fa-stack-1x fa-bus"></i>
                  </span>`,
            // html: `<span class="fa-stack fa-3x">
            //         <i class="fa fa-bus fa-stack-2x" style="background-color: white"></i>
            //         <strong class="fa-stack-1x fa-inverse calendar-text">27</strong>
            //       </span>`,
            // html: `<i class="fa fa-bus" style="color: ${color} border: 10px solid white"></i>`,
            className: '',
            iconSize: [24, 24],
          })
          const marker = (
            <Marker
              position={stopLatLng}
              icon={busIcon}
              // zIndexOffset={1000}
              ref={`${stop.id}`}
              draggable={isActive}
              onDragEnd={(e) => {
                console.log(e)
                let latlng = e.target.getLatLng()

                const precision = 100000000 // eight decimal places is accurate up to 1.1 meters
                this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {stop_lat: Math.round(latlng.lat * precision) / precision, stop_lon: Math.round(latlng.lng * precision) / precision})
                this.refs[`${stop.id}`].leafletElement.setLatLng(latlng)
              }}
              onClick={(e) => {
                console.log('stop clicked', e)
                // this.resetMap()

                // set active entity
                if (!isActive)
                  this.props.setActiveEntity(this.props.feedSource.id, 'stop', stop)
              }}
            >
            </Marker>
          )
          const circleMarker = (
            <CircleMarker
              center={this.state.editFinished === stop.id || (this.state.editStop === stop.id && this.state.editStopLatLng) ? this.state.editStopLatLng : stopLatLng}
              fillOpacity={1.0}
              radius={4}
              ref={stop.id}
              key={`${stop.id}`}
              color={color}
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
                  this.refs.map.leafletElement
                    .on('mousemove', (e) => {
                      this.refs[stop.id].leafletElement.setLatLng(e.latlng)
                    })
                  document.addEventListener('keydown', escapeListener, false)
                }
                // click while actively editing: stop editing and fire update action
                else if (editingStop) {
                  console.log('stop editing')
                  this.setState({editStop: null, editFinished: stop.id, editStopLatLng: e.latlng})
                  this.refs.map.leafletElement.removeEventListener('mousemove')
                  document.removeEventListener('keydown', escapeListener, false)
                  const precision = 100000000 // eight decimal places is accurate up to 1.1 meters
                  this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {stop_lat: Math.round(e.latlng.lat * precision) / precision, stop_lon: Math.round(e.latlng.lng * precision) / precision})
                }
                // if active stop, begin editing
                else if (isActive) {
                  this.setState({editStop: stop.id})
                  this.refs.map.leafletElement
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
    // console.log(this.state)
    // console.log(this.state.controlPoints)
    // console.log(this.refs.map)
    const { feedSource, feedInfo, activeComponent, entities, activeEntity, subComponent } = this.props
    // if (!feedSource) return null
    // console.log(entities)
    //const summary = version.validationSummary
    // const bounds = this.getBounds(this.props.activeComponent, this.props.entities) || [[34, -87], [33, -86]]
    const offset = 0.005
    let feedSourceBounds = feedSource && feedSource.latestValidation && feedSource.latestValidation.bounds
      ? [[feedSource.latestValidation.bounds.north + offset, feedSource.latestValidation.bounds.west - offset], [feedSource.latestValidation.bounds.south - offset, feedSource.latestValidation.bounds.east + offset]]
      : [[90, -90], [-90, 90]]
    let bounds = feedSourceBounds
    let stop = activeComponent === 'stop' && activeEntity
    let route = activeComponent === 'route' && activeEntity
    // don't adjust bounds if state tells us not to or editing is in progress because that's really annoying
    // if (this.props.editSettings.editGeometry || this.props.editSettings.addStops || this.props.entityEdited) {
    //   let mapBounds = this.refs.map.leafletElement.getBounds()
    //   bounds = mapBounds
    // }
    // if active stop
    // else if (activeEntity && stop && activeComponent === 'stop' && !isNaN(stop.stop_lat) && !isNaN(stop.stop_lon)) {
    //   bounds = [[stop.stop_lat + offset, stop.stop_lon - offset], [stop.stop_lat - offset, stop.stop_lon + offset]]
    // }
    // // if active trip pattern
    // else if (activeEntity && route && activeComponent === 'route' && subComponent === 'trippattern') {
    //   if (this.refs.patterns) {
    //     let patternBounds = this.refs.patterns.leafletElement.getBounds()
    //     if (patternBounds && patternBounds.isValid()){
    //       bounds = [[patternBounds.getNorth() + offset, patternBounds.getWest() - offset], [patternBounds.getSouth() - offset, patternBounds.getEast() + offset]]
    //     }
    //   }
    // }
    // // fall back to current state
    // else if (this.refs.map)  {
    //   let mapBounds = this.refs.map.leafletElement.getBounds()
    //   bounds = mapBounds
    // }
    let mapWidth = this.state.width - this.props.offset - 54
    // console.log('map width' + mapWidth)
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
          <LayersControl.Overlay name='Route Alignments'>
            <FeatureGroup>
              {this.props.tripPatterns ? this.props.tripPatterns.map((tp) => {
                if(!tp.latLngs) return null;
                return <Polyline key={`static-${tp.id}`} positions={tp.latLngs} weight={2} color='#888' />
              }) : null}
            </FeatureGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay
            // defaultChecked={this.props.activeComponent === 'stop' && this.props.entities}
            name='Stop Locations'
          >
            <StopLayer
              stops={this.props.tableData.stop}
            />
          </LayersControl.Overlay>
        </LayersControl>
        {
          this.getMapComponents(this.props.activeComponent, this.props.entities, this.props.activeEntity, this.props.activeSubEntity)
        }
      </Map>
    )
  }
}
