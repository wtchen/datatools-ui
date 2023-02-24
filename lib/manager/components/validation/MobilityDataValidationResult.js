/* eslint-disable no-fallthrough */
import React from 'react'
import { ListGroupItem, Table } from 'react-bootstrap'

import rules from './rules.json'

// from https://stackoverflow.com/a/4149671
function unCamelCase (s) {
  return s
    .split(/(?=[A-Z])/)
    .join(' ')
    .toLowerCase()
}

const NoticeTable = ({ notices, headerOverides = {} }) => {
  if (notices.length === 0) return null

  const headers = Object.keys(notices[0])

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {headers.map((header) => (
            <th style={{ textTransform: 'capitalize' }}>
              {headerOverides[header] || unCamelCase(header)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {notices.map((notice) => (
          <tr>
            {headers.map((header, index) => {
              const FieldWrapper =
                                header === 'fieldValue' ? 'pre' : React.Fragment

              return (
                <td key={`${header}-${index}`}>
                  <FieldWrapper>{notice[header]}</FieldWrapper>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

// eslint-disable-next-line complexity
const renderNoticeDetail = (notice) => {
  switch (notice.code) {
    case 'too_many_rows':
      notice.csvRowNumber = notice.rowNumber
    case 'fare_transfer_rule_duration_limit_type_without_duration_limit':
    case 'fare_transfer_rule_duration_limit_without_type':
    case 'fare_transfer_rule_missing_transfer_count':
    case 'fare_transfer_rule_with_forbidden_transfer_count':
      notice.filename = 'fare_transfer_rules.txt'
    case 'empty_file':
    case 'emtpy_row':
    case 'missing_recommended_field':
    case 'missing_timepoint_column':
    case 'missing_required_file':
    case 'missing_recommended_file':
    case 'unknown_file':
      return (
        <ul>
          {notice.sampleNotices.map((notice) => (
            <li>
              {notice.filename}
              {notice.csvRowNumber && `: row ${notice.csvRowNumber}`}
            </li>
          ))}
        </ul>
      )
    default:
      return (
        <details open={notice.sampleNotices.length < 15}>
          <summary>View List</summary>
          <NoticeTable notices={notice.sampleNotices} />
        </details>
      )
  }
}

const MobilityDataValidationResult = (props) => {
  const { notice } = props
  const rule = rules.find((rd) => rd.rule === notice.code)

  if (!rule) return null
  return (
    <ListGroupItem style={{ overflow: 'scroll' }}>
      <h4 style={{ textTransform: 'capitalize' }}>
        {notice.code.replaceAll('_', ' ').toLowerCase()}
      </h4>
      <p>{rule.description}</p>
      {renderNoticeDetail(notice)}
    </ListGroupItem>
  )
}

export default MobilityDataValidationResult
