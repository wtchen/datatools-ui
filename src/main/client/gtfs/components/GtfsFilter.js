import React from 'react'

import { Panel, Button, DropdownButton, MenuItem, Badge, Glyphicon, Label } from 'react-bootstrap'

export default class GtfsFilter extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
    var badgeStyle = {
      color: '#000',
      backgroundColor: '#ddd'
    }

    var removeIconStyle = {
      color: 'red',
      cursor: 'pointer'
    }

    var buttonRowStyle = {
      marginTop: '15px',
      textAlign: 'center'
    }

    var buttonMinimalStyle = {
      marginTop: '10px',
      marginBottom: '5px',
      textAlign: 'right'
    }

    var compare = function(a, b) {
      var aName = a.shortName || a.name
      var bName = b.shortName || b.name
      if(aName < bName) return -1
      if(aName > bName) return 1
      return 0
    }

    var activeFeeds = this.props.activeFeeds.sort(compare)
    var nonActiveFeeds = this.props.allFeeds.filter((feed) => {
      return (activeFeeds.indexOf(feed) === -1)
    }).sort(compare)

    var feedLookup = {}
    for(var f of this.props.allFeeds) feedLookup[f.id] = f
    return (
        <div style={buttonMinimalStyle}>
          <DropdownButton
            bsStyle='default'
            bsSize='small'
            title={activeFeeds.length === 0 ? 'No feeds selected'
              : activeFeeds.length < 3 ? `Searching ${activeFeeds.map(feed => feed.name.length > 11 ? feed.name.substr(0, 11) + '...' : feed.name).join(' and ')}`
              : `Searching ${activeFeeds.length} feeds`}
            alt={activeFeeds.join(', ')}
            onSelect={(evt, eventKey) => {
              let feed = feedLookup[eventKey]
              activeFeeds.indexOf(feed) === -1 ? this.props.onAddFeed(feed) : this.props.onRemoveFeed(feed)
            }}
          >
            {this.props.allFeeds.map((feed) => {
              return (
                <MenuItem
                  key={feed.id}
                  eventKey={feed.id}
                  alt={feed.shortName || feed.name}
                  title={feed.shortName || feed.name}
                >
                  <span>
                    <Label bsStyle={activeFeeds.indexOf(feed) === -1 ? 'danger' : 'success'} className='pull-right'>{activeFeeds.indexOf(feed) === -1 ? 'off' : 'on'}</Label>
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
        </div>
    )
  }
}
