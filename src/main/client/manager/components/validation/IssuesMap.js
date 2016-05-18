import React from 'react'
import { Map, Marker, Popup, TileLayer, Rectangle, GeoJson, FeatureGroup } from 'react-leaflet'

import ValidationMap from './ValidationMap'

export default class IssuesMap extends ValidationMap {

  constructor (props) {
    super(props)
  }

  getMapComponents () {
    const validation = this.props.version.validationResult

    let errors = {}

    validation && validation.errors.map(error => {
      if (!errors[error.file]) {
        errors[error.file] = []
      }
      errors[error.file].push(error)
    })

    return errors.stop ? errors.stop.map(stop => {
      let s2 = null // stop.problemData.stop2 ? stop.problemData.stop2 : null
      let s1 = stop.stop
      return (
        <FeatureGroup
          ref='stopIssues'
          key={s1.stop_id}
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
  }
}
