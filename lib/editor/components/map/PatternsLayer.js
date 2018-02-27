import randomColor from 'randomcolor'
import React, {Component, PropTypes} from 'react'
import {FeatureGroup, Polyline, Tooltip} from 'react-leaflet'

import {isSegmentActive} from '../../util/map'

export default class PatternsLayer extends Component {
  static propTypes = {
    activeEntity: PropTypes.object,
    activePattern: PropTypes.object,
    constructControlPoint: PropTypes.func,
    controlPoints: PropTypes.array,
    editSettings: PropTypes.object,
    feedSource: PropTypes.object,
    patternCoordinates: PropTypes.array,
    patternSegment: PropTypes.number,
    route: PropTypes.object,
    setActiveEntity: PropTypes.func,
    setActivePatternSegment: PropTypes.func,
    subEntity: PropTypes.number,
    updateEditSetting: PropTypes.func
  }

  state = {}

  _constructControlPoint = (segmentProps) => {
    const {constructControlPoint, patternCoordinates, controlPoints} = this.props
    constructControlPoint({...segmentProps, patternCoordinates, controlPoints})
  }

  render () {
    const {
      activePattern,
      editSettings,
      patternCoordinates,
      patternSegment,
      route,
      setActiveEntity,
      setActivePatternSegment,
      subEntityId,
      updateEditSetting
    } = this.props
    return (
      <FeatureGroup id='trip-patterns-layer'>
        {route && route.tripPatterns
          ? route.tripPatterns
            .map(tp => {
              const isActive = subEntityId === tp.id
              const isEditing = isActive && editSettings.editGeometry
              const pattern = isActive ? activePattern : tp
              // Coordinates for non-active trip patterns
              const latLngs = (
                pattern && pattern.shape && pattern.shape.coordinates
                  ? pattern.shape.coordinates
                  : []
              )
              // NOTE: don't render pattern if latlngs don't exist or a single pattern is active
              if (!latLngs || (!isActive && subEntityId)) {
                !latLngs && console.warn(`not rendering ${tp.id} due to missing coordinates`)
                return null
              }
              const lineColor = editSettings.editGeometry
                ? '#F3F315' // yellow if editing
                : 'blue'
              const clickAction = isEditing
                ? 'add control point'
                : isActive
                ? 'edit shape'
                : 'select'
              // console.log(`rendering ${tp.id}`)
              if (isActive) {
                // console.log('active pattern coordinates', patternCoordinates)
                return patternCoordinates && patternCoordinates
                  .map((coordinates, index) => {
                    const segmentIsActive = isSegmentActive(patternSegment, index)
                    if (!segmentIsActive && editSettings.hideInactiveSegments) {
                      return null
                    }
                    // console.log('segment coordinates', index, patternSegment === index, coordinates)
                    // const useTempSegment = this.props.temporaryPatternCoordinates &&
                    //   this.props.temporaryPatternCoordinates.index === index &&
                    //   this.props.temporaryPatternCoordinates.coordinates
                    // const segmentCoordinates = useTempSegment
                    //   ? this.props.temporaryPatternCoordinates.coordinates
                    //   : coordinates
                    // useTempSegment && console.log('temp segment', index, segmentCoordinates)
                    // patternSegment === index && console.log(`segment ${index}`, lineString([...segmentCoordinates, ...patternCoordinates[index + 1]]))
                    return <PatternSegment
                      key={`${tp.id}-${index}`}
                      index={index}
                      isEditing={isEditing}
                      patternIsActive={isActive}
                      segmentIsActive={segmentIsActive}
                      setActivePatternSegment={setActivePatternSegment}
                      clickAction={clickAction}
                      color={lineColor}
                      setActiveEntity={setActiveEntity}
                      updateEditSetting={updateEditSetting}
                      editSettings={editSettings}
                      coordinates={coordinates}
                      // Pass active pattern (with up-to-date shape) as prop
                      pattern={activePattern}
                      constructControlPoint={this._constructControlPoint} />
                  }
                )
              } else {
                return (
                  <PatternSegment
                    key={tp.id}
                    isEditing={isEditing}
                    patternIsActive={isActive}
                    setActivePatternSegment={setActivePatternSegment}
                    clickAction={clickAction}
                    color={lineColor}
                    coordinates={latLngs}
                    pattern={tp}
                    {...this.props} />
                )
              }
            })
          : null
        }
      </FeatureGroup>
    )
  }
}

class PatternSegment extends Component {
  _onClick = (e) => {
    const {pattern,
      coordinates,
      segmentIsActive,
      patternIsActive,
      isEditing,
      index,
      activeEntity,
      constructControlPoint,
      feedSource,
      setActiveEntity,
      setActivePatternSegment,
      updateEditSetting
    } = this.props
    console.log(`Clicked segment # ${index}`)
    if (isEditing && segmentIsActive) {
      constructControlPoint({pattern, latlng: e.latlng, segmentIndex: index, segmentCoordinates: coordinates})
    }
    if (!isEditing && patternIsActive) {
      updateEditSetting('editGeometry', true, pattern)
    }
    if (!patternIsActive) {
      setActiveEntity(feedSource.id, 'route', activeEntity, 'trippattern', pattern)
    }
    if (patternIsActive && !segmentIsActive) {
      setActivePatternSegment(index)
    }
  }

  render () {
    const {color,
      clickAction,
      coordinates,
      editSettings,
      index,
      isEditing,
      segmentIsActive,
      patternIsActive,
      pattern
    } = this.props
    // isEditing && segmentIsActive && console.log(`rendering active segment #${index}`, pattern, coordinates)
    if (!coordinates || !coordinates.length) {
      console.warn(`Could not render segment #${index} of pattern ID ${pattern.id}`, coordinates)
      return null
    }
    // console.log(`rendering ${pattern.id}-${index}`)
    if (coordinates.length < 2) {
      coordinates.push(coordinates[0])
    }
    const editingSegment = segmentIsActive && isEditing

    return (
      <Polyline
        // React leaflet coordinates are [lat, lon]
        positions={coordinates.map(c => ([c[1], c[0]]))}
        onClick={this._onClick}
        lineCap='butt'
        color={editingSegment
            ? 'green'
            : isEditing && patternIsActive
            ? randomColor()
            : color
          }
        weight={5}
        opacity={editingSegment
          ? 0.8

          : 0.5
        }>
        <Tooltip key={Math.random()} opacity={editSettings.showTooltips ? 0.9 : 0} sticky>
          <span>
            {isEditing
              ? `Click to ${clickAction}`
              : `${pattern.name} (click to ${clickAction})`
            }
          </span>
        </Tooltip>
      </Polyline>
    )
  }
}
