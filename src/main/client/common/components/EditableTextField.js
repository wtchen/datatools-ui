import React  from 'react'
import { Input, Glyphicon, Button } from 'react-bootstrap'
import { Link } from 'react-router'

export default class EditableTextField extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      isEditing : this.props.isEditing || false,
      value: this.props.value
    }
  }


  componentWillReceiveProps (nextProps) {
    if(this.state.value !== nextProps.value) this.setState({ value: nextProps.value })
  }

  edit () {
    this.setState({
      isEditing: true
    })
  }

  save () {
    const value = this.refs['input'].getValue()
    if (value === this.state.value) {
      this.cancel()
      return
    }
    if(this.props.onChange) {
      this.props.onChange(value)
    }

    this.setState({
      isEditing: false,
      value
    })
  }
  cancel () {
    this.setState({
      isEditing: false
    })
  }
  handleKeyUp (e) {
    // if [Enter] is pressed
    if (e.keyCode == 13) {
      this.save()
    }
    // if [Esc] is pressed
    if (e.keyCode == 27) {
      this.cancel()
    }
  }

  render () {
    var iconStyle = {
      cursor: 'pointer'
    }

    const saveIcon = (
      <Button
        onClick={() => this.save()}
      >
      <Glyphicon
        glyph='ok'
        style={iconStyle}
      />
      </Button> //feed.name.length > 11 ? feed.name.substr(0, 11) + '...' : feed.name
    )
    const displayValue = this.props.maxLength !== null && this.state.value && this.state.value.length > this.props.maxLength
          ? this.state.value.substr(0, this.props.maxLength) + '...'
          : this.state.value
    return (
      <div>
        {this.state.isEditing
          ? <span>
              <Input
                ref='input'
                type='text'
                autoFocus='true'
                onKeyUp={(e) => this.handleKeyUp(e)}
                onFocus={(e) => e.target.select()}
                defaultValue={ this.state.value }
                buttonAfter={saveIcon}
              />
            </span>

          : <span
              title={this.state.value}
            >
              {this.props.link
                ? <Link to={this.props.link}>{displayValue}</Link>
                : displayValue || '(none)'
              }
              &nbsp;&nbsp;
              <Button bsStyle='link'
                onClick={() => this.edit()}
                disabled={this.props.disabled !== null ? this.props.disabled : false}
              >
                <Glyphicon
                  style={iconStyle}
                  glyph={ 'pencil' }
                />
              </Button>
            </span>
        }
      </div>
    )
  }
}
