import React from 'react'
import { Grid, PageHeader, Nav, NavItem } from 'react-bootstrap'

import 'react-bootstrap-table/dist/react-bootstrap-table.min.css'
import 'react-select/dist/react-select.css'

import Feed from '../containers/Feed'
import Patterns from '../containers/Patterns'
import Routes from '../containers/Routes'
import Stops from '../containers/Stops'

export default class PageLayout extends React.Component {
  render () {
    console.log(this.props)
    return (
      <Grid>
        <PageHeader>Reports</PageHeader>
        <Nav bsStyle='tabs' activeKey={this.props.activeTab} onSelect={this.props.onTabSelect}
          style={{marginBottom: '10px'}}>
          <NavItem eventKey='feed'>Feed</NavItem>
          <NavItem eventKey='routes'>Routes</NavItem>
          <NavItem eventKey='patterns'>Patterns</NavItem>
          <NavItem eventKey='stop'>Stops</NavItem>
        </Nav>
        {this.props.activeTab === 'feed' &&
          <Feed />
        }
        {this.props.activeTab === 'routes' &&
          <Routes />
        }
        {this.props.activeTab === 'patterns' &&
          <Patterns />
        }
        {this.props.activeTab === 'stop' &&
          <Stops />
        }
      </Grid>
    )
  }
}
