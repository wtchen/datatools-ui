import React, {Component, PropTypes} from 'react'
import { Table, Button, ButtonToolbar } from 'react-bootstrap'
import {Icon} from 'react-fa'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'

export default class RouteEditor extends Component {

  constructor (props) {
    super(props)
  }

  render () {
    const routes = ['test', 'Route 123', 'Route 456', 'Route 1', 'Route 10']
    let panelStyle = {
      width: '300px',
      height: '100%',
      position: 'absolute',
      left: '0px',
      zIndex: 99,
      backgroundColor: 'white',
      paddingRight: '5px',
      paddingLeft: '5px'
    }
    const feedSource = this.props.feedSource
    const rowStyle = {
      cursor: 'pointer'
    }
    const routeTable = (
      <Table hover>
        <thead></thead>
        <tbody>
        {routes.map(r => {
          return (
            <tr
              href='#'
              onMouseDown={(e) => console.log(e)}
              style={rowStyle}
            >
              <LinkContainer to={`/feed/${feedSource.id}/edit/routes/${r}`}><td>{r}</td></LinkContainer>
            </tr>
          )
        })}
        </tbody>
      </Table>
    )
    return (
      <div
        style={panelStyle}
      >
        <h3>
          <ButtonToolbar
            className='pull-right'
          >
            <Button
              bsSize='small'
              bsStyle='success'
            >
              <Icon name='plus'/>
            </Button>
            <Button
              bsSize='small'
            >
              <Icon name='clone'/>
            </Button>
            <Button
              bsSize='small'
              bsStyle='danger'
            >
              <Icon name='trash'/>
            </Button>
          </ButtonToolbar>
          Route editor
        </h3>
        {routeTable}
        {this.props.entity
          ? <RouteDetails/>
          : null
        }
      </div>
    )
  }
}
