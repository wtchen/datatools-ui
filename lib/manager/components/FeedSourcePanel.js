import React, {Component, PropTypes} from 'react'
import {Icon} from '@conveyal/woonerf'
import { ListGroupItem, Panel, Badge, ListGroup, FormControl, Button, ButtonGroup } from 'react-bootstrap'
import { Link } from 'react-router'

import { getComponentMessages, getMessage } from '../../common/util/config'

export default class FeedSourcePanel extends Component {
  static propTypes = {
    activeProject: PropTypes.object,
    visibilityFilter: PropTypes.object,
    searchTextChanged: PropTypes.func,
    user: PropTypes.object,
    visibilityFilterChanged: PropTypes.func
  }
  render () {
    const messages = getComponentMessages('FeedSourcePanel')
    const {
      activeProject,
      visibilityFilter,
      searchTextChanged,
      user,
      visibilityFilterChanged
    } = this.props
    const renderFeedItems = (p, fs) => {
      const feedName = `${p.name} / ${fs.name}`
      return (
        <ListGroupItem key={fs.id} bsStyle={fs.isPublic ? 'default' : 'warning'}>
          <Link title={feedName} to={`/feed/${fs.id}`}>
            <Icon className='icon-link' type={fs.isPublic ? 'database' : 'lock'} />
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              {feedName.length > 33 ? `${feedName.substr(0, 33)}...` : feedName}
            </span>
          </Link>
        </ListGroupItem>
      )
    }
    const feedVisibilityFilter = (feed) => {
      const name = feed.name || 'unnamed'
      const visible = name.toLowerCase().indexOf((visibilityFilter.searchText || '').toLowerCase()) !== -1
      switch (visibilityFilter.filter) {
        case 'ALL':
          return visible
        case 'STARRED':
          return [].indexOf(feed.id) !== -1 // check userMetaData
        case 'PUBLIC':
          return feed.isPublic
        case 'PRIVATE':
          return !feed.isPublic
        default:
          return visible
      }
      // if (feed.isCreating) return true // feeds actively being created are always visible
    }
    return (
      <Panel header={
        <h3>Feeds for {activeProject ? activeProject.name : '[choose project]'} {activeProject && activeProject.feedSources &&
          <Badge>{activeProject.feedSources.length}</Badge>
        }</h3>
      }>
        <ListGroup fill>
          <ListGroupItem>
            <FormControl
              placeholder={getMessage(messages, 'search')}
              onChange={evt => searchTextChanged(evt.target.value)}
            />
            <ButtonGroup style={{marginTop: 10}} justified>
              <Button
                active={visibilityFilter.filter === 'ALL' || !visibilityFilter.filter}
                onClick={() => visibilityFilterChanged('ALL')}
                bsSize='xsmall'
                href='#'>All</Button>
              <Button
                active={visibilityFilter.filter === 'STARRED'}
                onClick={() => visibilityFilterChanged('STARRED')}
                bsSize='xsmall'
                href='#'>Starred</Button>
              <Button
                active={visibilityFilter.filter === 'PUBLIC'}
                onClick={() => visibilityFilterChanged('PUBLIC')}
                bsSize='xsmall'
                href='#'>Public</Button>
              <Button
                active={visibilityFilter.filter === 'PRIVATE'}
                onClick={() => visibilityFilterChanged('PRIVATE')}
                bsSize='xsmall'
                href='#'>Private</Button>
            </ButtonGroup>
          </ListGroupItem>
          {activeProject && activeProject.feedSources
            ? activeProject.feedSources.filter(feedVisibilityFilter).map(fs => renderFeedItems(activeProject, fs))
            : activeProject
            ? <ListGroupItem>
              <p className='lead text-center'>
                No feeds yet.{' '}
                {user.permissions.isProjectAdmin(activeProject.id, activeProject.organizationId) && <Link to={`/project/${activeProject.id}`}>Create one.</Link>}
              </p>
            </ListGroupItem>
            : <ListGroupItem><p className='lead text-center'>Choose a project to view feeds</p></ListGroupItem>
              // projects && projects.map(p => {
              //   return p.feedSources && p.feedSources.filter(feedVisibilityFilter).map(fs => renderFeedItems(p, fs))
              // })
          }
        </ListGroup>
      </Panel>
    )
  }
}
