// @flow

import React, {Component} from 'react'
import bearing from 'turf-bearing'
import { divIcon } from 'leaflet'
import { Marker } from 'react-leaflet'
import lineDistance from 'turf-line-distance'
import lineString from 'turf-linestring'
import along from '@turf/along'

import type {Coordinates, GeoJsonLinestring, GeoJsonPoint} from '../../../types'
import type {EditSettingsState, MapState} from '../../../types/reducers'

type Props = {
  editSettings: EditSettingsState,
  mapState: MapState,
  patternCoordinates: Array<Coordinates>,
  patternSegment: number
}

const getPatternLine = (
  patternCoordinates: Array<Coordinates>,
  patternSegment: number,
  hideInactiveSegments: boolean
) => {
  let patternLine: ?GeoJsonLinestring = patternCoordinates && patternCoordinates.length > 0
    ? lineString([].concat.apply([], patternCoordinates))
    : null
  if (!patternLine) return null
  if ((patternSegment || patternSegment === 0) && hideInactiveSegments) {
    // Only draw direction icons for single segment if it is active and inactive
    // segments are hidden.
    patternLine = lineString([
      ...patternCoordinates[patternSegment],
      patternCoordinates[patternSegment + 1]
    ])
  }
  return patternLine
}

export default class DirectionIconsLayer extends Component<Props> {
  render () {
    // TODO: move this to reducer
    const {editSettings, patternCoordinates, patternSegment, mapState} = this.props
    const {zoom, bounds} = mapState
    // Merge/flattern 2D array of coordinates
    let patternLine: ?GeoJsonLinestring
    let patternLength: number
    const lengthsAlongPattern = []
    try {
      patternLine = getPatternLine(
        patternCoordinates,
        patternSegment,
        editSettings.hideInactiveSegments
      )
      if (!patternLine) return null
      // get intervals along path for arrow icons
      patternLength = patternLine ? lineDistance(patternLine, 'meters') : 0
      const zoomValue = zoom || 12
      const iconInterval = zoomValue > 15
        ? 200
        : zoomValue > 14
          ? 500
          : zoomValue > 12
            ? 2000
            : zoomValue > 10
              ? 4000
              : zoomValue > 6
                ? 8000
                : 10000
      for (let i = 0; i < Math.floor(patternLength / iconInterval); i++) {
        const distance = i ? iconInterval * i : iconInterval / 2
        const position: GeoJsonPoint = along(patternLine, distance, {units: 'meters'})
        if (!bounds) continue
        if (
          position.geometry.coordinates[1] > bounds.getNorth() ||
          position.geometry.coordinates[1] < bounds.getSouth() ||
          position.geometry.coordinates[0] > bounds.getEast() ||
          position.geometry.coordinates[0] < bounds.getWest()
        ) {
          // Do not render any arrow icons outside of bounds
          continue
        }
        lengthsAlongPattern.push([distance, position])
      }
    } catch (e) {
      console.warn('Could not get line distance to render direction icons', patternLine, e)
      return null
    }
    return (
      <div>
        {lengthsAlongPattern && lengthsAlongPattern.length && patternLine
          ? lengthsAlongPattern.map((length, index) => (
            <DirectionIcon
              index={index}
              length={length}
              key={index}
              patternLine={patternLine} />
          ))
          : null
        }
      </div>
    )
  }
}

type IconProps = {
  index: number,
  length: [number, GeoJsonPoint],
  patternLine: any
}

class DirectionIcon extends Component<IconProps> {
  render () {
    const {index, length, patternLine} = this.props
    const distance = length[0]
    const position = length[1]

    const nextPosition: GeoJsonPoint = along(patternLine, distance + 5, {units: 'meters'})
    const dir: number = position && nextPosition ? bearing(position, nextPosition) : 0
    const color = '#000'
    const arrowIcon: HTMLElement = divIcon({
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
        key={`directionIcon-${index}`}
        color='black' />
    )
  }
}
