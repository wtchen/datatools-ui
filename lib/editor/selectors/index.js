import clone from 'lodash.clonedeep'
// import oneLine from 'common-tags/lib/oneLine'
import {List} from 'immutable'
import randomColor from 'randomcolor'
import SortDirection from 'react-virtualized/dist/commonjs/Table/SortDirection'
import {createSelector} from 'reselect'
import along from '@turf/along'
import lineDistance from 'turf-line-distance'
import featurecollection from 'turf-featurecollection'
import lineSliceAlong from '@turf/line-slice-along'
import lineSlice from 'turf-line-slice'
import lineString from 'turf-linestring'
import point from 'turf-point'

import {getEditorTable} from '../util'
import {getTableById, getEntityName} from '../util/gtfs'
import {POINT_TYPE} from '../constants'
import {
  generateControlPointsFromPatternStops,
  getLineSlices,
  newControlPoint,
  projectStopOntoLine
} from '../util/map'
import {validate} from '../util/validation'
import {coordinatesFromShapePoints} from '../util/objects'

const getActiveEntity = state => state.editor.data.active.entity

const getActiveId = createSelector(
  [state => state.editor.data.active.entity],
  entity => (entity ? entity.id : undefined)
)

const getActiveComponent = state => state.editor.data.active.component
const getActiveFeedSourceId = state => state.editor.data.active.feedSourceId

const getActiveTable = createSelector(
  [getActiveComponent, state => state.editor.data.tables],
  (component, tableData) => component && getTableById(tableData, component)
)

export const getValidationErrors = createSelector(
  [
    getActiveComponent,
    getActiveEntity,
    getActiveTable,
    state => state.editor.data.tables
  ],
  (component, entity, entities, tableData) => {
    return getEditorTable(component) && entity
      ? getEditorTable(component).fields
        .map((field, colIndex) =>
          validate(field, entity[field.name], entities, entity, tableData)
        )
        .filter(e => e)
      : []
  }
)

export const getActiveEntityList = createSelector(
  [
    getActiveId,
    getActiveComponent,
    getActiveTable,
    state => state.editor.data.sort,
    getActiveFeedSourceId
  ],
  (activeId, component, entities, sort) => {
    const list =
      entities && entities.length
        ? entities.map((entity, index) => {
          const {id} = entity
          const isActive = activeId && id === activeId
          const name = getEntityName(entity) || '[Unnamed]'
          return {...entity, name, id, isActive}
        })
        : []
    // return sorted Immutable List (based on sort value from store)
    return List(list)
      .sortBy(entity => entity[sort.key])
      .update(
        list => (sort.direction === SortDirection.DESC ? list.reverse() : list)
      )
  }
)

const getActivePattern = state => state.editor.data.active.subEntity
const getStops = state => state.editor.data.tables.stops
const getPresentControlPoints = state => {
  return state.editor.editSettings.present.controlPoints
}
export const getTripCounts = state => state.editor.data.tables.trip_counts
export const getActivePatternTripCount = createSelector(
  [
    getActivePattern,
    getTripCounts
  ],
  (pattern, tripCounts) => {
    if (!pattern) return 0
    const item = tripCounts.pattern_id.find(item => item.type === pattern.patternId)
    return item ? item.count : 0
  }
)

const getActiveShapePoints = createSelector(
  [
    getActivePattern,
    getStops,
    state => state.editor.editSettings.present.shapePoints
  ],
  (pattern, stops, pastShapePoints) => {
    return pastShapePoints || (pattern && pattern.shapePoints)
  }
)

const getPresentPatternSegments = state =>
  state.editor.editSettings.present.patternSegments

export const getControlPoints = createSelector(
  [
    getActivePattern,
    getActiveShapePoints,
    getStops,
    getPresentControlPoints,
    getPresentPatternSegments
  ],
  (
    pattern,
    shapePoints,
    stops,
    previousControlPoints,
    previousPatternSegments
  ) => {
    let controlPoints = []
    let patternSegments = []
    if (!pattern || !pattern.patternStops) {
      return {patternSegments, controlPoints}
    }
    const {patternStops} = pattern
    const hasShapePoints = shapePoints.length > 1
    const hasPatternStops = patternStops.length > 0
    if (
      previousControlPoints &&
      previousControlPoints.length &&
      previousPatternSegments &&
      previousPatternSegments.length &&
      // If there are more pattern stops than control points, we cannot default
      // to the previous control points because this will be inaccurate.
      patternStops.length <= previousControlPoints.length
    ) {
      // Default to previous control points and pattern segments (i.e., no need
      // to recalulate these because a UI action has generated new sets).
      return {
        controlPoints: previousControlPoints,
        patternSegments: previousPatternSegments
      }
    }
    if (shapePoints.length === 1) {
      console.warn('Pattern shape must not have a single point. Defaulting shape points to empty list.')
    }
    if (hasShapePoints) {
      if (hasPatternStops) {
        // Project pattern stops onto shape and add control points if distances
        // do not exist.
        // FIXME: independently check distance value existence for each pattern
        // stop, rather than assuming they're all missing if the first and last
        // pattern stop values are missing.
        const projectStops =
          patternStops[0].shapeDistTraveled === null &&
          patternStops[patternStops.length - 1].shapeDistTraveled === null &&
          shapePoints.filter(sp => sp.pointType === POINT_TYPE.STOP) <
            patternStops.length
        const totalShapePointsDistTraveled = shapePoints[shapePoints.length - 1].shapeDistTraveled
        let result
        try {
          result = addPatternStopsToShapePoints(
            shapePoints,
            patternStops,
            stops,
            projectStops,
            totalShapePointsDistTraveled
          )
        } catch (error) {
          console.warn(`Error adding pattern stops to shapepoints`, error)
          result = {shapePoints, patternSegments: [], error}
        }
        patternSegments = result.patternSegments
        // Get control points from shape points result, which will include any
        // projected stops and any pre-existing anchors.
        controlPoints = getControlPointsFromShapePoints(result.shapePoints)
        if (controlPoints.length - 1 > patternSegments.length) {
          // There are non-stop control points that need to be added in.
          for (let i = 0; i < controlPoints.length; i++) {
            const nextControlPoint = controlPoints[i + 1]
            if (nextControlPoint && nextControlPoint.pointType === 1) {
              // If the following control point is a user-defined anchor, slice
              // current line at the following control point and splice into
              // array of segments.
              // console.log(`control point ${i}; pattern segment ${i - 1}`, nextControlPoint, patternSegments[i])
              const {beforeSlice, afterSlice} = getLineSlices(
                lineString(patternSegments[i]),
                nextControlPoint.point
              )
              patternSegments.splice(
                i,
                1,
                beforeSlice.geometry.coordinates,
                afterSlice.geometry.coordinates
              )
            }
          }
        }
        featurecollection([
          ...patternSegments.map(ps => {
            const lineSegment = lineString(ps)
            lineSegment.properties.stroke = randomColor()
            return lineSegment
          }),
          ...controlPoints.map(cp => cp.point)
        ])
        // console.log()
      } else {
        // No pattern stops, return empty array (below).
        // FIXME: Return control points from shape points instead?
      }
    } else {
      // There are no shape points. Check for pattern stops and handle
      // accordingly.
      if (hasPatternStops) {
        // Generate straight-line distance control points/pattern segments from
        // pattern stops.
        console.warn(
          'No shape points found for pattern. Extracting from pattern stops.',
          patternStops
        )
        try {
          const result = generateControlPointsFromPatternStops(patternStops, stops)
          return result
        } catch (e) {
          console.warn(`There was an error generating control points from pattern stops.`, e)
          return {
            controlPoints: [],
            patternSegments: []
          }
        }
      } else {
        // No shape points found, return empty array (below).
        console.warn(
          'No shape points or pattern stops found for pattern. Returning empty arrays.'
        )
        return {
          controlPoints: [],
          patternSegments: []
        }
      }
    }
    // console.log('control points', controlPoints)
    const sortedControlPoints = controlPoints.sort(
      (a, b) => a.distance - b.distance
    )
    // console.log('sorted control points', sortedControlPoints)
    return {
      controlPoints: sortedControlPoints,
      patternSegments
    }
  }
)

/**
 * Get a scale factor to multiply shape dist traveled values by to get distance
 * traveled in meters. The shapeDistTraveled field is intended to be unitless
 * (see GTFS spec: https://developers.google.com/transit/gtfs/reference/#shapestxt).
 * But the units *should* be the same between stop_times.txt, which is used to derive
 * the pattern_stops values, and shapes.txt So, we use the last shapeDistTraveled
 * value for the pattern and the pattern length in meters to come up with a
 * scale factor to multiply by all of the pattern stop shapeDistTraveled values.
 */
function getDistanceScaleFactor (shapePoints) {
  const patternLine = lineString(coordinatesFromShapePoints(shapePoints))
  const patternLengthInMeters = lineDistance(patternLine, 'meters')
  const totalShapePointsDistTraveled = shapePoints[shapePoints.length - 1].shapeDistTraveled
  // If the shape points have no shape dist traveled values, default the scale
  // factor to one.
  let distScaleFactor
  if (totalShapePointsDistTraveled) {
    distScaleFactor = patternLengthInMeters / totalShapePointsDistTraveled
  } else {
    console.warn(`No shape dist traveled value found for final shape point. Distance scale factor defaulting to 1.`)
    distScaleFactor = 1
  }
  return distScaleFactor
}

/**
 * Gets the control points from the list of shape points. Any shape points that
 * have a pointType value of 1 or 2 indicate that a control point/anchor needs
 * to exist at that point.
 */
function getControlPointsFromShapePoints (shapePoints) {
  if (shapePoints.length < 2) {
    throw new Error('Shape points must contain two or more coordinates.')
  }
  const controlPoints = []
  // Return filtered control points and stop points (i.e., non-zero and
  // non-null shape point types)
  const patternLine = lineString(coordinatesFromShapePoints(shapePoints))
  const distScaleFactor = getDistanceScaleFactor(shapePoints)
  const beginPoint = point(patternLine.geometry.coordinates[0])
  shapePoints
    // filter out null or zero values (non control points)
    .filter(shapePoint => shapePoint.pointType)
    .forEach((shapePoint, index) => {
      const p = point([shapePoint.shapePtLon, shapePoint.shapePtLat])
      // Multiply dist traveled by scale factor (in case source data not in meters)
      let distance = shapePoint.shapeDistTraveled * distScaleFactor
      if (!distance && distance !== 0) {
        // Distance is null. Generate using line slice.
        // If we're slicing here, do we need to do it again later (getPatternCoordinates)?
        // FIXME: these are not the right arguments for lineSliceAlong.
        // FIXME: Perhaps we should just be using the
        console.warn(
          `Distance not found for generating distance cp index=${index}. Generating.`
        )
        const result = lineSliceAlong(patternLine, beginPoint, p)
        distance = result.distance
      }
      // FIXME: add stopId into controlPoint props
      const cp = newControlPoint(distance, p, shapePoint)
      // console.log(cp.pointType)
      controlPoints.push(cp)
    })
  return controlPoints
}

/**
 * Given a pattern, naively calculates the nearest point on line for each
 * pattern stop and splices those projected points into the list of shape points
 * for the pattern at the distance specified by the projection operation. The
 * projected points are also inserted into the pattern's list of coordinates.
 */
function addPatternStopsToShapePoints (
  oldShapePoints,
  patternStops,
  stops,
  projectStops = false,
  totalShapePointsDistTraveled
) {
  if (oldShapePoints.length < 2) {
    throw new Error('Shape points must contain two or more coordinates.')
  }
  // FIXME: should this be a clone operation?
  const shapePointsCopy = clone(oldShapePoints)
  const patternSegments = []
  const computedShapePoints = []
  // Keep only those shape points that are associated with stops
  // (this is an empty array if pattern shape has never been edited).
  const stopControlPoints = shapePointsCopy.filter(
    sp => sp.pointType === POINT_TYPE.STOP
  )
  const patternLine = lineString(coordinatesFromShapePoints(shapePointsCopy))
  const patternLengthInMeters = lineDistance(patternLine, 'meters')
  // Get the distance scale factor (pattern length / total shape dist traveled).
  const distScaleFactor = getDistanceScaleFactor(shapePointsCopy)
  if (distScaleFactor > 1.2 || distScaleFactor < 0.8) {
    console.warn(`Source data's shape_dist_traveled values are likely not in meters. Scale factor for distances is ${distScaleFactor} (derived from pattern length in meters / max shape_dist_traveled value)`)
  }
  const beginPoint = point(patternLine.geometry.coordinates[0])
  const endPointIndex = patternLine.geometry.coordinates.length - 1
  const endPoint = point(patternLine.geometry.coordinates[endPointIndex])
  let previousDistance = 0
  let remainingLine = patternLine
  // Iterate over pattern stops and FIXME what does this do?
  for (var i = 0; i < patternStops.length; i++) {
    const patternStop = patternStops[i]
    // Multiply dist traveled by scale factor (in case source data not in meters)
    const scaledDistanceInMeters = patternStop.shapeDistTraveled * distScaleFactor
    const {stopId} = patternStop
    const stop = stops && stops.find(st => st.stop_id === stopId)
    if (!stop) {
      console.warn(`No stop found for pattern stop ID: ${stopId}`, stops)
      continue
    }
    // These values must be filled in each condition below
    let distance, insertIndex, insertPoint, itemsToDelete
    if (projectStops) {
      if (i === 0) {
        // First stop must always be placed at first latlng coordinate
        insertPoint = beginPoint
        // console.log('first stop placed at begin point')
        insertIndex = 0
        distance = 0
        itemsToDelete = 1
      } else if (i === patternStops.length - 1) {
        // Last stop must always be placed at last latlng coordinate
        insertPoint = endPoint
        // console.log('last stop placed at end point')
        insertIndex = endPointIndex
        distance = patternLengthInMeters
        itemsToDelete = 1
      } else {
        // Handle projection of stops onto line
        const result = projectStopOntoLine(stop, remainingLine)
        insertPoint = result.insertPoint
        insertIndex = result.insertIndex
        distance = result.distanceInMeters + previousDistance
        patternStop.shapeDistTraveled = distance
        itemsToDelete = 0
      }
    } else {
      // Using pattern stop distances (i.e., not auto-projecting stops)
      if (
        i < stopControlPoints.length &&
        stopControlPoints[i] &&
        stopControlPoints[i].shapeDistTraveled !== null
      ) {
        // Check shape points for existence of control points. If index is less
        // than number of stop control points, skip.
        // console.log(`skipping index ${i} (control point should exist for stop)`)
        stopControlPoints[i].stopId = stopId
        // Multiply dist traveled by scale factor (in case source data not in meters)
        distance = stopControlPoints[i].shapeDistTraveled * distScaleFactor
        if (i > 0) {
          const sliceDistance = (distance - previousDistance) / 1000
          let lineSegment
          // console.log(remainingLine, sliceDistance, stopControlPoints[i])
          if (sliceDistance <= 0 || isNaN(sliceDistance)) {
            console.warn(`Slice distance for pattern stop index=${i} is ${sliceDistance} (${distance} = ${previousDistance} * scale ${distScaleFactor}). Reverting to straight line.`)
            // If there is no more line segment left, extend line to stop control
            // point and TODO signal warning to user?
            const {coordinates} = remainingLine.geometry
            lineSegment = lineString([
              coordinates[coordinates.length - 1],
              [stopControlPoints[i].shapePtLon, stopControlPoints[i].shapePtLat]
            ])
          } else {
            // Otherwise, slice line at specified distance.
            lineSegment = lineSliceAlong(remainingLine, 0, sliceDistance)
            if (!lineSegment) {
              console.warn(`Could not slice remaining line segment at index=${i}`)
            }
            remainingLine = lineSliceAlong(
              remainingLine,
              sliceDistance,
              lineDistance(remainingLine, 'kilometers')
            )
          }
          patternSegments.push(lineSegment.geometry.coordinates)
          previousDistance = distance
        }
        continue
      }
      // console.log(`generating shape point for stop #${i} at distance: ${scaledDistanceInMeters}`, patternStop, remainingLine)
      if (i === 0 && scaledDistanceInMeters !== 0) {
        console.warn(`Distance for first stop is not zero. Coercing to zero.`)
        distance = 0
        insertPoint = beginPoint
        insertIndex = 0
        itemsToDelete = 1
      } else if (
        i === patternStops.length - 1 &&
        scaledDistanceInMeters !== patternLengthInMeters * distScaleFactor
      ) {
        console.warn(
          `Distance for last stop does not match length of shape. Coercing to total distance of pattern.`
        )
        distance = patternLengthInMeters
        insertPoint = endPoint
        insertIndex = endPointIndex
        itemsToDelete = 1
      } else {
        // FIXME: Determine distance traveled along line
        if (scaledDistanceInMeters === 0) {
          // FIXME: what if this happens not on the first pattern stop
          if (i !== 0) {
            console.warn(
              `shape dist traveled for pattern stop ${i} equals zero. this should not be the case!`
            )
          }
          insertPoint = pointAtFirstCoordinate(remainingLine)
          insertIndex = 0
          distance = 0
          itemsToDelete = 1
        } else {
          // This should cover all cases except the first stop.
          const remainingLineDistance = lineDistance(remainingLine, 'meters')
          // FIXME this is breaking stuff when the remaining line has only one coordinate!!!
          // console.log(`remaining line dist = ${remainingLineDistance}`, remainingLine, scaledDistanceInMeters / 1000)
          if (scaledDistanceInMeters === remainingLineDistance) {
            // This should only be the case with the last stop
            // console.log(`pattern stop ${i}/${patternStops.length} distance is equal to remaining lint distance, setting to end of shape`)
            // FIXME: what if this happens not on the last pattern stop
            insertPoint = pointAtLastCoordinate(remainingLine)
            insertIndex = shapePointsCopy.length - 1
            distance = remainingLineDistance
            itemsToDelete = 1
          } else {
            // This should be the case for all but first and last stops
            distance = scaledDistanceInMeters
            // Use the pattern line to find the lat/lng to use for the generated
            // shape point.
            const lineSegment = lineSliceAlong(
              patternLine,
              0,
              scaledDistanceInMeters / 1000
            )
            insertPoint = pointAtLastCoordinate(lineSegment)
            // Insert generated shape point in the correct location according to
            // its distance along the line.
            insertIndex = shapePointsCopy.findIndex(
              sp => sp.shapeDistTraveled > distance
            )
            itemsToDelete = 0
          }
        }
      }
    }
    // Insert projected stop into shape points list
    const newShapePoint = {
      shapePtLat: insertPoint.geometry.coordinates[1],
      shapePtLon: insertPoint.geometry.coordinates[0],
      pointType: POINT_TYPE.STOP,
      stopId,
      shapeDistTraveled: distance
      // ShapePtSequence doesn't need updating here. The value is replaced for
      // every shape point below in the re-mapping.
    }
    // Insert closest point into pattern shape
    console.log(`inserting shape point at ${insertIndex}`, newShapePoint, shapePointsCopy)
    shapePointsCopy.splice(insertIndex, itemsToDelete, newShapePoint)
    if (i > 0) {
      // Add pattern segment to sliced segments
      let sliceDistance = (distance - previousDistance) / 1000
      if (sliceDistance <= 0 || isNaN(sliceDistance)) {
        // If slice distance is zero or negative, coerce to one meter.
        // Prepare geometries for debugging.
        patternLine.properties.stroke = randomColor()
        const features = featurecollection([
          patternLine,
          remainingLine,
          insertPoint,
          point([stop.stop_lon, stop.stop_lat])
        ])
        console.warn(`Slice distance for pattern stop index=${i} is ${sliceDistance} (${distance} - ${previousDistance}), setting to 1 meter
        http://geojson.io/#data=data:application/json,${encodeURIComponent(JSON.stringify(features))}`, patternStop)
        sliceDistance = 1 / 1000 // set slice distance to 1 meter if negative or zero
      }
      // console.log(`slicing line at ${sliceDistance} km`, remainingLine)
      const lineSegment = lineSliceAlong(remainingLine, 0, sliceDistance)
      // console.log(`slice #${i}/${patternStops.length - 1}`, lineSegment)
      remainingLine = lineSliceAlong(
        remainingLine,
        sliceDistance,
        lineDistance(remainingLine)
      )
      // console.log('remainingLine', remainingLine)
      if (remainingLine.geometry.coordinates.length < 2) {
        throw new Error(
          `Remaining line after pattern stop #${i}/${patternStops.length -
            1} has fewer than two coordinates`
        )
      }
      patternSegments.push(lineSegment.geometry.coordinates)
      previousDistance = distance
    }
    computedShapePoints.push(newShapePoint)
  }
  let previousShapePoint
  for (let i = 0; i < computedShapePoints.length; i++) {
    if (
      i < 0 &&
      previousShapePoint.shapeDistTraveled >=
        computedShapePoints[i].shapeDistTraveled
    ) {
      console.warn(
        `Warning! Shape point for stop index ${i -
          1} is greater than or equal to the next stop shape point`,
        previousShapePoint,
        computedShapePoints[i]
      )
    }
    previousShapePoint = computedShapePoints[i]
  }
  // Renumber ID (sequence) based on index
  return {
    shapePoints: shapePointsCopy.map((sp, index) => ({
      ...sp,
      id: index,
      shapePtSequence: index
    })),
    patternSegments
  }
}

function pointAtFirstCoordinate (lineSegment) {
  return point(lineSegment.geometry.coordinates[0])
}

function pointAtLastCoordinate (lineSegment) {
  const {coordinates} = lineSegment.geometry
  return point(coordinates[coordinates.length - 1])
}

export function sliceAtPoint (
  line,
  beginPoint,
  alongPoint = null,
  lengthInMeters = 0
) {
  if (!alongPoint && !lengthInMeters && lengthInMeters !== 0) {
    throw new Error(
      'Must provide alongPoint argument or positive number for lengthInMeters'
    )
  } else if (!alongPoint) {
    alongPoint = along(line, lengthInMeters, {units: 'meters'})
  }
  const lineSegment = lineSlice(beginPoint, alongPoint, line)

  // measure line segment
  const distance = lineDistance(lineSegment, 'meters')
  const index = lineSegment.geometry.coordinates.length
  return {distance, index, alongPoint, lineSegment}
}
