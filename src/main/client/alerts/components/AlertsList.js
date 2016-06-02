import React from 'react'

import { Row, Col, ButtonGroup, Button, Input, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import AlertPreview from './AlertPreview'
import { getFeedId } from '../../common/util/modules'

export default class AlertsList extends React.Component {

  constructor (props) {
    super(props)
  }
  render () {
    var compare = function (a, b) {
      var aName = a.shortName || a.name
      var bName = b.shortName || b.name
      if(aName < bName) return -1
      if(aName > bName) return 1
      return 0
    }
    let sortedFeeds = this.props.editableFeeds.sort(compare)
    return (
      <div>
        <Row>
          <Input
            type="text"
            placeholder="Search Alerts"
            onChange={evt => this.props.searchTextChanged(evt.target.value)}
            defaultValue={this.props.visibilityFilter.searchText}
          />
        </Row>
        <Row>
          <FormGroup>
          <ButtonGroup justified>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'ACTIVE' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('ACTIVE')}
              href="#">Active</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'FUTURE' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('FUTURE')}
              href="#">Future</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'ARCHIVED' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('ARCHIVED')}
              href="#">Archived</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'DRAFT' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('DRAFT')}
              href="#">Draft</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'ALL' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('ALL')}
              href="#">All</Button>
          </ButtonGroup>
          </FormGroup>
          <FormGroup className='form-inline pull-right' controlId='formControlsSelectMultiple'>
            <ControlLabel>Sort by</ControlLabel>
            {'  '}
            <FormControl
              componentClass='select'
              onChange={(evt) => {
                let values = evt.target.value.split(':')
                let sort = {
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
                <option value={getFeedId(fs)}>{fs.name}</option>
              ))}
            </FormControl>
          </FormGroup>

        </Row>
        <Row>

        {this.props.isFetching
          ? <p>Loading alerts...</p>
          : this.props.alerts.map((alert) => {
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
        }
        </Row>
      </div>
    )
  }
}
