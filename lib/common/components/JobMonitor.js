import Icon from '@conveyal/woonerf/components/icon'
import Pure from '@conveyal/woonerf/components/pure'
import React, {PropTypes} from 'react'
import {ProgressBar, Button, OverlayTrigger, Popover} from 'react-bootstrap'

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

  componentWillReceiveProps (nextProps) {
    // TODO: fix resizing when jobs are removed (height of popover appears to be incorrect)
    // if (nextProps.jobMonitor.retired.length !== this.props.jobMonitor.retired.length) {
    //   this.popover._onResize()
    // } else if (nextProps.jobMonitor.jobs.length !== this.props.jobMonitor.jobs.length) {
    //   this.popover._onResize()
    // }
  }

  removeAll = () => {
    this.props.jobMonitor.retired.forEach(job => this.props.removeRetiredJob(job))
  }

  sortByDate = (a, b) => new Date(b.status.initialized) - new Date(a.status.initialized)

  render () {
    const {jobMonitor, removeRetiredJob} = this.props
    const {jobs, retired} = jobMonitor
    return (
      <SidebarPopover
        ref={(SidebarPopover) => { this.popover = SidebarPopover }}
        title='Server Jobs'
        {...this.props}>
        <ul className='list-unstyled job-list'>
          {retired.sort(this.sortByDate).map(job => (
            <RetiredJob
              key={`retired-${job.jobId}`}
              job={job}
              removeRetiredJob={removeRetiredJob} />
            ))}
          {jobs.sort(this.sortByDate).map(job => (
            <li key={job.jobId} className='job-container'>
              <div className='job-spinner-div'>
                <Icon type='spinner' className='fa-pulse' />
              </div>
              <div className='job-container-inner'>
                <div>
                  <strong>{job.name}</strong>
                </div>
                <ProgressBar
                  label={`${job.status ? job.status.percentComplete : 0}%`}
                  active now={job.status ? job.status.percentComplete : 0}
                  className='job-status-progress-bar' />
                <div className='job-status-message' >
                  {job.status ? job.status.message : 'waiting'}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className='lead text-center'>{jobs.length ? jobs.length : 'No'} active jobs.</p>
        <Button
          block
          disabled={retired.length === 0}
          onClick={this.removeAll}>
          <Icon type='times-circle' /> Clear completed
        </Button>
      </SidebarPopover>
    )
  }
}

class RetiredJob extends Pure {
  static propTypes = {
    job: PropTypes.object,
    removeRetiredJob: PropTypes.func,
    statusStyle: PropTypes.object,
    style: PropTypes.object
  }

  removeJob = () => this.props.removeRetiredJob(this.props.job)

  render () {
    const {job} = this.props
    return (
      <li className='job-container'>
        <div style={{ float: 'left' }}>
          {job.status && job.status.error
            ? <Icon className='text-warning' type='exclamation-circle' />
            : <Icon className='text-success' type='check' />
          }
        </div>
        <div className='job-container-inner'>
          <div style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '220px',
            whiteSpace: 'nowrap'
          }}>
            <Button
              bsStyle='link'
              className='pull-right'
              onClick={this.removeJob}>
              <Icon className='pull-right' type='times-circle' />
            </Button>
            <strong
              title={job.name}>
              {job.name}
            </strong>
          </div>
          <div className='job-status-message'>
            {job.status.message}
            {job.status.exceptionDetails
              ? <OverlayTrigger
                trigger='click'
                placement='right'
                overlay={
                  <Popover
                    id='job-exception-detail'
                    style={{
                      minWidth: '400px'
                    }}
                    title={
                      <span>
                        <Icon type='bug' /> Oh no! Looks like an error has occurred.
                      </span>
                    }>
                    <p>
                    To submit an error report email a screenshot of your browser
                    window, the following text (current URL and error details),
                    and a detailed description of the steps you followed
                    to <a href='mailto:support@conveyal.com'>support@conveyal.com</a>.
                    </p>
                    <p>{window.location.href}</p>
                    <span style={{whiteSpace: 'pre', fontSize: 'xx-small'}}>
                      {job.status.exceptionDetails}
                    </span>
                  </Popover>
                  }>
                <Button
                  bsSize='small'
                  style={{padding: '0px'}}
                  bsStyle='link'>
                  <Icon type='bug' />
                </Button>
              </OverlayTrigger>
              : null
            }
          </div>
        </div>
      </li>
    )
  }
}
