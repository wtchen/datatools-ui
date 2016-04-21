import React from 'react'
import { Map, Marker, Popup, TileLayer, FeatureGroup } from 'react-leaflet'
import { Button } from 'react-bootstrap'
// import { MarkerCluster } from './MarkerCluster2'

export default class FeedsMap extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      bounds: this.props.bounds || [[70, 130], [-70, -130]]
    }
  }
  render () {
    const mapStyle = {
      height: '500px',
      width: '100%'
    }
    let feeds = []
    const feedsArray = this.props.projects.map(p => {
      if (p.feedSources) {
        return p.feedSources.map(f => {
          feeds.push(f)
          return f
        })
      }
    })
    const getFeedLocation = (bounds) => {
      if (!bounds) return null
      let lngEast = bounds.east ? bounds.east : bounds.west // check for 0 values
      let lngWest = bounds.west ? bounds.west : bounds.east // check for 0 values
      let latNorth = bounds.north ? bounds.north : bounds.south // check for 0 values
      let latSouth = bounds.south ? bounds.south : bounds.north // check for 0 values

      // return averaged location
      return [(latNorth + latSouth) / 2, (lngWest + lngEast) / 2]
    }
    const getFeedBounds = (feeds) => {
      return feeds
        // .filter(feed => feed.latestValidation)
        .reduce((previousFeed, currentFeed) => {
          let bounds = previousFeed.latestValidation ? previousFeed.latestValidation.bounds : previousFeed
          if (currentFeed.latestValidation && currentFeed.latestValidation.bounds) {
            return {
              east: currentFeed.latestValidation.bounds.east > bounds.east ? currentFeed.latestValidation.bounds.east : bounds.east,
              west: currentFeed.latestValidation.bounds.west < bounds.west ? currentFeed.latestValidation.bounds.west : bounds.west,
              north: currentFeed.latestValidation.bounds.north > bounds.north ? currentFeed.latestValidation.bounds.north : bounds.north,
              south: currentFeed.latestValidation.bounds.south < bounds.south ? currentFeed.latestValidation.bounds.south : bounds.south
            }
          }
          else {
            return bounds
          }
        })
    }
    console.log(feeds)
    let position = [this.state.lat, this.state.lng];
    if (feeds.length === 0) {
      return (
        <Map
          ref='feedsMap'
          style={mapStyle}
          bounds={this.state.bounds}
          scrollWheelZoom={false}
        >
          <TileLayer
            url='http://api.tiles.mapbox.com/v4/conveyal.ie3o67m0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
            attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
          />
        </Map>
      )
    }

    let bounds = getFeedBounds(feeds)

    let markers = []
    // let markerCluster =
    //   <MarkerCluster
    //     markers={markers}
    //   />
    feeds.map(feed => {
      if (feed.latestValidation && feed.latestValidation.bounds) {
        markers.push(
          {
            name: feed.name,
            id: feed.id,
            position: getFeedLocation(feed.latestValidation.bounds),
            url: feed.url
          }
        )
      }
    })
    console.log(bounds)
    bounds = bounds.north ? [[bounds.north, bounds.east], [bounds.south, bounds.west]] : this.state.bounds
    console.log(bounds)
    console.log(markers)
    return (
      <Map
        ref='feedsMap'
        style={mapStyle}
        bounds={bounds}
        scrollWheelZoom={false}
      >
        <TileLayer
          url='http://api.tiles.mapbox.com/v4/conveyal.ie3o67m0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
          attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
        />
        {markers.map(m => {
          return (
            <Marker position={m.position}>
              <Popup>
                <div>
                  <h3>{m.name}</h3>
                  <p><a href={m.url}>{m.url && m.url.length > 20 ? m.url.slice(0, 20) + '...' : m.url}</a></p>
                  <Button onClick={() => this.props.onFeedClick(m.id)}>View feed</Button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </Map>
    )
  }
}
