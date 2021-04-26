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

export default class HomeProjectDropdown extends Component<Props> {
  getOptions = (visibleProjects: Props) => {
    return visibleProjects.map(p => ({value: p.id, label: p.name}))
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
          onChange={(selectedOption) => browserHistory.push(`/home/${selectedOption.value}`)}
          options={this.getOptions(visibleProjects)}
        />
      </div>
    )
  }
}
