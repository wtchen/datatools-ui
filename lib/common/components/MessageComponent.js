// @flow

import {Component} from 'react'

import {getComponentMessages} from '../util/config'

/**
 * This helper function takes advantage of react inheritance to automatically
 * create a messages property of each class instance.  This way, manually adding
 * the getComponentMessages function with the appropriate component name is no
 * longer necessary.
 */
export default class MessageComponent<P = {}, S = {}> extends Component<P, S> {
  props: P
  state: S
  messages: string => string
  constructor (props: P) {
    super(props)
    this.messages = getComponentMessages(this.constructor.name)
  }
}
