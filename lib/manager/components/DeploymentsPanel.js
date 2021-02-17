// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import {
  Button,
  ButtonGroup,
  Checkbox,
  Col,
  ControlLabel,
  Glyphicon,
  HelpBlock,
  FormControl,
  FormGroup,
  Label as BsLabel,
  Panel,
  Row,
  Table
} from 'react-bootstrap'
import Select from 'react-select'

import * as deploymentActions from '../actions/deployments'
import * as feedsActions from '../actions/feeds'
import * as projectsActions from '../actions/projects'
import ActiveDeploymentViewer from '../containers/ActiveDeploymentViewer'
import ConfirmModal from '../../common/components/ConfirmModal'
import EditableTextField from '../../common/components/EditableTextField'
import Loading from '../../common/components/Loading'
import {getComponentMessages} from '../../common/util/config'
import {formatTimestamp, fromNow} from '../../common/util/date-time'
import {getServerDeployedTo} from '../util/deployment'

import type {Props as ContainerProps} from '../containers/DeploymentsPanel'
import type {Deployment, Project, ReactSelectOption} from '../../types'

type Props = ContainerProps & {
  createDeployment: typeof deploymentActions.createDeployment,
  deleteDeployment: typeof deploymentActions.deleteDeployment,
  fetchProjectDeployments: typeof deploymentActions.fetchProjectDeployments,
  fetchProjectFeeds: typeof feedsActions.fetchProjectFeeds,
  saveDeployment: typeof deploymentActions.saveDeployment,
  updateDeployment: typeof deploymentActions.updateDeployment,
  updateProject: typeof projectsActions.updateProject
}

export default class DeploymentsPanel extends Component<Props> {
  messages = getComponentMessages('DeploymentsPanel')

  _onChangePinned = (option: ReactSelectOption) => {
    const {
      fetchProjectDeployments,
      fetchProjectFeeds,
      project,
      updateProject
    } = this.props

    updateProject(
      project.id,
      { pinnedDeploymentId: option ? option.value : null }
    // $FlowFixMe action is wrapped in dispatch, so it can do promise stuff
    ).then(
      () => {
        fetchProjectDeployments(project.id)
        // needed in case user switches back to feeds tab
        fetchProjectFeeds(project.id)
      }
    )
  }

  _onToggleAutoDeploy = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const {
      fetchProjectDeployments,
      fetchProjectFeeds,
      project,
      updateProject
    } = this.props

    updateProject(
      project.id,
      { autoDeploy: evt.target.checked }
    // $FlowFixMe action is wrapped in dispatch, so it can do promise stuff
    ).then(
      () => {
        fetchProjectDeployments(project.id)
        // needed in case user switches back to feeds tab
        fetchProjectFeeds(project.id)
      }
    )
  }

  _onDeleteDeployment = (deployment: Deployment) => {
    this.refs.confirmModal.open({
      title: 'Delete Deployment?',
      body: `Are you sure you want to delete the deployment ${deployment.name}?`,
      onConfirm: () => {
        console.log('OK, deleting')
        this.props.deleteDeployment(deployment)
      }
    })
  }

  render () {
    const {
      activeSubComponent: deploymentId,
      createDeployment,
      fetchProjectDeployments,
      fetchProjectFeeds,
      project,
      saveDeployment,
      updateDeployment,
      updateProject
    } = this.props
    const deployments = project.deployments || []
    const deployment = deployments &&
      deployments.find(d => d.id && d.id === deploymentId)
    // Deployment is selected and found in list.
    if (deployment) {
      return (
        <ActiveDeploymentViewer
          project={project}
          deployment={deployment}
          feedSources={project.feedSources} />
      )
    }
    // Deployment is selected, but deployments have not finished loading.
    if (deploymentId && !deployments) {
      return <Loading />
    }
    return (
      <Row>
        <ConfirmModal ref='confirmModal' />
        <Col xs={9}>
          <DeploymentsList
            createDeployment={createDeployment}
            deleteDeployment={this._onDeleteDeployment}
            fetchProjectDeployments={fetchProjectDeployments}
            fetchProjectFeeds={fetchProjectFeeds}
            project={project}
            saveDeployment={saveDeployment}
            updateDeployment={updateDeployment}
            updateProject={updateProject} />
        </Col>
        <Col xs={3}>
          <Panel header={
            <h3>
              <Icon type='rocket' /> {this.messages('autoDeploy.title')}
            </h3>
          }>
            <FormGroup controlId='pinnedDeploymentId'>
              <ControlLabel>
                <Icon type='thumb-tack' />{' '}
                {this.messages('pinnedDeployment.label')}
              </ControlLabel>
              <Select
                name='pinnedDeploymentId'
                onChange={this._onChangePinned}
                options={deployments.map(d => ({label: d.name, value: d.id}))}
                placeholder={this.messages('pinnedDeployment.placeholder')}
                value={project.pinnedDeploymentId}
              />
              <HelpBlock>
                {this.messages('pinnedDeployment.help')}
              </HelpBlock>
            </FormGroup>
            <Checkbox
              checked={project.autoDeploy}
              disabled={!project.pinnedDeploymentId}
              name={'autoDeploy'}
              onChange={this._onToggleAutoDeploy}
            >
              {this.messages('autoDeploy.label')}
            </Checkbox>
            <HelpBlock>{this.messages('autoDeploy.help')}</HelpBlock>
          </Panel>
          <Panel header={
            <h3><Icon type='cog' /> {this.messages('configuration.title')}</h3>
          }>
            <p>
              {this.messages('configuration.body')}
            </p>
            <LinkContainer to={`/project/${project.id}/settings/deployment`}>
              <Button block>
                <Icon type='cog' />{' '}
                {this.messages('configuration.editSettings')}
              </Button>
            </LinkContainer>
            <LinkContainer to={`/admin/servers`}>
              <Button block>
                <Icon type='server' />{' '}
                {this.messages('configuration.manageServers')}
              </Button>
            </LinkContainer>
          </Panel>
        </Col>
      </Row>
    )
  }
}

type ListProps = {
  createDeployment: typeof deploymentActions.createDeployment,
  deleteDeployment: Deployment => void,
  fetchProjectDeployments: typeof deploymentActions.fetchProjectDeployments,
  fetchProjectFeeds: typeof feedsActions.fetchProjectFeeds,
  project: Project,
  saveDeployment: typeof deploymentActions.saveDeployment,
  updateDeployment: typeof deploymentActions.updateDeployment,
  updateProject: typeof projectsActions.updateProject
}

type State = {
  searchText?: string
}

class DeploymentsList extends Component<ListProps, State> {
  messages = getComponentMessages('DeploymentsList')
  state = {}

  _onChangeSearch = (evt: SyntheticInputEvent<HTMLInputElement>) =>
    this.setState({searchText: evt.target.value})

  _onClickNewDeployment = () => this.props.createDeployment(this.props.project.id)

  render () {
    const {project} = this.props
    const {deployments} = project
    const {searchText} = this.state
    const {pinnedDeploymentId} = project
    const visibleDeployments: Array<Deployment> = deployments
      ? deployments
        // Filter deployments by search text.
        .filter(deployment =>
          deployment.name
            .toLowerCase()
            .indexOf((searchText || '').toLowerCase()) !== -1
        )
        .sort((a, b) => {
          // If creating deployment, pin to top.
          if (!a.name) return -1
          if (!b.name) return 1
          // Ensure pinned deployment is first element in list.
          if (b.id === pinnedDeploymentId) return 1
          if (a.id === pinnedDeploymentId) return -1
          // Otherwise, sort by most recent last deployed date and then most recent
          // created date (ensuring deployments never deployed show up at end of
          // list).
          // TODO: Refactor to allow for sorting on multiple fields? This may be
          //  overkill for deployments.
          const aValue = a.lastDeployed || a.dateCreated
          const bValue = b.lastDeployed || b.dateCreated
          if (b.lastDeployed && !a.lastDeployed) return 1
          else if (a.lastDeployed && !b.lastDeployed) return -1
          return bValue - aValue
        })
      : []
    return (
      <Panel
        header={
          <Row>
            <Col xs={4}>
              <FormControl
                placeholder={this.messages('search')}
                onChange={this._onChangeSearch} />
            </Col>
            <Col xs={8}>
              <Button
                bsStyle='success'
                // disabled={projectEditDisabled}
                className='pull-right'
                onClick={this._onClickNewDeployment}>
                <Glyphicon glyph='plus' /> {this.messages('new')}
              </Button>
            </Col>
          </Row>
        }>
        <Table striped hover fill>
          <thead>
            <tr>
              <th className='col-md-4'>{this.messages('table.name')}</th>
              <th>{this.messages('table.creationDate')}</th>
              <th>{this.messages('table.lastDeployed')}</th>
              <th>{this.messages('table.deployedTo')}</th>
              <th>{this.messages('table.feedCount')}</th>
              <th>{this.messages('table.testDeployment')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibleDeployments.map((deployment, index) => (
              <DeploymentListItem
                key={deployment.id || 'new-deployment-' + Math.random()}
                deployment={deployment}
                {...this.props} />
            ))}
          </tbody>
        </Table>
      </Panel>
    )
  }
}

type RowProps = {
  deployment: Deployment
} & ListProps

class DeploymentListItem extends Component<RowProps> {
  _isPinned = () => {
    const {deployment, project} = this.props
    return project.pinnedDeploymentId === deployment.id
  }

  _onChangeName = (name) => {
    const {deployment, saveDeployment, project, updateDeployment} = this.props
    if (deployment.isCreating) saveDeployment({projectId: project.id, name})
    else updateDeployment(deployment, {name})
  }

  _onClickDelete = () => this.props.deleteDeployment(this.props.deployment)

  render () {
    const {deployment, project} = this.props
    const server = getServerDeployedTo(deployment, project)
    const na = (<span className='deployment-na'>N/A</span>)
    return (
      <tr className={this._isPinned() ? 'pinned-deployment' : ''}>
        <td>
          {this._isPinned()
            ? <Icon
              title='This deployment is pinned.'
              type='thumb-tack' />
            : null
          }
          <EditableTextField
            inline
            isEditing={(deployment.isCreating === true)}
            value={deployment.name}
            rejectEmptyValue
            onChange={this._onChangeName}
            link={`/project/${deployment.projectId}/deployments/${deployment.id}`}
          />
        </td>
        <td>
          {deployment.dateCreated
            ? <span title={formatTimestamp(deployment.dateCreated)}>
              {' '}
              {fromNow(deployment.dateCreated)}
            </span>
            : na
          }
        </td>
        <td>
          {deployment.lastDeployed
            ? <span title={formatTimestamp(deployment.lastDeployed)}>
              {fromNow(deployment.lastDeployed)}
            </span>
            : na
          }
        </td>
        <td>
          {server
            ? <BsLabel>{server.name}</BsLabel>
            : na
          }
        </td>
        <td>
          {deployment.feedVersions
            ? <span>{deployment.feedVersions.length}</span>
            : na
          }
        </td>
        <td>
          {deployment.routerId
            ? 'Yes'
            : na
          }
        </td>
        <td>
          <ButtonGroup className='pull-right'>
            <Button
              bsStyle='danger'
              bsSize='xsmall'
              onClick={this._onClickDelete}>
              <Glyphicon glyph='remove' />
            </Button>
          </ButtonGroup>
        </td>
      </tr>
    )
  }
}
