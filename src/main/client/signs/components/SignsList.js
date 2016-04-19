import React from 'react'

import { Row, Col, ButtonGroup, Button, Input } from 'react-bootstrap'
import SignPreview from './SignPreview'

export default class SignsList extends React.Component {

  constructor (props) {
    super(props)
  }
  render () {

    let sortedSigns = this.props.signs.sort((a,b) => {
      if(a.id < b.id) return -1
      if(a.id > b.id) return 1
      return 0
    })

    return (
      <div>
        <Row>
          <Input
            type="text"
            placeholder="Search Signs"
            onChange={evt => this.props.searchTextChanged(evt.target.value)}
          />
        </Row>
        <Row>
          <ButtonGroup justified>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'ALL' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('ALL')}
              href="#">All</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'PUBLISHED' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('PUBLISHED')}
              href="#">Published</Button>
            <Button
              bsStyle={this.props.visibilityFilter.filter === 'DRAFT' ? 'primary' : 'default'}
              onClick={() => this.props.visibilityFilterChanged('DRAFT')}
              href="#">Draft</Button>
          </ButtonGroup>
          <div className="form-group">&nbsp;</div>
        </Row>
        <Row>

        {this.props.isFetching
          ? <p>Loading signs...</p>
          : sortedSigns.map((sign) => {
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
        }
        </Row>
      </div>
    )
  }
}
