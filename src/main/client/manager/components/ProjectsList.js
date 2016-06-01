import React from 'react'
import Helmet from 'react-helmet'
import { Grid, Row, Col, Button, Table, Input, Panel, OverlayTrigger, Popover, Glyphicon } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerPage from '../../common/components/ManagerPage'
import EditableTextField from '../../common/components/EditableTextField'
import defaultSorter from '../../common/util/util'

export default class ProjectsList extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {

    if (!this.props.projects) {
      return <ManagerPage />
    }
    const messages = DT_CONFIG.messages.ProjectsList
    const projectCreationDisabled = !this.props.user.permissions.isApplicationAdmin()
    const visibleProjects = this.props.projects.filter((project) => {
      if(project.isCreating) return true // projects actively being created are always visible
      return project.name.toLowerCase().indexOf((this.props.visibilitySearchText || '').toLowerCase()) !== -1
    }).sort(defaultSorter)

    return (
      <ManagerPage ref='page'>
        <Helmet
          title={messages.title}
        />
        <Grid>
          <Panel header={(<h3>Projects</h3>)}>
          <Row>
            <Col xs={4}>
              <Input
                type="text"
                placeholder={messages.search}
                onChange={evt => this.props.searchTextChanged(evt.target.value)}
              />
            </Col>
            <Col xs={8}>

            <Button
              bsStyle='primary'
              disabled={projectCreationDisabled}
              className='pull-right'
              onClick={() => this.props.onNewProjectClick()}
            >
              {messages.new}
            </Button>
            <OverlayTrigger trigger="click" placement="left" overlay={<Popover id='project-help' title={messages.help.title}>{messages.help.content}</Popover>}>
              <Button bsStyle="link" className='pull-right'><Glyphicon glyph='question-sign'/></Button>
            </OverlayTrigger>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Table striped hover>
                <thead>
                  <tr>
                    <th className="col-md-4">{messages.table.name}</th>
                    <th className="col-md-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProjects.length > 0 ? visibleProjects.map((project) => {
                    let disabled = !this.props.user.permissions.isProjectAdmin(project.id)
                    return (
                      <tr key={project.id}>
                        <td className="col-md-4">
                          <div>
                            <EditableTextField
                              isEditing={(project.isCreating === true)}
                              value={project.name}
                              disabled={disabled}
                              onChange={(value) => {
                                if(project.isCreating) this.props.newProjectNamed(value)
                                else this.props.projectNameChanged(project, value)
                              }}
                              link={`/project/${project.id}`}
                            />
                          </div>
                        </td>
                        <td className="col-md-8">
                        </td>
                      </tr>
                    )
                  })
                  : <tr>
                  <td className='col-md-12 text-center'>
                    {messages.noProjects}
                    {'    '}
                    <Button
                      bsStyle='primary'
                      disabled={projectCreationDisabled}
                      onClick={() => this.props.onNewProjectClick()}
                    >
                      {messages.createFirst}
                    </Button>
                  </td></tr>
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
