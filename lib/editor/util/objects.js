// @flow
import clone from 'lodash.clonedeep'

import {ENTITY} from '../constants'
import camelcaseKeys from 'camelcase-keys'
import snakeCaseKeys from 'snakecase-keys'

import type {Entity} from '../../types'

export function componentToText (component: string): string {
  switch (component) {
    case 'scheduleexception':
      return 'exception'
    default:
      return component
  }
}

export function entityIsNew (entity: Entity): boolean {
  return entity.id === ENTITY.NEW_ID || typeof entity.id === 'undefined'
}

export const getMapToGtfsStrategy = (component: string) => {
  switch (component) {
    case 'route':
      return routeToGtfs
    default:
      return (entity: any) => entity
  }
}

export const getMapFromGtfsStrategy = (component: string) => {
  switch (component) {
    default:
      return (entity: any) => snakeCaseKeys(entity)
  }
}

/**
 * Adds shape geometry to trip pattern object.
 */
export function tripPatternToGtfs (tripPattern: any, stops: any): any {
  console.log(`converting trip pattern to gtfs`)
  // FIXME: Hack to avoid turning coordinates array into array of objects, e.g.
  // [{0: 37.445, 1: -87.564}, ...]
  // const coordinates = tripPattern.shape.coordinates.slice()
  const pattern = camelcaseKeys(tripPattern, {deep: true})
  let {shapePoints} = pattern
  if (!shapePoints) {
    // FIXME: Hack to handle different name of shapePoints key when returned from
    // saveTripPattern call
    shapePoints = pattern.shapePoints = clone(pattern.shapes)
  }
  delete pattern.shape
  delete pattern.shapes
  const coordinates = coordinatesFromShapePoints(shapePoints)
  if (coordinates && coordinates.length) {
    pattern.shape = {type: 'LineString', coordinates}
  }
  return pattern
}

export function coordinatesFromShapePoints (shapePoints: any) {
  const hasShapePoints = shapePoints.length > 0
  if (!hasShapePoints) return []
  const coordinates = shapePoints
    .map(shapePointToCoordinate)
    .filter(sp => sp)
  if (coordinates.length === 0) {
    console.warn('Warning! Pattern coordinates is empty array')
  }
  return coordinates
}

export function shapePointToCoordinate (shapePoint: any, index: number) {
  const {shapePtLon, shapePtLat} = shapePoint
  if (shapePtLon !== null && shapePtLon !== undefined && shapePtLat !== null && shapePtLat !== undefined) {
    return [shapePtLon, shapePtLat]
  } else {
    console.warn(`Shape point index=${index} has undefined or null shaptPtLat or shapePtLon`)
    return null
  }
}

export function routeToGtfs (route: any): any {
  if (route.tripPatterns) {
    route.tripPatterns = route.tripPatterns.map(tripPatternToGtfs)
  }
  return route
}
