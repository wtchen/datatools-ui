// @flow

import React, { Component } from 'react'
import {
  Alert,
  Button,
  Col,
  ListGroup,
  ListGroupItem,
  Pagination,
  Row
} from 'react-bootstrap'

import Loading from '../../../../common/components/Loading'
import ActiveDateTimeFilter from '../containers/ActiveDateTimeFilter'
import TripsPerHourChart from './TripsPerHourChart'

import type {RouteRowData} from '../../../selectors'

type Props = {
  onComponentMount: (boolean) => void,
  routeData: Array<RouteRowData>,
  routeDateTimeFilterChange: () => void,
  routeOffset: number,
  routeOffsetChange: (number) => void,
  fetchStatus: {
    error: String | boolean,
    fetched: boolean,
    fetching: boolean
  },
  numRoutes: number,
  tableOptions: any,
  version: any,
  viewPatterns: (any) => void
}

export default class RouteLayout extends Component<Props> {
  componentWillMount () {
    this.props.onComponentMount(this.props.fetchStatus.fetched)
  }

  _onPaginationSelect = (value: number) => {
    this.props.routeOffsetChange((value - 1) * 10)
  }

  render () {
    const {
      fetchStatus: {
        error,
        fetching,
        fetched
      },
      numRoutes,
      routeData,
      routeDateTimeFilterChange,
      routeOffset,
      version,
      viewPatterns
    } = this.props

    const maxTripsPerHourAllRoutes = fetched ? routeData.reduce(
      (accumulator, currentRoute) => {
        return Math.max(accumulator, ...currentRoute.tripsPerHour)
      },
      0
    ) : 0

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
              <ListGroup className='route-list'>
                {routeData.map((route, index) => (
                  <RouteRow
                    key={index}
                    {...route}
                    maxTripsPerHourAllRoutes={maxTripsPerHourAllRoutes}
                    viewPatterns={viewPatterns}
                    />
                ))}
              </ListGroup>
              <Pagination
                activePage={Math.floor(routeOffset / 10) + 1}
                bsSize='large'
                ellipsis
                first
                items={Math.ceil(numRoutes / 10)}
                last
                next
                onSelect={this._onPaginationSelect}
                prev
                />
            </Col>
          </Row>
        }
      </div>
    )
  }
}

function RouteRow (props: RouteRowData & {
  maxTripsPerHourAllRoutes: number,
  viewPatterns: (any) => void
}) {
  const {
    maxTripsPerHourAllRoutes,
    numPatterns,
    numStops,
    numTrips,
    routeName,
    tripsPerHour
  } = props

  return (
    <ListGroupItem>
      <Row>
        <Col xs={12}>
          <h3>{routeName}</h3>
        </Col>
        <Col xs={12} md={6}>
          <TripsPerHourChart
            maxTripsPerHour={maxTripsPerHourAllRoutes}
            tripsPerHour={tripsPerHour}
            />
        </Col>
        <Col xs={12} md={2} style={{marginTop: 50}}>
          <Button>
            <h4>{numStops} Stops</h4>
          </Button>
        </Col>
        <Col xs={12} md={2} style={{marginTop: 50}}>
          <Button>
            <h4>{numTrips} Trips</h4>
          </Button>
        </Col>
        <Col xs={12} md={2} style={{marginTop: 50}}>
          <Button>
            <h4>{numPatterns} Patterns</h4>
          </Button>
        </Col>
      </Row>
    </ListGroupItem>
  )
}
