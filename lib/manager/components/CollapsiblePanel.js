// @flow

import React, {Component, type Element} from 'react'
import {
  Button,
  Col,
  Panel,
  Glyphicon,
  Form,
  FormGroup,
  ControlLabel,
  FormControl
} from 'react-bootstrap'

import {getComponentMessages} from '../../common/util/config'

import type {FormProps} from '../../types'

type Props = {
  data: {[string]: string | number},
  defaultExpanded: boolean,
  fields: Array<FormProps>,
  index: number,
  onChange: (SyntheticInputEvent<HTMLInputElement>, number) => void,
  onRemove: number => void,
  title: Element<*> | string
}

export default class CollapsiblePanel extends Component<Props> {
  messages = getComponentMessages('CollapsiblePanel')

  _onChange = (evt: SyntheticInputEvent<HTMLInputElement>) =>
    this.props.onChange(evt, this.props.index)

  _onRemove = () => this.props.onRemove(this.props.index)

  render () {
    const {fields, data, defaultExpanded, title} = this.props
    return (
      <Panel
        header={<h5 style={{width: '100%', cursor: 'pointer'}}>{title}</h5>}
        defaultExpanded={defaultExpanded}
        collapsible>
        <Form>
          <Button
            bsSize='xsmall'
            bsStyle='danger'
            className='pull-right'
            onClick={this._onRemove}>
            Remove <Glyphicon glyph='remove' />
          </Button>
          {fields.map((f, i) => {
            const {split, ...fieldProps} = f
            const fieldName = f.name.split('.').slice(-1)[0]
            const value = data[fieldName]
            const checkboxProps = f.type === 'checkbox' ? {checked: value} : {}
            return (
              <Col key={i} xs={f.width || 6}>
                <FormGroup>
                  <ControlLabel>{this.messages(`deployment.${f.name}`)}</ControlLabel>
                  <FormControl
                    value={value === null ? '' : value}
                    {...checkboxProps} // adds checkbox props if type is checkbox
                    {...fieldProps}
                    placeholder={f.placeholder || this.messages(`deployment.${f.name}Placeholder`)}
                    name={f.name}
                    children={f.children
                      ? f.children.sort((a, b) => {
                        if (a.value < b.value) return -1
                        if (a.value > b.value) return 1
                        return 0
                      }).map((o, i) => (
                        <option key={i} {...o} />
                      ))
                      : undefined
                    }
                    onChange={this._onChange} />
                </FormGroup>
              </Col>
            )
          })}
        </Form>
      </Panel>
    )
  }
}
