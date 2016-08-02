import React, {Component, PropTypes} from 'react'
import { Row, Col, Table, Button, Checkbox, Collapse, FormGroup, ControlLabel, OverlayTrigger, Tooltip } from 'react-bootstrap'
import {Icon} from 'react-fa'
import { DragSource } from 'react-dnd'

import { getEntityName } from '../util/gtfs'
import MinuteSecondInput from './MinuteSecondInput'
import VirtualizedEntitySelect from './VirtualizedEntitySelect'

export default class PatternStopRow {
  constructor (props) {
    // super(props)
  }
  render () {
    let { index, patternStop, setActiveStop, activePattern } = this.props
    totalTravelTime += patternStop.defaultTravelTime + patternStop.defaultDwellTime
    const key = `${index}-${s.stopId}`
    let stopIsActive = this.props.activeStop === key
    let stop = stops.find(st => st.id === patternStop.stopId)
    let stopName = getEntityName('stop', stop)
    let stopNameParts = stopName.split(/(\band\b|&|@)+/i)
    let abbreviatedStopName = stopNameParts && stopNameParts.length === 3 && stop.stop_name.length > 20
      ? `${stopNameParts[0].substr(0, 10).trim()}... ${stopNameParts[2].substr(0, 10).trim()}`
      : stop.stop_name
    let titleStopName = stop ? `${index + 1}. ${stopName}` : `${index + 1}. ${patternStop.stopId}`
    let fullStopName = stop ? `${index + 1}. ${abbreviatedStopName}` : `${index + 1}. ${patternStop.stopId}`

    return // connectDragSource
    (
      <tr
        key={key}
        draggable={true}
        style={stopRowStyle}
        onDragOver={onDragOver}
        onDragStart={onDragStart}
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
              console.log(e.target)
              if (!stopIsActive) setActiveStop(key)
              else setActiveStop(null)
            }}
          >
            <span className='pull-right'>
              <span>{Math.round(totalTravelTime/60)} (+{Math.round(patternStop.defaultTravelTime / 60)} +{Math.round(patternStop.defaultDwellTime / 60)})</span>
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
                        controlId="formBasicText"
                        /*validationState={this.getValidationState()}*/
                      >
                        <ControlLabel>Default travel time</ControlLabel>
                        <MinuteSecondInput
                          seconds={s.defaultTravelTime}
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
                        controlId="formBasicText"
                        /*validationState={this.getValidationState()}*/
                      >
                        <ControlLabel>Default dwell time</ControlLabel>
                        <MinuteSecondInput
                          seconds={s.defaultDwellTime}
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
