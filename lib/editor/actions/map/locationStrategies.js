// @flow

import type {dispatchFn, getStateFn} from '../../../types/reducers'
import { updatingLocationShape } from '../active'

/**
 * Updates the location shape (Polygon, polyline, multi polygon or polyline)
 */
export function updateLocationShape (
  shape: Array
) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    return dispatch(updatingLocationShape(shape))
  }
}
