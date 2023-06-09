// @flow

import React from 'react'
import { Button } from 'react-bootstrap'

import { getComponentMessages } from '../../../common/util/config'

type Props = {
  csvData: ?string,
  inputIsUnchanged: boolean,
  onChangeCsvData: () => void,
  onSaveCsvData: () => void,
  type: string
}
const CustomCSVForm = (props: Props) => {
  const { csvData, inputIsUnchanged, onChangeCsvData, onSaveCsvData, type } = props

  const textValue = csvData || ''
  const numLines = !textValue ? 0 : textValue.split(/\r*\n/).length
  const messages = getComponentMessages('CustomCSVForm')

  // Assign yaml messages based on component
  let header, buttonText
  if (type === 'ReplaceFileFromString') {
    header = messages('addCsvData')
    buttonText = messages('saveCsv')
  } else if (type === 'AddCustomFile') {
    header = messages('addCustomCsvData')
    buttonText = messages('saveCsvAndFileName')
  }

  return <div>
    <label
      htmlFor='csvData'
      style={{
        display: 'flex',
        justifyContent: 'space-evenly',
        flexDirection: 'column'
      }}
    >
      {header}
      <textarea
        id='csvData'
        onChange={onChangeCsvData}
        placeholder={
          `stop_id,stop_code,stop_name,stop_lat,stop_lon\n1234567,188390987,Broad Ave,33.98768,-87.72686`
        }
        style={{
          fontFamily: 'monospace',
          fontSize: 'x-small',
          height: '80px',
          overflow: 'auto',
          whiteSpace: 'pre',
          width: '400px'
        }}
        value={textValue} />
    </label>
    <div style={{marginBottom: '10px'}}>
      <Button
        bsSize='xsmall'
        disabled={inputIsUnchanged}
        onClick={onSaveCsvData}
        style={{marginRight: '5px'}}
      >
        {buttonText}
      </Button>
      <small>{messages('numLines').replace('%numLines%', numLines.toString())}</small>
    </div>
  </div>
}

export default CustomCSVForm
