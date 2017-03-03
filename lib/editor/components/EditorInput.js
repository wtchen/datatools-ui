import React, {Component, PropTypes} from 'react'
import { Checkbox, FormControl, FormGroup, ControlLabel, Tooltip, OverlayTrigger } from 'react-bootstrap'
import SketchPicker from 'react-color/lib/components/sketch/Sketch'
import Select from 'react-select'
import reactCSS from 'reactcss'
import moment from 'moment'
import DateTimeField from 'react-bootstrap-datetimepicker'

import { getEntityName } from '../util/gtfs'
import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import GtfsSearch from '../../gtfs/components/gtfssearch'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import LanguageSelect from '../../common/components/LanguageSelect'
import toSentenceCase from '../../common/util/to-sentence-case'
import Dropzone from 'react-dropzone'

export default class EditorInput extends Component {
  static propTypes = {
    entities: PropTypes.array
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
  render () {
    const {
      activeEntity,
      updateActiveEntity,
      activeComponent,
      uploadBrandingAsset,
      feedSource,
      getGtfsEntity,
      fieldEdited,
      gtfsEntitySelected,
      tableData,
      row,
      field,
      currentValue,
      approveGtfsDisabled,
      zoneOptions,
      table,
      isNotValid
    } = this.props
    const formProps = {
      controlId: `${editorField}`,
      className: `col-xs-${field.columnWidth}`
    }
    if (isNotValid) {
      formProps.validationState = 'error'
    } else if (field.required) {
      formProps.validationState = 'success'
    }
    const simpleFormProps = {
      controlId: `${editorField}`,
      className: `col-xs-${field.columnWidth}`
    }
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
    const editorField = field.displayName || field.name
    const basicLabel = field.helpContent
        ? <OverlayTrigger placement='right' overlay={<Tooltip id='tooltip'>{field.helpContent}</Tooltip>}>
          <ControlLabel><small>{editorField}{field.required ? ' *' : ''}</small></ControlLabel>
        </OverlayTrigger>
        : <ControlLabel><small>{editorField}{field.required ? ' *' : ''}</small></ControlLabel>
    switch (field.inputType) {
      case 'GTFS_ID':
        return (
          <FormGroup {...formProps}>
            {basicLabel}
            <FormControl
              value={currentValue}
              placeholder={field.placeholder ? field.placeholder : ''}
              onChange={(evt) => {
                const props = {}
                props[field.name] = evt.target.value
                updateActiveEntity(activeEntity, activeComponent, props)
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
        return (
          <FormGroup {...formProps}>
            {basicLabel}
            <FormControl
              value={currentValue || ''}
              placeholder={field.placeholder ? field.placeholder : ''}
              onChange={(evt) => {
                const props = {}
                props[field.name] = evt.target.value
                updateActiveEntity(activeEntity, activeComponent, props)
              }}
            />
          </FormGroup>
        )
      case 'URL':
        const elements = [
          <FormGroup {...formProps} key={`${editorField}-input`}>
            {basicLabel}
            <FormControl
              value={currentValue || ''}
              placeholder={field.placeholder ? field.placeholder : ''}
              onChange={(evt) => {
                const props = {}
                props[field.name] = evt.target.value
                updateActiveEntity(activeEntity, activeComponent, props)
              }}
            />
          </FormGroup>
        ]
        if (field.name === 'agency_branding_url' || field.name === 'route_branding_url') {
          elements.push(
            <FormGroup
              className='col-xs-12'
              key={`${editorField}-upload`}>
              <ControlLabel>Upload {activeComponent} branding asset</ControlLabel>
              <Dropzone
                accept='image/*'
                multiple={false}
                onDrop={(files) => {
                  uploadBrandingAsset(feedSource.id, activeEntity.id, activeComponent, files[0])
                  this.setState({file: files[0]})
                }}>
                <div style={{marginBottom: '10px'}}>Drop {activeComponent} image here, or click to select image to upload.</div>
                {activeEntity && activeEntity[field.name]
                  ? <img alt='agency branding' className='img-responsive' src={this.state.file && this.state.file.preview || activeEntity[field.name]} />
                  : null
                }
              </Dropzone>
            </FormGroup>
          )
        }
        return <span>{elements}</span>
      case 'EMAIL':
        return (
          <FormGroup {...formProps}
          >
            {basicLabel}
            <FormControl
              value={currentValue}
              placeholder={field.placeholder ? field.placeholder : ''}
              onChange={(evt) => {
                const props = {}
                props[field.name] = evt.target.value
                updateActiveEntity(activeEntity, activeComponent, props)
              }}
            />
          </FormGroup>
        )
      case 'GTFS_ZONE':
        return (
          <FormGroup {...formProps}>
            {basicLabel}
            <Select
              placeholder='Select zone ID...'
              clearable
              noResultsText={`No zones found. Specify zones in stop.`}
              value={currentValue}
              onChange={(input) => {
                const props = {}
                const val = input ? input.value : null
                props[field.name] = val
                updateActiveEntity(activeEntity, activeComponent, props)
              }}
              filterOptions={(options, filter, values) => {
                // Filter already selected values
                const valueKeys = values && values.map(i => i.value)
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
              options={zoneOptions} />
          </FormGroup>
        )
      case 'TIMEZONE':
        return (
          <FormGroup {...formProps}>
            {basicLabel}
            <TimezoneSelect
              value={currentValue}
              clearable={!field.required}
              onChange={(option) => {
                const props = {}
                props[field.name] = option.value
                this.setState({[editorField]: option.value})
                updateActiveEntity(activeEntity, activeComponent, props)
              }} />
          </FormGroup>
        )
      case 'LANGUAGE':
        return (
          <FormGroup {...formProps}>
            {basicLabel}
            <LanguageSelect
              value={currentValue}
              clearable={false}
              onChange={(option) => {
                const props = {}
                props[field.name] = option.value
                this.setState({[editorField]: option.value})
                updateActiveEntity(activeEntity, activeComponent, props)
              }} />
          </FormGroup>
        )
      case 'TIME':
        return (
          <FormGroup {...simpleFormProps}>
            {basicLabel}
            <FormControl
              value={currentValue}
              placeholder='HH:MM:SS'
              onChange={(evt) => {
                const props = {}
                props[field.name] = evt.target.value
                updateActiveEntity(activeEntity, activeComponent, props)
              }} />
          </FormGroup>
        )
      case 'LATITUDE':
      case 'LONGITUDE':
        return (
          <FormGroup {...formProps}>
            {basicLabel}
            <FormControl
              value={currentValue}
              type='number'
              // readOnly
              onChange={(evt) => {
                const props = {}
                props[field.name] = evt.target.value
              //   this.setState({[editorField]: evt.target.value})
                updateActiveEntity(activeEntity, activeComponent, props)
              }} />
          </FormGroup>
        )
      case 'NUMBER':
        return (
          <FormGroup {...formProps}>
            {basicLabel}
            <FormControl
              value={currentValue}
              type='number'
              onChange={(evt) => {
                const props = {}
                props[field.name] = evt.target.value
                updateActiveEntity(activeEntity, activeComponent, props)
              }} />
          </FormGroup>
        )
      case 'DATE':
        const defaultValue = /end/.test(editorField) ? +moment().startOf('day').add(3, 'months') : +moment().startOf('day')
        const dateTimeProps = {
          mode: 'date',
          dateTime: currentValue ? +moment(currentValue) : defaultValue,
          onChange: (millis) => {
            const props = {}
            props[field.name] = +millis
            updateActiveEntity(activeEntity, activeComponent, props)
          }
        }
        if (!currentValue) {
          dateTimeProps.defaultText = 'Please select a date'
        }
        return (
          <FormGroup {...simpleFormProps}>
            {basicLabel}
            <DateTimeField {...dateTimeProps} />
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
          <FormGroup {...simpleFormProps}>
            {basicLabel}
            {
              <button
                style={styles.swatch}
                onClick={(e) => {
                  e.preventDefault()
                  this.handleClick(editorField)
                }}>
                <div style={colorStyle} />
              </button>
            }
            {this.state[editorField]
              ? <div style={styles.popover}>
                <div
                  role='button'
                  tabIndex='0'
                  style={styles.cover}
                  // TODO: jsx-a11y probably wants this here even though it's useless
                  onKeyPress={(e) => {
                    e.preventDefault()
                    // if [Esc] is pressed (for accessibility)
                    if (e.keyCode === 27) {
                      this.handleClose(editorField)
                    }
                  }}
                  onClick={() => this.handleClose(editorField)} />
                <div style={wrapper}>
                  <SketchPicker
                    color={hexColor}
                    onChange={(color) => {
                      const props = {}
                      props[field.name] = color.hex.split('#')[1]
                      updateActiveEntity(activeEntity, activeComponent, props)
                    }} />
                </div>
              </div>
              : null
            }
          </FormGroup>
        )
      case 'POSITIVE_INT':
        return (
          <FormGroup {...simpleFormProps}>
            {basicLabel}
            <FormControl
              value={currentValue}
              type='number'
              min={0}
              step={1}
              onChange={(evt) => {
                const props = {}
                props[field.name] = evt.target.value
                updateActiveEntity(activeEntity, activeComponent, props)
              }} />
          </FormGroup>
        )
      case 'POSITIVE_NUM':
        return (
          <FormGroup {...simpleFormProps}>
            {basicLabel}
            <FormControl
              value={currentValue}
              type='number'
              min={0}
              onChange={(evt) => {
                const props = {}
                props[field.name] = evt.target.value
                updateActiveEntity(activeEntity, activeComponent, props)
              }} />
          </FormGroup>
        )
      case 'DAY_OF_WEEK_BOOLEAN':
        return (
          <span>
            <span>
              {editorField === 'monday'
                ? <div className='col-xs-12'><ControlLabel>Days of service</ControlLabel></div> : null
              }
            </span>
            <span className='col-xs-3'>
              <Checkbox
                inline
                checked={this.state[editorField] === 1 || currentValue === 1}
                onChange={(evt) => {
                  const props = {}
                  props[field.name] = evt.target.checked ? 1 : 0
                  updateActiveEntity(activeEntity, activeComponent, props)
                }}>
                {toSentenceCase(editorField.substr(0, 3))}
              </Checkbox>
              {'     '}
            </span>
          </span>
        )
      case 'DROPDOWN':
        return (
          <FormGroup
            controlId={`${editorField}`}
            className={field.columnWidth ? `col-xs-${field.columnWidth}` : 'col-xs-12'}>
            {basicLabel}
            <FormControl componentClass='select'
              value={currentValue !== null ? currentValue : false}
              disabled={approveGtfsDisabled && field.adminOnly}
              onChange={(evt) => {
                const props = {}
                props[field.name] = evt.target.value
                updateActiveEntity(activeEntity, activeComponent, props)
              }}>
              {field.options.map(option => {
                return <option value={option.value} key={option.value}>
                  {option.text || option.value}
                </option>
              })}
            </FormControl>
          </FormGroup>
        )
      case 'GTFS_ROUTE':
        const routeEntity = getGtfsEntity('route', currentValue)
        const routeValue = routeEntity
          ? {
            'value': routeEntity.route_id,
            'label': routeEntity.route_short_name
              ? `${routeEntity.route_short_name} - ${routeEntity.route_long_name}`
              : routeEntity.route_long_name
          }
          : ''
        return (
          <GtfsSearch
            feeds={[feedSource]}
            limit={100}
            entities={['routes']}
            minimumInput={1}
            clearable={false}
            onChange={(evt) => {
              fieldEdited(table.id, row, editorField, evt.route.route_id)
              gtfsEntitySelected('route', evt.route)
            }}
            value={routeValue} />
        )
      case 'GTFS_AGENCY':
        const agency = tableData.agency && tableData.agency.find(a => a.id === currentValue)
        return (
          <FormGroup {...simpleFormProps}>
            {basicLabel}
            <Select
              placeholder='Select agency...'
              clearable
              value={agency ? {value: currentValue, label: agency.agency_name} : {value: currentValue}}
              onChange={(input) => {
                console.log(input)
                const props = {}
                const val = input ? input.value : null
                props[field.name] = val
                this.setState({[editorField]: val})
                updateActiveEntity(activeEntity, activeComponent, props)
              }}
              options={tableData.agency
                ? tableData.agency.map(agency => {
                  return {
                    value: agency.id,
                    label: agency.agency_name,
                    agency
                  }
                })
                : []
            } />
          </FormGroup>
        )
      case 'GTFS_STOP':
        const stopIndex = tableData.stop && tableData.stop.findIndex(s => s.id === activeEntity.id)
        const stop = tableData.stop.find(s => s.id === currentValue)
        const stops = [...tableData.stop]
        // remove current entity from list of stops
        if (stopIndex !== -1) {
          stops.splice(stopIndex, 1)
        }
        return (
          <FormGroup {...simpleFormProps}>
            {basicLabel}
            <VirtualizedEntitySelect
              value={stop ? {value: stop.id, label: getEntityName(activeComponent, stop), entity: stop} : null}
              component={'stop'}
              entities={stops}
              onChange={(input) => {
                console.log(input)
                const props = {}
                const val = input ? input.value : null
                props[field.name] = val
                this.setState({[editorField]: val})
                updateActiveEntity(activeEntity, activeComponent, props)
              }} />
          </FormGroup>
        )
      default:
        return null
    }
  }
}
