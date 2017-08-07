/* globals describe, expect, it */

import nock from 'nock'

import {recalculateShape} from '../map'

const controlPoints = require('./fixtures/test-control-points.json')
const followStreets = true
const patternShape = require('./fixtures/test-pattern-shape.json')

describe('editor > util > map >', () => {
  describe('recalculateShape >', () => {
    function makeTestCase ({editType, index, mapzenResponeFile, newPoint}) {
      return async () => {
        // setup nock
        if (mapzenResponeFile) {
          nock('https://valhalla.mapzen.com')
            .get(/^\/route\?json.*/)
            .reply(200, require(mapzenResponeFile))
        }

        const result = await recalculateShape({
          controlPoints,
          editType,
          index,
          followStreets,
          newPoint,
          patternShape
        })

        expect(result).toMatchSnapshot()
        const {coordinates} = result
        expect(coordinates.length).toBeGreaterThan(0)
        coordinates.forEach(coord => {
          expect(coord.length).toBe(2)
          expect(Math.abs(coord[0])).toBeLessThanOrEqual(180)
          expect(Math.abs(coord[1])).toBeLessThanOrEqual(90)
        })
      }
    }

    describe('updating >', () => {
      it(
        'should update the first stop',
        makeTestCase({
          editType: 'update',
          index: 0,
          mapzenResponeFile: './fixtures/mapzen-response-update-first-stop.json',
          newPoint: [-77.92553, 42.08666]
        })
      )

      it(
        'should update the last stop',
        makeTestCase({
          editType: 'update',
          index: 4,
          mapzenResponeFile: './fixtures/mapzen-response-update-last-stop.json',
          newPoint: [-77.92262, 42.09828]
        })
      )

      it(
        'should update a point in the middle of the control points',
        makeTestCase({
          editType: 'update',
          index: 3,
          mapzenResponeFile: './fixtures/mapzen-response-update-middle-control-point.json',
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
          mapzenResponeFile: './fixtures/mapzen-response-delete-middle-control-point.json'
        })
      )
    })
  })
})
