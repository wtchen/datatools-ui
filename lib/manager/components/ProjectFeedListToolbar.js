// @flow

import Icon from '@conveyal/woonerf/components/icon'
import memoize from 'lodash/memoize'
import React, {Component} from 'react'
import {
  Row,
  Col,
  ControlLabel,
  Button,
  Form,
  FormControl,
  FormGroup,
  Glyphicon,
  DropdownButton,
  MenuItem
} from 'react-bootstrap'

import * as projectsActions from '../actions/projects'
import * as visibilityFilterActions from '../actions/visibilityFilter'
import {getComponentMessages, isExtensionEnabled} from '../../common/util/config'
import {feedSortOptions} from '../util'

import type {Props as ContainerProps} from '../containers/ProjectFeedListToolbar'
import type {
  FeedSourceTableSortStrategiesWithOrders,
  ManagerUserState,
  ProjectFilter
} from '../../types/reducers'

type Props = ContainerProps & {
  downloadFeedForProject: typeof projectsActions.downloadFeedForProject,
  fetchFeedsForProject: typeof projectsActions.fetchFeedsForProject,
  filter: ProjectFilter,
  projectEditDisabled: boolean,
  setFeedSort: typeof projectsActions.setFeedSort,
  setVisibilitySearchText: typeof visibilityFilterActions.setVisibilitySearchText,
  thirdPartySync: typeof projectsActions.thirdPartySync,
  user: ManagerUserState,
}

export default class ProjectFeedListToolbar extends Component<Props> {
  messages = getComponentMessages('ProjectFeedListToolbar')

  _onDownloadMerged = () => this.props.downloadFeedForProject(this.props.project)

  _onSearchChange = (evt: SyntheticInputEvent<HTMLInputElement>) =>
    this.props.setVisibilitySearchText(evt.target.value)

  _onSelectFilter = (evt: SyntheticInputEvent<HTMLInputElement>) =>
    console.warn(`No action set for filter change ${evt.target.value}`)

  _onUpdateProject = () => this.props.fetchFeedsForProject(this.props.project)

  _onClickThirdPartySync = memoize((type: string) => (evt: SyntheticMouseEvent<HTMLInputElement>) => {
    const {project, thirdPartySync} = this.props
    thirdPartySync(project.id, type)
  })

  _onSort = memoize((type: FeedSourceTableSortStrategiesWithOrders) => () => {
    this.props.setFeedSort(type)
  })

  /**
   * Renders a third party sync menu item if it is enabled.
   */
  _renderSyncMenuItem = (type: string) => {
    const typeCaps = type.toUpperCase()
    return isExtensionEnabled(type) && <MenuItem
      bsStyle='primary'
      disabled={this.props.projectEditDisabled}
      id={typeCaps}
      key={type}
      onClick={this._onClickThirdPartySync(typeCaps)}
    >
      <Glyphicon glyph='refresh' /> {this.messages(`sync.${type}`)}
    </MenuItem>
  }

  /**
   * Do this bit of ugliness to make sure all items are at the root level.
   *
   * FIXME: make this all inline after upgrading to React 16
   * (see https://stackoverflow.com/questions/23840997/how-to-return-multiple-lines-jsx-in-another-return-statement-in-react)
   */
  _renderSortOptions () {
    const options = []
    const sortOptions = [...new Set(
      Object.keys(feedSortOptions).map(key => key.split('-')[0])
    )]
    sortOptions.forEach((option, idx) => {
      options.push(<MenuItem header>{this.messages(`sort.${option}.title`)}</MenuItem>)
      options.push(
        // $FlowFixMe flow isn't smart enough to recombine strings
        <MenuItem onClick={this._onSort(`${option}-asc`)}>
          {this.messages(`sort.${option}.asc`)}
        </MenuItem>
      )
      options.push(
        // $FlowFixMe flow isn't smart enough to recombine strings
        <MenuItem onClick={this._onSort(`${option}-desc`)}>
          {this.messages(`sort.${option}.desc`)}
        </MenuItem>
      )
      if (idx < sortOptions.length - 1) {
        options.push(<MenuItem divider />)
      }
    })
    return options
  }

  render () {
    const {
      onNewFeedSourceClick,
      projectEditDisabled
    } = this.props
    return (
      <div>
        <Row>
          <Col xs={9}>
            <Form inline style={{ display: 'inline' }}>
              <FormGroup
                className='feed-source-toolbar-formgroup'
                controlId='formControlsSelect'
              >
                <ControlLabel>Search:</ControlLabel>
                <FormControl
                  placeholder={this.messages('feeds.search')}
                  onChange={this._onSearchChange}
                />
              </FormGroup>
            </Form>
            <DropdownButton
              bsStyle='info'
              style={{ marginLeft: 20 }}
              title='Sort By'
            >
              {this._renderSortOptions()}
            </DropdownButton>
            <DropdownButton
              bsStyle='primary'
              style={{ marginLeft: 20 }}
              title='Bulk Actions'
            >
              {this._renderSyncMenuItem('transitland')}
              {this._renderSyncMenuItem('transitfeeds')}
              {this._renderSyncMenuItem('mtc')}
              <MenuItem
                bsStyle='default'
                disabled={projectEditDisabled}
                onClick={this._onUpdateProject}>
                <Icon type='cloud-download' /> {this.messages('feeds.update')}
              </MenuItem>
              <MenuItem
                bsStyle='primary'
                onClick={this._onDownloadMerged}>
                <Glyphicon glyph='download' /> {this.messages('mergeFeeds')}
              </MenuItem>
            </DropdownButton>
          </Col>
          <Col xs={3}>
            {!projectEditDisabled &&
              <Button
                bsStyle='success'
                className='pull-right'
                data-test-id='project-header-create-new-feed-source-button'
                disabled={projectEditDisabled}
                onClick={onNewFeedSourceClick}>
                <Glyphicon glyph='plus' /> {this.messages('feeds.new')}
              </Button>
            }
          </Col>
        </Row>
      </div>
    )
  }
}
