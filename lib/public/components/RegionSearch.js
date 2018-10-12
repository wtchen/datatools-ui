import React, { PropTypes } from 'react'
import { Glyphicon } from 'react-bootstrap'
import { shallowEqual } from 'react-pure-render'
import {Async} from 'react-select'

import MessageComponent from '../../common/components/MessageComponent'

export default class RegionSearch extends MessageComponent {
  static propTypes = {
    value: PropTypes.string
  }

  state = {
    value: this.props.value
  }

  cacheOptions (options) {
    options.forEach(o => {
      this.options[o.value] = o.feature
    })
  }

  componentWillReceiveProps (nextProps) {
    if (!shallowEqual(nextProps.value, this.props.value)) {
      this.setState({value: nextProps.value})
      this.refs.gtfsSelect.onChange()
    }
  }

  getOptions = (input) => {
    const {entities, feeds} = this.props
    const entitiesToSearch = typeof entities !== 'undefined'
      ? entities
      : ['regions', 'feeds']
    const entitySearches = []
    if (entitiesToSearch.indexOf('regions') > -1) {
      // TODO: Regions endpoint is no longer active. Remove this code entirely?
      // entitySearches.push(this.getRegions(input))
    }
    if (entitiesToSearch.indexOf('feeds') > -1) {
      // entitySearches.push(getFeeds(input))
    }
    return Promise.all(entitySearches).then((results) => {
      const regions = results[0]
      const feedOptions = feeds
        ? feeds.map(feed => ({feed, value: feed.feed_id, label: feed.name}))
        : []
      // const feeds = typeof results[1] !== 'undefined' ? results[1] : []
      const options = { options: [...regions, ...feedOptions] }
      return options
    })
  }

  // getRegions = (input) => {
  //   const url = `/api/manager/public/region`
  //   return fetch(url)
  //     .then((response) => {
  //       return response.json()
  //     })
  //     .then((regions) => {
  //       const regionOptions = regions !== null && regions.length > 0 ? regions.map(region => ({region, value: region.id, label: `${region.name}`})) : []
  //       return regionOptions
  //     })
  //     .catch((error) => {
  //       console.log(error)
  //       return []
  //     })
  // }

  renderOption (option) {
    return (
      <span style={{ color: 'black' }}>
        {option.region
          ? <Glyphicon glyph='globe' />
          : <Glyphicon glyph='option-horizontal' />
        } {option.label} {option.link}
      </span>
    )
  }

  onChange = (value) => {
    this.setState({value})
    this.props.onChange && this.props.onChange(value)
  }

  onFocus = (input) => {
    // clear options to onFocus to ensure only valid route/stop combinations are selected
    this.refs.gtfsSelect.loadOptions('')
  }

  render () {
    // console.log('render search feeds', this.props.feeds)
    const placeholder = this.messages('placeholder')
    return (
      <Async
        ref='gtfsSelect'
        cache={false}
        style={{marginBottom: '20px'}}
        onFocus={this.onFocus}
        filterOptions
        minimumInput={this.props.minimumInput !== null ? this.props.minimumInput : 1}
        clearable={this.props.clearable}
        placeholder={this.props.placeholder || placeholder}
        loadOptions={this.getOptions}
        value={this.state.value}
        optionRenderer={this.renderOption}
        onChange={this.onChange} />
    )
  }
}
