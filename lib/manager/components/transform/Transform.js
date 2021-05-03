// @flow

import type {
  Feed,
  FeedTransformationBase
} from '../../../types'

export type TransformProps<StateType> = {
  feedSource: Feed,
  index: number,
  onSave: (StateType, number) => void,
  onValidationErrors: (Array<string>) => void,
  transformation: FeedTransformationBase & StateType
}
