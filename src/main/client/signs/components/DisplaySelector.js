import React, { PropTypes } from 'react'

import fetch from 'isomorphic-fetch'

import { Panel, Grid, Row, Col, Button, Glyphicon, Label } from 'react-bootstrap'

import { PureComponent, shallowEqual } from 'react-pure-render'

import { Map, Marker, Popup, TileLayer, Polyline, MapControl } from 'react-leaflet'

import Select from 'react-select'

import { getFeed, getFeedId, getDisplaysUrl } from '../../common/util/modules'

export default class DisplaySelector extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      value: this.props.value
    };
  }

  cacheOptions (options) {
    options.forEach(o => {
      this.options[o.value] = o.feature
    })
  }

  componentWillReceiveProps (nextProps) {
    if (!shallowEqual(nextProps.value, this.props.value)) {
      this.setState({value: nextProps.value})
      console.log('props received', this.state.value)
    }
  }
  renderOption (option) {
    return <span style={{ color: 'black' }}><Glyphicon glyph="modal-window" /> {option.label} {option.link}</span>
  }
  renderValue (option) {
    console.log('rendering', option)
		return <span>{option.label} <Label>{option.display.DraftDisplayConfigurationId !== null ? 'Unpublished' : 'Unassigned'}</Label></span>
	}
  onChange (value) {
    this.setState({value})
  }
  render() {
    var style = {
      marginBottom: '15px'
    }
    const handleValueClick = (val) => {
      console.log('opening modal for ' + val.id, val.display)
      let draftConfigId = val.display.DraftDisplayConfigurationId ? null : this.props.sign.id
      this.props.handleClick(val.display, draftConfigId)
      let newVal = val
      newVal.display.DraftDisplayConfigurationId = draftConfigId
      this.onChange(newVal)
    }
    const getDisplays = (input) => {
      const url = getDisplaysUrl()
      return fetch(url)
        .then((response) => {
          return response.json()
        })
        .then((displays) => {
          console.log(displays)
          const displayOptions = displays !== null && displays.length > 0 ? displays.map(display => ({display, value: display.Id, label: `${display.DisplayTitle} (${display.LocationDescription})` })) : []
          return { options: displayOptions }
        })
        .catch((error) => {
          console.log(error)
          return []
        })
    }
    const handleChange = (input) => {
      this.onChange(input)
      console.log(input)
      this.props.onChange(input)
    }

    const onFocus = (input) => {
      // clear options to onFocus to ensure only valid route/stop combinations are selected
      this.refs.displaySelect.loadOptions('')
    }

    const placeholder = ''
    return (
    <Select.Async
      ref='displaySelect'
      style={style}
      cache={false}
      onFocus={onFocus}
      multi={true}
      onValueClick={handleValueClick}
      allowCreate={true} // currently not working in v 1.0.0
      filterOptions={true}
      minimumInput={this.props.minimumInput !== null ? this.props.minimumInput : 1}
      clearable={this.props.clearable}
      placeholder={this.props.placeholder || placeholder}
      loadOptions={getDisplays}
      value={this.state.value}
      optionRenderer={this.renderOption}
      valueRenderer={this.renderValue}
      onChange={handleChange} />
    )
  }
}
