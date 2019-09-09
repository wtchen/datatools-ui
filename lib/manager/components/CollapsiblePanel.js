// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, type Element} from 'react'
import {
  Button,
  ButtonToolbar,
  Panel,
  Form
} from 'react-bootstrap'

import FormInput from '../../common/components/FormInput'

import type {FormProps} from '../../types'

type Props = {
  children?: Element<*>,
  data: {[string]: any},
  defaultExpanded: boolean,
  fields: Array<FormProps>,
  index: number,
  onChange: (SyntheticInputEvent<HTMLInputElement>, number) => void,
  onRemove?: number => void,
  onSave?: number => any,
  saveDisabled: boolean,
  title: Element<*> | string
}

export default class CollapsiblePanel extends Component<Props> {
  static defaultProps = {
    saveDisabled: false
  }

  _onChange = (evt: SyntheticInputEvent<HTMLInputElement>) =>
    this.props.onChange(evt, this.props.index)

  _onRemove = () => this.props.onRemove && this.props.onRemove(this.props.index)

  _onSave = () => this.props.onSave && this.props.onSave(this.props.index)

  render () {
    const {fields, data, defaultExpanded, saveDisabled, title} = this.props
    return (
      <Panel
        header={<h5 style={{width: '100%', cursor: 'pointer'}}>{title}</h5>}
        defaultExpanded={defaultExpanded}
        collapsible>
        <Form>
          <ButtonToolbar className='pull-right'>
            {/* Only render save button is onSave prop is defined */}
            {typeof this.props.onSave === 'function' &&
              <Button
                bsSize='small'
                bsStyle='primary'
                disabled={saveDisabled}
                onClick={this._onSave}>
                <Icon type='floppy-o' /> Save
              </Button>
            }
            <Button
              bsSize='small'
              bsStyle='danger'
              onClick={this._onRemove}>
              <Icon type='trash-o' /> Delete
            </Button>
          </ButtonToolbar>
          {fields.map((f, i) =>
            <FormInput
              key={i}
              field={f}
              value={data[f.name.split('.').slice(-1)[0]]}
              onChange={this._onChange} />
          )}
          {/* Additional (usually more complex) fields can go here. */}
          {this.props.children}
        </Form>
      </Panel>
    )
  }
}
