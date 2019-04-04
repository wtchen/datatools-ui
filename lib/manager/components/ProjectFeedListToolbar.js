// @flow

import Icon from '@conveyal/woonerf/components/icon'
import memoize from 'lodash/memoize'
import React, {Component} from 'react'
import {
  Badge,
  ButtonGroup,
  Col,
  ControlLabel,
  DropdownButton,
  Form,
  FormControl,
  FormGroup,
  Glyphicon,
  MenuItem,
  Row
} from 'react-bootstrap'

import * as projectsActions from '../actions/projects'
import * as visibilityFilterActions from '../actions/visibilityFilter'
import OptionButton from '../../common/components/OptionButton'
import {getComponentMessages, isExtensionEnabled} from '../../common/util/config'
import {versionStatusFilters, feedSortOptions} from '../util'

import type {Props as ContainerProps} from '../containers/ProjectFeedListToolbar'
import type {
  FeedSourceTableFilterCountStrategies,
  FeedSourceTableSortStrategiesWithOrders,
  ManagerUserState,
  ProjectFilter
} from '../../types/reducers'

type Props = ContainerProps & {
  calculateFeedSourceTableComparisonColumn: typeof projectsActions.calculateFeedSourceTableComparisonColumn,
  downloadFeedForProject: typeof projectsActions.downloadFeedForProject,
  fetchFeedsForProject: typeof projectsActions.fetchFeedsForProject,
  filter: ProjectFilter,
  filterCounts: { [string]: number },
  possibleComparisons: Array<FeedSourceTableFilterCountStrategies>,
  projectEditDisabled: boolean,
  setFeedSort: typeof projectsActions.setFeedSort,
  setFeedSourceTableFilterCountStrategy: typeof projectsActions.setFeedSourceTableFilterCountStrategy,
  setVisibilityFilter: typeof visibilityFilterActions.setVisibilitySearchText,
  setVisibilitySearchText: typeof visibilityFilterActions.setVisibilitySearchText,
  thirdPartySync: typeof projectsActions.thirdPartySync,
  user: ManagerUserState,
}

export default class ProjectFeedListToolbar extends Component<Props> {
  messages = getComponentMessages('ProjectFeedListToolbar')

  _onDownloadMerged = () => this.props.downloadFeedForProject(this.props.project)

  _onSearchChange = (evt: SyntheticInputEvent<HTMLInputElement>) =>
    this.props.setVisibilitySearchText(evt.target.value)

  _onSelectFilter = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const {
      calculateFeedSourceTableComparisonColumn,
      project,
      setFeedSourceTableFilterCountStrategy
    } = this.props
    setFeedSourceTableFilterCountStrategy(evt.target.value)
    calculateFeedSourceTableComparisonColumn(project.id)
  }

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
   * Render the sort menu with all the various options
   */
  _renderSortOptions () {
    const options = [
      <MenuItem header key='sort-header-note'>
        Note: sorting only available on latest version data
      </MenuItem>
    ]
    const sortOptions = [...new Set(
      Object.keys(feedSortOptions).map(key => key.split('-')[0])
    )]
    sortOptions.forEach((option, idx) => {
      options.push(
        <MenuItem header key={`feed-sort-${option}-header`}>
          {this.messages(`sort.${option}.title`)}
        </MenuItem>
      )
      options.push(
        <MenuItem
          key={`feed-sort-${option}-asc`}
          // $FlowFixMe flow is not smart enough to recombine strings
          onClick={this._onSort(`${option}-asc`)}
        >
          {this.messages(`sort.${option}.asc`)}
        </MenuItem>
      )
      options.push(
        <MenuItem
          key={`feed-sort-${option}-desc`}
          // $FlowFixMe flow is not smart enough to recombine strings
          onClick={this._onSort(`${option}-desc`)}
        >
          {this.messages(`sort.${option}.desc`)}
        </MenuItem>
      )
      if (idx < sortOptions.length - 1) {
        options.push(<MenuItem divider key={`feed-sort-${option}-divider`} />)
      }
    })
    return options
  }

  _renderFilterToolbarLabel = () => {
    const {filter, possibleComparisons} = this.props

    const style = { marginLeft: 5, marginRight: 5 }
    const strategySelect = possibleComparisons.length < 2
      ? <span style={style}>{this.messages('comparison.LATEST')}</span>
      : (
        <select
          onChange={this._onSelectFilter}
          style={style}
          value={filter.feedSourceTableFilterCountStrategy}
        >
          {possibleComparisons.map(comparison => (
            <option key={comparison} value={comparison}>
              {this.messages(`comparison.${comparison}`)}
            </option>
          ))}
        </select>
      )

    return (
      <ControlLabel style={{ display: 'block' }}>
        Filter feed sources on
        {strategySelect}
        version
      </ControlLabel>
    )
  }

  render () {
    const {
      filter,
      filterCounts,
      onNewFeedSourceClick,
      projectEditDisabled,
      setVisibilityFilter
    } = this.props

    const activeFilter = filter.filter || 'all'
    const nonFilterColumnOffset = 25

    return (
      <Row>
        <Col xs={4} style={{ marginTop: nonFilterColumnOffset }}>
          <Form inline style={{ display: 'inline' }}>
            <FormGroup
              className='feed-source-toolbar-formgroup'
              controlId='formControlsSelect'
            >
              <FormControl
                placeholder={this.messages('feeds.search')}
                onChange={this._onSearchChange}
                value={filter.searchText || undefined}
              />
            </FormGroup>
          </Form>
          <DropdownButton
            id='project-feedsource-table-sort-button'
            style={{ marginLeft: 20 }}
            title='Sort By'
          >
            {this._renderSortOptions()}
          </DropdownButton>
        </Col>
        <Col xs={6}>
          <FormGroup id='feedFilterToolbarControl'>
            {this._renderFilterToolbarLabel()}
            <ButtonGroup>
              {Object.keys(versionStatusFilters).map(filterOption => (
                <OptionButton
                  active={activeFilter === filterOption}
                  className={activeFilter === filterOption ? 'active' : ''}
                  key={filterOption}
                  onClick={setVisibilityFilter}
                  value={filterOption}
                >
                  {this.messages(`filter.${filterOption}`)}{' '}
                  <Badge
                    style={{backgroundColor: '#babec0'}}>
                    {filterCounts[filterOption]}
                  </Badge>
                </OptionButton>
              ))}
            </ButtonGroup>
          </FormGroup>
        </Col>
        <Col xs={2} style={{ marginTop: nonFilterColumnOffset }}>
          <DropdownButton
            bsStyle='primary'
            id='project-header-actions'
            style={{ marginLeft: 20 }}
            title='Actions'
          >
            {!projectEditDisabled &&
              <MenuItem
                data-test-id='project-header-create-new-feed-source-button'
                disabled={projectEditDisabled}
                key='create-feedsource-button'
                onClick={onNewFeedSourceClick}
              >
                <Glyphicon glyph='plus' /> {this.messages('feeds.new')}
              </MenuItem>
            }
            {this._renderSyncMenuItem('transitland')}
            {this._renderSyncMenuItem('transitfeeds')}
            {this._renderSyncMenuItem('mtc')}
            <MenuItem
              bsStyle='default'
              disabled={projectEditDisabled}
              key='update-feeds-button'
              onClick={this._onUpdateProject}
            >
              <Icon type='cloud-download' /> {this.messages('feeds.update')}
            </MenuItem>
            <MenuItem
              bsStyle='primary'
              key='merge-feeds-button'
              onClick={this._onDownloadMerged}
            >
              <Glyphicon glyph='download' /> {this.messages('mergeFeeds')}
            </MenuItem>
          </DropdownButton>
        </Col>
      </Row>
    )
  }
}
