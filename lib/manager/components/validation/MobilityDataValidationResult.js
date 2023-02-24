import React from 'react'
import { ListGroupItem } from 'react-bootstrap'
import rules from './rules.json'

const MobilityDataValidationResult = (props) => {
    const { notice } = props
    const rule = rules.find(rd => rd.rule === notice.code)

    return <ListGroupItem><h4>{notice.code}</h4><p>{rule.description}</p></ListGroupItem>
}

export default MobilityDataValidationResult