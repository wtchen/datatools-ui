// @flow
import {secureFetch} from '../../common/actions'
import {getMapFromGtfsStrategy, entityIsNew} from '../util/objects'
import { getEditorNamespace } from '../util/gtfs'
import {fetchGTFSEntities} from '../../manager/actions/versions'
import type {dispatchFn, getStateFn} from '../../types/reducers'

import { receivedNewEntity, savedGtfsEntity } from './active'

export function saveLocation (
  feedId: ?string,
  location: GtfsLocation,
  refetch: ?boolean = true
) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    // Default behaviour: ...
    if (!feedId || !location) {
      return
    }
    // dispatch(savingActiveLocation()) //Update this?

    const notNew = !entityIsNew(location) // Checks if id is -2 or undefined
    const method = notNew ? 'put' : 'post'
    const idParam = notNew ? `/${location.id || ''}` : ''
    const {sessionId} = getState().editor.data.lock

    // Destructure into location metadata and shapes
    // locationmetadata , locationshapes
    const metaDataRoute = 'locationmetadata'
    // const locationShapes = 'locationshapes'

    const metaDataUrl = `/api/editor/secure/${metaDataRoute}${idParam}?feedId=${feedId}&sessionId=${sessionId || ''}`
    // const shapesUrl = `/api/editor/secure/${locationShapes}${idParam}?feedId=${feedId}&sessionId=${sessionId || ''}`

    // const url = `/api/editor/secure/${route}${idParam}?feedId=${feedId}&sessionId=${sessionId || ''}`
    const mappingStrategy = getMapFromGtfsStrategy('location')
    const data = mappingStrategy(location) // convert to snake_case_keys

    // Package our properties
    const locationProperties = {
      'stop_name': data.stop_name,
      'zone_id': data.zone_id,
      'stop_url': data.stop_url,
      'stop_desc': data.stop_desc
    }

    let propertiesString = ''
    const locationPropertiesKeys = Object.keys(locationProperties)
    locationPropertiesKeys.map((key, i) => {
      const propertyVal = locationProperties[key]
      const isLast = i === locationPropertiesKeys.length - 1

      if (propertyVal) {
        propertiesString += `${key}~${propertyVal}${isLast ? '' : '#'}` // ~ is the backend key-value sep., # is the prop sep.
      }
    })

    // Package our metaData
    const metaData = {
      'location_meta_data_id': data.location_id,
      'properties': propertiesString,
      'geometry_type': 'Polygon'
    }

    // TODO: Package our locationShapes

    return dispatch(secureFetch(metaDataUrl, method, metaData))
      .then(res => res.json())
      .then(savedEntity => {
        dispatch(savedGtfsEntity())
        const namespace = getEditorNamespace(feedId, getState())
        // Refetch entity and replace in store
        if (refetch) {
          return dispatch(fetchGTFSEntities({
            namespace,
            id: savedEntity.id,
            type: 'location', // override
            editor: true,
            replaceNew: !notNew
          }))
        } else {
          // Push new entity into store.
          dispatch(receivedNewEntity({component: 'location', entity: savedEntity}))
          return Promise.resolve(savedEntity)
        }
      })
  }
}
