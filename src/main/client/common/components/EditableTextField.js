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
    if(this.props.onChange) {
      this.props.onChange(value)
    }

    this.setState({
      isEditing: false,
      value
    })
  }
  handleKeyUp (e) {
    // if [Enter] is pressed
    if (e.keyCode == 13) {
      this.save()
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
    </Button>

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

          : <span>
              {this.props.link
                ? <Link to={this.props.link}>{this.state.value}</Link>
                : this.state.value || '(none)'
              }
              &nbsp;&nbsp;
              <Button bsStyle='link'
                onClick={() => this.edit()}
              >
                <Glyphicon style={iconStyle}
                  glyph={ 'pencil' }
                />
              </Button>
            </span>
        }
      </div>
    )
  }
}
