import React, {Component, PropTypes} from 'react'
import { Table, Input, Button, Glyphicon } from 'react-bootstrap'

import GtfsSearch from '../../gtfs/components/gtfssearch'

import EditableTextField from '../../common/components/EditableTextField'

export default class GtfsPlusTable extends Component {

  constructor (props) {
    super(props)
  }

  render () {

    const table = this.props.table

    const getInput = (row, field, currentValue) => {
      switch(field.inputType) {
        case 'TEXT':
          return (
            <EditableTextField
              value={currentValue}
              onChange={(value) => {
                this.props.fieldEdited(table.id, row, field.name, value)
              }}
            />
          )
        case 'DROPDOWN':
          return (
            <Input type='select'
              value={currentValue}
              onChange={(evt) => {
                this.props.fieldEdited(table.id, row, field.name, evt.target.value)
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

          const value = routeEntity
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
                this.props.fieldEdited(table.id, row, field.name, evt.route.route_id)
                this.props.gtfsEntitySelected('route', evt.route)
              }}
              value={value}
            />
          )
        case 'GTFS_STOP':
          const stopEntity = this.props.getGtfsEntity('stop', currentValue)
          return (
            <GtfsSearch
              feeds={[this.props.feedSource]}
              limit={100}
              entities={['stops']}
              clearable={false}
              minimumInput={1}
              onChange={(evt) => {
                this.props.fieldEdited(table.id, row, field.name, evt.stop.stop_id)
                this.props.gtfsEntitySelected('stop', evt.stop)
              }}
              value={stopEntity ? {'value': stopEntity.stop_id, 'label': stopEntity.stop_name } : ''}
            />
          )

      }
    }

    const headerStyle = {
      fontWeight: 'bold',
      fontSize: '24px',
      borderBottom: '2px solid black'
    }

    const subHeaderStyle = {
      marginTop: '6px',
      marginBottom: '8px',
      textAlign: 'right'
    }

    const colHeaderStyle = {
      background: 'gray',
      borderRight: '4px solid white',
      borderBottom: '0px',
      color: 'white'
    }

    return (<div>
      <div style={headerStyle}>
        {table.name}
      </div>

      <div style={subHeaderStyle}>
        <i>Click (?) icon for details on field and validation rules. Required fields denoted by (*)</i>
      </div>

      <Table>
        <thead>
          <tr>
            {table.fields.map(field => {
              return (<th style={colHeaderStyle} className={`col-md-${field.columnWidth}`}>
                {field.name}{field.required ? ' *' : ''}
                <Glyphicon
                  glyph='question-sign'
                  className='pull-right'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    this.props.showHelpClicked(table.id, field.name)
                  }}
                />
              </th>)
            })}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {this.props.tableData.map((data, rowIndex) => {
            return (<tr>
              {table.fields.map(field => {
                return <td>{getInput(rowIndex, field, data[field.name])}</td>
              })}
              <td>
              <Button
                  bsStyle='danger'
                  bsSize='small'
                  className='pull-right'
                  onClick={() => { this.props.deleteRowClicked(table.id, rowIndex) }}
                >
                  <Glyphicon glyph='remove' />
                </Button>
              </td>
            </tr>)
          })}
        </tbody>
      </Table>
      <Button
        bsStyle='primary'
        bsSize='large'
        className='pull-right'
        onClick={() => {
          this.props.newRowClicked(table.id)
        }}
      ><Glyphicon glyph='plus' /> New Row</Button>

    </div>)
  }
}
