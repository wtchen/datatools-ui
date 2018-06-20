// @flow

import React, { Component } from 'react'
import { Alert, Col, ListGroup, ListGroupItem, Row } from 'react-bootstrap'

import Loading from '../../../../common/components/Loading'
import ActiveDateTimeFilter from '../containers/ActiveDateTimeFilter'

import type {RouteRowData} from '../../../selectors/index'

type Props = {
  onComponentMount: (boolean) => void,
  routeData: Array<RouteRowData>,
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
              <ListGroup className='route-list'>
                {routeData.map(route => (
                  <RouteRow
                    {...route}
                    viewPatterns={viewPatterns}
                    />
                ))}
              </ListGroup>
            </Col>
          </Row>
        }
      </div>
    )
  }
}

class RouteRow extends Component<RouteRowData & {viewPatterns: (any) => void}> {
  render () {
    const {
      routeName
    } = this.props
    return (
      <ListGroupItem>
        <Row>
          <Col xs={12}>
            <p>{routeName}</p>
          </Col>
          <Col xs={12} md={6}>
            <p>Histogram</p>
          </Col>
          <Col xs={12} md={2}>
            <p>Stops button</p>
          </Col>
          <Col xs={12} md={2}>
            <p>Trips button</p>
          </Col>
          <Col xs={12} md={2}>
            <p>Patterns button</p>
          </Col>
        </Row>
      </ListGroupItem>
    )
  }
}
