/* globals describe, expect, it */

import nock from 'nock'

import {recalculatePatternCoordinates} from '../map'

describe('editor > util > map >', () => {
  describe('recalculatePatternCoordinates >', () => {
    const controlPoints = require('./fake-control-points.json')
    const followStreets = true
    const patternShape = require('./fake-pattern-shape.json')

    function makeTestCase ({disableNock, editType, index, mapzenResponeFile, newPoint}) {
      return async () => {
        if (!disableNock) {
          // setup nock
          nock('https://valhalla.mapzen.com')
            .get(/^\/route\?json.*/)
            .reply(200, require(mapzenResponeFile))
        }

        const coords = await recalculatePatternCoordinates(
          controlPoints,
          editType,
          index,
          followStreets,
          newPoint,
          patternShape
        )

        expect(coords.length).toBeGreaterThan(0)
        expect(coords).toMatchSnapshot()
      }
    }

    describe('inserting >', () => {
      it(
        'should insert a point before the first stop',
        makeTestCase({
          editType: 'insert',
          index: 0,
          mapzenResponeFile: './mapzen-response-1.json',
          newPoint: [-77.92553, 42.08666]
        })
      )
    })
  })
})
