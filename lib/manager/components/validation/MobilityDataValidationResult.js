import React from 'react'
import { ListGroupItem } from 'react-bootstrap'

const MobilityDataValidationResult = (props) => {
    const {notice} = props

    return <ListGroupItem><h4>{notice.code}</h4></ListGroupItem>
}

export default MobilityDataValidationResult