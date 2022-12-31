// @flow
// $FlowFixMe: Flow doesn't know about useState: https://stackoverflow.com/questions/53105954/cannot-import-usestate-because-there-is-no-usestate-export-in-react-flow-with
import React, {useState} from 'react'
import {Button, Modal} from 'react-bootstrap'

import * as tripActions from '../../actions/trip'
import {getComponentMessages} from '../../../common/util/config'
import HourMinuteInput from '../HourMinuteInput'

// TODO: fill in "any" prop types
type Props = {
  addNewTrip: typeof tripActions.addNewTrip,
  constructNewRow: any,
  onClose: any,
  show: boolean
}

const TripSeriesModal = (props: Props) => {
  const [startTime, setStartTime] = useState(0)
  const [headway, setHeadway] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [show, setShow] = useState(false)

  const messages = getComponentMessages('TripSeriesModal')

  const onClose = () => {
    setShow(false)
    props.onClose()
  }

  const onClickGenerate = () => {
    const {addNewTrip, constructNewRow} = props
    for (let time = startTime; time <= endTime; time += headway) {
      addNewTrip(constructNewRow(false, time))
    }
  }

  const { Body, Footer, Header, Title } = Modal
  return (
    // TODO: update the line below to work properly
    <Modal show={props.show || show} onHide={onClose}>
      <Header><Title>{messages('createTripSeriesQuestion')}</Title></Header>
      <Body>
        {messages('createTripSeriesBody')}
        <br />
        Start Time: <HourMinuteInput onChange={setStartTime} seconds={startTime} />
        Headway: <HourMinuteInput onChange={setHeadway} seconds={headway} />
        End Time: <HourMinuteInput onChange={setEndTime} seconds={headway} />
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
