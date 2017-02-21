import {Icon} from '@conveyal/woonerf'
import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import { Form, FormControl, InputGroup, FormGroup, Button } from 'react-bootstrap'
import { Link } from 'react-router'

export default class EditableTextField extends Component {

  static propTypes = {
    disabled: PropTypes.bool,
    inline: PropTypes.bool,
    hideEditButton: PropTypes.bool,
    isEditing: PropTypes.bool,
    link: PropTypes.string,
    maxLength: PropTypes.number,
    min: PropTypes.number,
    placeholder: PropTypes.string,
    step: PropTypes.number,
    tabIndex: PropTypes.number,
    type: PropTypes.string,
    value: PropTypes.string,

    onChange: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      isEditing: this.props.isEditing || false,
      value: this.props.value
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.value !== nextProps.value) this.setState({ value: nextProps.value })
  }

  edit () {
    this.setState({
      isEditing: true
    })
  }

  save () {
    const value = ReactDOM.findDOMNode(this.refs.input).value
    if (value === this.state.value) {
      this.cancel()
      return
    }
    if (this.props.onChange) {
      this.props.onChange(value)
    }
    this.setState({
      isEditing: false,
      value
    })
  }

  cancel (e) {
    this.setState({
      isEditing: false
    })
  }
  handleKeyDown (e) {
    // if [Enter] or [Tab] is pressed
    if ((e.keyCode === 9 || e.keyCode === 13) && this.state.isEditing) {
      this.save()
    }
    // if [Esc] is pressed
    if (e.keyCode === 27) {
      this.cancel()
    }
  }

  render () {
    var iconStyle = {
      cursor: 'pointer'
    }

    const saveButton = (
      <InputGroup.Button>
        <Button
          onClick={(evt) => {
            evt.preventDefault()
            this.save()
          }}>
          <Icon
            type='check'
            style={iconStyle} />
        </Button> //feed.name.length > 11 ? feed.name.substr(0, 11) + '...' : feed.name
      </InputGroup.Button>
    )
    const displayValue = this.props.maxLength !== null && this.state.value && this.state.value.length > this.props.maxLength
          ? this.state.value.substr(0, this.props.maxLength) + '...'
          : this.state.value
    const style = {
      ...this.props.style
    }
    const spanStyle = {}
    if (this.props.inline) {
      style.display = 'inline-block'
    }
    if (this.props.maxWidth) {
      spanStyle.maxWidth = this.props.maxWidth
      spanStyle.textOverflow = 'ellipsis'
      spanStyle.whiteSpace = 'nowrap'
      spanStyle.overflow = 'hidden'
    }
    return (
      <div style={style}>
        {this.state.isEditing
          ? <Form inline={this.props.inline}>
            <FormGroup>
              <InputGroup>
                <FormControl
                  ref='input'
                  type={this.props.type ? this.props.type.toLowerCase() : 'text'}
                  min={this.props.min != null ? this.props.min : null}
                  step={this.props.step != null ? this.props.step : null}
                  placeholder={this.props.placeholder ? this.props.placeholder : ''}
                  autoFocus='true'
                  onKeyDown={(e) => this.handleKeyDown(e)}
                  onFocus={(e) => e.target.select()}
                  defaultValue={this.state.value}
                />
                {saveButton}
              </InputGroup>
            </FormGroup>
          </Form>
          : <span
            title={this.state.value}
            style={spanStyle}>
            {this.props.link
              ? <Link to={this.props.link}>{displayValue}</Link>
              : displayValue || '(none)'
            }
            {this.props.hideEditButton
              ? null
              : <span>
                {'  '}
                <Button bsStyle='link'
                  ref='editButton'
                  tabIndex={this.props.tabIndex ? this.props.tabIndex : null}
                  onClick={() => this.edit()}
                  disabled={this.props.disabled !== null ? this.props.disabled : false}>
                  <Icon
                    style={iconStyle}
                    type='pencil' />
                </Button>
              </span>
            }
          </span>
        }
      </div>
    )
  }
}
