import React, {Component, PropTypes} from 'react'
import {Button} from 'react-bootstrap'
import {ArrowKeyStepper} from 'react-virtualized/dist/commonjs/ArrowKeyStepper'
import {AutoSizer} from 'react-virtualized/dist/commonjs/AutoSizer'
import {Grid} from 'react-virtualized/dist/commonjs/Grid'
import {ScrollSync} from 'react-virtualized/dist/commonjs/ScrollSync'
import ReactDOM from 'react-dom'
import moment from 'moment'
import update from 'react-addons-update'
import objectPath from 'object-path'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'

import HeaderCell from './HeaderCell'
import EditableCell from './EditableCell'
import Loading from '../../../common/components/Loading'
import { isTimeFormat, TIMETABLE_FORMATS } from '../../util'

export default class Timetable extends Component {
  static propTypes = {
    columns: PropTypes.array,
    data: PropTypes.array
  }

  state = {
    activeCell: null, // 'rowNum-colNum', e.g. 0-1
    edited: [],
    offsetSeconds: 0,

    // scrollsync
    columnWidth: 30,
    overscanColumnCount: 10,
    overscanRowCount: 5,
    rowHeight: 25,
    scrollToRow: this.props.scrollToRow,
    scrollToColumn: this.props.scrollToColumn
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
    return moment(date + 'T' + timeString, TIMETABLE_FORMATS).diff(date, 'seconds')
  }

  handlePastedRows (pastedRows, rowIndex, colIndex) {
    const newRows = [...this.props.data]
    const editedRows = []
    let activeRow = rowIndex
    let activeCol = colIndex
    // iterate over rows in pasted selection
    for (var i = 0; i < pastedRows.length; i++) {
      activeRow = rowIndex + i
      editedRows.push(i)

      // construct new row if it doesn't exist
      if (typeof this.props.data[i + rowIndex] === 'undefined') {
        this.props.addNewRow()
      }
      // iterate over number of this.props.columns in pasted selection
      for (var j = 0; j < pastedRows[0].length; j++) {
        activeCol = colIndex + j
        const path = `${rowIndex + i}.${this.props.columns[colIndex + j].key}`

        // // construct new row if it doesn't exist
        // if (typeof newRows[i + rowIndex] === 'undefined' || typeof objectPath.get(newRows, path) === 'undefined') {
        //   // newRows.push(this.props.constructNewRow())
        //   // this.props.addNewRow()
        // }
        const value = this.parseTime(pastedRows[i][j])
        // objectPath.set(newRows, path, value)
        this.props.updateCellValue(value, rowIndex + i, path)
        // if departure times are hidden, paste into adjacent time column
        const adjacentPath = `${rowIndex + i}.${this.props.columns[colIndex + j + 2].key}`
        if (this.props.timetable.hideDepartureTimes && isTimeFormat(this.props.columns[colIndex + j].type) && typeof objectPath.get(newRows, adjacentPath) !== 'undefined') {
          // objectPath.set(newRows, adjacentPath, value)
          this.props.updateCellValue(value, rowIndex + i, adjacentPath)
        }
      }
    }
    const stateUpdate = {
      activeCell: {$set: `${activeRow}-${activeCol}`},
      scrollToRow: {$set: activeRow},
      scrollToColumn: {$set: activeCol}
      // data: {$set: newRows},
      // edited: { $push: editedRows }
    }
    this.setState(update(this.state, stateUpdate))
  }

  _getColumnWidth = ({index}) => {
    index = this.props.timetable.hideDepartureTimes && index > 3 ? (index * 2) - 3 : index
    const col = this.props.columns[index]
    const width = col.type === 'ARRIVAL_TIME' && this.props.timetable.hideDepartureTimes
      ? col.width * 2
      : col
      ? col.width
      : 90
    return width
  }

  _getColumnHeaderWidth = ({index}) => {
    const col = this.getHeaderColumns()[index]
    const width = col.type === 'ARRIVAL_TIME' && !this.props.timetable.hideDepartureTimes
      ? col.width * 2
      : col
      ? col.width
      : 200
    return width
  }

  handleCellClick = (rowIndex, columnIndex) => {
    this.setState({scrollToColumn: columnIndex, scrollToRow: rowIndex})
  }

  cellValueInvalid (col, value, previousValue) {
    // TRUE if value is invalid
    return isTimeFormat(col.type) && value >= 0 && value < previousValue
  }
  _cellRenderer ({ columnIndex, key, rowIndex, scrollToColumn, scrollToRow, style }) {
    // adjust columnIndex for hideDepartures
    const colIndex = this.props.timetable.hideDepartureTimes && columnIndex > 3 ? (columnIndex * 2) - 3 : columnIndex
    const isFocused = colIndex === scrollToColumn && rowIndex === scrollToRow
    const isEditing = this.state.activeCell === `${rowIndex}-${colIndex}`
    const col = this.props.columns[colIndex]
    const previousCol = this.props.columns[colIndex - 1]
    const row = this.props.data[rowIndex]

    const {selected} = this.props
    const rowIsChecked =
      (selected[0] === '*' && selected.indexOf(rowIndex) === -1) ||
      (selected[0] !== '*' && selected.indexOf(rowIndex) !== -1)

    let val = objectPath.get(this.props.data[rowIndex], col.key)
    if (col.key === 'gtfsTripId' && val === null) {
      val = objectPath.get(this.props.data[rowIndex], 'id') !== 'new' ? objectPath.get(this.props.data[rowIndex], 'id') : null
    }
    const previousValue = previousCol && row && objectPath.get(row, previousCol.key)
    const isInvalid = isTimeFormat(col.type) && val >= 0 && val < previousValue && val !== null
    return (
      <EditableCell
        key={key}
        onClick={() => this.handleCellClick(rowIndex, colIndex)}
        duplicateLeft={(evt) => this.props.updateCellValue(previousValue, rowIndex, `${rowIndex}.${col.key}`)}
        handlePastedRows={(rows) => this.handlePastedRows(rows, rowIndex, colIndex, this.props.columns)}
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

          // set departure time value equal to arrival time if departure times are hidden
          const nextCol = this.props.timetable.columns[colIndex + 1]
          if (this.props.timetable.hideDepartureTimes && nextCol && nextCol.type === 'DEPARTURE_TIME') {
            this.props.updateCellValue(value, rowIndex, `${rowIndex}.${nextCol.key}`)
          }
        }} />
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

  _renderHeaderCell = ({ columnIndex, key, rowIndex, style }) => {
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

  _renderLeftHeaderCell = ({ columnIndex, key, rowIndex, style }) => {
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

  _renderLeftColumnCell = ({ columnIndex, key, rowIndex, style }) => {
    const rowSelected = this.props.selected.indexOf(rowIndex) !== -1
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
      case 8: // DELETE
        // TODO: add delete cell value
        // this.props.updateCellValue('', rowIndex, `${scrollToRow}.${col.key}`)
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
      } else if (value && value >= 86400) {
        const text = moment().startOf('day').seconds(value).format('HH:mm:ss')
        const parts = text.split(':')
        parts[0] = +parts[0] + 24
        return parts.join(':')
      } else if (value && value > 0) {
        return moment().startOf('day').seconds(value).format('HH:mm:ss')
      } else {
        return ''
      }
    }
  }
  render () {
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
            <Button
              bsStyle='success'
              onClick={(evt) => {
                evt.preventDefault()
                this.props.addNewRow()
              }}
              >
              Add new trip.
            </Button>
          </p>
        </div>
      )
    }
    const { columnWidth, overscanColumnCount, overscanRowCount, rowHeight } = this.state
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
                rowCount={this.props.data.length}>
                {({ onSectionRendered, scrollToColumn, scrollToRow }) => (
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'row'
                    }}
                    onKeyDown={(evt) => this.handleKeyPress(evt, scrollToColumn, scrollToRow)}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: 1 // ensures that top-left header cell is clickable
                      }}>
                      {/* Top Left Cell */}
                      <Grid
                        cellRenderer={this._renderLeftHeaderCell}
                        style={{outline: 'none'}}
                        width={columnWidth}
                        height={rowHeight}
                        rowHeight={rowHeight}
                        columnWidth={columnWidth}
                        rowCount={1}
                        columnCount={1} />
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
                                }}>
                                {/* Left Side Column */}
                                <Grid
                                  overscanColumnCount={overscanColumnCount}
                                  style={{overflowX: 'hidden', overflowY: 'hidden', outline: 'none'}}
                                  overscanRowCount={overscanRowCount}
                                  cellRenderer={this._renderLeftColumnCell}
                                  columnWidth={columnWidth}
                                  columnCount={1}
                                  scrollTop={scrollTop}
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
                                  style={{overflowX: 'hidden', overflowY: 'hidden', outline: 'none'}}
                                  columnWidth={this._getColumnHeaderWidth}
                                  columnCount={columnHeaderCount} // this.props.columns.length
                                  height={rowHeight}
                                  overscanColumnCount={overscanColumnCount}
                                  cellRenderer={this._renderHeaderCell}
                                  rowHeight={rowHeight}
                                  rowCount={1}
                                  scrollLeft={scrollLeft}
                                  width={width - scrollbarSize() - columnWidth} />
                              </div>
                              <div
                                style={{
                                  position: 'absolute',
                                  left: columnWidth,
                                  top: rowHeight
                                }}>
                                {/* Primary timetable grid */}
                                <Grid
                                  ref={Grid => { this.grid = Grid }}
                                  style={{outline: 'none'}}
                                  columnWidth={this._getColumnWidth}
                                  columnCount={this.props.timetable.hideDepartureTimes ? columnHeaderCount : this.props.columns.length}
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
                                  width={width - scrollbarSize() - columnWidth} />
                              </div>
                            </div>
                          )
                        }}
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
