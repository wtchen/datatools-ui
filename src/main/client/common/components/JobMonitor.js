import React, { PropTypes } from 'react'
import { ProgressBar } from 'react-bootstrap'
import { Icon } from 'react-fa'

import SidebarPopover from './SidebarPopover'

export default class JobMonitor extends React.Component {

  static propTypes = {
    jobMonitor: PropTypes.object,
    target: PropTypes.object,
    visible: PropTypes.func,
    close: PropTypes.func
  }

  render () {
    const jobContainerStyle = {
      marginBottom: 20
    }

    const progressBarStyle = {
      marginBottom: 2
    }

    const statusMessageStyle = {
      fontSize: '12px',
      color: 'darkGray'
    }

    return (
      <SidebarPopover
        ref='statusPopover'
        title='Server Jobs'
        target={this.props.target}
        visible={this.props.visible}
        close={this.props.close}
      >
        {this.props.jobMonitor.jobs.map(job => {
          return (
            <div style={jobContainerStyle}>
              <div style={{ float: 'left' }}>
                <Icon name='spinner' pulse />
              </div>
              <div style={{ marginLeft: 25 }}>
                <div>
                  <strong>{job.name}</strong>{/* <Button bsStyle='link'><Icon className='pull-right' name='times-circle'/></Button> */}
                </div>
                <ProgressBar label={`${job.status ? job.status.percentComplete : 0}%`} active={true} now={job.status ? job.status.percentComplete : 0} style={progressBarStyle} />
                <div style={statusMessageStyle} >{job.status ? job.status.message : 'waiting'}</div>
              </div>
            </div>
          )
        })}
      </SidebarPopover>
    )
  }
}
