import React, {Component, PropTypes} from 'react'
import { Row, Col, Table, Input, Button, Glyphicon, Pagination } from 'react-bootstrap'

import GtfsSearch from '../../gtfs/components/gtfssearch'

import EditableTextField from '../../common/components/EditableTextField'

const recordsPerPage = 25

export default class GtfsPlusTable extends Component {

  constructor (props) {
    super(props)

    this.state = {
      currentPage: 1
    }
  }

  componentWillReceiveProps (nextProps) {
    if(this.props.table !== nextProps.table) {
      this.setState({ currentPage: 1 })
    }
  }

  componentDidMount () {
    this.props.newRowsDisplayed(this.getActiveRowData(this.state.currentPage))
  }

  componentDidUpdate () {
    this.props.newRowsDisplayed(this.getActiveRowData(this.state.currentPage))
  }

  getActiveRowData (currentPage) {
    return this.props.tableData.slice((currentPage - 1) * recordsPerPage,
      Math.min(currentPage * recordsPerPage, this.props.tableData.length))
  }

  render () {

    const table = this.props.table
    const rowData = this.getActiveRowData(this.state.currentPage)

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
                this.props.fieldEdited(table.id, row, field.name, evt.route.route_id)
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
              feeds={[this.props.feedSource]}
              limit={100}
              entities={['stops']}
              clearable={false}
              minimumInput={1}
              onChange={(evt) => {
                this.props.fieldEdited(table.id, row, field.name, evt.stop.stop_id)
                this.props.gtfsEntitySelected('stop', evt.stop)
              }}
              value={stopValue}
            />
          )

      }
    }

    const headerStyle = {
      fontWeight: 'bold',
      fontSize: '24px',
      borderBottom: '2px solid black',
      marginBottom: '16px'
    }

    const subHeaderStyle = {
      marginTop: '6px',
      marginBottom: '24px',
      textAlign: 'right'
    }

    const colHeaderStyle = {
      background: 'gray',
      borderRight: '4px solid white',
      borderBottom: '0px',
      color: 'white'
    }

    const pageCount = Math.ceil(this.props.tableData.length / recordsPerPage)

    return (<div>
      <Row>
        <Col xs={12}>
          <div style={headerStyle}>
            {table.name}
            <Glyphicon
              glyph='question-sign'
              style={{ cursor: 'pointer', fontSize: '18px', marginLeft: '10px' }}
              onClick={() => {
                this.props.showHelpClicked(table.id)
              }}
            />
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={5}>
          {(this.props.tableData.length > recordsPerPage)
            ? <div className='form-inline'>
                <Button
                  disabled={this.state.currentPage <= 1}
                  onClick={(evt => {
                    this.setState({ currentPage: this.state.currentPage - 1 })
                  })}
                ><Glyphicon glyph='arrow-left' /></Button>

                <span style={{ fontSize: '18px', margin: '0px 10px'}}>
                  Page {this.state.currentPage} of {pageCount}
                </span>

                <Button
                  disabled={this.state.currentPage >= pageCount}
                  onClick={(evt => {
                    this.setState({ currentPage: this.state.currentPage + 1 })
                  })}
                ><Glyphicon glyph='arrow-right' /></Button>

                <span style={{ fontSize: '18px', marginLeft: '15px'}}>
                  Go to <Input
                    type='text'
                    size={5}
                    style={{ width: '50px', display: 'inline', textAlign: 'center' }}
                    onKeyUp={(e) => {
                      if (e.keyCode == 13) {
                        const newPage = parseInt(e.target.value)
                        if(newPage > 0 && newPage <= pageCount) {
                          e.target.value = ''
                          this.setState({ currentPage: newPage })
                        }
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                  />
                </span>
              </div>
            : null
          }
        </Col>
        <Col xs={7} style={subHeaderStyle}>
          <i>Click (?) icon for details on field and validation rules. Required fields denoted by (*)</i>
        </Col>
      </Row>

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
          {rowData.map((data, rowIndex) => {
              return (<tr>
                {table.fields.map(field => {
                  return (<td>
                    {getInput((this.state.currentPage - 1) * recordsPerPage + rowIndex,
                      field, data[field.name])}
                  </td>)
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

      <Row>
        <Button
          bsStyle='primary'
          bsSize='large'
          className='pull-right'
          onClick={() => {
            this.props.newRowClicked(table.id)
          }}
        ><Glyphicon glyph='plus' /> New Row</Button>
      </Row>

    </div>)
  }
}
