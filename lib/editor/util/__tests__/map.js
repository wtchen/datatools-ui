/* globals describe, expect, it */

import nock from 'nock'

import {recalculatePatternCoordinates} from '../map'

const controlPoints = require('./test-control-points.json')
const followStreets = true
const patternShape = require('./test-pattern-shape.json')

describe('editor > util > map >', () => {
  describe('recalculatePatternCoordinates >', () => {
    function makeTestCase ({editType, index, mapzenResponeFile, newPoint}) {
      return async () => {
        // setup nock
        if (mapzenResponeFile) {
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

      it(
        'should insert a point after the last stop',
        makeTestCase({
          editType: 'insert',
          index: 5,
          mapzenResponeFile: './mapzen-response-2.json',
          newPoint: [-77.92262, 42.09828]
        })
      )

      it(
        'should insert a point in the middle of the control points',
        makeTestCase({
          editType: 'insert',
          index: 3,
          mapzenResponeFile: './mapzen-response-3.json',
          newPoint: [-77.92382, 42.09182]
        })
      )
    })

    describe('updating >', () => {
      it(
        'should update the first stop',
        makeTestCase({
          editType: 'update',
          index: 0,
          mapzenResponeFile: './mapzen-response-4.json',
          newPoint: [-77.92553, 42.08666]
        })
      )

      it(
        'should update the last stop',
        makeTestCase({
          editType: 'update',
          index: 4,
          mapzenResponeFile: './mapzen-response-5.json',
          newPoint: [-77.92262, 42.09828]
        })
      )

      it(
        'should update a point in the middle of the control points',
        makeTestCase({
          editType: 'update',
          index: 3,
          mapzenResponeFile: './mapzen-response-6.json',
          newPoint: [-77.92382, 42.09182]
        })
      )
    })

    describe('deleting >', () => {
      it(
        'should delete the first stop',
        makeTestCase({
          editType: 'delete',
          index: 0
        })
      )

      it(
        'should delete the last stop',
        makeTestCase({
          editType: 'delete',
          index: 4
        })
      )

      it(
        'should delete a point in the middle of the control points',
        makeTestCase({
          editType: 'delete',
          index: 3,
          mapzenResponeFile: './mapzen-response-7.json'
        })
      )
    })
  })
})
