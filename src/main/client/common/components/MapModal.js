import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { Map, Marker, TileLayer, FeatureGroup } from 'react-leaflet'
// import { EditControl } from 'react-leaflet-draw'

import { getConfigProperty } from '../util/config'

let polyline

export default class MapModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showModal: false
    }
  }
  // componentWillReceiveProps (newProps) {
  //   if (newProps.title) {
  //     this.setState({
  //       showModal: true,
  //       title: newProps.title,
  //       body: newProps.body,
  //     })
  //   }
  // }
  close () {
    this.setState({
      showModal: false
    })
    // this.props.clearStatusModal()
  }
  open (props) {
    this.setState({
      showModal: true,
      title: props.title,
      marker: props.marker,
      bounds: props.bounds,
      rectangle: props.rectangle,
      markerSelect: props.markerSelect,
      rectangleSelect: props.rectangleSelect,
      body: props.body,
      onConfirm: props.onConfirm,
      draw: true
    })
  }
  getMap() {
    return this.refs.map
  }
  _onEditPath (e) {
    console.log('Path edited !')
  }

  _onCreate (e) {
    polyline = e.layer;
    this.setState({rectangle: e.layer})
    // To edit this polyline call : polyline.handler.enable()
    console.log('Path created !', polyline)

    this.setState({draw: false})
  }

  _onDeleted (e) {
    console.log('Path deleted !')

    if (this.refs.drawnItems.getLayers().length === 0){
        this.setState({draw: true})
    }
  }
  initializeMap() {
    if(this.mapInitialized || this.props.initialized) return
    const leafletMap = this.getMap().leafletElement
    leafletMap.invalidateSize()
    this.mapInitialized = true
  }
  ok () {
    if(this.state.markerSelect) this.state.onConfirm(this.state.marker)
    if(this.state.rectangleSelect) this.state.onConfirm(this.state.rectangle)
    else this.state.onConfirm()
    this.close()
  }

  render () {
    const bounds = this.state.bounds
      ? this.state.bounds
      : [[60, -120], [0, 120]]
    const mapStyle = {
      height: '300px',
      width: '100%'
    }
    const marker = this.state.marker ? <Marker
                      position={[this.state.marker.lat, this.state.marker.lng]}
                      key={Math.random()}
                    >
                    </Marker>
                    : null
    const clickHandler = (e) => {
      console.log(e.latlng)
      if (this.state.markerSelect) {
        this.refs.map.leafletElement.panTo(e.latlng)
        this.setState({marker: e.latlng})
      }
    }
    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header>
          <Modal.Title>{this.state.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Map
            ref='map'
            bounds={bounds}
            style={mapStyle}
            onClick={clickHandler}
          >
            <TileLayer
              url={`https://api.tiles.mapbox.com/v4/${getConfigProperty('mapbox.map_id')}/{z}/{x}/{y}.png?access_token=${getConfigProperty('mapbox.access_token')}`}
              attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
            />
            {this.state.rectangleSelect
              ? <FeatureGroup
                  ref='drawnItems'
                >
                  <EditControl
                    onEdited={(e) => this._onEditPath(e)}
                    onCreated={(e) => this._onCreate(e)}
                    onDeleted={(e) => this._onDeleted(e)}
                    position='topright'
                    draw={this.state.draw
                      ? {
                        circle: false,
                        polyline: false,
                        polygon: false,
                        marker: false
                      }
                      : {
                        circle: false,
                        polyline: false,
                        polygon: false,
                        marker: false,
                        rectangle: false
                      }
                    }
                  />
                </FeatureGroup>
              : null
            }
            {/*this.state.marker
              ? this.state.marker.map(m => {
                return (
                  <Marker
                    position={[m.lat, m.lng]}
                    key={Math.random()}
                  >
                  </Marker>
                )
              })
              : null
            */}
            {marker}
          </Map>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => this.ok()}>OK</Button>
          <Button onClick={() => this.close()}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
