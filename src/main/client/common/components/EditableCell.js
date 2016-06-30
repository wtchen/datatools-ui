import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import ContentEditable from 'react-contenteditable'
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
      isFocused: this.props.isFocused,
      data: this.props.data,
      originalData: this.props.data
    })
  }
  componentWillReceiveProps (nextProps) {
    if (this.state.data !== nextProps.data) this.setState({ data: nextProps.data })
    if (this.state.isEditing !== nextProps.isEditing) this.setState({isEditing: nextProps.isEditing})
    if (this.state.isFocused !== nextProps.isFocused) this.setState({isFocused: nextProps.isFocused})
  }
  cancel () {
    this.setState({
      isEditing: false,
      isFocused: false,
      data: this.state.originalData
    })
  }
  handleClick (evt) {
    // if (this.state.isFocused)
      this.setState({isEditing: true})
    // else {
      // this.setState({isFocused: true})
    // }
  }
  handleDoubleClick (evt) {
    // this.setState({isEditing: true, isFocused: false})
  }
  handleKeyDown (evt) {
    console.log(evt.keyCode)
    switch (evt.keyCode) {
      case 13: // Enter
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
      // case 39: // right
      //   if (this.props.onRight(evt))
      //     this.cancel()
      //   return true
      // case 37: // left
      //   if (this.props.onLeft(evt))
      //     this.cancel()
      //   return true
      case 38: // up
        this.save(evt)
        this.props.onUp(evt)
        // if () {
        //
        // }
        break
      case 40: // down
        this.save(evt)
        this.props.onDown(evt)
        break
      default:
        return true
    }
  }
  save (evt) {
    // this.setState({data: evt.target.value, isEditing: false})
    // this.props.onChange(evt.target.value)

    if (!this.props.renderTime) {
      // console.log(evt.target.value)
      // console.log(this.state.data)
      // if (evt.target.value !== this.state.originalData) {
        this.setState({data: evt.target.value, isEditing: false})
        this.props.onChange(evt.target.value)
      // }
      // else {
      //   this.setState({isEditing: false})
      //   console.log('no change!')
      // }
    }
    else {
      let date = moment().startOf('day').format('YYYY-MM-DD')
      let momentTime = moment(date + 'T' + evt.target.value, ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTh:mm:ss a', 'YYYY-MM-DDTh:mm a'], true)
      console.log(momentTime.isValid())
      let value = momentTime.diff(date, 'seconds')
      console.log(value)
      if (momentTime.isValid() && value !== this.cellRenderer(this.state.data)) {
        console.log('saving data... ' + value)
        this.setState({data: value, isEditing: false})
        this.props.onChange(value)
      }
      else {
        this.setState({isEditing: false})
        console.log('not a valid time!')
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
    console.log(evt.target.value)
    this.setState({data: evt.target.value})
    // this.props.onChange(evt.target.value)
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
        // width: '100%',
        // height: '100%',
        fontWeight: this.state.originalData !== this.state.data ? 'bold' : 'normal'
        // display: 'inline-block',
      }
      if (this.state.isEditing) {
        cellHtml = (
        <input
          type='text'
          defaultValue={this.cellRenderer(this.state.data)}
          onPaste={(evt) => this.handlePaste(evt)}
          style={{
            width: '100%',
            height: '100%',
          }}
          autoFocus='true'
          onKeyDown={(evt) => this.handleKeyDown(evt)}
          onChange={(evt) => this.handleChange(evt)}
          onBlur={(evt) => this.save(evt)}
          // className='editable-cell'
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
          // tabIndex={0}
          style={{
            margin: 0,
            padding: 0,
            backgroundColor: this.props.invalidData ? 'pink' : 'white',
            border: '1px solid #ddd',
            ...this.props.style,
            // ...cellStyle
          }}
          onClick={(evt) => {
            this.handleClick(evt)
            // this.props.onClick(evt)
          }}
          // contentEditable
          // dangerouslySetInnerHTML={{__html: this.state.data}}
        >
          {cellHtml}
          {
            // <ContentEditable
            //   autoFocus='true'
            //   onPaste={(evt) => this.handlePaste(evt)}
            //   onKeyDown={(evt) => this.handleKeyDown(evt)}
            //   onChange={(evt) => this.handleChange(evt)}
            //   onFocus={(evt) => console.log(evt)}
            //   html={this.state.data} // innerHTML of the editable div
            //   disabled={false}       // use true to disable edition
            //   onChange={(evt) => this.handleChange(evt)} // handle innerHTML change
            // />
          }
        </td>
      )
  }
}
