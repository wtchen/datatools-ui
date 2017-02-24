import React, {PropTypes} from 'react'
import {ProgressBar, Button} from 'react-bootstrap'
import {Icon, Pure} from '@conveyal/woonerf'
import truncate from 'truncate'

import SidebarPopover from './SidebarPopover'

export default class JobMonitor extends Pure {
  static propTypes = {
    expanded: PropTypes.bool,
    jobMonitor: PropTypes.object,
    target: PropTypes.object,
    visible: PropTypes.bool.isRequired,
    close: PropTypes.func,
    removeRetiredJob: PropTypes.func
  }
  removeJob (job) {
    this.props.removeRetiredJob(job)
  }
  componentWillReceiveProps (nextProps) {
    // TODO: fix resizing when jobs are removed (height of popover appears to be incorrect)
    // if (nextProps.jobMonitor.retired.length !== this.props.jobMonitor.retired.length) {
    //   this.popover._onResize()
    // } else if (nextProps.jobMonitor.jobs.length !== this.props.jobMonitor.jobs.length) {
    //   this.popover._onResize()
    // }
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
        ref={(SidebarPopover) => { this.popover = SidebarPopover }}
        title='Server Jobs'
        {...this.props}>
        {this.props.jobMonitor.retired.map(job => {
          return (
            <div key={`retired-${job.jobId}`} style={jobContainerStyle}>
              <div style={{ float: 'left' }}>
                {job.status && job.status.error
                  ? <Icon className='text-warning' type='exclamation-circle' />
                  : <Icon className='text-success' type='check' />
                }
              </div>
              <div style={{ marginLeft: 25 }}>
                <div>
                  <Button
                    bsStyle='link'
                    className='pull-right'
                    onClick={() => this.removeJob(job)}
                  >
                    <Icon className='pull-right' type='times-circle' />
                  </Button>
                  <strong title={job.name}>{truncate(job.name, 25)}</strong>
                </div>
                <div style={statusMessageStyle} >{job.status && job.status.error ? 'Error!' : 'Completed!'}</div>
              </div>
            </div>
          )
        })}
        {this.props.jobMonitor.jobs.length
          ? this.props.jobMonitor.jobs.map(job => (
            <div key={job.jobId} style={jobContainerStyle}>
              <div style={{ float: 'left' }}>
                <Icon type='spinner' className='fa-pulse' />
              </div>
              <div style={{ marginLeft: 25 }}>
                <div>
                  <strong>{job.name}</strong>
                </div>
                <ProgressBar label={`${job.status ? job.status.percentComplete : 0}%`} active now={job.status ? job.status.percentComplete : 0} style={progressBarStyle} />
                <div style={statusMessageStyle} >{job.status ? job.status.message : 'waiting'}</div>
              </div>
            </div>
          ))
          : <p>No active jobs.</p>
        }
      </SidebarPopover>
    )
  }
}
