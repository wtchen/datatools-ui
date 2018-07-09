import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import { Form, FormControl, InputGroup, FormGroup, Button } from 'react-bootstrap'
import { Link } from 'react-router'

export default class EditableTextField extends Component {
  static propTypes = {
    rejectEmptyValue: PropTypes.bool,
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

  static defaultProps = {
    rejectEmptyValue: false,
    style: {},
    type: 'text'
  }

  state = {
    isEditing: this.props.isEditing || false,
    value: this.props.value
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.value !== nextProps.value) this.setState({ value: nextProps.value })
  }

  edit = () => this.setState({isEditing: true})

  save = () => {
    const {onChange, rejectEmptyValue} = this.props
    const value = ReactDOM.findDOMNode(this.input).value
    // Do not allow save if there is no input value.
    if (rejectEmptyValue && !value) return window.alert('Must provide a valid input.')
    // If there was no change in the value, cancel editing.
    if (value === this.state.value) return this.cancel()
    // Otherwise, call onChange function from props and store value in state.
    onChange && onChange(value)
    this.setState({
      isEditing: false,
      value
    })
  }

  cancel () {
    const {rejectEmptyValue} = this.props
    const value = ReactDOM.findDOMNode(this.input).value
    // Do not allow cancel if there is no input value
    if (rejectEmptyValue && !value) return window.alert('Must provide a valid input.')
    else this.setState({isEditing: false})
  }

  handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 9: // [Enter]
      case 13: // [Tab]
        if (this.state.isEditing) return this.save()
        break
      case 27: // [Esc]
        return this.cancel()
      default:
        break
    }
  }

  _ref = input => {
    this.input = input
    // Auto-focus on text input when input is rendered (instead of disallowed
    // autofocus prop).
    this.input && ReactDOM.findDOMNode(this.input).focus()
  }

  // select entire text string on input focus
  _onInputFocus = (e) => e.target.select()

  render () {
    const {
      disabled,
      hideEditButton,
      inline,
      link,
      maxLength,
      min,
      placeholder,
      step,
      style,
      tabIndex,
      type
    } = this.props
    const {
      isEditing,
      value
    } = this.state
    // trim length of display text to fit content
    const displayValue = maxLength !== null && value && value.length > maxLength
      ? `${value.substr(0, maxLength)}...`
      : value || '(none)'
    if (inline) {
      style.display = 'inline-block'
    }
    return (
      <div
        style={style}>
        {isEditing
          ? <Form
            inline={inline}>
            <FormGroup>
              <InputGroup>
                <FormControl
                  ref={this._ref}
                  type={type.toLowerCase()}
                  min={min}
                  step={step}
                  placeholder={placeholder}
                  onKeyDown={this.handleKeyDown}
                  onFocus={this._onInputFocus}
                  defaultValue={value} />
                <InputGroup.Button>
                  <Button
                    onClick={this.save}>
                    <Icon type='check' />
                  </Button>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
          </Form>
          : <span>
            <span title={value}>
              {link
                ? <Link to={link}>{displayValue}</Link>
                : displayValue
              }
            </span>
            {hideEditButton
              ? null
              : <Button
                bsStyle='link'
                tabIndex={tabIndex}
                onClick={this.edit}
                disabled={disabled}>
                <Icon type='pencil' />
              </Button>
            }
          </span>
        }
      </div>
    )
  }
}
