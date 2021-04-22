// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Button, MenuItem } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import Select from 'react-select'

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
  };

  handleChange = (selectedOption: any) => {
    this.setState(
      {selectedOption},
      () => console.log(`Option selected:`, this.state.selectedOption)
    )
  };

  render () {
    const {selectedOption} = this.state
    const {
      activeProject,
      user,
      visibleProjects
    } = this.props
    const {profile} = user
    if (!profile) return null
    return (
      <div style={{marginBottom: '20px'}}>
        {activeProject
          ? <LinkContainer className='pull-right' style={{position: 'relative', listStyle: 'none', zIndex: '1', marginBottom: '5px'}} to={`/project/${selectedOption && selectedOption.value}`}>
            <Button bsStyle='primary'>View {selectedOption && selectedOption.label}</Button>
          </LinkContainer>
          : null
        }
        <Select
          value={selectedOption}
          style={{marginBottom: '5px', zIndex: '0'}}
          onChange={this.handleChange}
          options={visibleProjects.map(p => ({value: p.id, label: p.name}))} placeholder={`Select Project...`}
        />
        <LinkContainer to='/project/new' style={{listStyle: 'none'}}>
          <MenuItem>
            <Icon type='plus' /> New project
          </MenuItem>
        </LinkContainer>
      </div>
    )
  }
}
