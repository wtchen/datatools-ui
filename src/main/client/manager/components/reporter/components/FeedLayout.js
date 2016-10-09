import React from 'react'
import { Grid, Alert } from 'react-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'

import Loading from '../../../../common/components/Loading'


export default class FeedLayout extends React.Component {

  static propTypes = {}
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    return (

      <Grid>

        {(this.props.feed.fetchStatus.fetching ||
          !this.props.feed.fetchStatus.fetched) &&
          <Loading />
        }

        {this.props.feed.fetchStatus.error &&
          <Alert bsStyle="danger">
            An error occurred while trying to fetch the data
          </Alert>
        }

        {this.props.feed.fetchStatus.fetched &&

          <BootstrapTable
            data={this.props.feed.data}
            striped={true}
            hover={true}
          >
            <TableHeaderColumn dataField='statName' isKey={true}>Statistic</TableHeaderColumn>
            <TableHeaderColumn dataField='statValue'>Value</TableHeaderColumn>
          </BootstrapTable>
        }

      </Grid>
    )
  }
}
