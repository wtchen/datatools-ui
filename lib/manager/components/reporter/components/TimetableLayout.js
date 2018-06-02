// @flow

import React, { Component } from 'react'
import { Alert, Checkbox, Col, Row } from 'react-bootstrap'
import Select from 'react-select'
import BootstrapTable from 'react-bootstrap-table/lib/BootstrapTable'
import TableHeaderColumn from 'react-bootstrap-table/lib/TableHeaderColumn'

import Loading from '../../../../common/components/Loading'

type BaseGtfsEntity = {
  data: Array<any>,
  fetchStatus: {
    fetched: boolean,
    fetching: boolean,
    error: boolean
  }
}

type Props = {
  onComponentMount: (Props) => void,
  patternFilter: ?string,
  patternFilterChange: any => void,
  patterns: BaseGtfsEntity,
  routeFilter: ?string,
  routeFilterChange: any => void,
  routes: BaseGtfsEntity,
  serviceFilter: ?string,
  serviceFilterChange: any => void,
  services: BaseGtfsEntity,
  showArrivals: boolean,
  showArrivalsToggle: () => void,
  tableOptions: any,
  timepointFilter: boolean,
  timepointFilterToggle: () => void,
  timetableTableData: {
    columns: Array<any>,
    rows: Array<any>
  },
  timetables: BaseGtfsEntity
}

export default class TimetableLayout extends Component<Props> {
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    const {
      patternFilter,
      patternFilterChange,
      patterns,
      routeFilter,
      routeFilterChange,
      routes,
      serviceFilter,
      serviceFilterChange,
      services,
      showArrivals,
      showArrivalsToggle,
      tableOptions,
      timepointFilter,
      timepointFilterToggle,
      timetableTableData,
      timetables
    } = this.props

    const allFiltersSelected = routeFilter && patternFilter && serviceFilter

    return (
      <div>
        <Row style={{ marginBottom: '20px' }}>
          <Col xs={12} md={4} style={{paddingLeft: '25px', paddingRight: '25px'}}>
            <label htmlFor='route_name'>Route:</label>
            <Select
              options={routes.data}
              labelKey={'route_name'}
              valueKey={'route_id'}
              placeholder={'Select a Route'}
              value={routeFilter}
              onChange={routeFilterChange} />
          </Col>
          {routeFilter &&
            <Col xs={12} md={4} style={{paddingLeft: '25px', paddingRight: '25px'}}>
              <label htmlFor='pattern'>Pattern:</label>
              <Select
                options={patterns.data}
                labelKey={'name'}
                valueKey={'pattern_id'}
                placeholder={'Select a Pattern'}
                value={patternFilter}
                onChange={patternFilterChange} />
            </Col>
          }
          {patternFilter &&
            <Col xs={12} md={4} style={{paddingLeft: '25px', paddingRight: '25px'}}>
              <label htmlFor='service'>Service ID:</label>
              <Select
                options={services.data}
                labelKey={'serviceId'}
                valueKey={'serviceId'}
                placeholder={'Select a Service Id'}
                value={serviceFilter}
                onChange={serviceFilterChange} />
            </Col>
          }
        </Row>
        <Row style={{ marginBottom: '20px' }}>
          <Col xs={12} md={6}>
            <Checkbox
              checked={timepointFilter}
              onChange={timepointFilterToggle}
              >
              Only show stops with times
            </Checkbox>
          </Col>
          <Col xs={12} md={6}>
            <Checkbox
              checked={showArrivals}
              onChange={showArrivalsToggle}
              >
              Show arrival times
            </Checkbox>
          </Col>
        </Row>
        {timetables.fetchStatus.fetching &&
          <Loading />
        }
        {timetables.fetchStatus.error &&
          <Alert bsStyle='danger'>
            An error occurred while trying to fetch the data
          </Alert>
        }
        {!allFiltersSelected &&
          <Alert>
            Select a route, pattern and service
          </Alert>
        }
        {allFiltersSelected && timetables.fetchStatus.fetched && timetableTableData.rows.length > 0 &&
          <BootstrapTable
            {...tableOptions}
            containerStyle={{overflowX: 'scroll'}}
            data={timetableTableData.rows}
            >
            {timetableTableData.columns.map(col => {
              const {name, ...props} = col
              return (
                <TableHeaderColumn {...props}>{name}</TableHeaderColumn>
              )
            })}
          </BootstrapTable>
        }
      </div>
    )
  }
}
