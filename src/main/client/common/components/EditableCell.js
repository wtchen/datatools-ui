import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'

export default class EditableCell extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEditing: false,
      isFocused: false,
      data: ''
    }
  }
  componentWillMount () {
    this.setState({
      isEditing: this.props.isEditing,
      edited: false,
      isFocused: this.props.isFocused,
      data: this.props.data,
      originalData: this.props.data
    })
  }
  componentWillReceiveProps (nextProps) {
    if (this.state.data !== nextProps.data) {
      this.setState({
        data: nextProps.data,
        // edited: true
        // originalData: nextProps.data
      })
    }
    if (this.state.isEditing !== nextProps.isEditing) this.setState({isEditing: nextProps.isEditing})
    if (this.state.isFocused !== nextProps.isFocused) this.setState({isFocused: nextProps.isFocused})
  }
  cancel () {
    this.setState({
      isEditing: false,
      isFocused: false,
      data: this.props.data
    })
  }
  handleClick (evt) {
    // if (this.state.isFocused)
      this.setState({isEditing: true})
      let input = ReactDOM.findDOMNode(this.refs.cellInput)
      if (input) {
        input.select()
      }
    // else {
      // this.setState({isFocused: true})
    // }
  }
  handleDoubleClick (evt) {
    // this.setState({isEditing: true, isFocused: false})
  }
  handleKeyDown (evt) {
    let input = ReactDOM.findDOMNode(this.refs.cellInput)
    // console.log(input.selectionStart)
    // console.log(input.value.length)
    // if (evt.keyCode >= 65 && evt.keyCode <= 90) {
    //   evt.preventDefault()
    //   return false
    // }
    switch (evt.keyCode) {
      case 88: // x
        if (this.props.renderTime) {
          evt.preventDefault()
          this.props.onRowSelect(evt)
          break
        }
        else {
          return true
        }
      case 79: // o
        if (this.props.renderTime) {
          evt.preventDefault()
          this.props.onRowSelect(evt)
          break
        }
        else {
          return true
        }
      case 222: // single quote
        if (evt.shiftKey){
          console.log('dupe left')
          this.props.duplicateLeft(evt)
          this.props.onRight(evt)
          return false
        }
      case 13: // Enter
        evt.preventDefault()
        // handle shift
        if (evt.shiftKey){
          this.save(evt)
          this.props.onUp(evt)
        }
        else {
          this.save(evt)
          this.props.onDown(evt)
        }
        break
      case 9: // Tab
        evt.preventDefault()
        // handle shift
        if (evt.shiftKey){
          this.save(evt)
          this.props.onLeft(evt)
        }
        else {
          this.save(evt)
          this.props.onRight(evt)
        }
        break
      case 27: // Esc
        this.cancel()
        break
      case 39: // right
        if (input.selectionStart === input.value.length) {
          this.save(evt)
          this.props.onRight(evt)
          break
        }
        else {
          return true
        }
      case 37: // left
        if (input.selectionStart === 0) {
          this.save(evt)
          this.props.onLeft(evt)
          break
        }
        else {
          return true
        }
      case 38: // up
        this.save(evt)
        this.props.onUp(evt)
        break
      case 40: // down
        this.save(evt)
        this.props.onDown(evt)
        break
      default:
        return true
    }
  }
  save () {
    if (!this.props.renderTime) {
      console.log(this.state.data)
      if (this.state.data !== this.state.originalData) {
        console.log('saving data... ' + this.state.data)
        this.setState({isEditing: false})
        this.props.onChange(this.state.data)
      }
      else {
        this.cancel()
      }
    }
    else {
      console.log('render time' + this.state.data)
      let date = moment().startOf('day').format('YYYY-MM-DD')
      let momentTime = moment(date + 'T' + this.state.data, ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTh:mm:ss a', 'YYYY-MM-DDTh:mm a'], true)
      let value = momentTime.diff(date, 'seconds')

      // check for valid time and new value
      if (momentTime.isValid() && value !== this.state.data) {
        console.log('saving data... ' + value)
        this.setState({data: value, isEditing: false})
        this.props.onChange(value)
      }
      else {
        this.cancel()
      }
    }
  }
  cellRenderer (value) {
    if (this.props.cellRenderer) {
      return this.props.cellRenderer(value)
    }
    else {
      return value
    }
  }
  handleChange (evt) {
    this.setState({data: evt.target.value})
  }
  handlePaste (evt) {
    let text = evt.clipboardData.getData('Text')
    let rows = text.split(String.fromCharCode(13));

    for (var i = 0; i < rows.length; i++) {
    	rows[i] = rows[i].split(String.fromCharCode(9))
    }


    if (rows.length > 1 || rows[0].length > 1) {
      this.cancel()
      this.props.handlePastedRows(rows)
      evt.preventDefault()
    }
  }
  render () {
      var cellHtml
      var cellStyle = {
        fontWeight: this.state.edited ? 'bold' : 'normal'
      }
      if (this.state.isEditing) {
        cellHtml = (
        <input
          type='text'
          ref='cellInput'
          defaultValue={this.cellRenderer(this.state.data)}
          placeholder={this.props.placeholder || ''}
          onPaste={(evt) => this.handlePaste(evt)}
          style={{
            width: '100%',
            height: '100%'
          }}
          autoFocus='true'
          onKeyDown={(evt) => this.handleKeyDown(evt)}
          onChange={(evt) => this.handleChange(evt)}
          onBlur={(evt) => this.cancel(evt)}
        />
      )
      }
      else {
        cellHtml =
        <div
          style={{
            height: '100%',
            padding: 0,
            display: 'inline-block',
            ...this.props.style,
            ...cellStyle
          }}
        >
          {this.cellRenderer(this.state.data)}
        </div>
      }
      return (
        <td
          className='editable-cell small'
          style={{
            margin: 0,
            padding: 0,
            whiteSpace: 'nowrap',
            backgroundColor: this.props.invalidData ? 'pink' : 'white',
            border: '1px solid #ddd',
            ...this.props.style
          }}
          onClick={(evt) => {
            this.handleClick(evt)
          }}
        >
          {cellHtml}
        </td>
      )
  }
}
