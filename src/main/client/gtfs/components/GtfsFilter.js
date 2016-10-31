import React from 'react'

import { Panel, Button, DropdownButton, MenuItem, Badge, Glyphicon, Label, ButtonToolbar } from 'react-bootstrap'

export default class GtfsFilter extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    var buttonMinimalStyle = {
      marginTop: '10px',
      marginBottom: '5px',
      // textAlign: 'right'
    }

    var compare = function (a, b) {
      var aName = a.shortName || a.name
      var bName = b.shortName || b.name
      if(aName < bName) return -1
      if(aName > bName) return 1
      return 0
    }

    var activeFeeds = this.props.activeFeeds.sort(compare)
    var activeAndLoadedFeeds = this.props.activeFeeds.filter(f => f && this.props.loadedFeeds.findIndex(feed => feed.id === f.id) !== -1)
    var nonActiveFeeds = this.props.allFeeds.filter((feed) => {
      return (activeFeeds.indexOf(feed) === -1)
    }).sort(compare)

    var feedLookup = {}
    for(var f of this.props.allFeeds) feedLookup[f.id] = f
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
              let feed = feedLookup[eventKey]
              activeFeeds.indexOf(feed) === -1 ? this.props.onAddFeed(feed) : this.props.onRemoveFeed(feed)
            }}
          >
            {this.props.allFeeds.map((feed) => {
              let disabled = this.props.loadedFeeds.findIndex(f => f.id === feed.id) === -1
              return (
                <MenuItem
                  key={feed.id}
                  eventKey={feed.id}
                  alt={feed.shortName || feed.name}
                  disabled={disabled}
                  title={feed.shortName || feed.name}
                >
                  <span>
                    <Label
                      bsStyle={
                        disabled ? 'warning'
                        : activeFeeds.indexOf(feed) === -1 ? 'danger' : 'success'
                      }
                      className='pull-right'
                    >
                      {disabled ? 'pending'
                        : activeFeeds.indexOf(feed) === -1 ? 'off' : 'on'
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
            onClick={() => {activeFeeds.length > 0 ? this.props.onRemoveAllFeeds() : this.props.onAddAllFeeds()}}
          >
            {activeFeeds.length > 0 ? 'Remove All' : 'Add All'}
          </Button>
        </ButtonToolbar>
    )
  }
}
