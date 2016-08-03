import React, {Component, PropTypes} from 'react'
import { Row, Col, Button, Collapse, FormGroup, ControlLabel } from 'react-bootstrap'
import {Icon} from 'react-fa'
// import { DragSource } from 'react-dnd'

import { getEntityName } from '../util/gtfs'
import MinuteSecondInput from './MinuteSecondInput'

export default class PatternStopRow extends Component {
  static propTypes = {
    index: PropTypes.number,
    cumulativeTravelTime: PropTypes.number,

    stops: PropTypes.array,

    patternStop: PropTypes.object,
    activePattern: PropTypes.object,
    rowStyle: PropTypes.object,

    activeStop: PropTypes.string,

    setActiveStop: PropTypes.func,
    updateActiveEntity: PropTypes.func,
    saveActiveEntity: PropTypes.func
  }
  constructor (props) {
    super(props)
  }
  render () {
    let { index, patternStop, setActiveStop, activePattern, cumulativeTravelTime, stops, updateActiveEntity, saveActiveEntity, rowStyle } = this.props
    const key = `${index}-${patternStop.stopId}`
    let stopIsActive = this.props.activeStop === key
    let stop = stops.find(st => st.id === patternStop.stopId)
    let stopName = getEntityName('stop', stop)
    let stopNameParts = stopName.split(/(\band\b|&|@)+/i)
    let abbreviatedStopName = stopNameParts && stopNameParts.length === 3 && stop.stop_name.length > 20
      ? `${stopNameParts[0].substr(0, 10).trim()}... ${stopNameParts[2].substr(0, 10).trim()}`
      : stop.stop_name
    let titleStopName = stop ? `${index + 1}. ${stopName}` : `${index + 1}. ${patternStop.stopId}`
    let fullStopName = stop ? `${index + 1}. ${abbreviatedStopName}` : `${index + 1}. ${patternStop.stopId}`
    return (
      <tr
        key={key}
        // draggable={true}
        style={rowStyle}
      >
        <td
          style={{padding: '0px'}}
          colSpan='2'
        >
          <p
            title={titleStopName}
            style={{width: '100%', margin: '0px'}}
            className='small'
            onClick={(e) => {
              if (!stopIsActive) setActiveStop(key)
              else setActiveStop(null)
            }}
          >
            <span className='pull-right'>
              <span>{Math.round(cumulativeTravelTime / 60)} (+{Math.round(patternStop.defaultTravelTime / 60)} +{Math.round(patternStop.defaultDwellTime / 60)})</span>
              {'    '}
              <Button bsSize='xsmall' bsStyle='link' style={{cursor: '-webkit-grab'}}><Icon name='bars'/></Button>
            </span>
            <Icon name={stopIsActive ? 'caret-down' : 'caret-right'}/>
            {' '}
            <span>{fullStopName.length > 25 ? fullStopName.substr(0, 25) + '...' : fullStopName}</span>

          </p>
          <Collapse in={stopIsActive}>
            {stopIsActive
              ? <div>
                  <Row>
                    <Col xs={12}>
                    <Button
                      bsStyle='danger'
                      bsSize='xsmall'
                      className='pull-right'
                      onClick={() => {
                        let patternStops = [...activePattern.patternStops]
                        patternStops.splice(index, 1)
                        updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                        saveActiveEntity('trippattern')
                      }}
                    >
                      <Icon name='trash'/> Remove
                    </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={6}>
                      <FormGroup
                        controlId='formBasicText'
                      >
                        <ControlLabel>Default travel time</ControlLabel>
                        <MinuteSecondInput
                          seconds={patternStop.defaultTravelTime}
                          onChange={(value) => {
                            let patternStops = [...activePattern.patternStops]
                            patternStops[index].defaultTravelTime = value
                            updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col xs={6}>
                      <FormGroup
                        controlId='formBasicText'
                      >
                        <ControlLabel>Default dwell time</ControlLabel>
                        <MinuteSecondInput
                          seconds={patternStop.defaultDwellTime}
                          onChange={(value) => {
                            let patternStops = [...activePattern.patternStops]
                            patternStops[index].defaultDwellTime = value
                            updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                          }}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              : <div></div>
            }
          </Collapse>
        </td>
      </tr>
    )
  }
}

// export default DragSource(/* ... */)(PatternStopRow)
