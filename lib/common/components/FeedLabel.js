import React from 'react'
import tinycolor from 'tinycolor2'
import Icon from '@conveyal/woonerf/components/icon'

import ConfirmModal from '../../common/components/ConfirmModal'
import { LabelEditorModal } from '../../manager/components/LabelEditor'

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
    const { name, color, small, adminOnly } = this.props

    return (
      <div
        className={`feedLabel ${small ? 'small' : ''}`}
        style={{
          backgroundColor: color,
          color: getComplementaryColor(color, 40),
          borderColor: getComplementaryColor(color, 10)
        }}
      >

        <div className='labelName'>
          {adminOnly ? <Icon type='lock' /> : ''}
          <span>{name}</span>
        </div>
        { small ? ''
          : <div className='actionButtons small'>
            <ConfirmModal
              ref='deleteModal'
              title='Delete Label?'
              body={`Are you sure you want to delete the label ${name}?`}
              onConfirm={this._onConfirmDelete}
            />
            <LabelEditorModal ref='editModal' label={{ ...this.props }} />

            <button onClick={() => this._onClickEdit()}>Edit</button>
            <button onClick={() => this._onClickDelete()}>Delete</button>
          </div>
        }
      </div>
    )
  }
}
