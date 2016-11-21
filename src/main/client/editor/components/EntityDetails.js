import React, {Component, PropTypes} from 'react'
import { Checkbox, Radio, Button, ButtonToolbar, Form, FormControl, FormGroup, ControlLabel, Nav, NavItem, Tooltip, OverlayTrigger, Panel } from 'react-bootstrap'
import {Icon} from '@conveyal/woonerf'
import reactCSS from 'reactcss'
import validator from 'validator'
import { shallowEqual } from 'react-pure-render'
import Select from 'react-select'
import { sentence as toSentenceCase } from 'change-case'
import DateTimeField from 'react-bootstrap-datetimepicker'
import moment from 'moment'
import { SketchPicker } from 'react-color'
import Dropzone from 'react-dropzone'
import update from 'react-addons-update'

import GtfsSearch from '../../gtfs/components/gtfssearch'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import LanguageSelect from '../../common/components/LanguageSelect'
import ActiveTripPatternList from '../containers/ActiveTripPatternList'
import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import { getEntityName, gtfsIcons, getEntityBounds } from '../util/gtfs'
import { getConfigProperty } from '../../common/util/config'

export default class EntityDetails extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    project: PropTypes.object,
    entities: PropTypes.array,
    activeEntity: PropTypes.object,

    mapState: PropTypes.object,

    activeEntityId: PropTypes.string,
    width: PropTypes.number.isRequired,

    setActiveEntity: PropTypes.func.isRequired,
    saveActiveEntity: PropTypes.func.isRequired,
    resetActiveEntity: PropTypes.func.isRequired,
    updateActiveEntity: PropTypes.func.isRequired,
    deleteEntity: PropTypes.func.isRequired,
    newGtfsEntity: PropTypes.func.isRequired,
    uploadBrandingAsset: PropTypes.func,
    fieldEdited: PropTypes.func,
    gtfsEntitySelected: PropTypes.func,
    getGtfsEntity: PropTypes.func,
    showConfirmModal: PropTypes.func,
    updateMapSetting: PropTypes.func,

    activeComponent: PropTypes.string.isRequired,
    subEntityId: PropTypes.string,
    user: PropTypes.object,
    offset: PropTypes.number,
    tableData: PropTypes.object,
    entityEdited: PropTypes.bool,
    subComponent: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = {
      color: {
        r: '241',
        g: '112',
        b: '19',
        a: '1'
      }
    }
  }
  handleClick (field) {
    this.setState({ [field]: !this.state[field] })
  }
  handleClose (field) {
    this.setState({ [field]: !this.state[field] })
  }
  shouldComponentUpdate (nextProps, nextState) {
    return !shallowEqual(nextState, this.state) || // for color picker
    !shallowEqual(nextProps.feedSource, this.props.feedSource) ||
    !shallowEqual(nextProps.subComponent, this.props.subComponent) ||
    !shallowEqual(nextProps.subEntityId, this.props.subEntityId) ||
    !shallowEqual(nextProps.mapState.target, this.props.mapState.target) ||
    !shallowEqual(nextProps.entities, this.props.entities) ||
    !shallowEqual(nextProps.activeEntity, this.props.activeEntity) ||
    !shallowEqual(nextProps.activeEntityId, this.props.activeEntityId) ||
    !shallowEqual(nextProps.width, this.props.width)
  }
  render () {
    const approveGtfsDisabled = this.props.project && this.props.feedSource && this.props.user && !this.props.user.permissions.hasFeedPermission(this.props.project.id, this.props.feedSource.id, 'approve-gtfs')
    const styles = reactCSS({
      'default': {
        swatch: {
          padding: '5px',
          marginRight: '30px',
          background: '#fff',
          zIndex: 1,
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer'
        },
        popover: {
          position: 'absolute',
          zIndex: '200'
        },
        cover: {
          position: 'fixed',
          top: '0',
          right: '0',
          bottom: '0',
          left: '0'
        }
      }
    })
    let entity = this.props.activeEntity

    let panelWidth = `${this.props.width}px`

    let panelStyle = {
      width: panelWidth,
      height: '100%',
      position: 'absolute',
      // overflowY: 'scroll',
      overflowX: 'visible',
      top: '0px',
      left: this.props.offset || '0px',
      zIndex: 2,
      backgroundColor: '#F2F2F2',
      paddingRight: '5px',
      paddingLeft: '5px'
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
      // add any new zone
      if (entity && entity.zone_id && !zones[entity.zone_id]) {
        let zone = zones[entity.zone_id]
        if (!zone) {
          zone = []
        }
        zone.push(entity)
        zones[entity.zone_id] = zone
      }
    }
    let zoneOptions = Object.keys(zones).map(key => {
      return {
        value: key,
        label: `${key} zone (${zones[key] ? zones[key].length : 0} stops)`
      }
    })
    const validationErrors = []
    const getInput = (row, field, currentValue, index) => {
      const editorField = field.displayName || field.name // .split(/_(.+)?/)[1]
      let isNotValid
      // const standardLabel = <ControlLabel>{toSentenceCase(editorField.split(/_(.+)?/)[1])} <span style={{fontWeight: 'normal'}}>({editorField})</span></ControlLabel>
      const basicLabel = field.helpContent
          ? <OverlayTrigger placement='right' overlay={<Tooltip id='tooltip'>{field.helpContent}</Tooltip>}>
            <ControlLabel><small>{editorField}{field.required ? ' *' : ''}</small></ControlLabel>
          </OverlayTrigger>
          : <ControlLabel><small>{editorField}{field.required ? ' *' : ''}</small></ControlLabel>
      switch (field.inputType) {
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
                  props[field.name] = evt.target.value
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
                  props[field.name] = evt.target.value
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
          let elements = [
            <FormGroup
              controlId={`${editorField}`}
              key={`${editorField}`}
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
                  props[field.name] = evt.target.value
                  this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
                }}
              />
            </FormGroup>
          ]
          if (field.name === 'agencyBrandingUrl' || field.name === 'routeBrandingUrl') {
            elements.push(
              <FormGroup
                className='col-xs-12'
                key={`${editorField}-upload`}
              >
                <ControlLabel>Upload {this.props.activeComponent} branding asset</ControlLabel>
                <Dropzone
                  accept='image/*'
                  multiple={false}
                  onDrop={(files) => {
                    this.props.uploadBrandingAsset(this.props.feedSource.id, this.props.activeEntity.id, this.props.activeComponent, files[0])
                    this.setState({file: files[0]})
                  }}
                >
                  <div style={{marginBottom: '10px'}}>Drop {this.props.activeComponent} image here, or click to select image to upload.</div>
                  {this.props.activeEntity && this.props.activeEntity[field.name]
                    ? <img className='img-responsive' src={this.state.file && this.state.file.preview || this.props.activeEntity[field.name]} />
                    : null
                  }
                </Dropzone>
              </FormGroup>
            )
          }
          return elements
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
                  props[field.name] = evt.target.value
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
                  props[field.name] = val
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
                  if (filteredOptions.length === 0) {
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
                  props[field.name] = option.value
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
                  props[field.name] = option.value
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
              // validationState={this.getValidationState()}
            >
              {basicLabel}
              <FormControl
                value={currentValue}
                placeholder='HH:MM:SS'
                onChange={(evt) => {
                  let props = {}
                  props[field.name] = evt.target.value
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
                // readOnly={true}
                onChange={(evt) => {
                  let props = {}
                  props[field.name] = evt.target.value
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
                  props[field.name] = evt.target.value
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
              let props = {}
              props[field.name] = +millis
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
              // validationState={this.getValidationState()}
            >
              {basicLabel}
              <DateTimeField
                {...dateTimeProps}
              />
            </FormGroup>
          )
        case 'COLOR':
          const hexColor = currentValue !== null ? `#${currentValue}` : '#000000'
          const colorStyle = {
            width: '36px',
            height: '20px',
            borderRadius: '2px',
            background: hexColor
          }
          const wrapper = {
            position: 'inherit',
            zIndex: '100'
          }
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              // validationState={this.getValidationState()}
            >
              {basicLabel}
              {
                <div style={styles.swatch} onClick={() => this.handleClick(editorField)}>
                  <div style={colorStyle} />
                </div>
              }
              {this.state[editorField]
                ? <div style={styles.popover}>
                  <div style={styles.cover} onClick={() => this.handleClose(editorField)} />
                  <div style={wrapper}>
                    <SketchPicker
                      color={hexColor}
                      onChange={(color) => {
                        let props = {}
                        props[field.name] = color.hex.split('#')[1]
                        this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
                      }}
                      // onChangeComplete={(value) => {
                      //   let props = {}
                      //   props[field.name] = evt.target.value
                      //   this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
                      // }}
                    />
                  </div>
                </div>
                : null
              }
            </FormGroup>
          )
        case 'POSITIVE_INT':
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              // validationState={this.getValidationState()}
            >
              {basicLabel}
              <FormControl
                value={currentValue}
                type='number'
                min={0}
                step={1}
                onChange={(evt) => {
                  let props = {}
                  props[field.name] = evt.target.value
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
              // validationState={this.getValidationState()}
            >
              {basicLabel}
              <FormControl
                value={currentValue}
                type='number'
                min={0}
                onChange={(evt) => {
                  let props = {}
                  props[field.name] = evt.target.value
                  this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
                }}
              />
            </FormGroup>
          )
        case 'DAY_OF_WEEK_BOOLEAN':
          return [
            <span key={`dow-label`}>
              {editorField === 'monday'
                ? <div className='col-xs-12'><ControlLabel>Days of service</ControlLabel></div> : null
              }
            </span>,
            <span key={`${editorField}`} className='col-xs-3'>
              <Checkbox
                inline
                checked={this.state[editorField] === 1 || currentValue === 1}
                onChange={(evt) => {
                  console.log(evt.target.checked)
                  let props = {}
                  currentValue = evt.target.checked ? 1 : 0
                  props[field.name] = currentValue
                  this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
                }}
              >
                {toSentenceCase(editorField.substr(0, 3))}
              </Checkbox>
              {'     '}
            </span>
          ]
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
                disabled={approveGtfsDisabled && field.adminOnly}
                onChange={(evt) => {
                  let props = {}
                  props[field.name] = evt.target.value
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
          const agency = this.props.tableData.agency && this.props.tableData.agency.find(a => a.id === currentValue)
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              // validationState={this.getValidationState()}
            >
              {basicLabel}
              <Select
                placeholder='Select agency...'
                clearable
                value={agency ? {value: currentValue, label: agency.agency_name} : {value: currentValue}}
                onChange={(input) => {
                  console.log(input)
                  let props = {}
                  let val = input ? input.value : null
                  props[field.name] = val
                  this.setState({[editorField]: val})
                  this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
                }}
                options={this.props.tableData.agency
                  ? this.props.tableData.agency.map(agency => {
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
          const stopIndex = this.props.tableData.stop && this.props.tableData.stop.findIndex(s => s.id === this.props.activeEntity.id)
          const stop = this.props.tableData.stop.find(s => s.id === currentValue)

          let stops = [...this.props.tableData.stop]

          // remove current entity from list of stops
          if (stopIndex !== -1) {
            stops.splice(stopIndex, 1)
          }
          return (
            <FormGroup
              controlId={`${editorField}`}
              className={`col-xs-${field.columnWidth}`}
              // validationState={this.getValidationState()}
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
                  props[field.name] = val
                  this.setState({[editorField]: val})
                  this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, props)
                }}
              />
            </FormGroup>
          )
      }
    }
    const rowIndex = 0
    const table = getConfigProperty('modules.editor.spec').find(
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
      'SWAP'
    ]

    const fareRulesForm = this.state.editFareRules && this.props.activeEntity
      ? <div>
        <p>Specify which routes or zones <strong>{this.props.activeEntity.fare_id}</strong> fare applies to.</p>
        <span className='pull-right'>{this.props.activeEntity && this.props.activeEntity.fareRules.length} rules apply to this fare</span>
        <Button
          style={{marginBottom: '15px'}}
          onClick={() => {
            let rules = [...this.props.activeEntity.fareRules]
            rules.unshift({fare_id: this.props.activeEntity.fare_id})
            this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {fareRules: rules})
          }}
        ><Icon type='plus' /> Add rule</Button>
        {this.props.activeEntity.fareRules.map((rule, index) => {
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
                  let rules = [...this.props.activeEntity.fareRules]
                  rules.splice(index, 1)
                  this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {fareRules: rules})
                }}
              ><Icon type='times' /></Button>
              <FormGroup>
                <Radio
                  inline
                  key={Math.random()}
                  checked={rule.route_id}
                  onChange={(evt) => {
                    let rules = [...this.props.activeEntity.fareRules]
                    rules[index] = {fare_id: this.props.activeEntity.fare_id}
                    rules[index].route_id = true
                    this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {fareRules: rules})
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
                    let rules = [...this.props.activeEntity.fareRules]
                    rules[index] = {fare_id: this.props.activeEntity.fare_id}
                    rules[index].origin_id = true
                    this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {fareRules: rules})
                  }}
                >
                  <small>To/From</small>
                </Radio>
                {' '}
                <Radio
                  inline
                  key={Math.random()}
                  checked={rule.contains_id}
                  onChange={(evt) => {
                    let rules = [...this.props.activeEntity.fareRules]
                    rules[index] = {fare_id: this.props.activeEntity.fare_id}
                    rules[index].contains_id = true
                    this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {fareRules: rules})
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
                    let rules = [...this.props.activeEntity.fareRules]
                    rules[index].route_id = input ? input.value : null
                    this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {fareRules: rules})
                  }}
                />
                : rule.contains_id
                ? <Select
                  placeholder='Select zone which the itinerary passes through...'
                  clearable
                  noResultsText={`No zones found. Specify zones in stop.`}
                  key={Math.random()}
                  value={typeof rule.contains_id === 'string'
                    ? {value: rule.contains_id, label: `${rule.contains_id} zone (${zones[rule.contains_id] ? zones[rule.contains_id].length : 0} stops)`}
                    : null
                  }
                  onChange={(input) => {
                    console.log(input)
                    let rules = [...this.props.activeEntity.fareRules]
                    rules[index].zone_id = input ? input.value : null
                    this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {fareRules: rules})
                  }}
                  options={zoneOptions}
                />
                : rule.origin_id || rule.destination_id
                ? [
                  <Select
                    placeholder='Select origin zone...'
                    clearable
                    noResultsText={`No zones found. Specify zones in stop.`}
                    key={Math.random()}
                    value={typeof rule.origin_id === 'string'
                      ? {value: rule.origin_id, label: `${rule.origin_id} zone (${zones[rule.origin_id] ? zones[rule.origin_id].length : 0} stops)`}
                      : null
                    }
                    onChange={(input) => {
                      console.log(input)
                      let rules = [...this.props.activeEntity.fareRules]
                      rules[index].origin_id = input ? input.value : null
                      this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {fareRules: rules})
                    }}
                    options={zoneOptions}
                  />,
                  <Select
                    placeholder='Select destination zone...'
                    clearable
                    noResultsText={`No zones found. Specify zones in stop.`}
                    key={Math.random()}
                    value={typeof rule.destination_id === 'string'
                      ? {value: rule.destination_id, label: `${rule.destination_id} zone (${zones[rule.destination_id] ? zones[rule.destination_id].length : 0} stops)`}
                      : null
                    }
                    onChange={(input) => {
                      console.log(input)
                      let rules = [...this.props.activeEntity.fareRules]
                      rules[index].destination_id = input ? input.value : null
                      this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {fareRules: rules})
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
    let dateMap = {}
    let allExceptions = []
    if (this.props.tableData.scheduleexception) {
      allExceptions = [...this.props.tableData.scheduleexception]
    }
    if (this.props.activeEntity) {
      let exceptionIndex = allExceptions.findIndex(se => se.id === this.props.activeEntity.id)
      if (exceptionIndex !== -1) {
        allExceptions.splice(exceptionIndex, 1)
      }
      allExceptions.push(this.props.activeEntity)
    }
    for (let i = 0; i < allExceptions.length; i++) {
      allExceptions[i].dates && allExceptions[i].dates.map(d => {
        if (typeof dateMap[moment(d).format('YYYYMMDD')] === 'undefined') {
          dateMap[moment(d).format('YYYYMMDD')] = []
        }
        dateMap[moment(d).format('YYYYMMDD')].push(allExceptions[i].id)
      })
    }
    const scheduleExceptionForm = this.props.activeComponent === 'scheduleexception'
      ? <div>
        <Form>
          <FormGroup
            controlId={`name`}
            className={`col-xs-12`}
            // validationState={this.getValidationState()}
          >
            <ControlLabel>Exception name</ControlLabel>
            <FormControl
              value={this.props.activeEntity && this.props.activeEntity.name}
              onChange={(evt) => {
                this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {name: evt.target.value})
              }}
            />
          </FormGroup>
          <FormGroup
            controlId={`schedule`}
            className={`col-xs-12`}
            // validationState={this.getValidationState()}
          >
            <ControlLabel>Run the following schedule:</ControlLabel>
            <FormControl componentClass='select'
              value={this.props.activeEntity && this.props.activeEntity.exemplar}
              onChange={(evt) => {
                // let props = {}
                // props[field.name] = evt.target.value
                this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {exemplar: evt.target.value, customSchedule: null})
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
            </FormControl>
          </FormGroup>
          {this.props.activeEntity && this.props.activeEntity.exemplar === 'CUSTOM'
            ? <FormGroup
              controlId={`custom`}
              className={`col-xs-12`}
              // validationState={this.getValidationState()}
            >
              <ControlLabel>Select calendar to run:</ControlLabel>
              <Select
                placeholder='Select calendar...'
                clearable
                multi
                value={this.props.activeEntity && this.props.activeEntity.customSchedule}
                onChange={(input) => {
                  console.log(input)
                  let val = input ? input.map(i => i.value) : null
                  this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {customSchedule: val})
                }}
                options={this.props.tableData.calendar
                  ? this.props.tableData.calendar.map(calendar => {
                    return {
                      value: calendar.id,
                      label: calendar.description,
                      calendar
                    }
                  })
                  : []
                }
                />
            </FormGroup>
            : null
          }
          {this.props.activeEntity && this.props.activeEntity.exemplar === 'SWAP'
            ? <FormGroup
              controlId={`custom`}
              className={`col-xs-12`}
              // validationState={this.getValidationState()}
            >
              <ControlLabel>Select calendars to add:</ControlLabel>
              <Select
                placeholder='Select calendar...'
                clearable
                multi
                value={this.props.activeEntity && this.props.activeEntity.addedService}
                onChange={(input) => {
                  console.log(input)
                  let val = input ? input.map(i => i.value) : null
                  this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {addedService: val})
                }}
                options={this.props.tableData.calendar
                  ? this.props.tableData.calendar
                    .filter(cal => !this.props.activeEntity.removedService || this.props.activeEntity.removedService.indexOf(cal.id) === -1)
                    .map(calendar => {
                      return {
                        value: calendar.id,
                        label: calendar.description,
                        calendar
                      }
                    })
                  : []
              }
              />
              <ControlLabel>Select calendars to remove:</ControlLabel>
              <Select
                placeholder='Select calendar...'
                clearable
                multi
                value={this.props.activeEntity && this.props.activeEntity.removedService}
                onChange={(input) => {
                  console.log(input)
                  let val = input ? input.map(i => i.value) : null
                  this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {removedService: val})
                }}
                options={this.props.tableData.calendar
                  ? this.props.tableData.calendar
                    .filter(cal => !this.props.activeEntity.addedService || this.props.activeEntity.addedService.indexOf(cal.id) === -1)
                    .map(calendar => {
                      return {
                        value: calendar.id,
                        label: calendar.description,
                        calendar
                      }
                    })
                  : []
              }
              />
            </FormGroup>
            : null
          }
          <FormGroup
            controlId={`exception-dates`}
            className={`col-xs-12`}
            // validationState={this.getValidationState()}
          >
            <ControlLabel>On these dates:</ControlLabel>
            {this.props.activeEntity && this.props.activeEntity.dates.length
              ? this.props.activeEntity.dates.map((date, index) => {
                let isNotValid = false
                const dateString = moment(+date).format('YYYYMMDD')
                // check if date already exists in this or other exceptions
                if (dateMap[dateString] && dateMap[dateString].length > 1) {
                  validationErrors.push({field: `dates-${index}`, invalid: true})
                  isNotValid = true
                }
                let dateTimeProps = {
                  mode: 'date',
                  dateTime: date ? +moment(date) : +moment(),
                  onChange: (millis) => {
                    let dates = [...this.props.activeEntity.dates]
                    dates[index] = +millis
                    this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {dates})
                  }
                }
                if (!date) {
                  dateTimeProps.defaultText = 'Please select a date'
                }
                return (
                  <div style={{position: 'relative', width: '100%', marginBottom: '5px'}}>
                    <Button
                      bsStyle='danger'
                      className='pull-right'
                      style={{marginLeft: '5px'}}
                      key={`date-remove-${index}`}
                      onClick={() => {
                        let dates = [...this.props.activeEntity.dates]
                        dates.splice(index, 1)
                        this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {dates: dates})
                      }}
                    ><Icon type='times' /></Button>
                    <DateTimeField key={`date-${index}`} mode='date' {...dateTimeProps} />
                    {isNotValid
                      ? <small>{moment(+date).format('MM/DD/YYYY')} appears in another schedule exception. Please choose another date.</small>
                      : null
                    }
                  </div>
                )
              }
            )
          : <div>No dates specified</div>
        }
          </FormGroup>
          <div className={`col-xs-12`}>
            <Button
              onClick={() => {
                let dates = [...this.props.activeEntity.dates]
                dates.push(0)
                this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {dates: dates})
              }}
            ><Icon type='plus' /> Add date</Button>
          </div>

        </Form>
      </div>
      : null
    const entityForm = this.props.activeComponent === 'scheduleexception'
      ? null
      : (
        <div>
          <Form>
            {table.fields.map((field, colIndex) => {
              // get editor field by splitting on first underscore
              const editorField = field.name // .split(/_(.+)?/)[1]
              // const validationIssue = this.props.validation
              //   ? this.props.validation.find(v =>
              //       (v.rowIndex === data.origRowIndex && v.fieldName === field.name))
              //   : null

              // const tooltip = validationIssue
              //   ? <Tooltip>{validationIssue.description}</Tooltip>
              //   : null

              return entity
                ? getInput(rowIndex, field, entity[editorField], (rowIndex * table.fields.length) + colIndex + 1)
                : null
            })
            }
            <p className='col-xs-12'>* = field is required</p>
          </Form>
        </div>
    )
    let entityName = this.props.activeComponent === 'feedinfo' ? 'Feed Info' : getEntityName(this.props.activeComponent, entity)
    let icon = gtfsIcons.find(i => i.id === this.props.activeComponent)
    let iconName = icon ? icon.icon : null
    // .icon || 'circle'
    // console.log(validationErrors)
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
        <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>A route&rsquo;s trip patterns show where it goes.</Tooltip>}>
          <NavItem
            eventKey={'trippattern'}
            disabled={!entity || entity.id === 'new'}
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
          disabled={!entity || entity.id === 'new'}
          active={this.state.editFareRules}
          onClick={() => {
            this.setState({editFareRules: true})
          }}
        >
          Rules
        </NavItem>
      </Nav>
      : null
    const header = (
      <h5 style={{width: '100%', minHeight: '30px'}}>
        <ButtonToolbar
          className='pull-right'
        >
          {this.props.activeComponent === 'stop' || this.props.activeComponent === 'route'
            ? <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Zoom to {this.props.activeComponent}</Tooltip>}>
              <Button
                bsSize='small'
                disabled={entity && !this.props.subComponent
                  ? this.props.mapState.target === entity.id
                  : this.props.mapState.target === this.props.subEntityId
                }
                onClick={(e) => {
                  if (this.props.subEntityId) {
                    let pattern = entity.tripPatterns.find(p => p.id === this.props.subEntityId)
                    this.props.updateMapSetting({bounds: getEntityBounds(pattern), target: this.props.subEntityId})
                  } else {
                    this.props.updateMapSetting({bounds: getEntityBounds(entity), target: entity.id})
                  }
                }}
              >
                <Icon type='search' />
              </Button>
            </OverlayTrigger>
            : null
          }
          <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Undo changes</Tooltip>}>
            <Button
              bsSize='small'
              disabled={!this.props.entityEdited}
              onClick={(e) => {
                if (this.props.subComponent === 'trippattern') {
                  let pattern = entity.tripPatterns.find(p => p.id === this.props.subComponent)
                  this.props.resetActiveEntity(pattern, 'trippattern')
                } else {
                  this.props.resetActiveEntity(entity, this.props.activeComponent)
                }
                let stateUpdate = {}
                for (var key in this.state) {
                  stateUpdate[key] = {$set: null}
                }
                this.setState(update(this.state, stateUpdate))
              }}
            >
              <Icon type='undo' />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Save changes</Tooltip>}>
            <Button
              bsSize='small'
              bsStyle='primary'
              disabled={!this.props.entityEdited || validationErrors.length > 0}
              onClick={(e) => {
                if (this.props.subComponent === 'trippattern') {
                  this.props.saveActiveEntity('trippattern')
                } else {
                  this.props.saveActiveEntity(this.props.activeComponent)
                }
              }}
            >
              <Icon type='floppy-o' />
            </Button>
          </OverlayTrigger>
        </ButtonToolbar>
        {this.props.activeComponent === 'route' && entity
          ? <div className='IconStack'>
            <Icon type='square' style={{color: `#${entity.route_color ? entity.route_color : 'fff'}`}} stack='2x' />
            <Icon type='bus' style={{color: `#${entity.route_text_color ? entity.route_text_color : '000'}`}} stack='1x' />
          </div>
          : iconName
          ? <div className='IconStack'>
            <Icon type='square' stack='2x' />
            <Icon type={iconName} inverse stack='1x' />
          </div>
          // schedule exception icon if no icon founds
          : <div className='IconStack'>
            <Icon type='calendar' stack='1x' />
            <Icon type='ban' className='text-danger' stack='2x' />
          </div>
        }
        {'  '}
        <span title={entityName}>
          {
            `${entityName && entityName.length > 18 ? entityName.substr(0, 18) + '...' : entityName}`
          }
        </span>
      </h5>
    )

    return (
      <div
        style={panelStyle}
      >
        {!entity
          ? <div style={{height: '100%'}}>
            <h1
              className='text-center'
              style={{
                marginTop: '150px'
              }}
            >
              <Icon className='fa-5x fa-spin' type='refresh' />
            </h1>
          </div>
          : [
            <div
              style={{height: '100px'}}
              key='details-header'
            >
              {header}
              {!this.props.tableData[this.props.activeComponent] && this.props.activeComponent === 'feedinfo'
                ? <small>Complete feed info to begin editing GTFS.</small>
                : null
              }
              {validationErrors.length > 0
                ? <small className='pull-right text-danger'>Fix validation issues before saving</small>
                : null
              }
              {subNav}
            </div>, <div key='details-body' style={{height: '80%', overflowY: 'scroll'}}>
              {this.props.subComponent === 'trippattern'
                ? <ActiveTripPatternList
                  showConfirmModal={this.props.showConfirmModal}
                />
                : this.state.editFareRules
                ? fareRulesForm
                : this.props.activeComponent === 'scheduleexception'
                ? scheduleExceptionForm
                : entityForm
              }
            </div>
          ]
        }
      </div>
    )
  }
}
