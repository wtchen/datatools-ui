const circleMarker = (
  <CircleMarker
    center={this.state.editFinished === stop.id || (this.state.editStop === stop.id && this.state.editStopLatLng) ? this.state.editStopLatLng : stopLatLng}
    fillOpacity={1.0}
    radius={4}
    ref={stop.id}
    key={`${stop.id}`}
    color={color}
    onDblClick={(e) => {
      this.setState({editStop: null, editFinished: null, editStopLatLng: null})

      // reset latlng
      this.refs[stop.id].leafletElement.setLatLng(stopLatLng)

      // set active entity
      this.props.setActiveEntity(this.props.feedSource.id, 'stop', stop)
    }}
    onClick={(e) => {
      document.removeEventListener('keydown', escapeListener, false)
      // if editing of this stop just finished, open popup
      if (this.state.editFinished === stop.id) {
        console.log('begin editing again?')
        // set current location
        this.refs[stop.id].leafletElement.setLatLng(e.latlng)
        this.setState({editStop: stop.id, editFinished: null, editStopLatLng: e.latlng})
        this.refs.map.leafletElement
          .on('mousemove', (e) => {
            this.refs[stop.id].leafletElement.setLatLng(e.latlng)
          })
        document.addEventListener('keydown', escapeListener, false)
      }
      // click while actively editing: stop editing and fire update action
      else if (editingStop) {
        console.log('stop editing')
        this.setState({editStop: null, editFinished: stop.id, editStopLatLng: e.latlng})
        this.refs.map.leafletElement.removeEventListener('mousemove')
        document.removeEventListener('keydown', escapeListener, false)
        const precision = 100000000 // eight decimal places is accurate up to 1.1 meters
        this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, {stop_lat: Math.round(e.latlng.lat * precision) / precision, stop_lon: Math.round(e.latlng.lng * precision) / precision})
      }
      // if active stop, begin editing
      else if (isActive) {
        this.setState({editStop: stop.id})
        this.refs.map.leafletElement
          .on('mousemove', (e) => {
            this.refs[stop.id].leafletElement.setLatLng(e.latlng)
          })
        document.addEventListener('keydown', escapeListener, false)
      }
      // else, set as active stop
      else {
        console.log('resetting active stop')
        this.resetMap()

        // set active entity
        this.props.setActiveEntity(this.props.feedSource.id, 'stop', stop)
      }
    }}
  >
    {this.state.editFinished === stop.id
      ? null
      : null
    }
  </CircleMarker>
)
