// @flow

import { divIcon } from 'leaflet'
import React, {Component} from 'react'
import {FeatureGroup, Polygon, Popup} from 'react-leaflet'
import {Row, Col, FormGroup, ControlLabel} from 'react-bootstrap'

import * as activeActions from '../../actions/active'
import * as stopStrategiesActions from '../../actions/map/stopStrategies'
import * as tripPatternActions from '../../actions/tripPattern'
import MinuteSecondInput from '../MinuteSecondInput'
import PatternStopButtons from '../pattern/PatternStopButtons'
import type {ControlPoint, Feed, GtfsLocation, Pattern, PatternLocation} from '../../../types'
import { mergePatternHalts } from '../../../gtfs/util'

type Props = {
  active: boolean,
  activePattern: Pattern,
  addStopToPattern: typeof stopStrategiesActions.addStopToPattern,
  controlPoints: Array<ControlPoint>,
  feedSource: Feed,
  index: number,
  location: GtfsLocation,
  patternEdited: boolean,
  patternLocation: PatternLocation,
  removeStopFromPattern: typeof stopStrategiesActions.removeStopFromPattern,
  saveActiveGtfsEntity: typeof activeActions.saveActiveGtfsEntity,
  setActiveEntity: typeof activeActions.setActiveEntity,
  setActiveStop: typeof tripPatternActions.setActiveStop,
  updatePatternStops: typeof tripPatternActions.updatePatternStops
}

export default class PatternLocationMarker extends Component<Props> {
  componentWillReceiveProps (nextProps: Props) {
    // open popup if active
    // if (nextProps.active !== this.props.active) {
    //   if (nextProps.active) {
    //     this.refs[nextProps.patternLocation.id].leafletElement.openPopup()
    //   } else {
    //     this.refs[nextProps.patternLocation.id].leafletElement.closePopup()
    //   }
    // }
  }

  _onChangeTimeInLocation = (value: number) => {
    const {activePattern, index, updatePatternStops} = this.props
    const patternHalts = mergePatternHalts(activePattern.patternStops, activePattern.patternLocations)
    if (patternHalts[index].hasOwnProperty('flexDefaultZoneTime')) {
      // $FlowFixMe Flow is not able to understand this
      patternHalts[index].flexDefaultZoneTime = value
      updatePatternStops(activePattern, patternHalts)
    } else {
      console.warn('Tried to update flexDefaultZoneTime on a stop!')
    }
  }

  _onChangeTravelTime = (value: number) => {
    const {activePattern, index, updatePatternStops} = this.props
    const patternHalts = mergePatternHalts(activePattern.patternStops, activePattern.patternLocations)
    if (patternHalts[index].hasOwnProperty('flexDefaultTravelTime')) {
      // $FlowFixMe Flow is not able to understand this
      patternHalts[index].flexDefaultTravelTime = value
      updatePatternStops(activePattern, patternHalts)
    } else {
      console.warn('Tried to update flexDefaultTravelTime on a stop!')
    }
  }

  _onClick = () => {
    const {active, index, setActiveStop} = this.props
    const {id} = this.props.patternLocation
    if (!active && id) {
      setActiveStop({id: `${id}`, index})
    } else {
      setActiveStop({id: null, index: null})
    }
  }

  render () {
    const {active, index, location, patternLocation} = this.props
    const stopName = `${index + 1}. ${location.stop_name || ''} (${location.location_id})`
    const MARKER_SIZE = 24
    const patternStopIcon: HTMLElement = divIcon({
      html: `<span title="${stopName}" class="fa-stack">
              <i class="fa fa-circle fa-stack-2x" style="opacity: 0.8; ${active ? 'color: blue' : ''}"></i>
              <strong class="fa-stack-1x fa-inverse calendar-text">${index + 1}</strong>
            </span>`,
      className: '',
      iconSize: [MARKER_SIZE, MARKER_SIZE]
    })

    // Don't render a stop
    if (patternLocation.hasOwnProperty('stop_id')) return null

    const groupedLocationShapePts = location.location_shapes.reduce((acc, cur) => {
      if (!acc[cur.geometry_id]) acc[cur.geometry_id] = [[cur.geometry_pt_lat, cur.geometry_pt_lon]]
      else acc[cur.geometry_id].push([cur.geometry_pt_lat, cur.geometry_pt_lon])
      return acc
    }, {})

    return (
      <FeatureGroup>
        {groupedLocationShapePts && Object.keys(groupedLocationShapePts).map(key => {
          return (
            <Polygon
              ref={`${patternLocation.id || patternLocation.locationId}`}
              key={patternLocation.id}
              onClick={this._onClick}
              positions={groupedLocationShapePts[key]}
              zIndexOffset={active ? 1000 : 0}
              icon={patternStopIcon}
            >
              <Popup>
                <div // popup requires single child (i.e., single div)
                  style={{minWidth: '240px'}}>
                  <h5>{stopName}</h5>
                  <Row>
                    <Col xs={12}>
                      <PatternStopButtons
                        {...this.props} patternStop={patternLocation} stop={location} />
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={6}>
                      <FormGroup
                        controlId='defaultTravelTime'>
                        <ControlLabel>Travel time</ControlLabel>
                        <MinuteSecondInput
                          seconds={patternLocation.flexDefaultTravelTime}
                          onChange={this._onChangeTravelTime} />
                      </FormGroup>
                    </Col>
                    <Col xs={6}>
                      <FormGroup
                        controlId='defaultTimeInLocation'>
                        <ControlLabel>Time in location</ControlLabel>
                        <MinuteSecondInput
                          seconds={patternLocation.flexDefaultZoneTime}
                          onChange={this._onChangeTimeInLocation} />
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              </Popup>
            </Polygon>
          )
        })
        }
      </FeatureGroup>
    )
  }
}
