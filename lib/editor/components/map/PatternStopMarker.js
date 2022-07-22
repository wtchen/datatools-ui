// @flow

import { divIcon } from 'leaflet'
import React, {Component} from 'react'
import {Marker, Popup} from 'react-leaflet'
import {Row, Col, FormGroup, ControlLabel} from 'react-bootstrap'

import * as activeActions from '../../actions/active'
import * as stopStrategiesActions from '../../actions/map/stopStrategies'
import * as tripPatternActions from '../../actions/tripPattern'
import MinuteSecondInput from '../MinuteSecondInput'
import PatternStopButtons from '../pattern/PatternStopButtons'
import type {ControlPoint, Feed, GtfsStop, Pattern, PatternStop} from '../../../types'
import { mergePatternHaltsOfPattern } from '../../../gtfs/util'
import { patternHaltIsStop } from '../../util/location'

type Props = {
  active: boolean,
  activePattern: Pattern,
  addStopToPattern: typeof stopStrategiesActions.addStopToPattern,
  controlPoints: Array<ControlPoint>,
  feedSource: Feed,
  index: number,
  patternEdited: boolean,
  patternStop?: PatternStop,
  removeStopFromPattern: typeof stopStrategiesActions.removeStopFromPattern,
  saveActiveGtfsEntity: typeof activeActions.saveActiveGtfsEntity,
  setActiveEntity: typeof activeActions.setActiveEntity,
  setActiveStop: typeof tripPatternActions.setActiveStop,
  stop: GtfsStop,
  updatePatternStops: typeof tripPatternActions.updatePatternStops
}

export default class PatternStopMarker extends Component<Props> {
  componentWillReceiveProps (nextProps: Props) {
    // open popup if active
    // if (nextProps.active !== this.props.active) {
    //   if (nextProps.active) {
    //     this.refs[nextProps.patternStop.id].leafletElement.openPopup()
    //   } else {
    //     this.refs[nextProps.patternStop.id].leafletElement.closePopup()
    //   }
    // }
  }

  _onChangeDwellTime = (value: number) => {
    const {activePattern, index, updatePatternStops} = this.props
    const patternHalts = mergePatternHaltsOfPattern(activePattern)
    if (patternHalts[index].hasOwnProperty('defaultDwellTime')) {
      // $FlowFixMe Flow is not able to understand this
      patternHalts[index].defaultDwellTime = value
      updatePatternStops(activePattern, patternHalts)
    } else {
      console.warn('Tried to update defaultDwellTime on a location!')
    }
  }

  _onChangeTravelTime = (value: number) => {
    const {activePattern, index, updatePatternStops} = this.props
    const patternHalts = mergePatternHaltsOfPattern(activePattern)
    if (patternHalts[index].hasOwnProperty('defaultTravelTime')) {
      // $FlowFixMe Flow is not able to understand this
      patternHalts[index].defaultTravelTime = value
      updatePatternStops(activePattern, patternHalts)
    } else {
      console.warn('Tried to update defaultTravelTime on a location!')
    }
  }

  _onClick = () => {
    const {active, index, setActiveStop} = this.props
    if (!this.props.patternStop) return

    const {id} = this.props.patternStop
    if (!active) {
      setActiveStop({id: `${id}`, index})
    } else {
      setActiveStop({id: null, index: null})
    }
  }

  render () {
    const {active, stop, index, patternStop} = this.props

    // Don't render a location or location group
    if (!!patternStop && !patternHaltIsStop(patternStop)) {
      return null
    }

    const stopName = `${index + 1}. ${stop.stop_name} (${stop.stop_code ? stop.stop_code : stop.stop_id})`
    const MARKER_SIZE = 24
    const patternStopIcon: HTMLElement = divIcon({
      html: `<span title="${stopName}" class="fa-stack">
              <i class="fa fa-circle fa-stack-2x" style="opacity: 0.8; ${active ? 'color: blue' : ''}"></i>
              <strong class="fa-stack-1x fa-inverse calendar-text">${index + 1}</strong>
            </span>`,
      className: '',
      iconSize: [MARKER_SIZE, MARKER_SIZE]
    })

    return (
      <Marker
        ref={`${patternStop ? patternStop.id : stop.id}`}
        position={[stop.stop_lat, stop.stop_lon]}
        onClick={this._onClick}
        zIndexOffset={active ? 1000 : 0}
        icon={patternStopIcon}>
        <Popup>
          <div // popup requires single child (i.e., single div)
            style={{minWidth: '240px'}}>
            {!patternStop && <h4>Location Group</h4>}
            <h5>{stopName}</h5>
            {!!patternStop && <React.Fragment>
              <Row>
                <Col xs={12}>
                  <PatternStopButtons
                    {...this.props} />
                </Col>
              </Row>
              <Row>
                <Col xs={6}>
                  <FormGroup
                    controlId='defaultTravelTime'>
                    <ControlLabel>Travel time</ControlLabel>
                    <MinuteSecondInput
                      seconds={patternStop.defaultTravelTime}
                      onChange={this._onChangeTravelTime} />
                  </FormGroup>
                </Col>
                <Col xs={6}>
                  <FormGroup
                    controlId='defaultDwellTime'>
                    <ControlLabel>Dwell time</ControlLabel>
                    <MinuteSecondInput
                      seconds={patternStop.defaultDwellTime}
                      onChange={this._onChangeDwellTime} />
                  </FormGroup>
                </Col>
              </Row>
            </React.Fragment>}
          </div>
        </Popup>
      </Marker>
    )
  }
}
