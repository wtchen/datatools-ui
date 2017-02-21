import React, { PropTypes, Component } from 'react'
import { Row, Col, ButtonGroup, Button, FormControl, FormGroup, Badge, ControlLabel } from 'react-bootstrap'
import {Icon} from '@conveyal/woonerf'
import { sentence as toSentenceCase } from 'change-case'

import AlertPreview from './AlertPreview'
import { FILTERS } from '../util'
import { getFeedId } from '../../common/util/modules'

export default class AlertsList extends Component {
  static propTypes = {
    alerts: PropTypes.array,
    visibilityFilter: PropTypes.object,
    isFetching: PropTypes.bool,
    editableFeeds: PropTypes.array,
    publishableFeeds: PropTypes.array,
    filterCounts: PropTypes.object,

    onEditClick: PropTypes.func,
    onZoomClick: PropTypes.func,
    onDeleteClick: PropTypes.func,

    searchTextChanged: PropTypes.func,
    visibilityFilterChanged: PropTypes.func
  }
  render () {
    // console.log(this.props)
    var compare = function (a, b) {
      var aName = a.shortName || a.name
      var bName = b.shortName || b.name
      if (aName < bName) return -1
      if (aName > bName) return 1
      return 0
    }
    const sortedFeeds = this.props.editableFeeds.sort(compare)
    return (
      <div>
        <Row>
          <Col xs={12}>
            <FormGroup>
              <FormControl
                type='text'
                placeholder='Search Alerts'
                onChange={evt => this.props.searchTextChanged(evt.target.value)}
                defaultValue={this.props.visibilityFilter.searchText}
              />
            </FormGroup>
          </Col>
        </Row>
        {/* Alert filters */}
        <Row>
          <Col xs={12}>
            <FormGroup>
              <ButtonGroup justified>
                {FILTERS.map(f => (
                  <Button
                    active={this.props.visibilityFilter.filter === f}
                    onClick={() => this.props.visibilityFilterChanged(f)}
                    href='#'
                    key={f}
                  >
                    {toSentenceCase(f)} <Badge style={{backgroundColor: '#babec0'}}>{this.props.filterCounts[f]}</Badge>
                  </Button>
                ))}
              </ButtonGroup>
            </FormGroup>
            <FormGroup className='form-inline pull-right' controlId='formControlsSelectMultiple'>
              <ControlLabel>Sort by</ControlLabel>
              {'  '}
              <FormControl
                componentClass='select'
                onChange={(evt) => {
                  const values = evt.target.value.split(':')
                  const sort = {
                    type: values[0],
                    direction: values[1]
                  }
                  this.props.sortChanged(sort)
                }}
              >
                <option value='id:asc'>Oldest</option>
                <option value='id:desc'>Newest</option>
                <option value='title:asc'>Title</option>
                <option value='title:desc'>Title (reverse)</option>
                <option value='start:asc'>Starts earliest</option>
                <option value='start:desc'>Starts latest</option>
                <option value='end:asc'>Ends earliest</option>
                <option value='end:desc'>Ends latest</option>
              </FormControl>
            </FormGroup>
            <FormGroup className='form-inline' controlId='formControlsSelectMultiple'>
              <ControlLabel>Agency</ControlLabel>
              {'  '}
              <FormControl
                componentClass='select'
                onChange={(evt) => this.props.agencyFilterChanged(evt.target.value)}
              >
                <option value='ALL'>All</option>
                {sortedFeeds.map(fs => (
                  <option key={fs.id} value={getFeedId(fs)}>{fs.name}</option>
                ))}
              </FormControl>
            </FormGroup>
          </Col>
        </Row>
        {/* List of alerts */}
        <Row>
          <Col xs={12}>
            {this.props.isFetching
              ? <p className='text-center'><Icon className='fa-5x fa-spin' type='refresh' /></p>
              : this.props.alerts.length
              ? this.props.alerts.map((alert) => {
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
          </Col>
        </Row>
      </div>
    )
  }
}
