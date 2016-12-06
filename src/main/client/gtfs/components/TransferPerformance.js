import React, {Component} from 'react'
import { ControlLabel, FormControl } from 'react-bootstrap'
import moment from 'moment'

export default class TransferPerformance extends Component {
  renderTransferPerformanceResult (transferPerformance) {
    if (!transferPerformance) {
      return <p>No transfers found</p>
    }
    return (
      <ul className='list-unstyled' style={{marginTop: '5px'}}>
        <li><strong>Typical case: {moment.duration(transferPerformance.typicalCase, 'seconds').humanize()}</strong></li>
        <li>Best case: {moment.duration(transferPerformance.bestCase, 'seconds').humanize()}</li>
        <li>Worst case: {moment.duration(transferPerformance.worstCase, 'seconds').humanize()}</li>
      </ul>
    )
  }
  render () {
    const { stop } = this.props
    return stop.transferPerformance && stop.transferPerformance.length
      ? <div>
        <ControlLabel>Transfer performance</ControlLabel>
        <FormControl
          componentClass='select'
          defaultValue={0}
          onChange={(evt) => {
            let state = {}
            state[stop.stop_id] = +evt.target.value
            this.setState(state)
          }}
        >
          {stop.transferPerformance
            // .sort((a, b) => {
            //
            // })
            .map((summary, index) => {
              const fromRoute = this.props.routes.find(r => r.route_id === summary.fromRoute)
              const toRoute = this.props.routes.find(r => r.route_id === summary.toRoute)
              return <option value={index}>{fromRoute.route_short_name} to {toRoute.route_short_name}</option>
            })
          }
        </FormControl>
        {this.renderTransferPerformanceResult(stop.transferPerformance[this.state[stop.stop_id] || 0])}
      </div>
      : <p>No transfers found</p>
  }
}
