// @flow
import React from 'react'
import tinycolor from 'tinycolor2'
import Icon from '@conveyal/woonerf/components/icon'
import { connect } from 'react-redux'

import { deleteLabel } from '../../manager/actions/labels'
import type { Label } from '../../types'
import type {ManagerUserState} from '../../types/reducers'
import ConfirmModal from '../../common/components/ConfirmModal'
import LabelEditorModal from '../../manager/components/LabelEditorModal'

export type Props = {
  checked?: boolean,
  deleteLabel: Function,
  label: Label,
  onClick?: Function,
  small: boolean,
  user?: ManagerUserState
}
export type State = {}

/**
 * Generate lightened/darkened versions of a color for use in text and border rendering
 * @param {string} cssHex     The css hex value to modify
 * @param {number} strength   The amount to lighten or darken by
 * @returns                   String with lightened/darkened css hex value
 */
const getComplementaryColor = (cssHex, strength) => {
  const color = tinycolor(cssHex)

  const complementary = color.isDark()
    ? color.lighten(strength)
    : color.darken(strength + 10)
  return complementary.toHexString()
}

/**
 * Renders a feed label, either large or small and optionally renders a checkbox or edit/delete
 * buttons alongside the label
 */
class FeedLabel extends React.Component<Props, State> {
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
      <div className='feedLabelWrapper'
        onClick={!labelOnClick ? null : () => labelOnClick(label.id)}
        onKeyPress={!labelOnClick ? null : () => labelOnClick(label.id)}
        role='checkbox'
        aria-checked={checked}
        tabIndex={0}
      >
        {checked !== undefined && (
          <div className='actionButtons'>
            <input type='checkbox' checked={checked} />
          </div>
        )}
        <div
          className={`feedLabel ${small ? 'smaller' : ''} 
        ${
  // Need an explicit check for undefined, since it is expected
  // to be true/false
      checked !== undefined ? 'clickable' : ''
      }`}
          style={{
            backgroundColor: label.color,
            color: getComplementaryColor(label.color, 55),
            borderColor: getComplementaryColor(label.color, 10)
          }}
          title={label.description}
        >
          <div className='labelName'>
            {label.adminOnly && <Icon type='lock' />}
            <span>{label.name}</span>
          </div>
          {/* Only project admins can see controls that only appear
        on large labels */}
        </div>
        {!small && projectAdmin && (
          <div className='actionButtons'>
            <ConfirmModal
              ref='deleteModal'
              title='Delete Label?'
              body={`Are you sure you want to delete the label ${label.name}?`}
              onConfirm={this._onConfirmDelete}
            />
            <LabelEditorModal ref='editModal' label={this.props.label} />

            <button onClick={this._onClickEdit}>
              <Icon type='pencil' />
            </button>
            <button onClick={this._onClickDelete}>
              <Icon type='trash' />
            </button>
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = {
  deleteLabel
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedLabel)
