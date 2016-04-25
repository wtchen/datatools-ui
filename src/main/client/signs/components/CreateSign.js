import React from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

import { createSign } from '../actions/signs'

let CreateSign = ({ dispatch }) => {
  return (
    <Button
      bsStyle='primary'
      bsSize='large'
      onClick={() => {
        dispatch(createSign())
      }}
      className='pull-right'
    >New Configuration</Button>
  )
}

CreateSign = connect()(CreateSign)

export default CreateSign
