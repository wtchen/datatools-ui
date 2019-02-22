// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'

import {Button, ListGroupItem, ListGroup, Panel} from 'react-bootstrap'

import {getComponentMessages} from '../../common/util/config'
import FeedSourceTableRow from '../containers/FeedSourceTableRow'
import ProjectFeedListToolbar from '../containers/ProjectFeedListToolbar'
import {feedSortOptions} from '../util'

import type {Props as ContainerProps} from '../containers/FeedSourceTable'
import type {
  FeedSourceTableSortStrategiesWithOrders,
  ManagerUserState,
  ProjectFilter
} from '../../types/reducers'

type Props = ContainerProps & {
  filter: ProjectFilter,
  isFetching: boolean,
  isNotAdmin: boolean,
  sort: FeedSourceTableSortStrategiesWithOrders,
  user: ManagerUserState
}

export default class FeedSourceTable extends Component<Props> {
  messages = getComponentMessages('FeedSourceTable')

  render () {
    const {
      filter,
      isFetching,
      isNotAdmin,
      onNewFeedSourceClick,
      project,
      sort
    } = this.props
    const feedSources = project.feedSources ? project.feedSources : []
    const filteredFeedSources = feedSources
      // filter by name if needed
      .filter(feedSource => {
        // make constant so flow is happy
        const _searchText = filter.searchText
        return _searchText
          ? feedSource.name.toLowerCase().includes(
            _searchText.toLowerCase()
          )
          : true
      })
      .sort(feedSortOptions[sort])

    return (
      <Panel
        header={
          <ProjectFeedListToolbar
            onNewFeedSourceClick={onNewFeedSourceClick}
            project={project}
          />
        }
      >
        <ListGroup fill>
          {isFetching
            ? <ListGroupItem className='text-center'>
              <Icon className='fa-2x fa-spin' type='refresh' />
            </ListGroupItem>
            : feedSources.length
              ? filteredFeedSources.length
                ? filteredFeedSources.map((feedSource) => {
                  return <FeedSourceTableRow
                    key={feedSource.id || Math.random()}
                    feedSource={feedSource}
                    project={project}
                  />
                })
                : <ListGroupItem className='text-center'>
                  <h5>No feedsources match this filter</h5>
                </ListGroupItem>
              : <ListGroupItem className='text-center'>
                <Button
                  bsStyle='success'
                  data-test-id='create-first-feed-source-button'
                  disabled={isNotAdmin}
                  onClick={onNewFeedSourceClick}>
                  <Icon type='plus' /> {this.messages('createFirst')}
                </Button>
              </ListGroupItem>
          }
        </ListGroup>
      </Panel>
    )
  }
}
