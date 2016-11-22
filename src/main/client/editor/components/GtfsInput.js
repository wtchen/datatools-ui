import React, {Component, PropTypes} from 'react'
import { Checkbox, Radio, Button, ButtonToolbar, Form, FormControl, FormGroup, ControlLabel, Nav, NavItem, Tooltip, OverlayTrigger, Panel } from 'react-bootstrap'
import validator from 'validator'
import Select from 'react-select'
import { sentence as toSentenceCase } from 'change-case'
import DateTimeField from 'react-bootstrap-datetimepicker'
import moment from 'moment'
import { SketchPicker } from 'react-color'

import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import GtfsSearch from '../../gtfs/components/gtfssearch'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import LanguageSelect from '../../common/components/LanguageSelect'

export default class GtfsInput extends Component {

  static propTypes = {
    row: PropTypes.number,
    field: PropTypes.object,
    // currentValue: PropTypes.object,
    index: PropTypes.number,

  }

  constructor (props) {
    super(props)
  }
  // onChange (value) {
  //   this.props.onChange(value)
  // }
  render () {
    let { field, row, currentValue, index } = this.props
    let validationErrors = []
    const editorField = field.name //.split(/_(.+)?/)[1]
    let isNotValid
    const standardLabel = <ControlLabel>{toSentenceCase(editorField.split(/_(.+)?/)[1])} <span style={{fontWeight: 'normal'}}>({editorField})</span></ControlLabel>
    const basicLabel = field.helpContent
        ? <OverlayTrigger placement='right' overlay={<Tooltip id='tooltip'>{field.helpContent}</Tooltip>}>
            <ControlLabel><small>{editorField}{field.required ? ' *' : ''}</small></ControlLabel>
          </OverlayTrigger>
        : <ControlLabel><small>{editorField}{field.required ? ' *' : ''}</small></ControlLabel>
    switch(field.inputType) {
      case 'ID':
        isNotValid = field.required && !currentValue
        let indices = []
        let idList = this.props.entities.map(e => e[field.name])
        let idx = idList.indexOf(currentValue)
        while (idx !== -1) {
          indices.push(idx)
          idx = idList.indexOf(currentValue, idx + 1)
        }
        let isNotUnique = currentValue && (indices.length > 1 || indices.length && this.props.entities[indices[0]].id !== this.props.activeEntity.id)
        if (isNotValid || isNotUnique) {
          validationErrors.push({field: field.name, invalid: isNotValid || isNotUnique})
        }
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={`col-xs-${field.columnWidth}`}
            validationState={isNotValid || isNotUnique
              ? 'error'
              : field.required
              ? 'success'
              : ''
            }
          >
          {basicLabel}
          <FormControl
            value={currentValue}
            placeholder={field.placeholder ? field.placeholder : ''}
            onChange={(evt) => {
              let props = {}
              props[editorField] = evt.target.value
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
            }}
          />
          </FormGroup>
        )
      case 'TEXT':
      case 'GTFS_TRIP':
      case 'GTFS_SHAPE':
      case 'GTFS_BLOCK':
      case 'GTFS_FARE':
      case 'GTFS_SERVICE':
        isNotValid = field.required && !currentValue
        if (isNotValid) {
          validationErrors.push({field: field.name, invalid: isNotValid})
        }
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={`col-xs-${field.columnWidth}`}
            validationState={isNotValid
              ? 'error'
              : field.required
              ? 'success'
              : ''
            }
          >
          {basicLabel}
          <FormControl
            value={currentValue || ''}
            placeholder={field.placeholder ? field.placeholder : ''}
            onChange={(evt) => {
              let props = {}
              props[editorField] = evt.target.value
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
            }}
          />
          </FormGroup>
        )
      case 'URL':
        isNotValid = field.required && !currentValue || currentValue && !validator.isURL(currentValue)
        if (isNotValid) {
          validationErrors.push({field: field.name, invalid: isNotValid})
        }
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={`col-xs-${field.columnWidth}`}
            validationState={isNotValid
              ? 'error'
              : field.required
              ? 'success'
              : ''
            }
          >
          {basicLabel}
          <FormControl
            value={currentValue}
            placeholder={field.placeholder ? field.placeholder : ''}
            onChange={(evt) => {
              let props = {}
              props[editorField] = evt.target.value
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
            }}
          />
          </FormGroup>
        )
      case 'EMAIL':
        isNotValid = field.required && !currentValue || currentValue && !validator.isEmail(currentValue)
        if (isNotValid) {
          validationErrors.push({field: field.name, invalid: isNotValid})
        }
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={`col-xs-${field.columnWidth}`}
            validationState={isNotValid
              ? 'error'
              : field.required
              ? 'success'
              : ''
            }
          >
          {basicLabel}
          <FormControl
            value={currentValue}
            placeholder={field.placeholder ? field.placeholder : ''}
            onChange={(evt) => {
              let props = {}
              props[editorField] = evt.target.value
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
            }}
          />
          </FormGroup>
        )
      case 'GTFS_ZONE':
        isNotValid = field.required && (currentValue === null || typeof currentValue === 'undefined')
        if (isNotValid) {
          validationErrors.push({field: field.name, invalid: isNotValid})
        }
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={`col-xs-${field.columnWidth}`}
            validationState={isNotValid
              ? 'error'
              : field.required
              ? 'success'
              : ''
            }
          >
            {basicLabel}
            <Select
              placeholder='Select zone ID...'
              clearable
              noResultsText={`No zones found. Specify zones in stop.`}
              key={Math.random()}
              value={currentValue}
              onChange={(input) => {
                let props = {}
                let val = input ? input.value : null
                props[editorField] = val
                this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)

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
              options={this.props.zoneOptions}
            />
          </FormGroup>
        )
      case 'TIMEZONE':
        isNotValid = field.required && (currentValue === null || typeof currentValue === 'undefined')
        if (isNotValid) {
          validationErrors.push({field: field.name, invalid: isNotValid})
        }
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={`col-xs-${field.columnWidth}`}
            validationState={isNotValid
              ? 'error'
              : field.required
              ? 'success'
              : ''
            }
          >
          {basicLabel}
          <TimezoneSelect
            value={currentValue}
            clearable={!field.required}
            onChange={(option) => {
              let props = {}
              props[editorField] = option.value
              this.setState({[editorField]: option.value})
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
            }}
          />
          </FormGroup>
        )
      case 'LANGUAGE':
        isNotValid = field.required && (currentValue === null || typeof currentValue === 'undefined')
        if (isNotValid) {
          validationErrors.push({field: field.name, invalid: isNotValid})
        }
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={`col-xs-${field.columnWidth}`}
            validationState={isNotValid
              ? 'error'
              : field.required
              ? 'success'
              : ''
            }
          >
          {basicLabel}
          <LanguageSelect
            value={currentValue}
            clearable={false}
            onChange={(option) => {
              let props = {}
              props[editorField] = option.value
              this.setState({[editorField]: option.value})
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
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
            value={currentValue}
            placeholder='HH:MM:SS'
            onChange={(evt) => {
              let props = {}
              props[editorField] = evt.target.value
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
            }}
          />
          </FormGroup>
        )
      case 'LATITUDE':
      case 'LONGITUDE':
        isNotValid = field.required && (currentValue === null || typeof currentValue === 'undefined')
        if (isNotValid) {
          validationErrors.push({field: field.name, invalid: isNotValid})
        }
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={`col-xs-${field.columnWidth}`}
            validationState={isNotValid
              ? 'error'
              : field.required
              ? 'success'
              : ''
            }
          >
          {basicLabel}
          <FormControl
            value={currentValue}
            type='number'
            // readOnly
            onChange={(evt) => {
              let props = {}
              props[editorField] = evt.target.value
            //   this.setState({[editorField]: evt.target.value})
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
            }}
          />
          </FormGroup>
        )
      case 'NUMBER':
        isNotValid = field.required && (currentValue === null || typeof currentValue === 'undefined')
        if (isNotValid) {
          validationErrors.push({field: field.name, invalid: isNotValid})
        }
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={`col-xs-${field.columnWidth}`}
            validationState={isNotValid
              ? 'error'
              : field.required
              ? 'success'
              : ''
            }
          >
          {basicLabel}
          <FormControl
            value={currentValue}
            type='number'
            onChange={(evt) => {
              let props = {}
              props[editorField] = evt.target.value
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
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
            let props = {}
            props[editorField] = +millis
            // this.setState({[editorField]: +millis})
            this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
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
            value={currentValue}
            placeholder={field.placeholder}
            type='text'
            onChange={(evt) => {
              let props = {}
              props[editorField] = evt.target.value
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
            }}
          />
          {
            // <div is="swatch" onClick={ this.handleClick }>
            //   <div is="color" />
            // </div>
          }
          {
            // this.state.displayColorPicker ? <div is="popover">
            //   <div is="cover" onClick={ this.handleClose } />
            //   <SketchPicker
            //     color={ `#${this.state[editorField]}` || `#${currentValue}` }
            //     onChange={ this.handleChange }
            //     onChangeComplete={(value) => {
            //       let props = {}
            //       props[editorField] = evt.target.value
            // //       this.setState({[editorField]: evt.target.value})
            //       this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
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
            //     <div style={ cover } onClick={ this.handleClose } />
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
            value={currentValue}
            type='number'
            min={0}
            step={1}
            onChange={(value) => {
              let props = {}
              props[editorField] = evt.target.value
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
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
            value={currentValue}
            type='number'
            min={0}
            onChange={(value) => {
              let props = {}
              props[editorField] = evt.target.value
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
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
              currentValue = evt.target.checked ? 1 : 0
              props[editorField] = value
              this.setState({[editorField]: value})
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
            }}
          >
            {toSentenceCase(editorField.substr(0, 3))}
          </Checkbox>
          {'     '}
          </span>]
        )
      case 'DROPDOWN':
        // isNotValid = field.required && (currentValue === null || typeof currentValue === 'undefined')
        // if (isNotValid) {
        //   validationErrors.push({field: field.name, invalid: isNotValid})
        // }
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={field.columnWidth ? `col-xs-${field.columnWidth}` : 'col-xs-12'}
            // validationState={isNotValid
            //   ? 'error'
            //   : field.required
            //   ? 'success'
            //   : ''
            // }
          >
            {basicLabel}
            <FormControl componentClass='select'
              value={currentValue}
              onChange={(evt) => {
                let props = {}
                props[editorField] = evt.target.value
                this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
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
        const agency = this.props.getGtfsEntity('agency', currentValue)
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={`col-xs-${field.columnWidth}`}
            /*validationState={this.getValidationState()}*/
          >
            {basicLabel}
            <Select
              placeholder='Select agency...'
              clearable
              value={agency ? {value: currentValue, label: agency.agency_name}: {value: currentValue}}
              onChange={(input) => {
                console.log(input)
                let props = {}
                let val = input ? input.value : null
                props[editorField] = val
                this.setState({[editorField]: val})
                this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)

              }}
              options={this.props.agencies
                ? this.props.agencies.map(agency => {
                    return {
                      value: agency.id,
                      label: agency.agency_name,
                      agency
                    }
                  })
                : []
            }
            />
          </FormGroup>
        )
      case 'GTFS_STOP':
        const stopIndex = this.props.getGtfsEntityIndex('stop', currentValue)
        const stop = this.props.getGtfsEntity('stop', currentValue)

        let stops = [...this.props.stops]

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
              this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
            }}
          />
          </FormGroup>
        )
    }
  }
}
