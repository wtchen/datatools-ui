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

const initialState = {endTime: 0, error: '', startTime: 0, headway: 0}

const TripSeriesModal = (props: Props) => {
  const [{endTime, error, headway, startTime}, setState] = useState(initialState)
  const messages = getComponentMessages('TripSeriesModal')

  const close = () => {
    const {onClose} = props
    // Reset component state to default on close
    setState({...initialState})
    onClose()
  }

  const onClickGenerate = () => {
    const {addNewTrip, constructNewRow} = props
    if (startTime && endTime && headway) {
      for (let time = startTime; time <= endTime; time += headway) {
        addNewTrip(constructNewRow(null, time))
      }
      close()
    } else {
      setState(prevState => ({...prevState, error: 'You must provide input for all fields.'}))
    }
  }

  const {Body, Footer, Header, Title} = Modal
  const {show} = props
  return (
    <Modal show={show} onHide={close}>
      <Header><Title>{messages('createTripSeriesQuestion')}</Title></Header>
      <Body>
        {messages('createTripSeriesBody')}
        <br />
        {messages('startTime')}
        <div>
          <HourMinuteInput
            onChange={(startTimeInput) => setState(prevState => ({...prevState, startTime: startTimeInput}))}
            seconds={startTime}
            standaloneInput />
        </div>
        {messages('headway')}
        <div>
          <HourMinuteInput
            onChange={(headwayInput) => setState(prevState => ({...prevState, headway: headwayInput}))}
            seconds={headway}
            standaloneInput />
        </div>
        {messages('endTime')}
        <div>
          <HourMinuteInput
            onChange={(endTimeInput) => setState(prevState => ({...prevState, endTime: endTimeInput}))}
            seconds={endTime}
            standaloneInput />
        </div>
      </Body>
      <Footer>
        {!!error && <div style={{color: 'red'}}>{error}</div> }
        <Button
          bsStyle='primary'
          onClick={onClickGenerate}
        >
          {messages('generateTrips')}
        </Button>
        <Button
          onClick={close}>
          {messages('close')}
        </Button>
      </Footer>
    </Modal>
  )
}

export default TripSeriesModal
