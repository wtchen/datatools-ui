import React, { PropTypes, Component } from 'react'
import { Alert } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table/lib/BootstrapTable'
import TableHeaderColumn from 'react-bootstrap-table/lib/TableHeaderColumn'

import Loading from '../../../../common/components/Loading'

export default class FeedLayout extends Component {
  static propTypes = {
    feed: PropTypes.object
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    return (

      <div>

        {this.props.feed.fetchStatus.fetching &&
          <Loading />
        }

        {this.props.feed.fetchStatus.error &&
          <Alert bsStyle='danger'>
            An error occurred while trying to fetch the data
          </Alert>
        }

        {this.props.feed.fetchStatus.fetched &&

          <BootstrapTable
            data={this.props.feed.data}
            striped
            hover
          >
            <TableHeaderColumn dataField='statName' isKey>Statistic</TableHeaderColumn>
            <TableHeaderColumn dataField='statValue'>Value</TableHeaderColumn>
          </BootstrapTable>
        }

      </div>
    )
  }
}
