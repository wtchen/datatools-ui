import React, {Component} from 'react'

export default class HeaderCell extends Component {
  constructor (props) {
    super(props)
    this.state = {
      active: this.props.active
    }
  }
  componentWillReceiveProps (nextProps) {
    const { active } = nextProps
    if (this.props.active !== active) {
      this.setState({active})
    }
  }
  _handleClick () {
    if (this.props.selectable) {
      this.setState({active: !this.state.active})
      this.props.onChange(!this.state.active)
    }
  }
  render () {
    const edgeDiff = 0.5
    const style = {
      backgroundColor: this.state.active ? '#A8D4BB' : '#eee',
      border: '1px solid #ddd',
      margin: `${-0.5 + edgeDiff}px`,
      padding: `${-edgeDiff}px`,
      UserSelect: 'none',
      userSelect: 'none',
      paddingTop: '6px',
      cursor: this.props.selectable ? 'pointer' : 'default',
      ...this.props.style
    }
    return (
      <div
        className='text-center small'
        title={this.props.title}
        style={style}
        onClick={() => this._handleClick()}
      >
        {this.props.label}
      </div>
    )
  }
}
