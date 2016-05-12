import React from 'react'
import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon } from 'react-bootstrap'
import { Link, browserHistory } from 'react-router'
import { Map, Marker, Popup, TileLayer, Rectangle, GeoJson, FeatureGroup } from 'react-leaflet'

import ManagerPage  from '../../../common/components/ManagerPage'
import GtfsValidationSummary from './GtfsValidationSummary'

export default class GtfsValidationMap extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      mapHeight: '500px'
    }
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  componentDidMount () {
    window.addEventListener('resize', this.handleResize)
  }
  handleResize () {
    console.log(window.innerHeight)
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
    const bs = (
      <ManagerPage ref='page'>
        <Grid
          style={{margin: 0, padding: 0}}
        >
          <Row
            style={{margin: 0, padding: 0}}
          >
            <Col
              md={9}
              style={{margin: 0, padding: 0}}
            >
            <ValidationMap
              fetchIsochrones={this.props.fetchIsochrones}
              version={this.props.version}
            />
            </Col>
            <Col
              md={3}
              style={{margin: 0, padding: 0}}
            >
            <ValidationPanel
              version={this.props.version}
              fetchIsochrones={this.props.fetchIsochrones}
            />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
    const nonbs = (
      <ManagerPage ref='page'>

            <ValidationMap
              fetchIsochrones={this.props.fetchIsochrones}
              version={this.props.version}
            />

            <ValidationPanel
              version={this.props.version}
              fetchIsochrones={this.props.fetchIsochrones}
            />

      </ManagerPage>
    )
    return (
      <ManagerPage ref='page' noMargin={true}>
        <Grid fluid style={{margin: 0, padding: 0}}>
            <Col mdOffset={8} md={4} xs={12}>
              <ValidationPanel
                version={this.props.version}
                fetchIsochrones={this.props.fetchIsochrones}
              />
            </Col>
            <Col md={8} style={{margin: 0, padding: 0}}>
              <ValidationMap
                fetchIsochrones={this.props.fetchIsochrones}
                version={this.props.version}
                height={this.state.mapHeight}
              />
            </Col>
        </Grid>
      </ManagerPage>
    )
  }
}

class ValidationMap extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    const version = this.props.version
    const validation = version.validationResult
    let errors = {}
    validation && validation.errors.map(error => {
      if (!errors[error.file]) {
        errors[error.file] = []
      }
      errors[error.file].push(error)
    })
    const summary = version.validationSummary
    console.log(validation)
    const bounds = [[summary.bounds.north, summary.bounds.east], [summary.bounds.south, summary.bounds.west]]

    const getIsochrones = (e) => {
      console.log(e)
      const center = this.refs.validationMap.getLeafletElement().getCenter()
      console.log(center)
      this.props.fetchIsochrones(this.props.version, e.latlng.lat, e.latlng.lng, center.lat, center.lng)
    }
    const getIsochroneColor = (time) => {
      return time ? 'blue' : 'red'
    }
    // console.log(errors.stop)
    console.log(errors.route)
    const stopIssues = errors.stop ? errors.stop.map(stop => {
      // if (!stop.problemData) return null
      //
      // let s1 = stop.problemData.stop1 ? stop.problemData.stop1 : null
      let s2 = null // stop.problemData.stop2 ? stop.problemData.stop2 : null
      let s1 = stop.stop
      return (
        <FeatureGroup
          ref='stopIssues'
        >
        {s1 ?
          <Marker position={[s1.stop_lat, s1.stop_lon]}>
            <Popup>
              <div>
                <h4>{s1.stop_name}</h4>
                <p>{stop.errorType}</p>
              </div>
            </Popup>
          </Marker>
        : null}
        {s2 ?
          <Marker position={[s2.stop_lat, s2.stop_lon]}>
            <Popup>
              <div>
                <h4>{s2.stop_name}</h4>
                <p>{stop.errorType}</p>
              </div>
            </Popup>
          </Marker>
        : null}
        </FeatureGroup>
      )
    }) : null
    const mapStyle = {
      // position: 'absolute',
      // top: '50px',
      // bottom: 0,
      height: '620px',
      // height: '88%',
    }
    return (
      <Map
        ref='validationMap'
        style={mapStyle}
        bounds={bounds}
        onLeafletClick={getIsochrones}
        onLeafletLayeradd={(e) => console.log(e)}
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
        {
          version.isochrones ? version.isochrones.features.map(iso => {
            if (iso.properties.time !== 60*60) return null
            return (
              <GeoJson
                key={Math.random()}
                data={{type: 'MultiPolygon', coordinates: iso.geometry.coordinates}}
                color={'blue'}
                style={(feature) => {
                  console.log(feature)
                  return {
                    color: getIsochroneColor(iso.properties.time),
                  }
                }}
                onEachFeature={(feature, layer) => {
                  // feature.properties.time = iso.properties.time
                }}
              >

              </GeoJson>
            )
          })
          : null
        }
      </Map>
    )
  }
}

class ValidationPanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isVisible: true
    }
  }
  render () {
    const version = this.props.version

    const validation = this.props.version.validationResult
    console.log(validation)
    const dockStyle = {
      marginLeft: '20px',
      marginRight: '20px',
    }
    const panelStyle = {
      position: 'absolute',
      right: 0,
      // height: '88%',
      // width: '33%',
      backgroundColor: 'white',
    }
    return (
      <div
        style={panelStyle}
        className='pull-right'
      >
        <h2>{version.feedSource.name} Validation Results</h2>
        <Button
          bsStyle='default'
          href='#'
          onClick={(evt) => {
            this.props.fetchIsochrones(version, 33.756381, -84.388651, 33.7563, -84.3886)
          }}
        >
          Isochrones
        </Button>
        <GtfsValidationSummary
          validationResult={version.validationResult}
          version={version}
          validationResultRequested={() => { this.props.validationResultRequested(version) }}
        />
      </div>
    )
  }
}
