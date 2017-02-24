import React, { PropTypes } from 'react'
import fetch from 'isomorphic-fetch'
import { Glyphicon } from 'react-bootstrap'
import { shallowEqual } from 'react-pure-render'
import Select from 'react-select'

import { getComponentMessages, getMessage } from '../../common/util/config'

export default class RegionSearch extends React.Component {
  static propTypes = {
    value: PropTypes.string
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
      // console.log()
      this.refs.gtfsSelect.onChange()
    }
  }
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
  onChange (value) {
    this.setState({value})
  }
  render () {
    // console.log('render search feeds', this.props.feeds)
    const messages = getComponentMessages('RegionSearch')
    const getRegions = (input) => {
      const url = `/api/manager/public/region`
      return fetch(url)
        .then((response) => {
          return response.json()
        })
        .then((regions) => {
          console.log(regions)
          const regionOptions = regions !== null && regions.length > 0 ? regions.map(region => ({region, value: region.id, label: `${region.name}`})) : []
          return regionOptions
        })
        .catch((error) => {
          console.log(error)
          return []
        })
    }
    const getOptions = (input) => {
      const entities = typeof this.props.entities !== 'undefined' ? this.props.entities : ['regions', 'feeds']
      const entitySearches = []
      if (entities.indexOf('regions') > -1) {
        entitySearches.push(getRegions(input))
      }
      if (entities.indexOf('feeds') > -1) {
        // entitySearches.push(getFeeds(input))
      }
      return Promise.all(entitySearches).then((results) => {
        const regions = results[0]
        const feeds = this.props.feeds ? this.props.feeds.map(feed => ({feed, value: feed.feed_id, label: feed.name})) : []
        console.log('feeds', feeds, this.props.feeds)
         // const feeds = typeof results[1] !== 'undefined' ? results[1] : []
        const options = { options: [...regions, ...feeds] }
        return options
      })
    }
    const handleChange = (input) => {
      this.onChange(input)
      this.props.onChange(input)
    }

    const onFocus = (input) => {
      // clear options to onFocus to ensure only valid route/stop combinations are selected
      this.refs.gtfsSelect.loadOptions('')
    }

    const placeholder = getMessage(messages, 'placeholder')
    return (
      <Select.Async
        ref='gtfsSelect'
        cache={false}
        style={{marginBottom: '20px'}}
        onFocus={onFocus}
        filterOptions
        minimumInput={this.props.minimumInput !== null ? this.props.minimumInput : 1}
        clearable={this.props.clearable}
        placeholder={this.props.placeholder || placeholder}
        loadOptions={getOptions}
        value={this.state.value}
        optionRenderer={this.renderOption}
        onChange={handleChange} />
    )
  }
}
