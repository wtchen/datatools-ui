// @flow
// $FlowFixMe: Flow doesn't know about useState: https://stackoverflow.com/questions/53105954/cannot-import-usestate-because-there-is-no-usestate-export-in-react-flow-with
import React, {useState} from 'react'
import {Button, Modal} from 'react-bootstrap'

import * as tripActions from '../../actions/trip'
import {getComponentMessages} from '../../../common/util/config'
import HourMinuteInput from '../HourMinuteInput'
import type {Trip} from '../../../types'

type Props = {
  addNewTrip: typeof tripActions.addNewTrip,
  constructNewRow: (trip: ?Trip, tripSeriesStartTime: number) => ?Trip,
  onClose: () => void,
  show: boolean
}

const TripSeriesModal = (props: Props) => {
  const [startTime, setStartTime] = useState(0)
  const [headway, setHeadway] = useState(0)
  const [endTime, setEndTime] = useState(0)

  const messages = getComponentMessages('TripSeriesModal')

  const onClickGenerate = () => {
    const {addNewTrip, constructNewRow, onClose} = props
    for (let time = startTime; time <= endTime; time += headway) {
      addNewTrip(constructNewRow(null, time))
    }
    onClose()
  }

  const {Body, Footer, Header, Title} = Modal
  const {onClose, show} = props
  return (
    <Modal show={show} onHide={onClose}>
      <Header><Title>{messages('createTripSeriesQuestion')}</Title></Header>
      <Body>
        {messages('createTripSeriesBody')}
        <br />
        {messages('startTime')} <div><HourMinuteInput onChange={setStartTime} seconds={startTime} /></div>
        {messages('headway')} <div><HourMinuteInput onChange={setHeadway} seconds={headway} /></div>
        {messages('endTime')} <div><HourMinuteInput onChange={setEndTime} seconds={endTime} /></div>
      </Body>
      <Footer>
        <Button
          bsStyle='primary'
          onClick={onClickGenerate}
        >
          {messages('generateTrips')}
        </Button>
        <Button
          onClick={onClose}>
          {messages('close')}
        </Button>
      </Footer>
    </Modal>
  )
}

export default TripSeriesModal
