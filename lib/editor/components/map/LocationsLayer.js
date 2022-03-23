// @flow

import * as L from 'leaflet'
import clone from 'lodash/cloneDeep'
import React, { useState, useEffect } from 'react'
import { EditControlFeatureGroup } from '@andrewdodd/react-leaflet-draw'
import { Polygon, Polyline } from 'react-leaflet'

import * as activeActions from '../../actions/active'
import type { GtfsLocation, LocationShape } from '../../../types'
import { groupLocationShapePoints } from '../../util/location'

type Props = {
  activeEntity: GtfsLocation,
  updatingLocationShape: typeof activeActions.updatingLocationShape
}

/**
 * Draw one location on a map and render a popup on click
 *
 * Once multi-polygons or polylines are supported, this component will render
 * multiple locations.
 */
const LocationsLayer = (props: Props) => {
  const [groupedLocationShapePts, updateGroupLocationShapePts] = useState({})
  const {activeEntity} = props
  const {geometry_type: geometryType, location_shapes: locationShapes} = activeEntity

  useEffect(() => {
    // Create our locations shape out of the bulk location shape points
    updateGroupLocationShapePts(groupLocationShapePoints(locationShapes))
  }, [])

  const _onCreated = (e: L.LeafletEvent) => {
    const { layerType: geometryType, layer } = e

    // TODO: allow multi polygon type
    if (activeEntity.location_shapes.length > 0) {
      window.alert('MultiPolygons / Multipolylines are not currently supported.')
      // TODO: clear the EditControl in a better way
      location.reload()
      return
    }

    // TODO: unify geometryType w/ backend types, including detecting MULTIPOLYGON & MULTILINESTRING
    // Construct a location type as an array of location shape points.
    const locationShape: LocationShape = geometryType === 'polygon'
      ? layer.getLatLngs()[0].map(latlng => {
        return {
          location_id: activeEntity.location_id,
          geometry_id: e.target._leaflet_id,
          geometry_pt_lat: latlng.lat,
          geometry_pt_lon: latlng.lng,
          id: e.target._leaflet_id
        }
      })
      : layer.getLatLngs().map(latlng => {
        return {
          location_id: activeEntity.location_id,
          geometry_id: e.target._leaflet_id,
          geometry_pt_lat: latlng.lat,
          geometry_pt_lon: latlng.lng,
          id: e.target._leaflet_id
        }
      })

    const newLocationShapes = [ ...activeEntity.location_shapes, ...locationShape ]
    props.updatingLocationShape({ geometryType, shapes: newLocationShapes })
    updateGroupLocationShapePts(groupLocationShapePoints(newLocationShapes))
  }

  const _onEdited = (e: L.LeafletEvent, layer: L.Layer) => {
    const {key} = e
    const { geometryType } = e.props
    const {latlngs: positions} = layer.editing
    if (!positions || !positions[0][0]) return

    const newLocationShapes = positions[0][0].map((coord, index) => (
      {
        geometry_id: key,
        geometry_pt_lat: coord.lat,
        geometry_pt_lon: coord.lng,
        id: index
      }
    ))
    props.updatingLocationShape({ geometryType, shapes: newLocationShapes })
  }
  const _onDelete = (e: L.LeafletEvent, layer: L.Layer) => {
    const {activeEntity} = props
    const locationShapes = clone(activeEntity.location_shapes)
    const {key} = e

    const newLocationShapes = locationShapes.filter((shapePt) => !(key === shapePt.geometry_id))

    props.updatingLocationShape({ geometryType, shapes: newLocationShapes })
  }

  const noShapes = locationShapes.length === 0

  console.log(groupedLocationShapePts)
  return (
    <div id='location-features-layer'>
      <EditControlFeatureGroup
        controlProps={{draw: {

          circle: false,
          circlemarker: false,
          marker: false,
          polygon: noShapes,
          polyline: noShapes,
          rectangle: false
        },
        position: 'topleft'}}
        onCreated={_onCreated}
        onEdited={_onEdited}
        onDeleted={_onDelete}
      >
        {Object.keys(groupedLocationShapePts).map((key) => {
          // const Shape = this.state.initialShapeIds.includes(key) && geometryType === 'polygon' ? Polygon : Polyline
          const Shape = geometryType === 'polygon' ? Polygon : Polyline
          return <Shape key={key} geometryType={geometryType} positions={groupedLocationShapePts[key]} />
        })}

      </EditControlFeatureGroup>

    </div>
  )
}

export default LocationsLayer
