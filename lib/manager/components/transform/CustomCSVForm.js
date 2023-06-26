// @flow

import React from 'react'
import { Button } from 'react-bootstrap'

import { getComponentMessages } from '../../../common/util/config'

type Props = {
  csvData: ?string,
  inputIsSame: boolean,
  onChangeCsvData: (SyntheticInputEvent<HTMLInputElement>) => void,
  onSaveCsvData: () => void,
  type: string
}
const CustomCSVForm = (props: Props) => {
  const { csvData, inputIsSame, onChangeCsvData, onSaveCsvData, type } = props

  const numLines = !csvData ? 0 : csvData.split(/\r*\n/).length
  const messages = getComponentMessages('CustomCSVForm')

  // Assign yaml messages based on component
  const header = type === 'ReplaceFileFromString' ? messages('addCsvData') : messages('addCustomCsvData')
  const buttonText = type === 'ReplaceFileFromString' ? messages('saveCsv') : messages('saveCsvAndFileName')

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
        value={csvData} />
    </label>
    <div style={{marginBottom: '10px'}}>
      <Button
        bsSize='xsmall'
        disabled={inputIsSame}
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
