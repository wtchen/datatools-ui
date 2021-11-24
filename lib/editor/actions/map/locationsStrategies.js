// @flow

// import along from '@turf/along'
// import ll from '@conveyal/lonlat'
// import clone from 'lodash/cloneDeep'
// import lineDistance from 'turf-line-distance'
// import lineSliceAlong from '@turf/line-slice-along'
// import lineSlice from 'turf-line-slice'
// import lineString from 'turf-linestring'
// import point from 'turf-point'

// import {updateActiveGtfsEntity, saveActiveGtfsEntity} from '../active'
// import {updatePatternStops} from '../tripPattern'
// import {generateUID} from '../../../common/util/util'
// import {POINT_TYPE} from '../../constants'
// import {newGtfsEntity} from '../editor'
// import {setErrorMessage} from '../../../manager/actions/status'
// import {updatePatternGeometry} from '../map'
// import {getControlPoints} from '../../selectors'
// import {polyline as getPolyline} from '../../../scenario-editor/utils/valhalla'
// import {getTableById} from '../../util/gtfs'
import {
  constructPolygonPoint
  // controlPointsFromSegments,
  // newControlPoint,
  // stopToPatternStop,
  // recalculateShape,
  // getPatternEndPoint,
  // projectStopOntoLine,
  // street,
  // stopToPoint,
  // constructPoint
} from '../../util/map'
// import {coordinatesFromShapePoints} from '../../util/objects'
// import type {ControlPoint, GtfsStop, LatLng, Pattern} from '../../../types'
import type {dispatchFn, getStateFn} from '../../../types/reducers'

/**
 * Creates a new stop at click location (leaflet latlng) and extends the pattern
 * geometry to the new stop location.
 */
export function addPolygonPoint (
  latlng: LatLng,
  // addToPattern: boolean = false,
  index: ?number,
  activeLocation: Pattern
) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    // create location polygon point
    const pt = constructPolygonPoint(latlng)
    console.log(pt)
  }
}

// dispatch adding the point to the Polygon list
// Something like dispatch(addStopToPattern(activePattern, newStop, index))

//   return constructPolygonPoint(latlng)
//     .then(stop => dispatch(newGtfsEntity(null, 'stop', stop, true, false))
//       .then(newStop => {
//         if (addToPattern && newStop) {
//           // Add stop to end of pattern
//           return dispatch(addStopToPattern(activePattern, newStop, index))
//             .then(result => newStop)
//         }
//         return newStop
//       }))
// }
// }
