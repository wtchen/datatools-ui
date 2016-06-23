import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, ListGroupItem, Button, ButtonToolbar, Form, Glyphicon, FormControl, FormGroup, ControlLabel, Input, Nav, NavItem } from 'react-bootstrap'
import {Icon} from 'react-fa'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import { PureComponent, shallowEqual } from 'react-pure-render'

import GtfsSearch from '../../gtfs/components/gtfssearch'
import EditableTextField from '../../common/components/EditableTextField'
import TimezoneSelect from '../../common/components/TimezoneSelect'
import LanguageSelect from '../../common/components/LanguageSelect'
import TripPatternList from './TripPatternList'

export default class EntityDetails extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  // componentWillReceiveProps (nextProps) {
  //   // forceUpdate()
  // }
  shouldComponentUpdate (nextProps) {
    // component is updating!!!
    return  true // !shallowEqual(nextProps.entity, this.props.entity) || nextProps.entityEdited !== this.props.entityEdited || nextProps.activeEntityId !== this.props.activeEntityId
  }
  render () {
    // const routes = ['test', 'Route 123', 'Route 456', 'Route 1', 'Route 10']

    let entity = this.props.entity

    let entName = this.props.activeComponent === 'agency'
      ? 'agency_name'
      : this.props.activeComponent === 'route'
      ? 'route_short_name'
      : this.props.activeComponent === 'stop'
      ? 'stop_name'
      : null

    let panelStyle = {
      width: '300px',
      height: '100%',
      position: 'absolute',
      // overflowY: 'scroll',
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
        case 'GTFS_TRIP':
        case 'GTFS_SHAPE':
        case 'GTFS_AGENCY':
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
              // tabIndex={index}
              defaultValue={currentValue}
              onChange={(evt) => {
                let props = {}
                props[editorField] = evt.target.value
                this.setState({[editorField]: evt.target.value})
                this.props.updateActiveEntity(props)
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
              // tabIndex={index}
              defaultValue={currentValue}
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
              // tabIndex={index}
              defaultValue={currentValue}
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
              // tabIndex={index}
              defaultValue={currentValue}
              placeholder='HH:MM:SS'
              onChange={(evt) => {
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
              // tabIndex={index}
              defaultValue={currentValue}
              type='number'
              onChange={(evt) => {
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
              // tabIndex={index}
              defaultValue={currentValue}
              placeholder='YYYYMMDD'
              onChange={(evt) => {
                let props = {}
                props[editorField] = evt.target.value
                this.setState({[editorField]: evt.target.value})
                this.props.updateActiveEntity(props)
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
              // tabIndex={index}
              defaultValue={currentValue}
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
              // tabIndex={index}
              defaultValue={currentValue}
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
              // tabIndex={index}
              defaultValue={currentValue}
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
            <FormGroup
              controlId="formBasicText"
              /*validationState={this.getValidationState()}*/
            >
              <ControlLabel>{editorField}</ControlLabel>
              <FormControl componentClass='select'
                // tabIndex={index}
                defaultValue={currentValue}
                onChange={(evt) => {
                  this.props.fieldEdited(table.id, row, editorField, evt.target.value)
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
          // return (
          //   <FormGroup
          //     controlId="formBasicText"
          //     /*validationState={this.getValidationState()}*/
          //   >
          //   <ControlLabel>{editorField}</ControlLabel>
          //   <FormControl
          //     tabIndex={index}
          //     value={currentValue}
          //     onChange={(value) => {
          //       this.props.fieldEdited(table.id, row, editorField, value)
          //     }}
          //   />
          //   </FormGroup>
          // )
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
        // case 'GTFS_AGENCY':
        //   const agencyEntity = this.props.getGtfsEntity('agency', currentValue)
        //   const stopValue = agencyEntity ? {'value': stopEntity.stop_id, 'label': stopEntity.stop_name } : ''
        //   return (
        //     <Input type='select'
        //      tabIndex={index}
        //       value={currentValue}
        //       onChange={(evt) => {
        //         this.props.fieldEdited(table.id, row, editorField, evt.target.value)
        //       }}
        //     >
        //       {field.options.map(option => {
        //         return <option value={option.value} key={option.value}>
        //           {option.text || option.value}
        //         </option>
        //       })}
        //     </Input>
        //   )
        case 'GTFS_STOP':
          const stopEntity = this.props.getGtfsEntity('stop', currentValue)
          const stopValue = stopEntity ? {'value': stopEntity.stop_id, 'label': stopEntity.stop_name } : ''
          // return (
          //   <FormGroup
          //     controlId="formBasicText"
          //     /*validationState={this.getValidationState()}*/
          //   >
          //   <ControlLabel>{editorField}</ControlLabel>
          //   <FormControl
          //    tabIndex={index}
          //     value={currentValue}
          //     onChange={(value) => {
          //       this.props.fieldEdited(table.id, row, editorField, value)
          //     }}
          //   />
          //   </FormGroup>
          // )
          return (
            <GtfsSearch
              // tabIndex={index}
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
    if (!entity) return null
    const rowIndex = 0
    const table = DT_CONFIG.modules.editor.spec.find(t => this.props.activeComponent === 'scheduleexception' ? t.id === 'calendar_dates' : t.id === this.props.activeComponent)
    console.log(entity.id)
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
                  <div key={`row-${entity.id}-${editorField}`} style={{ marginLeft: (validationIssue ? '20px' : '0px') }}>
                    {getInput(rowIndex, field, entity[editorField], (rowIndex * table.fields.length) + colIndex + 1)}
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
        <div
          style={{height: '85px'}}
        >
          <h3>
            <ButtonToolbar
              className='pull-right'
            >
              <Button
                bsSize='small'
                disabled={!this.props.entityEdited}
                onClick={(e) => {
                  // this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, null)
                  this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, entity)
                }}
              >
                Reset
              </Button>
              <Button
                bsSize='small'
                bsStyle='primary'
                disabled={!this.props.entityEdited}
                onClick={(e) => {
                  this.props.saveActiveEntity()
                  this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent)
                }}
              >
                Save
              </Button>
            </ButtonToolbar>
            <EditableTextField
              value={entity[entName]}
              onChange={(value) => {
                // this.props.fieldEdited(table.id, row, editorField, value)
              }}
            />
          </h3>
          {this.props.activeComponent === 'route'
            ? <Nav style={{marginBottom: '5px'}} bsStyle='pills' justified onSelect={this.handleSelect}>
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
                <NavItem
                  eventKey={'trippattern'}
                  disabled={entity.id === 'new'}
                  active={this.props.subComponent === 'trippattern'}
                  onClick={() => {
                    this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, entity, 'trippattern')
                    browserHistory.push(`/feed/${this.props.feedSource.id}/edit/${this.props.activeComponent}/${entity.id}/trippattern`)
                  }}
                >
                  Trip patterns
                </NavItem>
              </Nav>
            : null
          }
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
                subSubComponent={this.props.subSubComponent}
                route={entity}
                stops={this.props.stops}
                tableData={this.props.tableData}
              />
            : agencyForm
          }
        </div>
      </div>
    )
  }
}
