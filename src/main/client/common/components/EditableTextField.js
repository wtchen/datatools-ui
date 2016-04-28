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
    // console.log(this.refs.editableContainer)
    this.setState({
      isEditing: false
    })
    // this.refs.editableContainer.focus()
  }
  handleKeyDown (e) {
    // if [Enter] or [Tab] is pressed
    if ((e.keyCode == 9 || e.keyCode == 13) && this.state.isEditing) {
      this.save()
    }
  }
  handleKeyUp (e) {
    if (e.keyCode == 27) {
      this.cancel()
    }
  }

  render () {
    var iconStyle = {
      cursor: 'pointer'
    }

    const saveIcon = <Button
      onClick={() => this.save()}
    >
    <Glyphicon
      glyph='ok'
      style={iconStyle}
    />
    </Button> //feed.name.length > 11 ? feed.name.substr(0, 11) + '...' : feed.name
    const displayValue = this.props.maxLength !== null && this.state.value && this.state.value.length > this.props.maxLength
          ? this.state.value.substr(0, this.props.maxLength) + '...'
          : this.state.value
    return (
      <div
        ref='editableContainer'
      >
        {this.state.isEditing
          ? <span>
              <Input
                ref='input'
                type={this.props.type ? this.props.type.toLowerCase() : 'text'}
                min={this.props.min ? this.props.min : null}
                step={this.props.step ? this.props.step : null}
                placeholder={this.props.placeholder ? this.props.placeholder : ''}
                autoFocus='true'
                onKeyUp={(e) => this.handleKeyUp(e)}
                onKeyDown={(e) => this.handleKeyDown(e)}
                onFocus={(e) => e.target.select()}
                onBlur={(e) => this.cancel()}
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
                ref='editButton'
                tabIndex={this.props.tabIndex ? this.props.tabIndex : null}
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
