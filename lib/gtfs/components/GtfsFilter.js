import React from 'react'
import { Button, DropdownButton, MenuItem, Label, ButtonToolbar } from 'react-bootstrap'

export default class GtfsFilter extends React.Component {
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  render () {
    const {
      activeFeeds,
      loadedFeeds,
      allFeeds,
      onAddFeed,
      onRemoveFeed,
      onRemoveAllFeeds,
      onAddAllFeeds
    } = this.props
    const buttonMinimalStyle = {
      marginTop: '10px',
      marginBottom: '5px'
    }
    var activeAndLoadedFeeds = activeFeeds.filter(f => f && loadedFeeds.findIndex(feed => feed.id === f.id) !== -1)

    var feedLookup = {}
    for (const f of allFeeds) feedLookup[f.id] = f
    return (
      <ButtonToolbar className='pull-right' style={buttonMinimalStyle}>
        <DropdownButton
          bsStyle='default'
          bsSize='small'
          id='gtfs-feed-filter'
          title={activeAndLoadedFeeds.length === 0 ? 'No feeds selected'
            : activeAndLoadedFeeds.length < 3 ? `Searching ${activeAndLoadedFeeds.map(feed => feed.name.length > 11 ? feed.name.substr(0, 11) + '...' : feed.name).join(' and ')}`
            : `Searching ${activeAndLoadedFeeds.length} feeds`}
          alt={activeAndLoadedFeeds.join(', ')}
          onSelect={eventKey => {
            const feed = feedLookup[eventKey]
            activeFeeds.indexOf(feed) === -1 ? onAddFeed(feed) : onRemoveFeed(feed)
          }}
        >
          {allFeeds.map((feed) => {
            const isPublished = feed.publishedVersionId !== null
            const disabled = loadedFeeds.findIndex(f => f.id === feed.id) === -1
            return (
              <MenuItem
                key={feed.id}
                style={{width: '200px'}}
                eventKey={feed.id}
                alt={feed.shortName || feed.name}
                disabled={disabled}
                title={feed.shortName || feed.name}
              >
                <span>
                  <Label
                    bsStyle={disabled && isPublished
                      ? 'warning'
                      : disabled
                      ? 'danger'
                      : activeFeeds.indexOf(feed) === -1
                      ? 'danger'
                      : 'success'
                    }
                    className='pull-right'
                  >
                    {disabled && isPublished
                      ? 'pending'
                      : disabled
                      ? 'unpublished'
                      : activeFeeds.indexOf(feed) === -1
                      ? 'off'
                      : 'on'
                    }
                  </Label>
                  <span>{feed.shortName || feed.name.length > 11 ? feed.name.substr(0, 11) + '...' : feed.name}</span>
                </span>
              </MenuItem>
            )
          })}
        </DropdownButton>
        <Button
          bsSize='small'
          onClick={() => {
            activeFeeds.length > 0
            ? onRemoveAllFeeds()
            : onAddAllFeeds()
          }}
        >
          {activeFeeds.length > 0 ? 'Remove All' : 'Add All'}
        </Button>
      </ButtonToolbar>
    )
  }
}
