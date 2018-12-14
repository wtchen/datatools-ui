// @flow

import React, {Component} from 'react'
import {
  Grid,
  Row,
  Col,
  Button,
  Table,
  FormControl,
  Panel,
  OverlayTrigger,
  Popover,
  Glyphicon
} from 'react-bootstrap'
import {browserHistory} from 'react-router'

<<<<<<< HEAD
import {fetchProjects, updateProject} from '../actions/projects'
import {setVisibilitySearchText} from '../actions/visibilityFilter'
=======
import * as projectsActions from '../actions/projects'
import * as visibilityFilterActions from '../actions/visibilityFilter'
>>>>>>> container-refactor
import ManagerPage from '../../common/components/ManagerPage'
import EditableTextField from '../../common/components/EditableTextField'
import {getComponentMessages} from '../../common/util/config'
import {defaultSorter} from '../../common/util/util'

import type {Props as ContainerProps} from '../containers/ActiveProjectsList'
import type {Project} from '../../types'
import type {ManagerUserState} from '../../types/reducers'

<<<<<<< HEAD
type Props = {
  fetchProjects: typeof fetchProjects,
  projects: Array<Project>,
  setVisibilitySearchText: typeof setVisibilitySearchText,
  updateProject: typeof updateProject,
  user: ManagerUserState,
  visibilitySearchText: ?string
=======
type Props = ContainerProps & {
  createProject: typeof projectsActions.createProject,
  fetchProjects: typeof projectsActions.fetchProjects,
  projects: Array<Project>,
  saveProject: typeof projectsActions.saveProject,
  setVisibilitySearchText: typeof visibilityFilterActions.setVisibilitySearchText,
  updateProject: typeof projectsActions.updateProject,
  user: ManagerUserState,
  visibilitySearchText: null | string
>>>>>>> container-refactor
}

const userCanCreateProject = (user: ManagerUserState) => {
  const {permissions} = user
  if (!permissions) return false
  else return permissions.isApplicationAdmin() || permissions.canAdministerAnOrganization()
}

export default class ProjectsList extends Component<Props> {
  messages = getComponentMessages('ProjectsList')

  componentWillMount () {
    const {fetchProjects, setVisibilitySearchText} = this.props
    setVisibilitySearchText(null)
    fetchProjects()
  }

<<<<<<< HEAD
  _newProjectClicked () {
    browserHistory.push('/project/new')
=======
  _newProjectClicked = () => {
    const {createProject, user} = this.props
    const project = {}
    const userOrganizationId = user.permissions && user.permissions.getOrganizationId()
    if (userOrganizationId) {
      project.organizationId = userOrganizationId
    }
    createProject(project)
>>>>>>> container-refactor
  }

  _onChangeSearch = (evt: SyntheticInputEvent<HTMLInputElement>) =>
    this.props.setVisibilitySearchText(evt.target.value)

  render () {
    const {
      projects,
<<<<<<< HEAD
=======
      saveProject,
>>>>>>> container-refactor
      updateProject,
      user,
      visibilitySearchText
    } = this.props
    if (!projects) {
      return <ManagerPage />
    }
    const projectCreationDisabled = !userCanCreateProject(user)
    const visibleProjects = projects
      .filter((project) => {
        if (project.isCreating) return true // projects actively being created are always visible
        return project.name.toLowerCase().indexOf((visibilitySearchText || '').toLowerCase()) !== -1
      })
      .sort(defaultSorter)

    return (
      <ManagerPage
        ref='page'
        title={this.messages('title')}>
        <Grid fluid>
          <Panel header={(<h3>Projects</h3>)}>
            <Row>
              <Col xs={4}>
                <FormControl
                  placeholder={this.messages('search')}
                  onChange={this._onChangeSearch} />
              </Col>
              <Col xs={8}>
                <Button
                  bsStyle='primary'
                  data-test-id='create-new-project-button'
                  disabled={projectCreationDisabled}
                  className='pull-right'
                  onClick={this._newProjectClicked}>
                  {this.messages('new')}
                </Button>
                <OverlayTrigger
                  trigger='click'
                  placement='left'
                  overlay={
                    <Popover
                      id='project-help'
                      title={this.messages('help.title')}>
                      {this.messages('help.content')}
                    </Popover>
                  }>
                  <Button
                    bsStyle='link'
                    className='pull-right'>
                    <Glyphicon glyph='question-sign' />
                  </Button>
                </OverlayTrigger>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Table data-test-id='project-list-table' striped hover>
                  <thead>
                    <tr>
                      <th className='col-md-4'>
                        {this.messages('table.name')}
                      </th>
                      <th className='col-md-8' />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProjects.length > 0
                      ? visibleProjects.map((project) => (
                        <ProjectRow
                          project={project}
<<<<<<< HEAD
=======
                          saveProject={saveProject}
>>>>>>> container-refactor
                          updateProject={updateProject}
                          user={user} />
                      ))
                      : <tr>
                        <td className='col-md-12 text-center'>
                          {this.messages('noProjects')}
                          {'    '}
                          <Button
                            bsStyle='primary'
                            disabled={projectCreationDisabled}
                            onClick={this._newProjectClicked}>
                            {this.messages('createFirst')}
                          </Button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Panel>
        </Grid>
      </ManagerPage>
    )
  }
}

class ProjectRow extends Component<{
  project: Project,
<<<<<<< HEAD
  updateProject: typeof updateProject,
  user: ManagerUserState
}> {
  _onChangeName = (name: string) => {
    const {project, updateProject} = this.props
    const proj = {}
    proj.name = name
    if (project.organizationId) proj.organizationId = project.organizationId
    updateProject(project.id, {name})
=======
  saveProject: typeof projectsActions.saveProject,
  updateProject: typeof projectsActions.updateProject,
  user: ManagerUserState
}> {
  _onChangeName = (name: string) => {
    const {project, updateProject, saveProject} = this.props
    const proj = {}
    proj.name = name
    if (project.organizationId) proj.organizationId = project.organizationId
    if (project.isCreating) saveProject(proj)
    else updateProject(project, {name})
>>>>>>> container-refactor
  }

  render () {
    const {project, user} = this.props
    const disabled = !user.permissions ||
      !user.permissions.isProjectAdmin(project.id, project.organizationId)
    return (
      <tr>
        <td className='col-md-4'>
          <div className='project-name-editable'>
            <EditableTextField
              value={project.name}
              disabled={disabled}
              onChange={this._onChangeName}
              link={`/project/${project.id}`} />
          </div>
        </td>
        <td className='col-md-8' />
      </tr>
    )
  }
}
