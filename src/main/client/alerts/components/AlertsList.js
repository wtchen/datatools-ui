import React, { PropTypes, Component } from 'react'

import { Row, ButtonGroup, Button, FormControl, FormGroup } from 'react-bootstrap'
import AlertPreview from './AlertPreview'
import Icon from 'react-fa'

export default class AlertsList extends Component {
  static propTypes = {
    alerts: PropTypes.array,
    visibilityFilter: PropTypes.object,
    isFetching: PropTypes.bool,
    editableFeeds: PropTypes.array,
    publishableFeeds: PropTypes.array,

    onEditClick: PropTypes.func,
    onZoomClick: PropTypes.func,
    onDeleteClick: PropTypes.func,

    searchTextChanged: PropTypes.func,
    visibilityFilterChanged: PropTypes.func
  }
  constructor (props) {
    super(props)
  }
  render () {
    let sortedAlerts = this.props.alerts.sort((a, b) => {
      if (a.id < b.id) return -1
      if (a.id > b.id) return 1
      return 0
    })

    return (
      <div>
        <Row>
          <FormGroup>
            <FormControl
              type='text'
              placeholder='Search Alerts'
              onChange={evt => this.props.searchTextChanged(evt.target.value)}
              defaultValue={this.props.visibilityFilter.searchText}
            />
          </FormGroup>
        </Row>
        <Row>
          <ButtonGroup justified>

            <Button
              bsStyle={this.props.visibilityFilter.filter === 'ACTIVE' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('ACTIVE')}
              href='#'>Active</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'FUTURE' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('FUTURE')}
              href='#'>Future</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'ARCHIVED' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('ARCHIVED')}
              href='#'>Archived</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'DRAFT' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('DRAFT')}
              href='#'>Draft</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'ALL' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('ALL')}
              href='#'>All</Button>
          </ButtonGroup>
          <div className='form-group'>&nbsp;</div>
        </Row>
        <Row>

        {this.props.isFetching
          ? <p className='text-center'><Icon size='5x' spin name='refresh' /></p>
          : sortedAlerts.length
          ? sortedAlerts.map((alert) => {
            return <AlertPreview
              alert={alert}
              key={alert.id}
              editableFeeds={this.props.editableFeeds}
              publishableFeeds={this.props.publishableFeeds}
              onEditClick={this.props.onEditClick}
              onZoomClick={this.props.onZoomClick}
              onDeleteClick={this.props.onDeleteClick}
            />
          })
          : <p className='lead text-center'>No alerts found.</p>
        }
        </Row>
      </div>
    )
  }
}
