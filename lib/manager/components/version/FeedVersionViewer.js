// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Row, Col, Button, Panel, Label, Glyphicon, ButtonGroup, ListGroup, ListGroupItem } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

import GtfsValidationViewer from '../validation/GtfsValidationViewer'
import FeedVersionReport from './FeedVersionReport'
import VersionDateLabel from './VersionDateLabel'
import NotesViewer from '../NotesViewer'
import {getTableFatalExceptions} from '../../util/version'
import ConfirmModal from '../../../common/components/ConfirmModal'
import ActiveGtfsPlusVersionSummary from '../../../gtfsplus/containers/ActiveGtfsPlusVersionSummary'
import {isModuleEnabled, getComponentMessages, getMessage} from '../../../common/util/config'

import type {Feed, FeedVersion, Project} from '../../../types'
import type {GtfsState} from '../../../gtfs/reducers/index'
import type {UserState} from '../../reducers/user'

type Props = {
  deleteDisabled: boolean,
  editDisabled: boolean,
  deleteFeedVersionConfirmed: FeedVersion => void,
  version: FeedVersion,
  feedSource: Feed,
  versions: Array<FeedVersion>,
  feedVersionIndex: number,
  versionSection: ?string,
  isPublic: boolean,
  hasVersions: boolean,
  listView: boolean,
  newNotePosted: any => void,
  notesRequested: any => void,
  fetchValidationIssueCount: (FeedVersion) => void,
  fetchGTFSEntities: any => void,
  downloadFeedClicked: any => void,
  loadFeedVersionForEditing: any => void,
  user: UserState,
  feedSource: Feed,
  fetchValidationErrors: any,
  fetchGTFSEntities: any => void,
  project: Project,
  gtfs: GtfsState,
  feedVersionRenamed: (FeedVersion, string) => void,
  publishFeedVersion: FeedVersion => void
}

export default class FeedVersionViewer extends Component<Props> {
  messages = getComponentMessages('FeedVersionViewer')

  render () {
    const {
      feedVersionIndex,
      listView,
      newNotePosted,
      notesRequested,
      version,
      versionSection,
      user
    } = this.props

    if (!version) {
      return (
        <p className='text-center lead'>
          {getMessage(this.messages, 'noVersionsExist')}
        </p>
      )
    }

    if (listView) {
      // List view of feed versions
      return (
        <Row>
          <Col xs={12} sm={12}>
            <VersionList {...this.props} />
          </Col>
        </Row>
      )
    }
    return (
      <Row>
        <Col xs={12} sm={3}>
          <VersionSectionSelector
            version={version}
            feedVersionIndex={feedVersionIndex}
            versionSection={versionSection} />
        </Col>
        <Col xs={12} sm={9}>
          {!versionSection
            ? <FeedVersionReport {...this.props} />
            : versionSection === 'issues'
              ? <GtfsValidationViewer
                {...this.props}
                validationResult={version.validationResult} />
              : versionSection === 'gtfsplus' && isModuleEnabled('gtfsplus')
                ? <ActiveGtfsPlusVersionSummary
                  version={version} />
                : versionSection === 'comments'
                  ? <NotesViewer
                    type='feed-version'
                    stacked
                    user={user}
                    version={version}
                    notes={version.notes}
                    noteCount={version.noteCount}
                    notesRequested={notesRequested}
                    newNotePosted={newNotePosted} />
                  : null
          }
        </Col>
      </Row>
    )
  }
}

type SelectorProps = {
  version: FeedVersion,
  feedVersionIndex: number,
  versionSection: ?string
}

class VersionSectionSelector extends Component<SelectorProps> {
  _renderIssuesLabel (version) {
    const tableFatalExceptions = getTableFatalExceptions(version)
    const {validationSummary, feedLoadResult} = version
    const hasCriticalError = validationSummary.loadStatus !== 'SUCCESS' ||
      !feedLoadResult || feedLoadResult.fatalException ||
      tableFatalExceptions.length > 0
    const color = hasCriticalError
      ? 'danger'
      : validationSummary.errorCount
        ? 'warning'
        : 'success'
    const text = hasCriticalError
      ? 'critical error'
      : validationSummary.errorCount
    return (
      <Label bsStyle={color}>
        {text}
      </Label>
    )
  }

  render () {
    const { version } = this.props
    return (
      <Panel>
        <ListGroup fill>
          <LinkContainer
            to={`/feed/${version.feedSource.id}/version/${this.props.feedVersionIndex}`}
            active={!this.props.versionSection}>
            <ListGroupItem><Icon type='info-circle' /> Version summary</ListGroupItem>
          </LinkContainer>
          <LinkContainer
            to={`/feed/${version.feedSource.id}/version/${this.props.feedVersionIndex}/issues`}
            active={this.props.versionSection === 'issues'}>
            <ListGroupItem>
              <Icon type='exclamation-triangle' /> Validation issues {this._renderIssuesLabel(version)}
            </ListGroupItem>
          </LinkContainer>
          {isModuleEnabled('gtfsplus')
            ? <LinkContainer
              to={`/feed/${version.feedSource.id}/version/${this.props.feedVersionIndex}/gtfsplus`}
              active={this.props.versionSection === 'gtfsplus'}>
              <ListGroupItem>
                <Icon type='plus' /> GTFS+ for this version
              </ListGroupItem>
            </LinkContainer>
            : null
          }
          <LinkContainer
            to={`/feed/${version.feedSource.id}/version/${this.props.feedVersionIndex}/comments`}
            active={this.props.versionSection === 'comments'}>
            <ListGroupItem>
              <Glyphicon glyph='comment' /> Version comments{' '}
              <Label>{version.noteCount}</Label>
            </ListGroupItem>
          </LinkContainer>
        </ListGroup>
      </Panel>
    )
  }
}

type ListProps = {
  deleteDisabled: boolean,
  editDisabled: boolean,
  version: FeedVersion,
  versions: Array<FeedVersion>,
  feedVersionIndex: number,
  isPublic: boolean,
  hasVersions: boolean,
  downloadFeedClicked: (FeedVersion, boolean) => void,
  deleteFeedVersionConfirmed: FeedVersion => void,
  loadFeedVersionForEditing: any => void
}

class VersionList extends Component<ListProps> {
  render () {
    return <Panel header={<h3>List of feed versions</h3>}>
      <ListGroup fill>
        {this.props.versions
          ? this.props.versions.map(v => {
            return (
              <ListGroupItem key={v.id}>
                {v.name}
                {' '}
                <small>
                  <VersionDateLabel version={v} />
                </small>
                <VersionButtonToolbar
                  version={v}
                  size='xsmall'
                  {...this.props} />
              </ListGroupItem>
            )
          })
          : <ListGroupItem>
            No versions
          </ListGroupItem>
        }
      </ListGroup>
    </Panel>
  }
}

type ToolbarProps = ListProps & {size: string}

export class VersionButtonToolbar extends Component<ToolbarProps> {
  messages = getComponentMessages('FeedVersionViewer')

  _onClickDownload = () =>
    this.props.downloadFeedClicked(this.props.version, this.props.isPublic)

  _onClickLoadIntoEditor = (evt: SyntheticMouseEvent<HTMLInputElement>) => {
    const {loadFeedVersionForEditing, version} = this.props

    const {id: feedVersionId, feedSource} = version
    this.refs.confirm.open({
      title: getMessage(this.messages, 'load'),
      body: getMessage(this.messages, 'confirmLoad'),
      onConfirm: () =>
        loadFeedVersionForEditing({feedSourceId: feedSource.id, feedVersionId})
    })
  }

  _onClickDeleteVersion = (evt: SyntheticMouseEvent<HTMLInputElement>) => {
    const {deleteFeedVersionConfirmed, version} = this.props
    this.refs.confirm.open({
      title: `${getMessage(this.messages, 'delete')} ${getMessage(this.messages, 'version')}`,
      body: getMessage(this.messages, 'confirmDelete'),
      onConfirm: () => deleteFeedVersionConfirmed(version)
    })
  }

  render () {
    const {
      deleteDisabled,
      deleteFeedVersionConfirmed,
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
            disabled={!hasVersions}
            onClick={this._onClickDownload}>
            <Glyphicon glyph='download' />
            <span className='hidden-xs'> {getMessage(this.messages, 'download')}</span>
            <span className='hidden-xs hidden-sm'> {getMessage(this.messages, 'version')}</span>
          </Button>

          {/* "Load for Editing" Button */}
          {isModuleEnabled('editor') && !isPublic
            ? <Button
              bsSize={size}
              disabled={editDisabled || !hasVersions}
              onClick={this._onClickLoadIntoEditor}>
              <Glyphicon glyph='pencil' />
              <span className='hidden-xs'> {getMessage(this.messages, 'load')}</span>
              <span className='hidden-xs hidden-sm'> {getMessage(this.messages, 'version')}</span>
            </Button>
            : null
          }

          {/* "Delete Version" Button */}
          {!isPublic
            ? <Button
              bsSize={size}
              disabled={deleteDisabled || !hasVersions || typeof deleteFeedVersionConfirmed === 'undefined'}
              onClick={this._onClickDeleteVersion}>
              <span className='text-danger'>
                <Icon type='trash' />
                <span className='hidden-xs'> {getMessage(this.messages, 'delete')}</span>
                <span className='hidden-xs hidden-sm'> {getMessage(this.messages, 'version')}</span>
              </span>
            </Button>
            : null
          }
        </ButtonGroup>
      </div>
    )
  }
}
