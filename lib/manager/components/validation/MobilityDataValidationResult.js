/* eslint-disable no-fallthrough */
import React, { useState } from 'react'
import Icon from '@conveyal/woonerf/components/icon'
import { ListGroupItem, Table } from 'react-bootstrap'

import toSentenceCase from '../../../common/util/to-sentence-case'
import {
  mobilityDataValidationErrorMapping,
  validationErrorIconLookup
} from '../../util/version'

import rules from './rules.json'

// from https://stackoverflow.com/a/4149671
function unCamelCase (s) {
  return s
    .split(/(?=[A-Z])/)
    .join(' ')
    .toLowerCase()
}

const NoticeTable = ({ headerOverides = {}, notices }) => {
  if (notices.length === 0) return null

  const headers = Object.keys(notices[0])

  return (
    <Table bordered className='table-fixed' fill hover striped>
      <thead>
        <tr>
          {headers.map((header) => (
            <th>
              {headerOverides[header] || toSentenceCase(unCamelCase(header))}
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
        <ul style={{marginTop: '-10px'}}>
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
        <NoticeTable notices={notice.sampleNotices} />
      )
  }
}

const MobilityDataValidationResult = (props) => {
  const { notice } = props
  const rule = rules.find((rd) => rd.rule === notice.code)
  if (!rule) return null

  const errorClass = `gtfs-error-${mobilityDataValidationErrorMapping[notice.severity]}`
  const [expanded, setExpanded] = useState(notice.totalNotices < 2)

  return (
    <ListGroupItem style={{ overflow: 'scroll', padding: 0 }}>
      <div style={{padding: '10px 15px'}}>
        {/* TODO: animations */}
        <h4 onClick={() => setExpanded(!expanded)} style={{cursor: 'pointer'}}>
          <span
            className={`buffer-icon ${errorClass}`}
            title={`${toSentenceCase(notice.severity)} priority`}
          >
            <Icon
              type={
                validationErrorIconLookup[mobilityDataValidationErrorMapping[notice.severity]]
              }
            />
          </span>
          {toSentenceCase(notice.code.replaceAll('_', ' ').toLowerCase())}
          <span className={errorClass}>
            {' '}
          &mdash; {notice.totalNotices} case{notice.totalNotices > 1 ? 's' : ''}{' '}
          found
          </span>
          <span className={`pull-right`}>
            <Icon type={expanded ? 'caret-up' : 'caret-down'} />
          </span>
        </h4>
        {expanded && <p>{rule.description}</p>}
      </div>
      {expanded && renderNoticeDetail(notice)}
    </ListGroupItem>
  )
}

export default MobilityDataValidationResult
