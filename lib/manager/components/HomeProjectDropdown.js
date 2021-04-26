// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import {browserHistory} from 'react-router'
import Select from 'react-select'

import {getAbbreviatedProjectName} from '../../common/util/util'
import type {Project} from '../../types'
import type {ManagerUserState} from '../../types/reducers'

type Props = {
  activeProject: Project,
  user: ManagerUserState,
  visibleProjects: Array<Project>
}

type State = {
  selectedOption: any
}

export default class HomeProjectDropdown extends Component<Props, State> {
  state = {
    selectedOption: ''
  }

  handleChange = (selectedOption, activeProject) => {
    this.setState({selectedOption})
    activeProject === null
      ? browserHistory.push(`/home/${selectedOption.value}`)
      : browserHistory.push(`/home/`)
  }

  render () {
    const {
      activeProject,
      user,
      visibleProjects
    } = this.props
    const {profile} = user
    const abbreviatedProjectName = getAbbreviatedProjectName(activeProject)
    const isAdmin = user.permissions && user.permissions.isApplicationAdmin()
    if (!profile) return null
    return (
      <div style={{marginBottom: '20px'}}>
        {
          isAdmin && (
            <LinkContainer to='/project/new'>
              <Button>
                <Icon type='plus' /> New project
              </Button>
            </LinkContainer>
          )
        }
        {activeProject
          ? <LinkContainer className='pull-right' style={{marginBottom: '5px'}} to={`/project/${activeProject.id}`}>
            <Button bsStyle='primary'>View {abbreviatedProjectName}</Button>
          </LinkContainer>
          : null
        }
        <Select
          value={activeProject && {value: activeProject.id, label: activeProject.name}}
          onChange={(selectedOption) => this.handleChange(selectedOption, activeProject)}
          options={visibleProjects.map(p => ({value: p.id, label: p.name}))}
          style={{marginTop: '5px'}}
        />
      </div>
    )
  }
}
