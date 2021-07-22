// @flow
import React from 'react'
import tinycolor from 'tinycolor2'
import Icon from '@conveyal/woonerf/components/icon'

import type { Label } from '../../types'
import type {ManagerUserState} from '../../types/reducers'
import ConfirmModal from '../../common/components/ConfirmModal'
import LabelEditorModal from '../../manager/components/LabelEditorModal'

const getComplementaryColor = (cssHex, strength) => {
  const color = tinycolor(cssHex)

  const complementary = color.isDark()
    ? color.lighten(strength)
    : color.darken(strength + 10)
  return complementary.toHexString()
}

export type Props = {
  checked?: boolean,
  deleteLabel?: Function,
  label: Label,
  onClick?: Function,
  small: boolean,
  user?: ManagerUserState
}
export type State = {}

export default class FeedLabel extends React.Component<Props, State> {
  _onConfirmDelete = () => {
    this.props.deleteLabel && this.props.deleteLabel(this.props.label)
  }

  _onClickDelete = () => {
    this.refs.deleteModal.open()
  }

  _onClickEdit = () => {
    this.refs.editModal.open()
  }

  render () {
    const {small, label, checked, onClick: labelOnClick, user} = this.props
    const projectAdmin =
      user &&
      user.permissions &&
      user.permissions.isProjectAdmin(label.projectId)

    return (
      <div
        className={`feedLabel ${small ? 'small' : ''} ${checked !== undefined ? 'clickable' : ''}`}
        style={{
          backgroundColor: label.color,
          color: getComplementaryColor(label.color, 55),
          borderColor: getComplementaryColor(label.color, 10)
        }}
        title={label.description}

        onClick={!labelOnClick ? null : () => labelOnClick(label.id)}
        onKeyPress={!labelOnClick ? null : () => labelOnClick(label.id)}
        role='checkbox'
        aria-checked={checked}
        tabIndex={0}
      >

        <div className='labelName'>
          {checked !== undefined
            ? <div className='actionButtons'>
              <input type='checkbox' checked={checked} />
            </div>
            : ''}
          {label.adminOnly ? <Icon type='lock' /> : ''}
          <span>{label.name}</span>
        </div>
        { !small && projectAdmin && (
          <div className='actionButtons'>
            <ConfirmModal
              ref='deleteModal'
              title='Delete Label?'
              body={`Are you sure you want to delete the label ${label.name}?`}
              onConfirm={this._onConfirmDelete}
            />
            <LabelEditorModal ref='editModal' label={this.props.label} />

            <button onClick={() => this._onClickEdit()}><Icon type='pencil' /></button>
            <button onClick={() => this._onClickDelete()}><Icon type='trash' /></button>
          </div>
        )}
      </div>
    )
  }
}
