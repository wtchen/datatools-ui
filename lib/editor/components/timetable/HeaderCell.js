import React, {Component} from 'react'

export default class HeaderCell extends Component {
  state = {
    active: this.props.active
  }

  componentWillReceiveProps (nextProps) {
    const { active } = nextProps
    if (this.state.active !== active) {
      this.setState({active})
    }
  }

  _handleClick = () => {
    const {index, selectable, onChange} = this.props
    if (selectable) {
      this.setState({active: !this.state.active})
      onChange && onChange({active: !this.state.active, rowIndex: index})
    }
  }

  _handleKeyDown = (e) => {
    if (document.activeElement === e.target && e.which === 13) {
      this._handleClick()
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
        tabIndex={0}
        title={this.props.title}
        role='button'
        style={style}
        onClick={this._handleClick}
        onKeyDown={this._handleKeyDown}>
        {this.props.label}
      </div>
    )
  }
}
