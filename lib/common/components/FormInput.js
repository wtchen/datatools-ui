// @flow

import React from 'react'
import {
  Col,
  FormGroup,
  ControlLabel,
  FormControl
} from 'react-bootstrap'

import {getComponentMessages} from '../../common/util/config'
import type {FormProps} from '../../types'

type Props = {
  field: FormProps,
  messageRoot?: string,
  onChange: any,
  shouldRender: () => boolean,
  value?: any
}

export default class FormInput extends React.Component<Props> {
  static defaultProps = {
    shouldRender: () => true
  }

  messages = getComponentMessages('FormInput')

  render () {
    const {field, messageRoot, shouldRender, value} = this.props
    const prefix = messageRoot ? `${messageRoot}.` : ''
    const {effects, split, ...fieldProps} = field
    // If should render is false, do not render form element (for conditional
    // visibility of form elements).
    if (!shouldRender()) return null
    const isCheckbox = field.type === 'checkbox'
    const isSelect = field.type.indexOf('select') !== -1
    const checkboxProps = isCheckbox ? {checked: value} : {}
    return (
      <Col xs={field.width || 6}>
        <FormGroup>
          <ControlLabel>
            {this.messages(`${prefix}${field.name}`)}
            {field.required ? ' *' : ''}
          </ControlLabel>
          <FormControl
            value={value === null ? '' : value}
            {...checkboxProps} // adds checkbox props if type is checkbox
            {...fieldProps}
            placeholder={isCheckbox || isSelect
              ? undefined
              : field.placeholder || this.messages(`${prefix}${field.name}Placeholder`)
            }
            name={field.name}
            children={field.children
              ? field.children.sort((a, b) => {
                if (a.value < b.value) return -1
                if (a.value > b.value) return 1
                return 0
              }).map((o, i) => (
                <option key={i} {...o} />
              ))
              : undefined
            }
            onChange={this.props.onChange} />
        </FormGroup>
      </Col>
    )
  }
}
