// @flow

import React from 'react'
import { shallowEqual } from 'react-pure-render'
import Select from 'react-select'
import ISO6391 from 'iso-639-1'

import MessageComponent from './MessageComponent'

type Props = {
  clearable?: boolean,
  minimumInput?: number,
  onChange?: string => void,
  placeholder?: string,
  tabIndex?: number,
  value: ?string
}

type State = {
  value: ?string
}

export default class LanguageSelect extends MessageComponent<Props, State> {
  static defaultProps = {
    minimumInput: 1
  }

  state = {
    value: this.props.value
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!shallowEqual(nextProps.value, this.props.value)) {
      this.setState({value: nextProps.value})
    }
  }

  _onChange = (value: string) => {
    const {onChange} = this.props
    this.setState({value})
    onChange && onChange(value)
  }

  _getOptions = () => ISO6391.getAllCodes().map(code => ({value: code, label: ISO6391.getName(code)}))

  render () {
    const {clearable, tabIndex, placeholder, minimumInput} = this.props
    return (
      <Select
        ref='langSelect'
        tabIndex={tabIndex}
        cache={false}
        style={{marginBottom: '20px'}}
        filterOptions
        minimumInput={minimumInput}
        clearable={clearable}
        placeholder={placeholder || this.messages('placeholder')}
        options={this._getOptions()}
        value={this.state.value}
        onChange={this._onChange} />
    )
  }
}
