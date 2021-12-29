// @flow

import Icon from '@conveyal/woonerf/components/icon'
import clone from 'lodash/cloneDeep'
import React, { Component } from 'react'
import {connect} from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd'
import {
  Checkbox,
  Col,
  Collapse,
  ControlLabel,
  FormControl,
  FormGroup,
  Row
} from 'react-bootstrap'
import Select from 'react-select'

import * as activeActions from '../../actions/active'
import * as stopStrategiesActions from '../../actions/map/stopStrategies'
import * as tripPatternActions from '../../actions/tripPattern'
import { getEntityName, getAbbreviatedStopName, getTableById } from '../../util/gtfs'
import MinuteSecondInput from '../MinuteSecondInput'
import { getGtfsSpecField } from '../../../common/util/config'
import type {Feed, Pattern, PatternLocation, PatternStop} from '../../../types'
import type {AppState, RouterProps, EditorTables} from '../../../types/reducers'
import { mergePatternHalts } from '../../../gtfs/util'

import NormalizeStopTimesTip from './NormalizeStopTimesTip'
import PatternStopButtons from './PatternStopButtons'

type Props = {
  active: boolean,
  activePattern: Pattern,
  addStopToPattern: typeof stopStrategiesActions.addStopToPattern,
  // property is available through react dnd?
  connectDragSource: any,
  cumulativeTravelTime: number,
  feedSource: Feed,
  findCard: string => { card: PatternStop | PatternLocation, index: number },
  id: string,
  index: number,
  isDragging: boolean,
  moveCard: (string, number) => void,
  patternEdited: boolean,
  patternStop: PatternStop | PatternLocation,
  removeStopFromPattern: typeof stopStrategiesActions.removeStopFromPattern,
  rowStyle: {[string]: number | string},
  saveActiveGtfsEntity: typeof activeActions.saveActiveGtfsEntity,
  setActiveEntity: typeof activeActions.setActiveEntity,
  setActiveStop: typeof tripPatternActions.setActiveStop,
  status: any,
  stop: any,
  stopIsActive: boolean,
  tables: EditorTables,
  updateActiveGtfsEntity: typeof activeActions.updateActiveGtfsEntity,
  updatePatternStops: typeof tripPatternActions.updatePatternStops
}

type PickupDropoffSelectProps = {
  activePattern: Pattern,
  controlLabel: string,
  onChange: (evt: SyntheticInputEvent<HTMLInputElement>) => void,
  selectType: string,
  shouldHaveDisabledOption: boolean,
  title: string,
  value: string | number
}

type State = {
  flexWindowOffsetEnd: number,
  flexWindowOffsetStart: number,
  initialDwellTime: number,
  initialTravelTime: number,
  meanDurationFactor: number,
  meanDurationOffset: number,
  safeDurationFactor: number,
  safeDurationOffset: number,
  update: boolean
}

const pickupDropoffOptions = [
  {
    value: 0,
    text: 'Regularly Scheduled'
  },
  {
    value: 1,
    text: 'Not available'
  },
  {
    value: 2,
    text: 'Must phone agency to arrange'
  },
  {
    value: 3,
    text: 'Must coordinate with driver to arrange'
  }
]

/** renders the form control drop downs for dropOff/Pick up and also continuous */
const PickupDropoffSelect = (props: PickupDropoffSelectProps) => {
  const {
    activePattern,
    controlLabel,
    onChange,
    selectType,
    shouldHaveDisabledOption,
    title,
    value
  } = props
  const hasShapeId = activePattern.shapeId === null
  return (
    <FormGroup
      bsSize='small'
      controlId={selectType}
    >
      <ControlLabel
        className='small'
        title={title}
      >
        {controlLabel}
      </ControlLabel>
      <FormControl
        componentClass='select'
        disabled={shouldHaveDisabledOption && hasShapeId}
        onChange={onChange}
        placeholder='select'
        value={value}
      >
        {pickupDropoffOptions.map(o => (
          <option key={o.value} value={o.value}>{o.text} ({o.value})</option>
        ))}
      </FormControl>
    </FormGroup>
  )
}

const cardSource = {
  beginDrag (props: Props) {
    return {
      id: props.id,
      originalIndex: props.findCard(props.id).index
    }
  },

  endDrag (props: Props, monitor: any) {
    const { id: droppedId, originalIndex } = monitor.getItem()
    const didDrop = monitor.didDrop()
    if (!didDrop) {
      console.log('endDrag')
      props.moveCard(droppedId, originalIndex)
    }
  },

  // disable dragging if request is pending (i.e., save trip pattern is in progress)
  canDrag (props: Props, monitor: any) {
    if (props.status.savePending || props.active) {
      const item = monitor.getItem()
      // Ensure item exists before getting ID.
      const id = item && item.id
      console.warn(`Cannot drag card (id=${id}). Card is active or save is in progress.`)
      return false
    }
    return true
  }
}

const cardTarget = {
  drop (props, monitor) {
    const { id: droppedId, originalIndex } = monitor.getItem()
    const { index: droppedIndex } = props.findCard(droppedId)
    if (droppedIndex !== originalIndex) {
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

class PatternStopCard extends Component<Props> {
  _formatTravelTime (cumulativeTravelTime, patternStop) {
    if (!patternStop.defaultTravelTime || !patternStop.defaultDwellTime) return

    // $FlowFixMe Flow can't handle the strange type checking we're doing here
    return `${Math.round(cumulativeTravelTime / 60)} (+${Math.round(patternStop.defaultTravelTime / 60)}${patternStop.defaultDwellTime > 0 ? ` +${Math.round(patternStop.defaultDwellTime / 60)}` : ''})`
  }

  handleClick = () => {
    const {active, id, index, setActiveStop} = this.props
    if (!active) setActiveStop({id, index})
    else setActiveStop({id: null, index: null})
  }

  _onKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.handleClick()
    }
  }

  render () {
    const {
      active,
      connectDragSource,
      // $FlowFixMe https://github.com/flow-typed/flow-typed/issues/1564
      connectDropTarget,
      stop,
      index,
      patternStop,
      cumulativeTravelTime
    } = this.props
    const stopName = getEntityName(stop)
    const abbreviatedStopName = getAbbreviatedStopName(stop)
    const titleStopName = stop
      ? `${index + 1}. ${stopName}`
      : `${index + 1}. [unknown stop]`
    const fullStopName = stop
      ? `${index + 1}. ${abbreviatedStopName}`
      : `${index + 1}. [unknown stop]`

    // Show pattern stop in warning color if travel time is zero (a zero value
    // is required for the first pattern stop).
    let cardBackground = null
    if (!patternStop.defaultTravelTime && index !== 0) {
      cardBackground = 'hsla(35, 84%, 87%, 1)'
    }
    // Flex locations should be their own color
    if (patternStop.hasOwnProperty('locationId')) {
      cardBackground = 'hsla(187, 84%, 87%, 1)'
    }
    return connectDragSource(connectDropTarget(
      <div
        className='pattern-stop-card'
        style={{backgroundColor: cardBackground}}>
        {/* Main card title */}
        <div
          className='small'
          role='button'
          style={{cursor: 'pointer'}}
          tabIndex={0}
          onClick={this.handleClick}
          onKeyDown={this._onKeyDown}>
          <div className='pull-left'>
            <p
              style={{margin: '0px'}}
              title={titleStopName}>
              <Icon type={active ? 'caret-down' : 'caret-right'} />
              {fullStopName.length > 25
                ? fullStopName.substr(0, 25) + '...'
                : fullStopName
              }
            </p>
          </div>
          <div className='pull-right'>
            <p style={{margin: '0px'}} className='text-right'>
              <span>
                {this._formatTravelTime(cumulativeTravelTime, patternStop)}
              </span>
              {'    '}
              <span style={{cursor: '-webkit-grab', color: 'black'}} >
                <Icon type='bars' />
              </span>
            </p>
          </div>
          <div className='clearfix' />
        </div>
        <PatternStopContents {...this.props} />
      </div>
    ))
  }
}

class PatternStopContents extends Component<Props, State> {
  componentWillMount () {
    const {patternStop} = this.props
    // PatternStop will either be a stop or a location
    // This can be detected using the alpahbetically first field

    if (patternStop.hasOwnProperty('stopId')) {
      this.setState({
        // $FlowFixMe flow doesn't like our "type check"
        initialDwellTime: patternStop.defaultDwellTime,
        // $FlowFixMe flow doesn't like our "type check"
        initialTravelTime: patternStop.defaultTravelTime,
        update: false
      })
    } else if (patternStop.hasOwnProperty('locationId')) {
      this.setState({
        // $FlowFixMe flow doesn't like our "type check"
        flexWindowOffsetStart: patternStop.flexWindowOffsetStart,
        // $FlowFixMe flow doesn't like our "type check"
        flexWindowOffsetEnd: patternStop.flexWindowOffsetEnd,
        // $FlowFixMe flow doesn't like our "type check"
        meanDurationFactor: patternStop.meanDurationFactor,
        // $FlowFixMe flow doesn't like our "type check"
        meanDurationOffset: patternStop.meanDurationOffset,
        // $FlowFixMe flow doesn't like our "type check"
        safeDurationFactor: patternStop.safeDurationFactor,
        // $FlowFixMe flow doesn't like our "type check"
        safeDurationOffset: patternStop.safeDurationOffset,
        update: false
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.patternEdited && this.props.patternEdited) {
      this.setState({update: false})
    }
  }

  /**
   * Only update component if id changes, active state changes, or if pattern has
   * been saved (patternEdited changes to false). This is to ensure that default
   * times are not overwritten.
   * FIXME: id shouldn't change anymore (not generated client-side). Check that
   * this has no negative effects (check elsewhere, too, for example, pattern geom).
   */
  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.active !== this.props.active ||
      nextProps.id !== this.props.id ||
      nextState !== this.state ||
      (!nextProps.patternEdited && this.props.patternEdited)
    ) {
      return true
    }
    return false
  }

  // Returns combined patternLocations and pattern stops
  getPatternHaltsFromActivePattern = () => {
    const {patternLocations, patternStops} = this.props.activePattern
    return mergePatternHalts(patternStops, patternLocations)
  };

  _onChangeTimepoint = () => {
    const {activePattern, index, patternStop, saveActiveGtfsEntity, updatePatternStops} = this.props
    const patternStops = this.getPatternHaltsFromActivePattern()
    const newValue = patternStop.timepoint ? 0 : 1
    patternStops[index].timepoint = newValue
    updatePatternStops(activePattern, patternStops)
    saveActiveGtfsEntity('trippattern')
  }

  _onClickRemovePatternStop = () => {
    const {activePattern, index, saveActiveGtfsEntity, updatePatternStops} = this.props
    const patternStops = this.getPatternHaltsFromActivePattern()
    patternStops.splice(index, 1)
    updatePatternStops(activePattern, patternStops)
    saveActiveGtfsEntity('trippattern')
  }

  _onMinuteSecondInputChange = (newValue: number, key: string) => {
    const {activePattern, index, updatePatternStops} = this.props
    const patternStops = this.getPatternHaltsFromActivePattern()
    // FLEX TODO: Either here or inside updatePatternStops all offsets needs to be converted
    // to an actual value
    patternStops[index][key] = newValue
    this.setState({update: true})
    updatePatternStops(activePattern, patternStops)
  }

  _onTextFieldChange = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    // FLEX TODO: Validation
    const {activePattern, index, updatePatternStops} = this.props
    // THis can also include locations and location groups
    const patternStops = this.getPatternHaltsFromActivePattern()
    // FLEX TODO: Either here or inside updatePatternStops all offsets needs to be converted
    // to an actual value
    patternStops[index][evt.target.id] = evt.target.value
    updatePatternStops(activePattern, patternStops)
  }

  _onPickupOrDropOffChange = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const selectedOptionValue: number = parseInt(evt.target.value, 10)
    const {activePattern, index, updatePatternStops} = this.props
    const patternStops = this.getPatternHaltsFromActivePattern()

    const newPatternStop = clone(patternStops[index])
    newPatternStop[evt.target.id] = selectedOptionValue
    patternStops[index] = newPatternStop
    this.setState({update: true})
    updatePatternStops(activePattern, patternStops)
  }

  _onBookingRuleChange = (change: {label: string, value: string}, field: string) => {
    const selectedRuleId: string = (change && change.value) || ''
    const {activePattern, index, updatePatternStops} = this.props
    const patternStops = this.getPatternHaltsFromActivePattern()

    const newPatternStop = clone(patternStops[index])
    newPatternStop[field] = selectedRuleId
    patternStops[index] = newPatternStop
    this.setState({update: true})
    updatePatternStops(activePattern, patternStops)
  }

  // This entire component should be refactored ot use Entity information from gtfs.yml
  // until that refactor happens, it will be a little complex, in line with other
  // similar components.
  // eslint-disable-next-line complexity
  render () {
    const {active, activePattern, feedSource, patternEdited, patternStop, tables} = this.props
    // This component has a special shouldComponentUpdate to ensure that state
    // is not overwritten with new props, so use state.update to check edited
    // state.
    const isEdited = patternEdited || this.state.update

    // FIXME: a better way to do this?
    const pickupBookingRuleId = getGtfsSpecField('stop_time', 'pickup_booking_rule_id')
    const dropOffBookingRuleId = getGtfsSpecField('stop_time', 'drop_off_booking_rule_id')

    const pickupDropOffRow = <Row>
      <Col xs={6}>
        <PickupDropoffSelect
          activePattern={activePattern}
          controlLabel='Pickup'
          onChange={this._onPickupOrDropOffChange}
          selectType='pickupType'
          shouldHaveDisabledOption={false}
          title='Define the pickup method/availability at this stop.'
          value={patternStop.pickupType || ''}
        />
      </Col>
      <Col xs={6}>
        <PickupDropoffSelect
          activePattern={activePattern}
          controlLabel='Drop-off'
          onChange={this._onPickupOrDropOffChange}
          selectType='dropOffType'
          shouldHaveDisabledOption={false}
          title='Define the dropff method/availability at this stop.'
          value={patternStop.dropOffType || ''}
        />
      </Col>
    </Row>

    const bookingRuleRow = feedSource.flex && <Row>
      <Col xs={6}>
        {pickupBookingRuleId &&
        <FormGroup>
          <ControlLabel className='small'>{pickupBookingRuleId.displayName}</ControlLabel>
          <Select
            clearable
            oResultsText={`No booking rules found. You can add some in the sidebar.`}
            onChange={change => this._onBookingRuleChange(change, 'pickupBookingRuleId')}
            options={getTableById(tables, 'bookingrule').map((rule) => {
              return {
                value: rule.booking_rule_id,
                label: rule.booking_rule_id
              }
            })}
            value={patternStop.pickupBookingRuleId || ''}
          />
        </FormGroup>
        }
      </Col>
      <Col xs={6}>
        {dropOffBookingRuleId &&
        <FormGroup>
          <ControlLabel className='small'>{dropOffBookingRuleId.displayName}</ControlLabel>
          <Select
            clearable
            oResultsText={`No booking rules found. You can add some in the sidebar.`}
            onChange={change => this._onBookingRuleChange(change, 'dropOffBookingRuleId')}
            options={getTableById(tables, 'bookingrule').map((rule) => {
              return {
                value: rule.booking_rule_id,
                label: rule.booking_rule_id
              }
            })}
            value={patternStop.dropOffBookingRuleId || ''}
          />
        </FormGroup>}
      </Col>
    </Row>

    const stopRows = <div>
      <Row>
        <Col xs={6}>
          <FormGroup controlId='defaultTravelTime' bsSize='small'>
            <ControlLabel
              title={this.props.index === 0
                ? 'Travel time for first stop must be zero'
                : 'Define the default time it takes to travel to this stop from the previous stop.'}
              className='small'>
          Default travel time
            </ControlLabel>
            <MinuteSecondInput
              disabled={this.props.index === 0}
              seconds={this.state.initialTravelTime}
              onChange={newValue => this._onMinuteSecondInputChange(newValue, 'defaultTravelTime')}
            />
          </FormGroup>
        </Col>
        <Col xs={6}>
          <FormGroup controlId='defaultDwellTime' bsSize='small'>
            <ControlLabel className='small'>Default dwell time</ControlLabel>
            <MinuteSecondInput
              seconds={this.state.initialDwellTime}
              onChange={newValue => this._onMinuteSecondInputChange(newValue, 'defaultDwellTime')}
            />
          </FormGroup>
        </Col>
      </Row>
      {pickupDropOffRow}
      <Row>
        <Col xs={6}>
          <PickupDropoffSelect
            activePattern={activePattern}
            controlLabel='Continuous pickup'
            onChange={this._onPickupOrDropOffChange}
            selectType='continuousPickup'
            shouldHaveDisabledOption
            title='Indicates whether a rider can board the transit vehicle anywhere along the vehicle\u2019s travel path.'
            value={patternStop.continuousPickup || ''}
          />
        </Col>
        <Col xs={6}>
          <PickupDropoffSelect
            activePattern={activePattern}
            controlLabel='Continuous drop-off'
            onChange={this._onPickupOrDropOffChange}
            selectType='continuousDropOff'
            shouldHaveDisabledOption
            title='Indicates whether a rider can alight from the transit vehicle at any point along the vehicle\u2019s travel path.'
            value={patternStop.continuousDropOff || ''}
          />
        </Col>
      </Row>
      {feedSource.flex && bookingRuleRow}
    </div>

    const locationRows = feedSource.flex && (
      <div>
        <Row>
          <Col xs={6}>
            <FormGroup bsSize='small'>
              <ControlLabel className='small'>
                Flex Window Offset Start
              </ControlLabel>
              <MinuteSecondInput
                seconds={this.state.flexWindowOffsetStart}
                onChange={(newValue) =>
                  this._onMinuteSecondInputChange(
                    newValue,
                    'flexWindowOffsetStart'
                  )
                }
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup bsSize='small'>
              <ControlLabel className='small'>
                Flex Window Offset End
              </ControlLabel>
              <MinuteSecondInput
                seconds={this.state.flexWindowOffsetEnd}
                onChange={(newValue) =>
                  this._onMinuteSecondInputChange(
                    newValue,
                    'flexWindowOffsetEnd'
                  )
                }
              />
            </FormGroup>
          </Col>
        </Row>
        {pickupDropOffRow}
        <Row>
          <Col xs={6}>
            <FormGroup controlId='meanDurationFactor'>
              <ControlLabel className='small'>Mean Duration Factor</ControlLabel>
              <FormControl
                value={this.state.meanDurationFactor}
                onChange={this._onTextFieldChange}
                type='number'
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup controlId='meanDurationOffset'>
              <ControlLabel className='small'>Mean Duration Offset</ControlLabel>
              <FormControl
                value={this.state.meanDurationOffset}
                onChange={this._onTextFieldChange}
                type='number'
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <FormGroup controlId='safeDurationFactor'>
              <ControlLabel className='small'>Safe Duration Factor</ControlLabel>
              <FormControl
                value={this.state.safeDurationFactor}
                onChange={this._onTextFieldChange}
                type='number'
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup controlId='safeDurationOffset'>
              <ControlLabel className='small'>Safe Duration Offset</ControlLabel>
              <FormControl
                value={this.state.safeDurationOffset}
                onChange={this._onTextFieldChange}
                type='number'
              />
            </FormGroup>
          </Col>
        </Row>
        {bookingRuleRow}
      </div>
    )

    let innerDiv
    if (active) {
      innerDiv = <div>
        <Row>
          <Col xs={4}>
            <Checkbox
              checked={patternStop.timepoint}
              onChange={this._onChangeTimepoint}>
        Timepoint?
            </Checkbox>
          </Col>
          <Col xs={8}>
            <PatternStopButtons
              {...this.props}
              patternEdited={isEdited}
              size='xsmall'
              style={{ marginTop: '10px' }}
            />
          </Col>
        </Row>
        {patternStop.hasOwnProperty('stopId') && stopRows}
        {patternStop.hasOwnProperty('locationId') && locationRows}
        <NormalizeStopTimesTip />
      </div>
    }
    return (
      <Collapse // collapsible div
        in={active}>
        <div>{innerDiv}</div>
      </Collapse>
    )
  }
}

const dropTargetCollect = (connect) => ({connectDropTarget: connect.dropTarget()})
const dragSourceCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
})

const mapStateToProps = (state: AppState, ownProps: RouterProps) => {
  return { tables: state.editor.data.tables }
}

const mapDispatchToProps = {updateActiveGtfsEntity: activeActions.updateActiveGtfsEntity}

export default DropTarget('card', cardTarget, dropTargetCollect)(
  DragSource('card', cardSource, dragSourceCollect)(connect(mapStateToProps, mapDispatchToProps)(PatternStopCard))
)
