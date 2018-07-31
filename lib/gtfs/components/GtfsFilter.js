// @flow

import React, {Component} from 'react'
import { Button, Dropdown, MenuItem, Label, ButtonToolbar } from 'react-bootstrap'

import type {Feed} from '../../types'

type Props = {
  activeFeeds: Array<Feed>,
  activeAndLoadedFeeds: Array<Feed>,
  allFeeds: Array<Feed>,
  loadedFeeds: Array<Feed>,
  onAddAllFeeds: () => void,
  onAddFeed: string => void,
  onRemoveAllFeeds: () => void,
  onRemoveFeed: string => void
}

export default class GtfsFilter extends Component<Props> {
  getFeedSummary (feeds: Array<Feed>) {
    const feedNames = feeds
      .map(feed => feed.name.length > 11
        ? feed.name.substr(0, 11) + '...'
        : feed.name
      )
      .join(' and ')
    return feeds.length === 0
      ? 'No feeds selected'
      : feeds.length < 3
        ? `Searching ${feedNames}`
        : `Searching ${feeds.length} feeds`
  }

  _onSelect = (feedId: string) => {
    const {activeFeeds, onAddFeed, onRemoveFeed} = this.props
    if (activeFeeds.some(f => f.id === feedId)) onAddFeed(feedId)
    else onRemoveFeed(feedId)
  }

  _onToggleAll = () => this.props.activeFeeds.length > 0
    ? this.props.onRemoveAllFeeds()
    : this.props.onAddAllFeeds()

  render () {
    const {
      activeFeeds,
      activeAndLoadedFeeds,
      allFeeds,
      loadedFeeds
    } = this.props
    const buttonMinimalStyle = {
      marginTop: '10px',
      marginBottom: '5px'
    }
    return (
      <ButtonToolbar
        className='pull-right'
        style={buttonMinimalStyle}>
        <Dropdown
          bsSize='small'
          disabled={allFeeds.length === 0}
          title={activeAndLoadedFeeds.map(f => f.name).join(', ')}
          onSelect={this._onSelect}
          id='gtfs-feed-filter'>
          <Dropdown.Toggle>
            {this.getFeedSummary(activeAndLoadedFeeds)}
          </Dropdown.Toggle>
          <Dropdown.Menu className='scrollable-dropdown'>
            {allFeeds.length > 0
              ? allFeeds.map(feed => {
                const isPublished = feed.publishedVersionId !== null
                // Disable item if loaded feeds does not have feed ID.
                const disabled = !loadedFeeds.some(f => f.id === feed.id)
                const feedIsInactive = !activeFeeds.some(f => f.id === feed.id)
                return (
                  <MenuItem
                    key={feed.id}
                    style={{width: '200px'}}
                    eventKey={feed.id}
                    alt={feed.shortName || feed.name}
                    disabled={disabled}
                    title={feed.shortName || feed.name}>
                    <span>
                      <Label
                        bsStyle={disabled && isPublished
                          ? 'warning'
                          : disabled
                            ? 'danger'
                            : feedIsInactive
                              ? 'danger'
                              : 'success'
                        }
                        className='pull-right'>
                        {disabled && isPublished
                          ? 'pending'
                          : disabled
                            ? 'unpublished'
                            : feedIsInactive
                              ? 'off'
                              : 'on'
                        }
                      </Label>
                      <span>
                        {feed.shortName || feed.name.length > 11
                          ? feed.name.substr(0, 11) + '...'
                          : feed.name
                        }
                      </span>
                    </span>
                  </MenuItem>
                )
              })
              : <MenuItem disabled>No feeds available</MenuItem>
            }
          </Dropdown.Menu>
        </Dropdown>
        <Button
          bsSize='small'
          disabled={allFeeds.length === 0}
          onClick={this._onToggleAll}>
          {activeFeeds.length > 0 ? 'Remove All' : 'Add All'}
        </Button>
      </ButtonToolbar>
    )
  }
}
