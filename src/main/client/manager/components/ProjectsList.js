import React from 'react'
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

    const visibleProjects = this.props.projects.filter((project) => {
      if(project.isCreating) return true // projects actively being created are always visible
      return project.name.toLowerCase().indexOf((this.props.visibilitySearchText || '').toLowerCase()) !== -1
    }).sort(defaultSorter)

    return (
      <ManagerPage ref='page'>
        <Grid>
          <Panel header={(<h3>Projects</h3>)}>
          <Row>
            <Col xs={4}>
              <Input
                type="text"
                placeholder="Search by Project Name"
                onChange={evt => this.props.searchTextChanged(evt.target.value)}
              />
            </Col>
            <Col xs={8}>

            <Button
              bsStyle='primary'
              className='pull-right'
              onClick={() => this.props.onNewProjectClick()}
            >
              New Project
            </Button>
            <OverlayTrigger trigger="click" placement="left" overlay={<Popover title="What's a project?">A project is used to group GTFS feeds. For example, the feeds in a project may be in the same region or they may collectively define a planning scenario.</Popover>}>
              <Button bsStyle="link" className='pull-right'><Glyphicon glyph='question-sign'/></Button>
            </OverlayTrigger>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Table striped hover>
                <thead>
                  <tr>
                    <th className="col-md-4">Project Name</th>
                    <th className="col-md-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProjects.length > 0 ? visibleProjects.map((project) => {
                    let disabled = !this.props.user.permissions.isProjectAdmin(project.id)
                    console.log(disabled)
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
                    You currently do not have any projects. &nbsp;&nbsp;&nbsp;&nbsp;
                    <Button
                      bsStyle='primary'
                      onClick={() => this.props.onNewProjectClick()}
                    >
                      Create my first project
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
