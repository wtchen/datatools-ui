import React, { Component, PropTypes } from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import { Row, Col, Button, Collapse, Form, FormGroup, ControlLabel, Checkbox } from 'react-bootstrap'
import {Icon} from 'react-fa'

import { getEntityName } from '../util/gtfs'
import MinuteSecondInput from './MinuteSecondInput'

const cardSource = {
  beginDrag (props) {
    return {
      id: props.id,
      originalIndex: props.findCard(props.id).index
    }
  },

  endDrag (props, monitor) {
    const { id: droppedId, originalIndex } = monitor.getItem()
    const didDrop = monitor.didDrop()
    if (!didDrop) {
      console.log('endDrag')
      props.moveCard(droppedId, originalIndex)
    }
  }
}

const cardTarget = {
  drop (props, monitor) {
    const { id: droppedId, originalIndex } = monitor.getItem()
    const { index: droppedIndex } = props.findCard(droppedId)
    if (droppedIndex !== originalIndex) {
      console.log('dropped in new location')
      props.dropCard()
    }
  },
  hover (props, monitor) {
    const { id: draggedId } = monitor.getItem()
    const { id: overId } = props
    if (draggedId !== overId) {
      const { index: overIndex } = props.findCard(overId)
      props.moveCard(draggedId, overIndex)
    }
  }
}

@DropTarget('card', cardTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource('card', cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
export default class PatternStopCard extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.any.isRequired,
    moveCard: PropTypes.func.isRequired,
    style: PropTypes.object,

    cumulativeTravelTime: PropTypes.number,
    stopIsActive: PropTypes.bool,

    stop: PropTypes.object,
    activePattern: PropTypes.object,

    patternStop: PropTypes.object,
    rowStyle: PropTypes.object,

    activeStop: PropTypes.string,

    setActiveStop: PropTypes.func,
    updateActiveEntity: PropTypes.func,
    saveActiveEntity: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {}
  }
  handleClick (stopIsActive) {
    if (!stopIsActive) this.props.setActiveStop(this.props.id)
    else this.props.setActiveStop(null)
  }
  render () {
    const { isDragging, connectDragSource, connectDropTarget, stop, index, patternStop, cumulativeTravelTime, setActiveStop, updateActiveEntity, saveActiveEntity, activePattern } = this.props
    const opacity = isDragging ? 0 : 1
    let stopIsActive = this.props.activeStop === this.props.id
    let stopName = getEntityName('stop', stop)
    let stopNameParts = stopName.split(/(\band\b|&|@|:)+/i)
    let abbreviatedStopName = stopNameParts && stopNameParts.length === 3 && stop.stop_name.length > 20
      ? `${stopNameParts[0].substr(0, 10).trim()}... ${stopNameParts[2].substr(0, 10).trim()}`
      : stop.stop_name
    let titleStopName = stop ? `${index + 1}. ${stopName}` : `${index + 1}. ${stop.stop_id}`
    let fullStopName = stop ? `${index + 1}. ${abbreviatedStopName}` : `${index + 1}. ${stop.stop_id}`

    return connectDragSource(connectDropTarget(
      <div style={{ ...this.props.style, opacity }}>
        {/* Main card title */}
        <div
          className='small'
          tabIndex={0}
          onClick={(e) => this.handleClick(stopIsActive)}
          onKeyDown={(e) => {
            console.log(e.keyCode)
            if (e.keyCode === 13) {
              this.handleClick(stopIsActive)
            }
          }}
        >
        <div className='pull-left'>
          <p style={{margin: '0px'}} title={titleStopName}><Icon fixedWidth name={stopIsActive ? 'caret-down' : 'caret-right'}/>{fullStopName.length > 25 ? fullStopName.substr(0, 25) + '...' : fullStopName}</p>
        </div>
        <div className='pull-right'>
          <p style={{margin: '0px'}} className='text-right'>
             <span>{Math.round(cumulativeTravelTime / 60)} (+{Math.round(patternStop.defaultTravelTime / 60)}{patternStop.defaultDwellTime > 0 ? ` +${Math.round(patternStop.defaultDwellTime / 60)}` : ''})</span>
             {'    '}
             <span style={{cursor: '-webkit-grab', color: 'black'}}><Icon name='bars'/></span>
          </p>
        </div>
        <div className='clearfix'></div>
        </div>
        {/* Collapsible interior div */}
        <Collapse in={stopIsActive}>
          {stopIsActive
            ? <div>
                {/* Remove from pattern button */}
                <Row>
                  <Col xs={6}>
                    <Checkbox>
                      Timepoint?
                    </Checkbox>
                  </Col>
                  <Col xs={6}>
                    <Button
                      bsStyle='danger'
                      bsSize='xsmall'
                      style={{marginTop: '9px'}} // margin on top to align button with checkbox
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
                {/* default travel time inputs */}
                <Row>
                  <Col xs={6}>
                    <FormGroup
                      controlId='formBasicText'
                      bsSize='small'
                    >
                      <ControlLabel className='small'>Default travel time</ControlLabel>
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
                      bsSize='small'
                    >
                      <ControlLabel className='small'>Default dwell time</ControlLabel>
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
      </div>
    ))
  }
}
