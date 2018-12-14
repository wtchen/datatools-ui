// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button, Glyphicon, ButtonGroup} from 'react-bootstrap'

import ConfirmModal from '../../../common/components/ConfirmModal'
import {getComponentMessages, isModuleEnabled} from '../../../common/util/config'

import type {ListProps} from './FeedVersionViewer'

type ToolbarProps = ListProps & {size: string}

export default class VersionButtonToolbar extends Component<ToolbarProps> {
  messages = getComponentMessages('VersionButtonToolbar')

  _onClickDownload = () =>
    this.props.downloadFeedViaToken(this.props.version, this.props.isPublic)

  _onClickLoadIntoEditor = (evt: SyntheticMouseEvent<HTMLInputElement>) => {
    const {loadFeedVersionForEditing, version} = this.props

    const {id: feedVersionId, feedSource} = version
    this.refs.confirm.open({
      title: this.messages('load'),
      body: this.messages('confirmLoad'),
      onConfirm: () =>
        loadFeedVersionForEditing({feedSourceId: feedSource.id, feedVersionId})
    })
  }

  _onClickDeleteVersion = (evt: SyntheticMouseEvent<HTMLInputElement>) => {
    const {deleteFeedVersion, version} = this.props
    this.refs.confirm.open({
      title: `${this.messages('delete')} ${this.messages('version')}`,
      body: this.messages('confirmDelete'),
      onConfirm: () => deleteFeedVersion(version)
    })
  }

  render () {
    const {
      deleteDisabled,
      deleteFeedVersion,
      editDisabled,
      hasVersions,
      isPublic,
      size
    } = this.props
    return (
      <div style={{display: 'inline'}}>
        <ConfirmModal ref='confirm' />
        <ButtonGroup className='pull-right'>

          {/* "Download Feed" Button */}
          <Button
            bsSize={size}
            data-test-id='download-feed-version-button'
            disabled={!hasVersions}
            onClick={this._onClickDownload}>
            <Glyphicon glyph='download' />
            <span className='hidden-xs'> {this.messages('download')}</span>
            <span className='hidden-xs hidden-sm'> {this.messages('version')}</span>
          </Button>

          {/* "Load for Editing" Button */}
          {isModuleEnabled('editor') && !isPublic
            ? <Button
              bsSize={size}
              disabled={editDisabled || !hasVersions}
              onClick={this._onClickLoadIntoEditor}>
              <Glyphicon glyph='pencil' />
              <span className='hidden-xs'> {this.messages('load')}</span>
              <span className='hidden-xs hidden-sm'> {this.messages('version')}</span>
            </Button>
            : null
          }

          {/* "Delete Version" Button */}
          {!isPublic
            ? <Button
              bsSize={size}
              data-test-id='delete-feed-version-button'
              disabled={deleteDisabled || !hasVersions || typeof deleteFeedVersion === 'undefined'}
              onClick={this._onClickDeleteVersion}>
              <span className='text-danger'>
                <Icon type='trash' />
                <span className='hidden-xs'> {this.messages('delete')}</span>
                <span className='hidden-xs hidden-sm'> {this.messages('version')}</span>
              </span>
            </Button>
            : null
          }
        </ButtonGroup>
      </div>
    )
  }
}
