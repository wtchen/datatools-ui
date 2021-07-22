// @flow
import React, { Component } from 'react'
import { Panel } from 'react-bootstrap'

import FeedLabel from '../../common/containers/FeedLabel'
import type {ManagerUserState} from '../../types/reducers'

import LabelEditorModal from './LabelEditorModal'

export type Props = {
  large?: boolean,
  project?: any,
  user: ManagerUserState,
};

export default class LabelPanel extends Component<Props> {
  _onClickNewLabel = () => this.refs.newLabelModal.open();

  render () {
    const {large, project, user} = this.props

    // To make flow happy, make sure there is a valid
    // project we can add labels tobefore continuing
    if (!project || !project.labels || !project.id) { return <div /> }

    const { labels, id: projectId } = project

    const projectAdmin =
      user &&
      user.permissions &&
      user.permissions.isProjectAdmin(project.id)

    let labelBody = (
      <div className='noLabelsMessage' >
        There are no labels in this project.
      </div>
    )
    if (labels.length > 0) {
      labelBody = labels.map((label) => (
        // Flow doesn't like things being created within a map
        // $FlowFixMe
        <FeedLabel key={label.id} label={label} />
      ))
    }

    return (
      <Panel header={<h3>Labels</h3>}>
        <div className={`feedLabelContainer ${large ? 'large' : ''}`}>
          <LabelEditorModal ref='newLabelModal' projectId={projectId} />
          {projectAdmin && (
            <button
              className='labelActionButton'
              onClick={this._onClickNewLabel}
            >
              Add a new label
            </button>
          )}
          {labelBody}
        </div>
      </Panel>
    )
  }
}
