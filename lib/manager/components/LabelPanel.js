import React, { Component } from 'react'
import { Panel } from 'react-bootstrap'

import FeedLabel from '../../common/containers/FeedLabel'
import { Project } from '../../types'

import LabelEditorModal from './LabelEditorModal'

export default class LabelPanel extends Component<{ project: Project; }> {
  _onClickNewLabel = () => this.refs.newLabelModal.open();

  render () {
    const {large, project} = this.props
    const { labels, id: projectId } = project

    let labelBody = (
      <div className='noLabelsMessage' >
        There are no labels in this project.
      </div>
    )
    if (labels.length > 0) {
      labelBody = labels.map((label) => (
        <FeedLabel key={label.id} label={label} />
      ))
    }

    return (
      <Panel header={<h3>Labels</h3>}>
        <div className={`feedLabelContainer ${large ? 'large' : ''}`}>
          <LabelEditorModal ref='newLabelModal' projectId={projectId} />
          <button className='newLabel' onClick={this._onClickNewLabel}>Add a new label</button>
          {labelBody}
        </div>
      </Panel>
    )
  }
}
