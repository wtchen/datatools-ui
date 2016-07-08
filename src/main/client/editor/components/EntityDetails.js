import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, Checkbox, Radio, ListGroupItem, Button, ButtonToolbar, Form, Glyphicon, FormControl, FormGroup, ControlLabel, Input, Nav, NavItem, Tooltip, OverlayTrigger, Panel } from 'react-bootstrap'
import {Icon, IconStack} from 'react-fa'
import ReactCSS from 'reactcss'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import { PureComponent, shallowEqual } from 'react-pure-render'
import Select from 'react-select'
import { sentence as toSentenceCase } from 'change-case'
import DateTimeField from 'react-bootstrap-datetimepicker'
import moment from 'moment'
import { SketchPicker } from 'react-color'
import Dropzone from 'react-dropzone'

import GtfsSearch from '../../gtfs/components/gtfssearch'
import EditableTextField from '../../common/components/EditableTextField'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import LanguageSelect from '../../common/components/LanguageSelect'
import TripPatternList from './TripPatternList'
import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import { getEntityName, gtfsIcons } from '../util/gtfs'

export default class EntityDetails extends Component {

  constructor (props) {
    super(props)
    this.state = {
      displayColorPicker: false,
      color: {
        r: '241',
        g: '112',
        b: '19',
        a: '1',
      }
    }
  }

  // componentWillReceiveProps (nextProps) {
  //   // forceUpdate()
  // }
  shouldComponentUpdate (nextProps) {
    // component is updating!!!
    return  true // !shallowEqual(nextProps.entity, this.props.entity) || nextProps.entityEdited !== this.props.entityEdited || nextProps.activeEntityId !== this.props.activeEntityId
  }
  classes () {
    return {
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.color.a })`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
      },
    }
  }
  render () {
    // const routes = ['test', 'Route 123', 'Route 456', 'Route 1', 'Route 10']
    console.log(this.state)
    let entity = this.props.activeComponent === 'feedinfo' ? this.props.tableData.feedinfo : this.props.entity

    let panelWidth = `${this.props.width}px`

    let panelStyle = {
      width: panelWidth,
      height: '100%',
      position: 'absolute',
      // overflowY: 'scroll',
      top: '0px',
      left: this.props.offset || '0px',
      zIndex: 99,
      backgroundColor: '#F2F2F2',
      paddingRight: '5px',
      paddingLeft: '5px'
    }
    const rowStyle = {
      cursor: 'pointer'
    }

    let zones = {}
    if (this.props.tableData.stop) {
      for (var i = 0; i < this.props.tableData.stop.length; i++) {
        let stop = this.props.tableData.stop[i]
        if (stop.zone_id) {
          let zone = zones[stop.zone_id]
          if (!zone) {
            zone = []
          }
          zone.push(stop)
          zones[stop.zone_id] = zone
        }
      }
    }
    let zoneOptions = Object.keys(zones).map(key => {
      return {
        value: key,
        label: `${key} zone (${zones[key] ? zones[key].length : 0} stops)`
      }
    })

    const getInput = (row, field, currentValue, index) => {
      const editorField = field.name //.split(/_(.+)?/)[1]
      let value
      const standardLabel = <ControlLabel>{toSentenceCase(editorField.split(/_(.+)?/)[1])} <span style={{fontWeight: 'normal'}}>({editorField})</span></ControlLabel>
      const basicLabel = field.helpContent
          ? <OverlayTrigger placement='right' overlay={<Tooltip id='tooltip'>{field.helpContent}</Tooltip>}>
              <ControlLabel>{editorField}{field.required ? ' *' : ''}</ControlLabel>
            </OverlayTrigger>
          : <ControlLabel>{editorField}{field.required ? ' *' : ''}</ControlLabel>
      switch(field.inputType) {
        case 'TEXT':
        case 'URL':
        case 'GTFS_TRIP':
        case 'GTFS_SHAPE':
        case 'GTFS_BLOCK':
        case 'GTFS_FARE':
        case 'GTFS_SERVICE':
          value = this.state[editorField] || currentValue
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              validationState={field.required && !value
                ? 'error'
                : field.required
                ? 'success'
                : ''
              }
            >
            {basicLabel}
            <FormControl
              // tabIndex={index}
              defaultValue={currentValue ? currentValue : ''}
              placeholder={field.placeholder ? field.placeholder : ''}
              onChange={(evt) => {
                let props = {}
                props[editorField] = evt.target.value
                this.setState({[editorField]: evt.target.value})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              }}
            />
            {
              // <FormControl.Feedback />
            }
            </FormGroup>
          )
        case 'GTFS_ZONE':
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              /*validationState={this.getValidationState()}*/
            >
              {basicLabel}
              <Select
                placeholder='Select origin zone...'
                clearable={true}
                noResultsText={`No zones found. Specify zones in stop.`}
                key={Math.random()}
                value={currentValue ? {value: currentValue, label: `${currentValue} zone (${zones[currentValue] ? zones[currentValue].length : 0} stops)`}  : null}
                onChange={(input) => {
                  console.log(input)
                  let props = {}
                  value = input ? input.value : null
                  props[editorField] = value
                  this.setState({[editorField]: value})
                  this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)

                }}
                filterOptions={(options, filter, values) => {
                  // Filter already selected values
                  let valueKeys = values && values.map(i => i.value)
                  let filteredOptions = options.filter(option => {
                    return valueKeys ? valueKeys.indexOf(option.value) === -1 : []
                  })

                  // Filter by label
                  if (filter !== undefined && filter != null && filter.length > 0) {
                    filteredOptions = filteredOptions.filter(option => {
                      return RegExp(filter, 'ig').test(option.label)
                    })
                  }

                  // Append Addition option
                  if (filteredOptions.length == 0) {
                    filteredOptions.push({
                      label: <span><strong>Create new zone</strong>: {filter}</span>,
                      value: filter,
                      create: true
                    })
                  }

                  return filteredOptions
                }}
                options={zoneOptions}
              />
            </FormGroup>
          )
        case 'TIMEZONE':
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              /*validationState={this.getValidationState()}*/
            >
            {basicLabel}
            <TimezoneSelect
              // tabIndex={index}
              value={this.state[editorField] || currentValue}
              clearable={!field.required}
              onChange={(option) => {
                let props = {}
                props[editorField] = option.value
                this.setState({[editorField]: option.value})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              }}
            />
            </FormGroup>
          )
        case 'LANGUAGE':
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              /*validationState={this.getValidationState()}*/
            >
            {basicLabel}
            <LanguageSelect
              // tabIndex={index}
              value={this.state[editorField] || currentValue}
              clearable={false}
              onChange={(option) => {
                let props = {}
                props[editorField] = option.value
                this.setState({[editorField]: option.value})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              }}
            />
            </FormGroup>
          )
        case 'TIME':
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              /*validationState={this.getValidationState()}*/
            >
            {basicLabel}
            <FormControl
              // tabIndex={index}
              defaultValue={currentValue}
              placeholder='HH:MM:SS'
              onChange={(evt) => {
                let props = {}
                props[editorField] = evt.target.value
                this.setState({[editorField]: evt.target.value})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              }}
            />
            </FormGroup>
          )
        case 'LATITUDE':
        case 'LONGITUDE':

          value = this.state[editorField] || currentValue
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              validationState={field.required && !value
                ? 'error'
                : field.required
                ? 'success'
                : ''
              }
            >
            {basicLabel}
            <FormControl
              // tabIndex={index}
              value={value}
              type='number'
              // onChange={(evt) => {
              //   let props = {}
              //   props[editorField] = evt.target.value
              // //   this.setState({[editorField]: evt.target.value})
              //   this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              // }}
            />
            </FormGroup>
          )
        case 'NUMBER':
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              /*validationState={this.getValidationState()}*/
            >
            {basicLabel}
            <FormControl
              // tabIndex={index}
              defaultValue={currentValue}
              type='number'
              onChange={(evt) => {
                let props = {}
                props[editorField] = evt.target.value
                this.setState({[editorField]: evt.target.value})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              }}
            />
            </FormGroup>
          )
        case 'DATE':
          let defaultValue = /end/.test(editorField) ? +moment().startOf('day').add(3, 'months') : +moment().startOf('day')
          let dateTimeProps = {
            mode: 'date',
            dateTime: currentValue ? +moment(currentValue) : defaultValue,
            onChange: (millis) => {
              let date = moment(+millis)
              console.log(date, millis)
              let seconds = +millis / 1000
              let props = {}
              props[editorField] = +millis
              this.setState({[editorField]: +millis})
              this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
            }
          }
          if (!currentValue) {
            dateTimeProps.defaultText = 'Please select a date'
          }
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              /*validationState={this.getValidationState()}*/
            >
            {basicLabel}
            <div style={{position: 'relative'}}>
            <DateTimeField
              {...dateTimeProps}
            />
            </div>
            </FormGroup>
          )
        case 'COLOR':
          const popover = {
            position: 'absolute',
            zIndex: '2',
          }
          const cover = {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
          }
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              /*validationState={this.getValidationState()}*/
            >
            {basicLabel}
            <FormControl
              // tabIndex={index}
              defaultValue={currentValue}
              placeholder={field.placeholder}
              type='text'
              onChange={(evt) => {
                let props = {}
                props[editorField] = evt.target.value
                this.setState({[editorField]: evt.target.value})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              }}
            />
            {
              // <div is="swatch" onClick={ this.handleClick }>
              //   <div is="color" />
              // </div>
            }
            {
              // this.state.displayColorPicker ? <div is="popover">
              //   <div is="cover" onClick={ this.handleClose }/>
              //   <SketchPicker
              //     color={ `#${this.state[editorField]}` || `#${currentValue}` }
              //     onChange={ this.handleChange }
              //     onChangeComplete={(value) => {
              //       let props = {}
              //       props[editorField] = evt.target.value
              // //       this.setState({[editorField]: evt.target.value})
              //       this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              //     }}
              //   />
              // </div> : null
            }
            {
              // <Button onClick={ () => this.setState({ displayColorPicker: !this.state.displayColorPicker }) }>Pick Color</Button>
            }
            {
              // this.state.displayColorPicker
              // ? <div style={ popover }>
              //     <div style={ cover } onClick={ this.handleClose }/>
              //     <SketchPicker />
              //   </div>
              // : null
            }
            </FormGroup>
          )
        case 'POSITIVE_INT':
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              /*validationState={this.getValidationState()}*/
            >
            {basicLabel}
            <FormControl
              // tabIndex={index}
              defaultValue={currentValue}
              type='number'
              min={0}
              step={1}
              onChange={(value) => {
                let props = {}
                props[editorField] = evt.target.value
                this.setState({[editorField]: evt.target.value})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              }}
            />
            </FormGroup>
          )
        case 'POSITIVE_NUM':
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              /*validationState={this.getValidationState()}*/
            >
            {basicLabel}
            <FormControl
              // tabIndex={index}
              defaultValue={currentValue}
              type='number'
              min={0}
              onChange={(value) => {
                let props = {}
                props[editorField] = evt.target.value
                this.setState({[editorField]: evt.target.value})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              }}
            />
            </FormGroup>
          )
        case 'DAY_OF_WEEK_BOOLEAN':
          return ([
            <span>
            {editorField === 'monday'
              ? <div className='col-xs-12'><ControlLabel>Days of service</ControlLabel></div> : null
            }
            </span>
            ,
            <span className='col-xs-3'>
            <Checkbox
              inline
              checked={this.state[editorField] === 1 || currentValue === 1}
              onChange={(evt) => {
                console.log(evt.target.checked)
                let props = {}
                value = evt.target.checked ? 1 : 0
                props[editorField] = value
                this.setState({[editorField]: value})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              }}
            >
              {toSentenceCase(editorField.substr(0, 3))}
            </Checkbox>
            {'     '}
            </span>]
          )
        case 'DROPDOWN':
          value = this.state[editorField] || currentValue
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              validationState={field.required && !value
                ? 'error'
                : field.required
                ? 'success'
                : ''
              }
            >
              {basicLabel}
              <FormControl componentClass='select'
                // tabIndex={index}
                value={value}
                onChange={(evt) => {
                  let props = {}
                  props[editorField] = evt.target.value
                  this.setState({[editorField]: evt.target.value})
                  this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
                }}
              >
                {field.options.map(option => {
                  return <option value={option.value} key={option.value}>
                    {option.text || option.value}
                  </option>
                })}
              </FormControl>
            </FormGroup>
          )
        case 'GTFS_ROUTE':
          const routeEntity = this.props.getGtfsEntity('route', currentValue)

          const routeValue = routeEntity
            ? { 'value': routeEntity.route_id,
                'label': routeEntity.route_short_name
                  ? `${routeEntity.route_short_name} - ${routeEntity.route_long_name}`
                  : routeEntity.route_long_name
              }
            : ''
          return (
            <GtfsSearch
              // tabIndex={index}
              feeds={[this.props.feedSource]}
              limit={100}
              entities={['routes']}
              minimumInput={1}
              clearable={false}
              onChange={(evt) => {
                this.props.fieldEdited(table.id, row, editorField, evt.route.route_id)
                this.props.gtfsEntitySelected('route', evt.route)
              }}
              value={routeValue}
            />
          )
        case 'GTFS_AGENCY':
          value = this.state[editorField] || currentValue
          const agency = this.props.tableData.agency && this.props.tableData.agency.find(a => a.id === value)
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              /*validationState={this.getValidationState()}*/
            >
              {basicLabel}
              <Select
                placeholder='Select agency...'
                clearable={true}
                value={agency ? {value, label: agency.agency_name}: {value}}
                onChange={(input) => {
                  console.log(input)
                  let props = {}
                  let val = input ? input.value : null
                  props[editorField] = val
                  this.setState({[editorField]: val})
                  this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)

                }}
                options={
                  // () => {
                  this.props.tableData.agency ? this.props.tableData.agency.map(agency => {
                    return {
                      value: agency.id,
                      label: agency.agency_name,
                      agency
                    }
                  })
                // }
                : []
              }
              />
            </FormGroup>
          )
        case 'GTFS_STOP':
          value = this.state[editorField] || currentValue
          const stopIndex = this.props.tableData.stop && this.props.tableData.stop.findIndex(s => s.id === this.props.entity.id)
          const stop = this.props.tableData.stop.find(s => s.id === value)

          let stops = [...this.props.tableData.stop]

          // remove current entity from list of stops
          if (stopIndex !== -1) {
            stops.splice(stopIndex, 1)
          }
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              /*validationState={this.getValidationState()}*/
            >
            {basicLabel}
            <VirtualizedEntitySelect
              value={stop ? {value: stop.id, label: getEntityName(this.props.activeComponent, stop), entity: stop} : null}
              component={'stop'}
              entities={stops}
              onChange={(input) => {
                console.log(input)
                let props = {}
                let val = input ? input.value : null
                props[editorField] = val
                this.setState({[editorField]: val})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)
              }}
            />
            </FormGroup>
          )
      }
    }
    if (!entity) return null
    const rowIndex = 0
    const table = DT_CONFIG.modules.editor.spec.find(
      t => this.props.activeComponent === 'scheduleexception'
        ? t.id === 'calendar_dates'
        : this.props.activeComponent === 'fare'
        ? t.id === 'fare_attributes'
        : t.id === this.props.activeComponent
    )
    const exemplars = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
      'NO_SERVICE',
      'CUSTOM',
    ]

    const fareRulesForm = this.state.editFareRules
      ? <div>
          <p>Specify which routes or zones <strong>{this.props.entity.fare_id}</strong> fare applies to.</p>
          <span className='pull-right'>{this.props.entity.fareRules.length} rules apply to this fare</span>
          <Button
            style={{marginBottom: '15px'}}
            onClick={() => {
              let rules = [...this.props.entity.fareRules]
              rules.unshift({fare_id: this.props.entity.fare_id})
              this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {fareRules: rules})
            }}
          ><Icon name='plus'/> Add rule</Button>
            {this.props.entity.fareRules.map((rule, index) => {

              let ruleEntity
              if (rule.route_id) {
                ruleEntity = this.props.tableData.route && this.props.tableData.route.find(r => r.route_id === rule.route_id)
              }
              return (
                <Panel
                  key={`rule-${index}`}
                >
                  <Button
                    bsStyle='danger'
                    bsSize='xsmall'
                    className='pull-right'
                    style={{marginLeft: '5px'}}
                    key={Math.random()}
                    onClick={() => {
                      let rules = [...this.props.entity.fareRules]
                      rules.splice(index, 1)
                      this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {fareRules: rules})
                    }}
                  ><Icon name='times'/></Button>
                  <FormGroup>
                    <Radio
                      inline
                      key={Math.random()}
                      checked={rule.route_id}
                      onChange={(evt) => {
                        let rules = [...this.props.entity.fareRules]
                        rules[index] = {fare_id: this.props.entity.fare_id}
                        rules[index].route_id = true
                        this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {fareRules: rules})
                      }}
                    >
                      <small>Route</small>
                    </Radio>
                    {' '}
                    <Radio
                      inline
                      key={Math.random()}
                      checked={rule.origin_id || rule.destination_id}
                      onChange={(evt) => {
                        let rules = [...this.props.entity.fareRules]
                        rules[index] = {fare_id: this.props.entity.fare_id}
                        rules[index].origin_id = true
                        this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {fareRules: rules})
                      }}
                    >
                      <small>Origin/Dest.</small>
                    </Radio>
                    {' '}
                    <Radio
                      inline
                      key={Math.random()}
                      checked={rule.contains_id}
                      onChange={(evt) => {
                        let rules = [...this.props.entity.fareRules]
                        rules[index] = {fare_id: this.props.entity.fare_id}
                        rules[index].contains_id = true
                        this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {fareRules: rules})
                      }}
                    >
                      <small>Contains</small>
                    </Radio>
                  </FormGroup>
                  {rule.route_id
                    ? <VirtualizedEntitySelect
                        value={ruleEntity ? {value: ruleEntity.route_id, label: getEntityName('route', ruleEntity), entity: ruleEntity} : null}
                        component={'route'}
                        entityKey='route_id'
                        entities={this.props.tableData.route}
                        onChange={(input) => {
                          console.log(input)
                          let rules = [...this.props.entity.fareRules]
                          rules[index].route_id = input ? input.value : null
                          this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {fareRules: rules})
                        }}
                      />
                    : rule.contains_id
                    ? <Select
                        placeholder='Select zone...'
                        clearable={true}
                        noResultsText={`No zones found. Specify zones in stop.`}
                        key={Math.random()}
                        value={typeof rule.contains_id === 'string' ? {value: rule.contains_id, label: `${rule.contains_id} zone (${zones[rule.contains_id] ? zones[rule.contains_id].length : 0} stops)`}  : null}
                        onChange={(input) => {
                          console.log(input)
                          let rules = [...this.props.entity.fareRules]
                          rules[index].zone_id = input ? input.value : null
                          this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {fareRules: rules})
                          // let props = {}
                          // props[editorField] = input.value
                          // this.setState({[editorField]: input.value})
                          // this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)

                        }}
                        options={zoneOptions}
                      />
                    : rule.origin_id || rule.destination_id
                    ? [<Select
                        placeholder='Select origin zone...'
                        clearable={true}
                        noResultsText={`No zones found. Specify zones in stop.`}
                        key={Math.random()}
                        value={typeof rule.origin_id === 'string' ? {value: rule.origin_id, label: `${rule.origin_id} zone (${zones[rule.origin_id] ? zones[rule.origin_id].length : 0} stops)`}  : null}
                        onChange={(input) => {
                          console.log(input)
                          let rules = [...this.props.entity.fareRules]
                          rules[index].origin_id = input ? input.value : null
                          this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {fareRules: rules})
                          // let props = {}
                          // props[editorField] = input.value
                          // this.setState({[editorField]: input.value})
                          // this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)

                        }}
                        options={zoneOptions}
                      />
                      ,
                      <Select
                          placeholder='Select destination zone...'
                          clearable={true}
                          noResultsText={`No zones found. Specify zones in stop.`}
                          key={Math.random()}
                          value={typeof rule.destination_id === 'string' ? {value: rule.destination_id, label: `${rule.destination_id} zone (${zones[rule.destination_id] ? zones[rule.destination_id].length : 0} stops)`}  : null}
                          onChange={(input) => {
                            console.log(input)
                            let rules = [...this.props.entity.fareRules]
                            rules[index].destination_id = input ? input.value : null
                            this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {fareRules: rules})
                            // let props = {}
                            // props[editorField] = input.value
                            // this.setState({[editorField]: input.value})
                            // this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, props)

                          }}
                          options={zoneOptions}
                        />
                    ]

                    : null
                  }
                </Panel>
              )
            })}
        </div>
      : null
    const scheduleExceptionForm = this.props.activeComponent === 'scheduleexception'
      ? <div>
        <Form>
          <FormGroup
            controlId={`name`}
            /*validationState={this.getValidationState()}*/
          >
            <ControlLabel>Exception name</ControlLabel>
            <FormControl
              // tabIndex={index}
              defaultValue={this.props.entity.name}
              onChange={(evt) => {
                // let props = {}
                // props[editorField] = evt.target.value
                // // this.setState({[editorField]: evt.target.value})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {name: evt.target.value})
              }}
            />
          </FormGroup>
          <FormGroup
            controlId={`schedule`}
            /*validationState={this.getValidationState()}*/
          >
            <ControlLabel>Run the following schedule:</ControlLabel>
            <FormControl componentClass='select'
              // tabIndex={index}
              defaultValue={this.props.entity.exemplar}
              onChange={(evt) => {
                // let props = {}
                // props[editorField] = evt.target.value
                // // this.setState({[editorField]: evt.target.value})
                this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {exemplar: evt.target.value})
              }}
            >
              {
                exemplars.map(exemplar => {
                  return (
                    <option value={exemplar} key={exemplar}>
                      {toSentenceCase(exemplar)}
                    </option>
                  )
                })
              }
              {
                // this.props.tableData.calendar && this.props.tableData.calendar.map(calendar => {
                //   return <option value={calendar.id} key={calendar.id}>
                //     {calendar.description} ({calendar.service_id})
                //   </option>
                // })
              }
            </FormControl>
          </FormGroup>
          <FormGroup
            controlId={`exception-dates`}
            /*validationState={this.getValidationState()}*/
          >
          <ControlLabel>On these dates</ControlLabel>
          {this.props.entity.dates.length
            ? this.props.entity.dates.map((date, index) => (
            <div style={{position: 'relative', width: '100%', marginBottom: '5px'}}>
              <Button
                bsStyle='danger'
                className='pull-right'
                style={{marginLeft: '5px'}}
                key={`date-remove-${index}`}
                onClick={() => {
                  let dates = [...this.props.entity.dates]
                  dates.splice(index, 1)
                  this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {dates: dates})
                }}
              ><Icon name='times'/></Button>
              <DateTimeField key={`date-${index}`} mode='date'/>
            </div>
            )
          )
          : <div>No dates specified</div>
        }
          </FormGroup>
          <Button
            onClick={() => {
              let dates = [...this.props.entity.dates]
              dates.push(+moment())
              this.props.updateActiveEntity(this.props.entity, this.props.activeComponent, {dates: dates})
            }}
          ><Icon name='plus'/> Add date</Button>

        </Form>
      </div>
      : null
    const entityForm = (
        <div>
          <Form>
            {
              table.fields.map((field, colIndex) => {
                // get editor field by splitting on first underscore
                const editorField = field.name // .split(/_(.+)?/)[1]
              const validationIssue = this.props.validation
                ? this.props.validation.find(v =>
                    (v.rowIndex === data.origRowIndex && v.fieldName === field.name))
                : null

              const tooltip = validationIssue ? (
                <Tooltip>{validationIssue.description}</Tooltip>
              ) : null

              return (
                  <span>
                    {getInput(rowIndex, field, entity[editorField], (rowIndex * table.fields.length) + colIndex + 1)}
                  </span>
              )
            })}
            {this.props.activeComponent === 'route'
              ? <FormGroup
                  className='col-xs-12'
                >
                  <ControlLabel>Upload route branding asset</ControlLabel>
                  <Dropzone
                    onDrop={(files) => console.log('Received files: ', files)}
                    // className='center-block'
                    // style={{height: '40px', width: '100%'}}
                  >
                    <div>Drop a route image here, or click to select image to upload.</div>
                  </Dropzone>
                </FormGroup>
              : null
            }
            <p className='col-xs-12'>* = field is required</p>
          </Form>
          {
            // this.props.activeComponent === 'fare'
            // ? <h4>Fare rules</h4>
            // : null
          }
      </div>
    )
    let entityName = this.props.activeComponent === 'feedinfo' ? 'Feed Info' : getEntityName(this.props.activeComponent, entity)
    let icon = gtfsIcons.find(i => i.id === this.props.activeComponent)
    let iconName = icon ? icon.icon : 'circle'
    // .icon || 'circle'
    const subNav = this.props.activeComponent === 'route'
      ? <Nav style={{marginBottom: '5px'}} bsStyle='pills' justified>
          <NavItem
            eventKey={'route'}
            active={this.props.subComponent !== 'trippattern'}
            onClick={() => {
              this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, entity)
              // browserHistory.push(`/feed/${this.props.feedSource.id}/edit/${this.props.activeComponent}/${entity.id}`)
            }}
          >
            Route details
          </NavItem>
          <OverlayTrigger placement='bottom' overlay={<Tooltip id="tooltip">A route&rsquo;s trip patterns show where it goes.</Tooltip>}>
          <NavItem
            eventKey={'trippattern'}
            disabled={entity.id === 'new'}
            active={this.props.subComponent === 'trippattern'}
            onClick={() => {
              if (this.props.subComponent !== 'trippattern') {
                this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, entity, 'trippattern')
              }
            }}
          >
            Trip patterns
          </NavItem>
          </OverlayTrigger>
        </Nav>
      : this.props.activeComponent === 'fare'
      ? <Nav style={{marginBottom: '5px'}} bsStyle='pills' justified>
          <NavItem
            eventKey={'fare'}
            active={!this.state.editFareRules}
            onClick={() => {
              this.setState({editFareRules: false})
            }}
          >
            Attributes
          </NavItem>
          <NavItem
            eventKey={'rules'}
            disabled={entity.id === 'new'}
            active={this.state.editFareRules}
            onClick={() => {
              this.setState({editFareRules: true})
            }}
          >
            Rules
          </NavItem>
        </Nav>
      : null
    return (
      <div
        style={panelStyle}
      >
        <div
          style={{height: '85px'}}
        >
          <h5 style={{width: '100%'}}>
            <ButtonToolbar
              className='pull-right'
            >
              <Button
                bsSize='small'
                disabled={!this.props.entityEdited}
                onClick={(e) => {
                  // this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, null)
                  // this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, entity)
                  this.props.resetActiveEntity(entity, this.props.activeComponent)
                  // this.setState({})
                }}
              >
                Reset
              </Button>
              <Button
                bsSize='small'
                bsStyle='primary'
                disabled={!this.props.entityEdited}
                onClick={(e) => {
                  if (this.props.subComponent === 'trippattern') {
                    this.props.saveActiveEntity('trippattern')
                    // this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, entity, 'trippattern')
                  }
                  else {
                    this.props.saveActiveEntity(this.props.activeComponent)
                    // this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent)
                  }
                }}
              >
                Save
              </Button>
            </ButtonToolbar>
            {this.props.activeComponent === 'route'
              ? <IconStack>
                  <Icon name='square' style={{color: `#${entity.route_color}`}} stack="2x" />
                  <Icon name='bus' style={{color: `#${entity.route_text_color}`}} stack="1x" />
                </IconStack>
              : <Icon
                  name={iconName}
                />
            }
            {'  '}
            <span title={entityName}>
              {
                `${entityName && entityName.length > 18 ? entityName.substr(0, 18) + '...' : entityName}`
              }
            </span>
          </h5>
          {subNav}
        </div>
        <div style={{height: '80%', overflowY: 'scroll'}}>
          {this.props.subComponent === 'trippattern'
            ? <TripPatternList
                feedSource={this.props.feedSource}
                setActiveEntity={this.props.setActiveEntity}
                activePatternId={this.props.activeSubEntity}
                activeScheduleId={this.props.activeSubSubEntity}
                deleteEntity={this.props.deleteEntity}
                newEntityClicked={this.props.newEntityClicked}
                updateActiveEntity={this.props.updateActiveEntity}
                resetActiveEntity={this.props.resetActiveEntity}
                saveActiveEntity={this.props.saveActiveEntity}
                subSubComponent={this.props.subSubComponent}
                route={entity}
                toggleEditGeometry={this.props.toggleEditGeometry}
                toggleAddStops={this.props.toggleAddStops}
                isEditingGeometry={this.props.isEditingGeometry}
                isAddingStops={this.props.isAddingStops}
                stops={this.props.stops}
                tableData={this.props.tableData}
                fetchStops={this.props.fetchStops}
              />
            : this.state.editFareRules
            ? fareRulesForm
            : this.props.activeComponent === 'scheduleexception'
            ? scheduleExceptionForm
            : entityForm
          }
        </div>
      </div>
    )
  }
}
