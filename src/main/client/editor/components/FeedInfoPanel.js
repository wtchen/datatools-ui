import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, ListGroupItem, Button, ButtonToolbar, Nav, NavItem } from 'react-bootstrap'
import {Icon} from 'react-fa'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'

import EditableTextField from '../../common/components/EditableTextField'
import EntityDetails from './EntityDetails'
import GtfsTable from './GtfsTable'

export default class FeedInfoPanel extends Component {

  constructor (props) {
    super(props)
  }

  render () {
    let { feedSource, feedInfo } = this.props
    let panelStyle = {
      backgroundColor: 'white',
      position: 'absolute',
      right: 5,
      bottom: 20,
      paddingRight: 5,
      paddingLeft: 5,
      height: 200,
      width: 400,
      zIndex: 99
    }
    if (!feedInfo || !feedSource) {
      return null
    }
    return (
      <div
        style={panelStyle}
      >
        <h3>
          Editing {feedSource.name}
          {'  '}
          <Button bsSize='small' bsStyle='primary'>Save snapshot</Button>
        </h3>
        <p>{feedInfo.id}</p>

      </div>
    )
  }
}
