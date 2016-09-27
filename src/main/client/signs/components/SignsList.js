import React, { Component, PropTypes } from 'react'
import { Row, ButtonGroup, Button, FormControl, FormGroup } from 'react-bootstrap'
import Icon from 'react-fa'

import SignPreview from './SignPreview'

export default class SignsList extends Component {
  static propTypes = {
    signs: PropTypes.array,
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
    let sortedSigns = this.props.signs.sort((a, b) => {
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
              placeholder='Search Signs'
              onChange={evt => this.props.searchTextChanged(evt.target.value)}
              defaultValue={this.props.visibilityFilter.searchText}
            />
          </FormGroup>
        </Row>
        <Row>
          <ButtonGroup justified>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'ALL' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('ALL')}
              href='#'>All</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'PUBLISHED' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('PUBLISHED')}
              href='#'>Published</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'DRAFT' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('DRAFT')}
              href='#'>Draft</Button>
          </ButtonGroup>
          <div className='form-group'>&nbsp;</div>
        </Row>
        <Row>

        {this.props.isFetching
          ? <p className='text-center'><Icon size='5x' spin name='refresh' /></p>
          : sortedSigns.length
          ? sortedSigns.map((sign) => {
            return <SignPreview
              sign={sign}
              key={sign.id}
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
