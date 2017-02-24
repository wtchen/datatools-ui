import React, { Component } from 'react'
import {Icon} from '@conveyal/woonerf'
import { Button, FormGroup, ControlLabel, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap'

export default class EditSchedulePanel extends Component {
  render () {
    const { activePattern, activePatternId, feedSource, activeEntity } = this.props
    const timetableOptions = [
      <span><Icon type='table' /> Use timetables</span>,
      <span><Icon type='clock-o' /> Use frequencies</span>
    ]
    return (
      <div>
        <h4>Schedules</h4>
        <ButtonGroup>
          <DropdownButton
            onSelect={(key) => {
              const useFrequency = key !== 'timetables'
              const other = key === 'timetables' ? 'frequencies' : 'timetables'
              this.props.showConfirmModal({
                title: `Use ${key} for ${activePattern.name}?`,
                body: `Are you sure you want to use ${key} for this trip pattern? Any trips created using ${other} will be lost.`,
                onConfirm: () => {
                  console.log('use ' + key)
                  this.props.updateActiveEntity(activePattern, 'trippattern', {useFrequency})
                  this.props.saveActiveEntity('trippattern')
                }
              })
            }}
            title={activePattern.useFrequency ? timetableOptions[1] : timetableOptions[0]} id='frequency-dropdown'>
            <MenuItem eventKey={activePattern.useFrequency ? 'timetables' : 'frequencies'}>{activePattern.useFrequency ? timetableOptions[0] : timetableOptions[1]}</MenuItem>
          </DropdownButton>
        </ButtonGroup>
        <FormGroup style={{marginTop: '5px'}}>
          <ControlLabel>Direction</ControlLabel>
          <br />
          <ButtonGroup>
            <Button
              active={activePattern.patternDirection === 0}
              onClick={() => {
                const patternDirection = 0
                this.props.updateActiveEntity(activePattern, 'trippattern', {patternDirection})
                this.props.saveActiveEntity('trippattern')
              }}
            >
              Outbound (0)
            </Button>
            <Button
              active={activePattern.patternDirection === 1}
              onClick={() => {
                const patternDirection = 1
                this.props.updateActiveEntity(activePattern, 'trippattern', {patternDirection})
                this.props.saveActiveEntity('trippattern')
              }}
            >
              Inbound (1)
            </Button>
          </ButtonGroup>
        </FormGroup>
        <Button
          disabled={activePatternId === 'new' || (activePattern && activePattern.patternStops && activePattern.patternStops.length === 0)}
          block
          bsStyle='primary'
          onClick={() => {
            this.props.setActiveEntity(feedSource.id, 'route', activeEntity, 'trippattern', activePattern, 'timetable')
          }}
        >
          <Icon type='pencil' /> Edit schedules
        </Button>
      </div>
    )
  }
}
