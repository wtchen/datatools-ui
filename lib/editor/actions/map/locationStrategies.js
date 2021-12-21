// @flow

import type { dispatchFn, getStateFn } from '../../../types/reducers'
import { updatingLocationShape } from '../active'
import type { LocationShape } from '../../../types'

/**
 * Updates the location shape (Polygon, polyline, multi polygon or polyline)
 */
export function updateLocationShape (
  shape: Array<LocationShape>
) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    return dispatch(updatingLocationShape(shape))
  }
}
