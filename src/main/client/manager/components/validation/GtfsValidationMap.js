import React from 'react'
import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'
import { Map, Marker, Popup, TileLayer, Rectangle, FeatureGroup } from 'react-leaflet'

import ManagerPage  from '../../../common/components/ManagerPage'

export default class GtfsValidationMap extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    console.log(this.props.version)

    if (!this.props.version || !this.props.version.validationResult) {
      return (
        <ManagerPage ref='page'>
          <Grid>
            <Row>
              <Col xs={12}>
              </Col>
            </Row>
          </Grid>
        </ManagerPage>
      )
    }
    return (
      <ManagerPage ref='page'>
        <ValidationMap
          version={this.props.version}
        />
      </ManagerPage>
    )
  }
}

class ValidationMap extends React.Component {

  render () {
    const validation = this.props.version.validationResult
    console.log(validation)
    const bounds = [[validation.bounds.north, validation.bounds.east], [validation.bounds.south, validation.bounds.west]]
    const stopIssues = validation.stops.invalidValues ? validation.stops.invalidValues.map(stop => {
      if (!stop.problemData) return null

      let s1 = stop.problemData.stop1 ? stop.problemData.stop1 : null
      let s2 = stop.problemData.stop2 ? stop.problemData.stop2 : null
      return (
        <FeatureGroup
          ref='stopIssues'
        >
        {s1 ?
          <Marker position={[s1.lat, s1.lon]}>
            <Popup>
              <div>
                <h4>{s1.name}</h4>
                <p>{stop.problemDescription}</p>
              </div>
            </Popup>
          </Marker>
        : null}
        {s2 ?
          <Marker position={[s2.lat, s2.lon]}>
            <Popup>
              <div>
                <h4>{s2.name}</h4>
                <p>{stop.problemDescription}</p>
              </div>
            </Popup>
          </Marker>
        : null}
        </FeatureGroup>
      )
    }) : null
    const mapStyle = {
      position: 'absolute',
      top: '50px',
      bottom: 0,
      width: '100%'
    }
    return (
      <Map
        ref='validationMap'
        style={mapStyle}
        bounds={bounds}
        scrollWheelZoom={true}
      >
        <TileLayer
          url='http://api.tiles.mapbox.com/v4/conveyal.ie3o67m0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
          attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
        />
        <div>
          <Button>Back</Button>
        </div>
        <Rectangle
          bounds={bounds}
          fillOpacity={0}
        />
        {stopIssues}
      </Map>
    )
  }
}
