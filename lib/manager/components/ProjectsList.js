import React, {Component, PropTypes} from 'react'
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
import { browserHistory } from 'react-router'

import ManagerPage from '../../common/components/ManagerPage'
import EditableTextField from '../../common/components/EditableTextField'
import defaultSorter from '../../common/util/util'
import { getComponentMessages, getMessage } from '../../common/util/config'

export default class ProjectsList extends Component {
  static propTypes = {
    projectNameChanged: PropTypes.func,
    projects: PropTypes.array,
    searchTextChanged: PropTypes.func,
    user: PropTypes.object,
    visibilitySearchText: PropTypes.object
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  _newProjectClicked () {
    browserHistory.push('/project/new')
  }

  _onChangeSearch = evt => this.props.searchTextChanged(evt.target.value)

  render () {
    const {
      projects,
      projectNameChanged,
      user,
      visibilitySearchText
    } = this.props
    if (!projects) {
      return <ManagerPage />
    }
    const messages = getComponentMessages('ProjectsList')
    const projectCreationDisabled = !user.permissions.isApplicationAdmin() && !user.permissions.canAdministerAnOrganization()
    const visibleProjects = projects
      .filter((project) => {
        if (project.isCreating) return true // projects actively being created are always visible
        return project.name.toLowerCase().indexOf((visibilitySearchText || '').toLowerCase()) !== -1
      })
      .sort(defaultSorter)

    return (
      <ManagerPage
        ref='page'
        title={getMessage(messages, 'title')}>
        <Grid fluid>
          <Panel header={(<h3>Projects</h3>)}>
            <Row>
              <Col xs={4}>
                <FormControl
                  placeholder={getMessage(messages, 'search')}
                  onChange={this._onChangeSearch} />
              </Col>
              <Col xs={8}>
                <Button
                  bsStyle='primary'
                  disabled={projectCreationDisabled}
                  className='pull-right'
                  onClick={this._newProjectClicked}>
                  {getMessage(messages, 'new')}
                </Button>
                <OverlayTrigger trigger='click' placement='left' overlay={<Popover id='project-help' title={getMessage(messages, 'help.title')}>{getMessage(messages, 'help.content')}</Popover>}>
                  <Button bsStyle='link' className='pull-right'><Glyphicon glyph='question-sign' /></Button>
                </OverlayTrigger>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th className='col-md-4'>{getMessage(messages, 'table.name')}</th>
                      <th className='col-md-8' />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProjects.length > 0 ? visibleProjects.map((project) => (
                      <ProjectRow
                        project={project}
                        projectNameChanged={projectNameChanged}
                        user={user} />
                    ))
                    : <tr>
                      <td className='col-md-12 text-center'>
                        {getMessage(messages, 'noProjects')}
                        {'    '}
                        <Button
                          bsStyle='primary'
                          disabled={projectCreationDisabled}
                          onClick={this._newProjectClicked}>
                          {getMessage(messages, 'createFirst')}
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

class ProjectRow extends Component {
  _onChangeName = (name) => {
    const {project, projectNameChanged} = this.props
    const proj = {name}
    if (project.organizationId) proj.organizationId = project.organizationId
    projectNameChanged(project, name)
  }

  render () {
    const {project, user} = this.props
    const disabled = !user.permissions.isProjectAdmin(project.id, project.organizationId)
    return (
      <tr key={project.id}>
        <td className='col-md-4'>
          <div>
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
