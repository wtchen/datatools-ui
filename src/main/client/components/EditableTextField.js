import React from 'react'

import { Input, Glyphicon } from 'react-bootstrap'

export default class EditableTextField extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      isEditing : false,
      value: this.props.value
    }
  }

  componentWillMount () {
  }

  edit () {
    this.setState({
      isEditing: true
    })
  }

  save () {
    const value = this.refs['input'].getValue()
    if(this.props.onChange) {
      this.props.onChange(value)
    }

    this.setState({
      isEditing: false,
      value
    })
  }

  render () {
    var iconStyle = {
      cursor: 'pointer'
    }

    const saveIcon = <Glyphicon
      glyph="ok"
      style={iconStyle}
      onClick={() => this.save()}
    />

    return (
      <div>
        {this.state.isEditing
          ? <span>
              <Input
                ref="input"
                type="text"
                defaultValue={ this.state.value }
                addonAfter={saveIcon}
              />
            </span>

          : <span>{this.state.value}&nbsp;&nbsp;
              <Glyphicon style={iconStyle}
                glyph={ "pencil" }
                onClick={() => this.edit()}
              />
            </span>
        }
      </div>
    )
  }
}
