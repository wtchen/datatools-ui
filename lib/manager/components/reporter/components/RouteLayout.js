// @flow

import React, { Component } from 'react'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table/lib/BootstrapTable'
import TableHeaderColumn from 'react-bootstrap-table/lib/TableHeaderColumn'

import Loading from '../../../../common/components/Loading'
import ActiveDateTimeFilter from '../containers/ActiveDateTimeFilter'

type Route = {
  route_long_name: String,
  route_short_name: String
}

type Props = {
  onComponentMount: (boolean) => void,
  routeData: Array<Route>,
  routeDateTimeFilterChange: () => void,
  fetchStatus: {
    error: String | boolean,
    fetched: boolean,
    fetching: boolean
  },
  tableOptions: any,
  version: any,
  viewPatterns: (any) => void
}

export default class RouteLayout extends Component<Props> {
  componentWillMount () {
    this.props.onComponentMount(this.props.fetchStatus.fetched)
  }

  render () {
    const {
      fetchStatus: {
        error,
        fetching,
        fetched
      },
      routeData,
      routeDateTimeFilterChange,
      version,
      viewPatterns
    } = this.props

    return (
      <div>

        <ActiveDateTimeFilter
          onChange={routeDateTimeFilterChange}
          version={version}
          />

        {fetching &&
          <Loading />
        }

        {error &&
          <Alert bsStyle='danger'>
            An error occurred while trying to fetch the data
          </Alert>
        }

        {fetched &&
          <Row style={{marginTop: 20}}>
            <Col xs={12}>
              {routeData.map(route => (
                <RouteRow
                  {...route}
                  viewPatterns={viewPatterns}
                  />
              ))}
            </Col>
          </Row>
        }
      </div>
    )
  }
}

class RouteRow extends Component<Route & {viewPatterns: (any) => void}> {
  render () {
    const {
      route_short_name: routeShortName,
      route_long_name: routeLongName
    } = this.props
    return (
      <div>
        <p>{routeShortName}</p>
        <p>{routeLongName}</p>
      </div>
    )
  }
}
