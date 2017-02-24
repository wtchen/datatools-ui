import React, { PropTypes } from 'react'
import fetch from 'isomorphic-fetch'
import { Glyphicon, Label } from 'react-bootstrap'
import { shallowEqual } from 'react-pure-render'
import Select from 'react-select'

import { getDisplaysUrl } from '../../common/util/modules'

export default class DisplaySelector extends React.Component {
  static propTypes = {
    sign: PropTypes.object
  }
  constructor (props) {
    super(props)
    this.state = {
      value: this.props.value
    }
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
  onChange (value) {
    this.setState({value})
  }
  render () {
    if (!this.props.sign) {
      return ''
    }
    var style = {
      marginBottom: '15px'
    }
    const renderValue = (option) => {
      const combinedLabel = getDisplayStatusLabel(option.display)
      return <span>{option.label} {combinedLabel}</span>
    }
    const renderOption = (option) => {
      const combinedLabel = getDisplayStatusLabel(option.display)
      return <span style={{ color: 'black' }}><Glyphicon glyph='modal-window' /> <strong>{option.label}</strong> {option.location} {combinedLabel} {option.link}</span>
    }
    const getDisplayStatusLabel = (display) => {
      if (!display) return ''
      const displayDraftId = display.DraftDisplayConfigurationId
      const displayPublishedId = display.PublishedDisplayConfigurationId

      const label = displayPublishedId !== this.props.sign.id && displayPublishedId > 0 && displayDraftId === this.props.sign.id ? <span><Label bsStyle='warning'>Assigned here</Label><Label bsStyle='danger'>Published to {displayPublishedId}</Label></span>
            : displayPublishedId !== this.props.sign.id && displayPublishedId > 0 ? <Label bsStyle='danger'>Published to {displayPublishedId}</Label>
            : displayPublishedId !== null && displayDraftId !== null ? <span><Label bsStyle='success'>Published</Label><Label bsStyle='warning'>Assigned to {displayDraftId}</Label></span>
            : displayDraftId === null ? <Label>Unassigned</Label>
            : displayDraftId !== this.props.sign.id && displayDraftId > 0 ? <Label bsStyle='danger'>Assigned to {displayDraftId}</Label>
            : <Label bsStyle='warning'>Unpublished</Label>
      return label
    }
    const handleValueClick = (val) => {
      // Toggle value of draft/published config ID
      const pubId = val.display.PublishedDisplayConfigurationId
      const draftId = val.display.DraftDisplayConfigurationId

      // allow publishing or unpublishing to display if sign config is published AND display isn't assigned elsewhere
      if (this.props.sign.published && (pubId === null || pubId === this.props.sign.id)) {
        const newPubId = pubId ? null
                  : this.props.sign.id
        this.props.toggleConfigForDisplay(val.display, 'PUBLISHED', newPubId)
        // if (newPub)
        //   this.props.toggleConfigForDisplay(val.display, 'DRAFT', null)
      } else if (pubId === this.props.sign.id) { // else already published to this config (but config not published), you can set it to null
        this.props.toggleConfigForDisplay(val.display, 'PUBLISHED', null)
      } else { // if config is draft, you can toggle draftId
        const newDraftId = draftId ? null
                  : this.props.sign.id
        this.props.toggleConfigForDisplay(val.display, 'DRAFT', newDraftId)
      }
    }
    const filterOptions = (options, filter, values) => {
      // Filter already selected values
      const valueKeys = values.map(i => i.value)
      let filteredOptions = options.filter(option => {
        return valueKeys.indexOf(option.value) === -1
      })

      // Filter by label
      if (filter !== undefined && filter != null && filter.length > 0) {
        filteredOptions = filteredOptions.filter(option => {
          return RegExp(filter, 'ig').test(option.label)
        })
      }

      // Append Addition option
      if (filteredOptions.length === 0) {
        filteredOptions.push({
          label: <span><strong>Create display</strong>: {filter}</span>,
          value: filter,
          create: true
        })
      }

      return filteredOptions
    }
    const getDisplays = (input) => {
      const url = getDisplaysUrl()
      return fetch(url)
        .then((response) => {
          return response.json()
        })
        .then((displays) => {
          const displayOptions = displays !== null && displays.length > 0 ? displays.map(display => ({display, value: display.Id, label: display.DisplayTitle, location: display.LocationDescription})) : []
          return { options: displayOptions }
        })
        .catch((error) => {
          console.log(error)
          return []
        })
    }
    const handleChange = (input) => {
      console.log('new value', input)
      if (input.length && input[input.length - 1] && input[input.length - 1].create === true) {
        console.log('creating display!!!')
        this.props.createDisplay(input[input.length - 1].value)
        return
      }
      this.onChange(input)
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
        multi
        onValueClick={handleValueClick}
        allowCreate // currently not working in v 1.0.0
        filterOptions={filterOptions}
        minimumInput={this.props.minimumInput !== null ? this.props.minimumInput : 1}
        clearable={this.props.clearable}
        placeholder={this.props.placeholder || placeholder}
        loadOptions={getDisplays}
        value={this.state.value}
        optionRenderer={renderOption}
        valueRenderer={renderValue}
        onChange={handleChange} />
    )
  }
}
