import along from '@turf/along'
import ll from '@conveyal/lonlat'
import clone from 'lodash.clonedeep'
import lineDistance from 'turf-line-distance'
import lineSliceAlong from '@turf/line-slice-along'
import lineSlice from 'turf-line-slice'
import lineString from 'turf-linestring'
import point from 'turf-point'

import {updateActiveGtfsEntity, saveActiveGtfsEntity} from '../active'
import {generateUID} from '../../../common/util/util'
import {POINT_TYPE} from '../../constants'
import {newGtfsEntity} from '../editor'
import {setErrorMessage} from '../../../manager/actions/status'
import {updatePatternGeometry} from '../map'
import {getControlPoints} from '../../selectors'
import {getSegment, polyline as getPolyline} from '../../../scenario-editor/utils/valhalla'
import {getTableById} from '../../util/gtfs'
import {
  constructStop,
  stopToPatternStop,
  recalculateShape,
  getPatternEndPoint,
  street,
  constructPoint
} from '../../util/map'

function addingStopToPattern (pattern, stop, index) {
  return {
    type: 'ADDING_STOP_TO_PATTERN',
    pattern,
    stop,
    index
  }
}

/**
 * Creates a new stop at click location (leaflet latlng) and extends the pattern
 * geometry to the new stop location.
 */
export function addStopAtPoint (latlng, addToPattern = false, index, activePattern) {
  return function (dispatch, getState) {
    // create stop
    return constructStop(latlng, activePattern.feedId)
      .then(stop => dispatch(newGtfsEntity(activePattern.feedId, 'stop', stop, true, false))
        .then(newStop => {
          if (addToPattern && newStop) {
            // Add stop to end of pattern
            return dispatch(addStopToPattern(activePattern, newStop, index))
              .then(result => newStop)
          }
          return newStop
        }))
  }
}

/**
 * Creates new stops at intersections according to edit settings (e.g., distance
 * from intersection, whether it should be on the near or far side of the
 * intersection, etc.) and extends the pattern geometry through the stops.
 *
 * FIXME for the SQL editor version
 */
export function addStopAtIntersection (latlng, activePattern, controlPoints) {
  return async function (dispatch, getState) {
    const endPoint = getPatternEndPoint(activePattern, controlPoints)
    street(endPoint, latlng)
      .then(json => {
        if (json) {
          const extension = [].concat.apply([], json.data.features.map(f => f.geometry.coordinates))
          const patternStops = [...activePattern.patternStops]
          // trim added coordinates from end of existing pattern shape to end of extension
          const last = json.data.features[json.data.features.length - 1]
          const start = constructPoint(endPoint)
          const end = constructPoint(last.geometry.coordinates[last.geometry.coordinates.length - 1])
          // TODO-lineSlice: refactor below code to not use lineSlice
          // the current code may have undesired results in cases where the shape overlaps itself
          const trimmed = lineSlice(start, end, {type: 'Feature', geometry: {type: 'LineString', coordinates: extension}})
          const { afterIntersection, intersectionStep, distanceFromIntersection } = getState().editor.editSettings.present
          const shape = {type: 'LineString', coordinates: [...activePattern.shape.coordinates, ...trimmed.geometry.coordinates]}
          dispatch(updateActiveGtfsEntity(activePattern, 'trippattern', {shape}))
          dispatch(saveActiveGtfsEntity('trippattern'))
          return Promise.all(json.data.features.map((feature, index) => {
            // create stops only at specified step
            if (index % intersectionStep !== 0) {
              return null
            }
            const toVertex = json.vertices.find(v => v.index === feature.properties.toVertex)
            // skip vertex if no intersection exists
            if (toVertex.incidentStreets.length <= 2) {
              return null
            }
            // skip vertex if incidentStreets tags highway !== primary or secondary
            // else if (toVertex) {
            //
            // }

            // modify location according to distanceFromIntersection and before/after
            const start = afterIntersection
              ? constructPoint(feature.geometry.coordinates[feature.geometry.coordinates.length - 1])
              : constructPoint(shape.coordinates[0])
            const end = afterIntersection
              ? constructPoint(shape.coordinates[shape.coordinates.length - 1])
              : constructPoint(feature.geometry.coordinates[feature.geometry.coordinates.length - 1])
            // TODO-lineSlice: refactor below code to use only relevant section of shape with lineSlice
            // the current code may have undesired results in cases where the shape overlaps itself
            const lineFromPoint = lineSlice(start, end, {type: 'Feature', geometry: shape})
            const stopLocation = along(lineFromPoint, distanceFromIntersection / 1000, {units: 'kilometers'})
            const latlng = ll.toLeaflet(stopLocation.geometry.coordinates)
            // const {afterIntersection, intersectionStep, distanceFromIntersection} = getState().editor.editSettings.present
            return dispatch(addStopAtPoint(latlng, false, patternStops.length, activePattern))
          }))
            .then(stops => {
              stops.map(s => {
                // add new stop to array
                if (s) {
                  // FIXME: Update shape dist traveled
                  patternStops.push(stopToPatternStop(s))
                }
              })
              // update and save all new stops to pattern
              dispatch(updateActiveGtfsEntity(getState().editor.data.active.subEntity, 'trippattern', {patternStops}))
              return dispatch(saveActiveGtfsEntity('trippattern'))
            })
        }
      })
  }
}

/**
 * Creates new stops at the desired distance interval and extends to pattern
 * geometry to the stop location.
 *
 * FIXME for the SQL editor version
 */
export function addStopAtInterval (latlng, activePattern, controlPoints) {
  return function (dispatch, getState) {
    const {data, editSettings} = getState().editor
    if (activePattern.patternStops.length === 0) {
      // Create first stop at click location if no pattern stops exist
      return dispatch(addStopAtPoint(latlng, true, 0, activePattern))
    } else {
      // Extend pattern to point
      const patternStops = [...activePattern.patternStops]
      // Extend pattern to click point
      const endPoint = getPatternEndPoint(activePattern, controlPoints)
      dispatch(extendPatternToPoint(activePattern, endPoint, latlng, null, editSettings.present.stopInterval))
        .then(result => {
          const newStopLatLngs = []
          // Iterate over newly added controlPoints and create stops for each.
          for (var i = controlPoints.length; i < result.controlPoints.length; i++) {
            const controlPoint = result.controlPoints[i]
            const stopLatlng = ll.toLeaflet(controlPoint.point.geometry.coordinates)
            newStopLatLngs.push(stopLatlng)
          }
          // Create new stops at the interval points.
          return Promise.all(newStopLatLngs.map((latlng, i) => dispatch(
            addStopAtPoint(latlng, false, patternStops.length + i, activePattern))
          ))
            .then(newStops => {
              newStops.forEach((s, index) => {
                // Add new stop to pattern stops list
                if (s) {
                  const stopControlPoint = result.controlPoints[controlPoints.length + index]
                  const patternStop = stopToPatternStop(s)
                  // Set pattern stop's shape dist traveled.
                  patternStop.shapeDistTraveled = stopControlPoint.distance
                  patternStops.push(patternStop)
                  // Update stop properties on new control points.
                  stopControlPoint.pointType = POINT_TYPE.STOP
                  stopControlPoint.stopId = s.stop_id
                }
              })
              console.log('updated control points', result)
              dispatch(updatePatternGeometry(result))
              dispatch(updateActiveGtfsEntity(data.active.subEntity, 'trippattern', {patternStops}))
              return dispatch(saveActiveGtfsEntity('trippattern'))
            })
            // TODO: switch to adding multiple stops per action (Java controller and action promise need updating)
            // const newStops = await this.addStopsAtPoints(newStopLatLngs)
            // // add new stop to array
            // patternStops = [...patternStops, ...newStops.map(s => stopToPatternStop(s))]
        })
    }
  }
}

export function addStopToPattern (pattern, stop, index) {
  return function (dispatch, getState) {
    dispatch(addingStopToPattern(pattern, stop, index))
    const {data, editSettings} = getState().editor
    const patternStops = [...pattern.patternStops]
    // FIXME replace with patternSegments
    const coordinates = pattern.shape && pattern.shape.coordinates
    const missingIndex = typeof index === 'undefined' || index === null
    const stopSequence = missingIndex ? patternStops.length : index
    const newStop = stopToPatternStop(stop, stopSequence)

    if (missingIndex) {
      // if adding stop to end, also a proxy for extending pattern to point
      if (coordinates) {
        // if shape coordinates already exist, extend them to the new stop.
        const endPoint = ll.toLeaflet(coordinates[coordinates.length - 1])
        patternStops.push(newStop)
        dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
        const {stop_lon: lng, stop_lat: lat} = stop
        return dispatch(extendPatternToPoint(pattern, endPoint, {lng, lat}, stop))
      } else {
        // If shape coordinates do not exist, add pattern stop and get shape
        // between stops (if more than one stops exists).
        patternStops.push(newStop)
        if (patternStops.length > 1) {
          const stops = getTableById(data.tables, 'stop')
          const previousStopId = patternStops[patternStops.length - 2].stopId
          const previousStop = stops.find(s => s.stop_id === previousStopId)
          if (!previousStop) {
            throw new Error(`Stop not found for stop_id ${previousStopId}.`)
          }
          return getSegment([[previousStop.stop_lon, previousStop.stop_lat], [stop.stop_lon, stop.stop_lat]], editSettings.present.followStreets)
            .then(geojson => {
              dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
              // FIXME Update pattern geometry here? Currently, the behavior is
              // that no shape will be created if stops are added to a shapeless
              // pattern. This might be ok because it essentially will not create
              // a shape of any kind unless explicitly asked for. There may be
              // some use cases where this is desired.
              return dispatch(saveActiveGtfsEntity('trippattern'))
            })
        } else {
          // If the pattern only contains a single stop, there is no need to
          // draw a shape of any kind.
          dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
          return dispatch(saveActiveGtfsEntity('trippattern'))
        }
      }
      // TODO: construct shape if not following roads
      // updateActiveGtfsEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}})
    } else {
      // if adding stop in middle
      patternStops.splice(index, 0, newStop)
      dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
      return dispatch(saveActiveGtfsEntity('trippattern'))
    }
    // TODO: add strategy for stop at beginning
  }
}

/**
 * Extends shape of input pattern from specified end point to new end point,
 * optionally following streets if the setting is enabled.
 */
function extendPatternToPoint (pattern, endPoint, newEndPoint, stop = null, splitInterval = 0) {
  return async function (dispatch, getState) {
    const {followStreets} = getState().editor.editSettings.present
    const {controlPoints, patternSegments} = getControlPoints(getState())
    const clonedControlPoints = clone(controlPoints)
    let newShape
    if (followStreets) {
      newShape = await getPolyline([endPoint, newEndPoint])
    }
    if (!newShape) {
      // Get single coordinate for straight line if polyline fails or if not
      // following streets.
      newShape = [ll.toCoordinates(endPoint), ll.toCoordinates(newEndPoint)]
    }
    const initialDistance = pattern.shape
      ? lineDistance(pattern.shape, 'meters')
      : 0
    const newLineSegment = lineString(newShape)
    const distanceAdded = lineDistance(newLineSegment, 'meters')
    const newPatternSegments = [...patternSegments]
    if (splitInterval > 0) {
      // If split interval is provided (e.g., to add stops at intervals along
      // new segment), split new line segment and add temp control points (later
      // to be assigned stop IDs).
      const numIntervals = Math.floor(distanceAdded / splitInterval)
      let previousDistance = 0
      // Iterate over intervals and store positions for constructing stops
      for (var i = 1; i <= numIntervals; i++) {
        const splitDistance = (i * splitInterval)
        // Default unit for lineSliceAlong is km (meters not supported).
        console.log(`slicing line from ${previousDistance} m to ${splitDistance} m.`, newLineSegment)
        const slicedSegment = lineSliceAlong(newLineSegment, previousDistance / 1000, splitDistance / 1000)
        const newCoords = slicedSegment.geometry.coordinates
        // Push new coordinates to updated pattern segments
        newPatternSegments.push(newCoords)
        // Add stops along new line segment at distance (initial dist +
        // stopInterval)
        const endPoint = point(newCoords[newCoords.length - 1])
        const controlPoint = {
          id: generateUID(),
          point: endPoint,
          // If control points are to become stops, point type and stop ID must
          // be added later (e.g., in addStopAtInterval).
          pointType: POINT_TYPE.ANCHOR,
          distance: initialDistance + splitDistance
        }
        clonedControlPoints.push(controlPoint)
        // Update previous distance
        previousDistance = splitDistance
      }
    } else {
      // If not splitting segment, simply add new shape coordinates.
      newPatternSegments.push(newShape)
    }
    if (stop) {
      // If extending to a stop, add control point for stop.
      if (splitInterval > 0) {
        throw new Error('The stop argument should not be provided in conjunction with a split interval. This will result in redundant control points.')
      }
      const controlPoint = {
        id: generateUID(),
        point: point(ll.toCoordinates(newEndPoint)),
        pointType: POINT_TYPE.STOP,
        distance: initialDistance + distanceAdded,
        stopId: stop.stop_id
      }
      clonedControlPoints.push(controlPoint)
    }
    // Update pattern geometry and control points
    const result = {
      controlPoints: clonedControlPoints,
      patternSegments: newPatternSegments
    }
    if (stop) {
      dispatch(updatePatternGeometry(result))
      await dispatch(saveActiveGtfsEntity('trippattern'))
    }
    console.log('done extending pattern!', result)
    return result
  }
}

export function removeStopFromPattern (pattern, stop, index, controlPoints, patternCoordinates) {
  return async function (dispatch, getState) {
    if (!controlPoints || !patternCoordinates) {
      const result = getControlPoints(getState())
      controlPoints = result.controlPoints
      patternCoordinates = result.patternSegments
    }
    const {shapePoints} = pattern
    // let shape
    if (!shapePoints || shapePoints.length === 0) {
      // if pattern has no shape points, don't attempt to refactor pattern shape
      console.log('pattern coordinates do not exist')
    } else {
      const {followStreets} = getState().editor.editSettings.present
      let result
      try {
        result = await recalculateShape({
          controlPoints,
          editType: 'delete',
          index, // FIXME this index needs to be offset by non-stop control points : cpIndex,
          followStreets,
          pattern,
          patternCoordinates
        })
      } catch (err) {
        console.log(err)
        dispatch(setErrorMessage({message: `Could not remove pattern from stop: ${err}`}))
        return
      }
      if (!result.coordinates) {
        // Last stop was removed?, set coordinates to null.
        console.warn('Coordinates from recalculating shape are null.')
        // shape = null
      } else {
        // FIXME
        // shape = {type: 'LineString', coordinates}
      }
      // Update pattern geometry
      dispatch(updatePatternGeometry({
        controlPoints: result.updatedControlPoints,
        patternSegments: result.coordinates
      }))
    }
    // Update pattern stops (whether or not geometry exists)
    const patternStops = [...pattern.patternStops]
    patternStops.splice(index, 1)
    dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
    // saving the trip pattern will recalculate the control points
    // FIXME: Is the above comment still true? Control points are handled by selector.
    dispatch(saveActiveGtfsEntity('trippattern'))
  }
}
