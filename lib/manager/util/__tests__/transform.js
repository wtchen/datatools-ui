// @flow
import clone from 'lodash/cloneDeep'

import {getTransformationName} from '../transform'
import {FEED_TRANSFORMATION_TYPES} from '../../../common/constants'

import type {FeedTransformation} from '../../../types'

const {REPLACE_FILE_FROM_STRING} = FEED_TRANSFORMATION_TYPES

const replaceFileTransformation: FeedTransformation = {
  '@type': REPLACE_FILE_FROM_STRING,
  active: true,
  sourceVersionId: 'abcdefg-12345.zip',
  table: null
}

const halfCompletedTransformation = clone(replaceFileTransformation)
halfCompletedTransformation.csvData = 'feed_id\n1'

const fullyCompletedTransformation = clone(halfCompletedTransformation)
fullyCompletedTransformation.table = 'feed_info'

describe('manager > util > transform >', () => {
  describe('getTransformationName >', () => {
    it('should return name for ReplaceFileFromStringTranformation', () => {
      expect(getTransformationName(REPLACE_FILE_FROM_STRING)).toMatchSnapshot()
    })

    it('should return unreplaced label for ReplaceFileFromStringTranformation', () => {
      expect(
        getTransformationName(
          REPLACE_FILE_FROM_STRING,
          replaceFileTransformation
        )
      ).toMatchSnapshot()
    })

    it('should return half-replaced label for ReplaceFileFromStringTranformation', () => {
      expect(
        getTransformationName(
          REPLACE_FILE_FROM_STRING,
          halfCompletedTransformation
        )
      ).toMatchSnapshot()
    })

    it('should return fully-replaced label for ReplaceFileFromStringTranformation', () => {
      expect(
        getTransformationName(
          REPLACE_FILE_FROM_STRING,
          fullyCompletedTransformation
        )
      ).toMatchSnapshot()
    })
  })
})
