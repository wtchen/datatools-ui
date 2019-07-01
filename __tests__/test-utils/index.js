// @flow

export function expectArrayToMatchContents (actual: any, expected: Array<any>) {
  expect(actual).toHaveLength(expected.length)
  expect(actual).toEqual(expect.arrayContaining(expected))
}
