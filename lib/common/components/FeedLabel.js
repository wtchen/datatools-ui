import React from 'react'
import tinycolor from 'tinycolor2'
import Icon from '@conveyal/woonerf/components/icon'

import ConfirmModal from '../../common/components/ConfirmModal'
import LabelEditorModal from '../../manager/components/LabelEditorModal'

const getComplementaryColor = (cssHex, strength) => {
  const color = tinycolor(cssHex)

  const complementary = color.isDark()
    ? color.lighten(strength)
    : color.darken(strength + 10)
  return complementary.toHexString()
}

export default class FeedLabel extends React.Component {
  _onConfirmDelete = () => {
    this.props.deleteLabel(this.props)
  }

  _onClickDelete = () => {
    this.refs.deleteModal.open()
  }

  _onClickEdit = () => {
    this.refs.editModal.open()
  }

  render () {
    const {small, label} = this.props

    return (
      <div
        className={`feedLabel ${small ? 'small' : ''}`}
        style={{
          backgroundColor: label.color,
          color: getComplementaryColor(label.color, 40),
          borderColor: getComplementaryColor(label.color, 10)
        }}
      >

        <div className='labelName'>
          {label.adminOnly ? <Icon type='lock' /> : ''}
          <span>{label.name}</span>
        </div>
        { small ? ''
          : <div className='actionButtons'>
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
        }
      </div>
    )
  }
}
