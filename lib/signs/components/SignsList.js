// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Row, ButtonGroup, FormControl, FormGroup, Badge} from 'react-bootstrap'

import * as signsActions from '../actions/signs'
import * as visibilityFilterActions from '../actions/visibilityFilter'
import SignPreview from './SignPreview'
import {FILTERS} from '../util'
import OptionButton from '../../common/components/OptionButton'
import toSentenceCase from '../../common/util/to-sentence-case'

import type {Props as ContainerProps} from '../containers/VisibleSignsList'
import type {Feed, Sign} from '../../types'
import type {SignsFilter} from '../../types/reducers'

type Props = ContainerProps & {
  deleteSign: typeof signsActions.deleteSign,
  editSign: typeof signsActions.editSign,
  editableFeeds: Array<Feed>,
  filterCounts: any,
  isFetching: boolean,
  publishableFeeds: Array<Feed>,
  setVisibilityFilter: typeof visibilityFilterActions.setVisibilityFilter,
  setVisibilitySearchText: typeof visibilityFilterActions.setVisibilitySearchText,
  signs: Array<Sign>,
  visibilityFilter: SignsFilter
}

export default class SignsViewer extends Component<Props> {
  _onSearchChange = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.props.setVisibilitySearchText(evt.target.value)
  }

  render () {
    const {
      deleteSign,
      editableFeeds,
      editSign,
      filterCounts,
      isFetching,
      publishableFeeds,
      signs,
      setVisibilityFilter,
      visibilityFilter
    } = this.props

    const sortedSigns = signs.sort((a, b) => {
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
              onChange={this._onSearchChange}
              defaultValue={visibilityFilter.searchText} />
          </FormGroup>
        </Row>
        <Row>
          <ButtonGroup justified>
            {FILTERS.map(f => (
              <OptionButton
                active={visibilityFilter.filter === f}
                onClick={setVisibilityFilter}
                value={f}
                key={f}>
                {toSentenceCase(f)} <Badge style={{backgroundColor: '#babec0'}}>{filterCounts[f]}</Badge>
              </OptionButton>
            ))}
          </ButtonGroup>
          <div className='form-group'>&nbsp;</div>
        </Row>
        <Row>
          {isFetching
            ? <p className='text-center'><Icon className='fa-5x fa-spin' type='refresh' /></p>
            : sortedSigns.length
              ? sortedSigns.map((sign) => (
                <SignPreview
                  deleteSign={deleteSign}
                  editSign={editSign}
                  editableFeeds={editableFeeds}
                  key={sign.id}
                  publishableFeeds={publishableFeeds}
                  sign={sign} />
              ))
              : <p className='lead text-center'>No signs found.</p>
          }
        </Row>
      </div>
    )
  }
}
