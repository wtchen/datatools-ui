import React, {Component, PropTypes} from 'react'
import { ArrowKeyStepper, Grid, AutoSizer, ScrollSync } from 'react-virtualized'
import ReactDOM from 'react-dom'
import moment from 'moment'
import update from 'react-addons-update'
import objectPath from 'object-path'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'

import EditableCell from '../../common/components/EditableCell'
import Loading from '../../common/components/Loading'
import { isTimeFormat } from '../util'

const DT_FORMATS = ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTh:mm:ss a', 'YYYY-MM-DDTh:mm a']

export default class Timetable extends Component {
  static propTypes = {
    columns: PropTypes.array,
    data: PropTypes.array
  }
  constructor (props) {
    super(props)
    this.state = {
      activeCell: null, // 'rowNum-colNum', e.g. 0-1
      edited: [],
      offsetSeconds: 0,
      data: this.props.data,
      columns: this.props.columns,

      // scrollsync
      columnWidth: 30,
      overscanColumnCount: 10,
      overscanRowCount: 5,
      rowHeight: 25,
      scrollToRow: this.props.scrollToRow,
      scrollToColumn: this.props.scrollToColumn
    }
    this._getColumnWidth = this._getColumnWidth.bind(this)
    this._getColumnHeaderWidth = this._getColumnHeaderWidth.bind(this)
    this._renderHeaderCell = this._renderHeaderCell.bind(this)
    this._renderLeftHeaderCell = this._renderLeftHeaderCell.bind(this)
    this._renderLeftColumnCell = this._renderLeftColumnCell.bind(this)
  }
  componentWillReceiveProps (nextProps) {
    // handle scrolling to new location based on props
    const { scrollToRow, scrollToColumn } = nextProps
    if (scrollToRow !== this.props.scrollToRow || scrollToColumn !== this.props.scrollToColumn) {
      this.setState({scrollToRow, scrollToColumn})
    }
  }
  shouldComponentUpdate (nextProps) {
    return true
  }
  parseTime (timeString) {
    const date = moment().startOf('day').format('YYYY-MM-DD')
    return moment(date + 'T' + timeString, DT_FORMATS).diff(date, 'seconds')
  }
  handlePastedRows (pastedRows, rowIndex, colIndex) {
    let newRows = [...this.props.data]
    let editedRows = []

    // iterate over rows in pasted selection
    for (var i = 0; i < pastedRows.length; i++) {
      editedRows.push(i)
      if (typeof this.props.data[i + rowIndex] === 'undefined') {
        console.log('adding row' + i + rowIndex)
        this.props.addNewRow()
      }
      // iterate over number of this.props.columns in pasted selection
      for (var j = 0; j < pastedRows[0].length; j++) {
        let path = `${rowIndex + i}.${this.props.columns[colIndex + j].key}`

        // construct new row if it doesn't exist
        if (typeof newRows[i + rowIndex] === 'undefined' || typeof objectPath.get(newRows, path) === 'undefined') {
          // newRows.push(this.props.constructNewRow())
          // this.props.addNewRow()
        }
        let value = this.parseTime(pastedRows[i][j])
        // objectPath.set(newRows, path, value)
        this.props.updateCellValue(value, rowIndex + i, path)
        // if departure times are hidden, paste into adjacent time column
        let adjacentPath = `${rowIndex + i}.${this.props.columns[colIndex + j + 2].key}`
        if (this.props.timetable.hideDepartureTimes && isTimeFormat(this.props.columns[colIndex + j].type) && typeof objectPath.get(newRows, adjacentPath) !== 'undefined') {
          // objectPath.set(newRows, adjacentPath, value)
          this.props.updateCellValue(value, rowIndex + i, adjacentPath)
        }
      }
    }
    let stateUpdate = {activeCell: {$set: `${rowIndex}-${colIndex}`}, data: {$set: newRows}, edited: { $push: editedRows }}
    this.setState(update(this.state, stateUpdate))
  }
  _getColumnWidth ({ index }) {
    const col = this.props.columns[index]
    const width = col ? col.width : 90
    return width
  }
  _getColumnHeaderWidth ({ index }) {
    const col = this.getHeaderColumns()[index]
    const width = col.type === 'ARRIVAL_TIME' && !this.props.timetable.hideDepartureTimes
      ? col.width * 2
      : col
      ? col.width
      : 90
    return width
  }
  handleCellClick (rowIndex, columnIndex) {
    this.setState({scrollToColumn: columnIndex, scrollToRow: rowIndex})
  }
  _cellRenderer ({ columnIndex, key, rowIndex, scrollToColumn, scrollToRow, style }) {
    const isFocused = columnIndex === scrollToColumn && rowIndex === scrollToRow
    const isEditing = this.state.activeCell === `${rowIndex}-${columnIndex}`
    const col = this.props.columns[columnIndex]
    const previousCol = this.props.columns[columnIndex - 1]
    const row = this.props.data[rowIndex]

    let rowIsChecked = this.props.selected[0] === '*' &&
      this.props.selected.indexOf(rowIndex) === -1 || this.props.selected[0] !== '*' &&
      this.props.selected.indexOf(rowIndex) !== -1

    let val = objectPath.get(this.props.data[rowIndex], col.key)
    if (col.key === 'gtfsTripId' && val === null) {
      val = objectPath.get(this.props.data[rowIndex], 'id') !== 'new' ? objectPath.get(this.props.data[rowIndex], 'id') : null
    }
    let previousValue = previousCol && row && objectPath.get(row, previousCol.key)
    const isInvalid = isTimeFormat(col.type) && val >= 0 && val < previousValue
    return (
      <EditableCell
        key={key}
        onClick={() => this.handleCellClick(rowIndex, columnIndex)}
        duplicateLeft={(evt) => this.props.updateCellValue(previousValue, rowIndex, `${rowIndex}.${col.key}`)}
        handlePastedRows={(rows) => this.handlePastedRows(rows, rowIndex, columnIndex, this.props.columns)}
        invalidData={isInvalid}
        isEditing={isEditing}
        isSelected={rowIsChecked}
        isFocused={isFocused}
        lightText={col.type === 'DEPARTURE_TIME'}
        placeholder={col.placeholder}
        renderTime={isTimeFormat(col.type)}
        cellRenderer={(value) => this.getCellRenderer(col, value)}
        data={val}
        style={style}
        onStopEditing={() => this.handleEndEditing()}
        onChange={(value) => {
          this.props.updateCellValue(value, rowIndex, `${rowIndex}.${col.key}`)
          // this.setState({activeCell: null})

          // TODO: add below back in
          // // set departure time value if departure times are hidden
          // if (this.props.timetable.hideDepartureTimes && this.props.timetable.columns[colIndex + 1] && this.props.timetable.columns[colIndex + 1].type === 'DEPARTURE_TIME') {
          //   this.updateCellValue(value, rowIndex, `${rowIndex}.${this.props.timetable.columns[columnIndex + 1].key}`)
          // }
        }}
      />
    )
  }
  getHeaderColumns () {
    return this.props.columns.filter(c => c.type !== 'DEPARTURE_TIME')
  }
  handleEndEditing () {
    this.setState({activeCell: null})
    // refocus on grid after editing is done
    ReactDOM.findDOMNode(this.grid).focus()
  }
  _renderHeaderCell ({ columnIndex, key, rowIndex, style }) {
    const col = this.getHeaderColumns()[columnIndex]
    return (
      <HeaderCell
        key={key}
        active={this.props.selected.length > 0 && this.props.selected.length === this.props.data.length} // render column headers as active if all rows selected
        title={col.title ? col.title : col.name}
        label={col.name}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          ...style
        }}
      />
    )
  }
  _renderLeftHeaderCell ({ columnIndex, key, rowIndex, style }) {
    // Select all checkbox
    return (
      <HeaderCell
        key={key}
        onChange={(value) => this.props.toggleAllRows(value)}
        style={style}
        selectable
      />
    )
  }
  _renderLeftColumnCell ({ columnIndex, key, rowIndex, style }) {
    let rowSelected = this.props.selected.indexOf(rowIndex) !== -1
    // Select row checkbox
    return (
      <HeaderCell
        active={rowSelected}
        key={key}
        index={rowIndex}
        label={rowIndex + 1}
        onChange={() => this.props.toggleRowSelection(rowIndex)}
        style={style}
        selectable
      />
    )
  }
  handleKeyPress (evt, scrollToColumn, scrollToRow) {
    switch (evt.keyCode) {
      case 13: // Enter
        if (!this.state.activeCell) {
          this.setState({activeCell: `${scrollToRow}-${scrollToColumn}`})
        } else {
          this.setState({activeCell: null})
        }
        break
      case 67:
        // handle copy
        if (evt.ctrlKey) {
          console.log('copy pasta')
        }
        return false
      default:
        break
    }
    // input was 0-9
    if (!this.state.activeCell && evt.keyCode >= 48 && evt.keyCode <= 57 && !evt.ctrlKey) {
      this.setState({activeCell: `${scrollToRow}-${scrollToColumn}`})
    }
    // input was a-z
    if (!this.state.activeCell && evt.keyCode >= 65 && evt.keyCode <= 90 && !evt.ctrlKey) {
      this.setState({activeCell: `${scrollToRow}-${scrollToColumn}`})
    }
  }
  getCellRenderer (col, value) {
    if (!isTimeFormat(col.type)) {
      return value
    } else {
      if (value === 0) {
        return moment().startOf('day').seconds(value).format('HH:mm:ss')
      } else if (value && value > 0) {
        return moment().startOf('day').seconds(value).format('HH:mm:ss')
      } else {
        return ''
      }
    }
  }
  render () {
    // console.log(this.props, this.state)
    if (this.props.columns.length === 0 && this.props.data.length === 0) {
      return (
        <div style={{marginTop: '20px'}}>
          <Loading />
        </div>
      )
    } else if (this.props.data.length === 0) {
      return (
        <div>
          <p className='text-center lead'>
            No trips for calendar.
            {' '}
            <a
              href='#'
              onClick={(evt) => {
                evt.preventDefault()
                this.props.addNewRow()
              }}
            >
              Add new trip.
            </a>
          </p>
        </div>
      )
    }
    const {
      columnWidth,
      overscanColumnCount,
      overscanRowCount,
      rowHeight
    } = this.state
    const columnHeaderCount = this.getHeaderColumns().length
    return (
      <ScrollSync>
        {({ clientHeight, clientWidth, onScroll, scrollHeight, scrollLeft, scrollTop, scrollWidth }) => {
          return (
            <div>
              <ArrowKeyStepper
                columnCount={this.props.columns.length + 1}
                mode={'cells'}
                ref='keyStepper'
                disabled={this.state.activeCell !== null}
                scrollToColumn={this.state.scrollToColumn}
                scrollToRow={this.state.scrollToRow}
                rowCount={this.props.data.length}
              >
                {({ onSectionRendered, scrollToColumn, scrollToRow }) => (
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'row'
                    }}
                    onKeyDown={(evt) => this.handleKeyPress(evt, scrollToColumn, scrollToRow)}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: 1 // ensures that top-left header cell is clickable
                      }}
                    >
                      {/* Top Left Cell */}
                      <Grid
                        cellRenderer={this._renderLeftHeaderCell}
                        style={{
                          outline: 'none'
                        }}
                        width={columnWidth}
                        height={rowHeight}
                        rowHeight={rowHeight}
                        columnWidth={columnWidth}
                        rowCount={1}
                        columnCount={1}
                      />
                    </div>
                    <div style={{width: '100%', ...this.props.style}}>
                      <AutoSizer>
                        {({ width, height }) => {
                          return (
                            <div>
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: rowHeight
                                }}
                              >
                                {/* Left Side Column */}
                                <Grid
                                  overscanColumnCount={overscanColumnCount}
                                  style={{overflowX: 'hidden', overflowY: 'hidden', outline: 'none'}}
                                  overscanRowCount={overscanRowCount}
                                  cellRenderer={this._renderLeftColumnCell}
                                  columnWidth={columnWidth}
                                  columnCount={1}
                                  scrollTop={scrollTop}
                                  className={styles.LeftSideGrid}
                                  height={height - scrollbarSize()}
                                  rowHeight={rowHeight}
                                  rowCount={this.props.data.length}
                                  width={columnWidth}
                                />
                              </div>
                              <div style={{
                                height: rowHeight,
                                position: 'absolute',
                                left: columnWidth,
                                width: width - scrollbarSize(),
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                {/* Top Header Row */}
                                <Grid
                                  // className={styles.HeaderGrid}
                                  style={{overflowX: 'hidden', overflowY: 'hidden', outline: 'none'}}
                                  columnWidth={this._getColumnHeaderWidth}
                                  columnCount={columnHeaderCount} // this.props.columns.length
                                  height={rowHeight}
                                  overscanColumnCount={overscanColumnCount}
                                  cellRenderer={this._renderHeaderCell}
                                  rowHeight={rowHeight}
                                  rowCount={1}
                                  scrollLeft={scrollLeft}
                                  width={width - scrollbarSize() - columnWidth}
                                />
                              </div>
                              <div
                                style={{
                                  position: 'absolute',
                                  left: columnWidth,
                                  top: rowHeight
                                }}
                              >
                                {/* Primary timetable grid */}
                                <Grid
                                  ref={Grid => { this.grid = Grid }}
                                  style={{
                                    outline: 'none'
                                  }}
                                  columnWidth={this._getColumnWidth}
                                  columnCount={this.props.columns.length}
                                  height={height}
                                  onScroll={onScroll}
                                  overscanColumnCount={overscanColumnCount}
                                  overscanRowCount={overscanRowCount}
                                  onSectionRendered={onSectionRendered}
                                  cellRenderer={({ columnIndex, key, rowIndex, style }) => this._cellRenderer({ columnIndex, key, rowIndex, scrollToColumn, scrollToRow, style })}
                                  rowHeight={rowHeight}
                                  rowCount={this.props.data.length}
                                  scrollToColumn={scrollToColumn}
                                  scrollToRow={scrollToRow}
                                  width={width - scrollbarSize() - columnWidth}
                                />
                              </div>
                            </div>
                        ) }}
                      </AutoSizer>
                    </div>
                  </div>
                )}
              </ArrowKeyStepper>
            </div>
          )
        }}
      </ScrollSync>
    )
  }
}

class HeaderCell extends Component {
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
