import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, ListGroupItem, Button, ButtonToolbar, Form, Glyphicon, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import {Icon} from 'react-fa'

import { LinkContainer } from 'react-router-bootstrap'

import GtfsSearch from '../../gtfs/components/gtfssearch'
import EditableTextField from '../../common/components/EditableTextField'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import LanguageSelect from '../../common/components/LanguageSelect'

export default class AgencyDetails extends Component {

  constructor (props) {
    super(props)
  }

  render () {
    // const routes = ['test', 'Route 123', 'Route 456', 'Route 1', 'Route 10']

    let agency = this.props.agency

    console.log(agency)

    let panelStyle = {
      width: '300px',
      height: '100%',
      position: 'absolute',
      top: '0px',
      left: this.props.offset || '300px',
      zIndex: 99,
      backgroundColor: '#F2F2F2',
      paddingRight: '5px',
      paddingLeft: '5px'
    }
    const rowStyle = {
      cursor: 'pointer'
    }
    const getInput = (row, field, currentValue, index) => {
      const editorField = field.name //.split(/_(.+)?/)[1]
      switch(field.inputType) {
        case 'TEXT':
        case 'URL':
        case 'GTFS_AGENCY':
        case 'GTFS_TRIP':
        case 'GTFS_SHAPE':
        case 'GTFS_BLOCK':
        case 'GTFS_FARE':
        case 'GTFS_SERVICE':
        case 'GTFS_ZONE':
          return (
            <FormGroup
              controlId="formBasicText"
              /*validationState={this.getValidationState()}*/
            >
            <ControlLabel>{editorField}</ControlLabel>
            <FormControl
              tabIndex={index}
              value={currentValue}
              onChange={(value) => {
                this.props.fieldEdited(table.id, row, editorField, value)
              }}
            />
            </FormGroup>
          )
        case 'TIMEZONE':
          return (
            <FormGroup
              controlId="formBasicText"
              /*validationState={this.getValidationState()}*/
            >
            <ControlLabel>{editorField}</ControlLabel>
            <TimezoneSelect
              tabIndex={index}
              value={currentValue}
              onChange={(option) => {
                this.props.fieldEdited(table.id, row, editorField, option.value)
              }}
            />
            </FormGroup>
          )
        case 'LANGUAGE':
          return (
            <FormGroup
              controlId="formBasicText"
              /*validationState={this.getValidationState()}*/
            >
            <ControlLabel>{editorField}</ControlLabel>
            <LanguageSelect
              tabIndex={index}
              value={currentValue}
              onChange={(option) => {
                this.props.fieldEdited(table.id, row, editorField, option.value)
              }}
            />
            </FormGroup>
          )
        case 'TIME':
          return (
            <FormGroup
              controlId="formBasicText"
              /*validationState={this.getValidationState()}*/
            >
            <ControlLabel>{editorField}</ControlLabel>
            <FormControl
              tabIndex={index}
              value={currentValue}
              placeholder='HH:MM:SS'
              onChange={(value) => {
                this.props.fieldEdited(table.id, row, editorField, value)
              }}
            />
            </FormGroup>
          )
        case 'LATITUDE':
        case 'LONGITUDE':
        case 'NUMBER':
          return (
            <FormGroup
              controlId="formBasicText"
              /*validationState={this.getValidationState()}*/
            >
            <ControlLabel>{editorField}</ControlLabel>
            <FormControl
              tabIndex={index}
              value={currentValue}
              type='number'
              onChange={(value) => {
                this.props.fieldEdited(table.id, row, editorField, value)
              }}
            />
            </FormGroup>
          )
        case 'DATE':
          return (
            <FormGroup
              controlId="formBasicText"
              /*validationState={this.getValidationState()}*/
            >
            <ControlLabel>{editorField}</ControlLabel>
            <FormControl
              tabIndex={index}
              value={currentValue}
              placeholder='YYYYMMDD'
              onChange={(value) => {
                this.props.fieldEdited(table.id, row, editorField, value)
              }}
            />
            </FormGroup>
          )
        case 'COLOR':
          return (
            <FormGroup
              controlId="formBasicText"
              /*validationState={this.getValidationState()}*/
            >
            <ControlLabel>{editorField}</ControlLabel>
            <FormControl
              tabIndex={index}
              value={currentValue}
              placeholder='00FF00'
              type='number'
              onChange={(value) => {
                this.props.fieldEdited(table.id, row, editorField, value)
              }}
            />
            </FormGroup>
          )
        case 'POSITIVE_INT':
          return (
            <FormGroup
              controlId="formBasicText"
              /*validationState={this.getValidationState()}*/
            >
            <ControlLabel>{editorField}</ControlLabel>
            <FormControl
              tabIndex={index}
              value={currentValue}
              type='number'
              min={0}
              step={1}
              onChange={(value) => {
                this.props.fieldEdited(table.id, row, editorField, value)
              }}
            />
            </FormGroup>
          )
        case 'POSITIVE_NUM':
          return (
            <FormGroup
              controlId="formBasicText"
              /*validationState={this.getValidationState()}*/
            >
            <ControlLabel>{editorField}</ControlLabel>
            <FormControl
              tabIndex={index}
              value={currentValue}
              type='number'
              min={0}
              onChange={(value) => {
                this.props.fieldEdited(table.id, row, editorField, value)
              }}
            />
            </FormGroup>
          )
        case 'DROPDOWN':
          return (
            <Input type='select'
              tabIndex={index}
              value={currentValue}
              onChange={(evt) => {
                this.props.fieldEdited(table.id, row, editorField, evt.target.value)
              }}
            >
              {field.options.map(option => {
                return <option value={option.value} key={option.value}>
                  {option.text || option.value}
                </option>
              })}
            </Input>
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
              tabIndex={index}
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
        case 'GTFS_STOP':
          const stopEntity = this.props.getGtfsEntity('stop', currentValue)
          const stopValue = stopEntity ? {'value': stopEntity.stop_id, 'label': stopEntity.stop_name } : ''

          return (
            <GtfsSearch
              tabIndex={index}
              feeds={[this.props.feedSource]}
              limit={100}
              entities={['stops']}
              clearable={false}
              minimumInput={1}
              onChange={(evt) => {
                this.props.fieldEdited(table.id, row, editorField, evt.stop.stop_id)
                this.props.gtfsEntitySelected('stop', evt.stop)
              }}
              value={stopValue}
            />
          )

      }
    }
    if (!agency) return null
    const data = agency
    const rowIndex = 0
    const table = DT_CONFIG.modules.editor.spec.find(t => t.id === 'agency')
    const agencyForm = (
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
                  <div style={{ marginLeft: (validationIssue ? '20px' : '0px') }}>
                    {getInput(rowIndex, field, data[editorField], (rowIndex * table.fields.length) + colIndex + 1)}
                  </div>
              )
            })}
            {/*
            <td>

              <Button
                bsStyle='primary'
                bsSize='small'
                className='pull-right'
                onClick={() => { this.props.saveRowClicked(table.id, rowIndex, this.props.feedSource.id) }}
              >
                <Glyphicon glyph='floppy-disk' />
              </Button>
              <Button
                bsStyle='danger'
                bsSize='small'
                className='pull-right'
                onClick={() => { this.props.deleteRowClicked(table.id, rowIndex) }}
              >
                <Glyphicon glyph='remove' />
              </Button>

            </td>*/}
          </Form>
        )

    return (
      <div
        style={panelStyle}
      >
        <h3>
          <ButtonToolbar
            className='pull-right'
          >
            <Button
              bsSize='small'
              bsStyle='primary'
            >
              Save
            </Button>
          </ButtonToolbar>
          <EditableTextField
            value={agency.agency_name}
            onChange={(value) => {
              // this.props.fieldEdited(table.id, row, editorField, value)
            }}
          />
        </h3>
          {agencyForm}
      </div>
    )
  }
}
