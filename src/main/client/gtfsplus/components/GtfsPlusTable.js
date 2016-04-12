import React, {Component, PropTypes} from 'react'
import { Table, Input, Button, Glyphicon } from 'react-bootstrap'

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
                  {option.text}
                </option>
              })}
            </Input>
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
              return (<th style={colHeaderStyle}>
                {field.name}{field.required ? ' *' : ''}
                <Glyphicon glyph='question-sign' className='pull-right' />
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
