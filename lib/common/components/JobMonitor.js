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

  componentDidUpdate () {
    const jobList = this.refs.jobList
    jobList.scrollTop = jobList.scrollHeight
  }

  // Remove any retired jobs from the monitor
  removeAll = () => {
    const { jobMonitor } = this.props
    jobMonitor.retired.forEach(job => this.props.removeRetiredJob(job))

    // If no active jobs left, then close the popover
    if (jobMonitor.jobs.length === 0) this.props.close()
  }

  sortByDate = (a, b) => new Date(b.status.initialized) - new Date(a.status.initialized)

  render () {
    const {jobMonitor, removeRetiredJob} = this.props
    const {jobs, retired} = jobMonitor
    return (
      <SidebarPopover
        ref={(SidebarPopover) => { this.popover = SidebarPopover }}
        title='Server Jobs'
        fixedHeight={300}
        minMarginBottom={75}
        {...this.props}
      >
        <div className='job-monitor'>
          {/* The main list of jobs */}
          <div className='job-list' ref='jobList'> {/* TODO: replace w/ React 16 createRef() */}
            <ul className='list-unstyled'>
              {retired.sort(this.sortByDate).map(job => (
                <RetiredJob
                  key={`retired-${job.jobId}`}
                  job={job}
                  removeRetiredJob={removeRetiredJob} />
              ))}
              {jobs.sort(this.sortByDate).map(job => {
                const pctComplete = Math.round(job.status ? job.status.percentComplete : 0)
                return (
                  <li key={job.jobId} className='job-container'>
                    <div className='job-spinner-div'>
                      <Icon type='spinner' className='fa-pulse' />
                    </div>
                    <div className='job-container-inner'>
                      <div>
                        <strong>{job.name}</strong>
                      </div>
                      <ProgressBar active
                        style={{ width: 190 }}
                        label={`${pctComplete}%`}
                        now={pctComplete}
                        className='job-status-progress-bar' />
                      <div className='job-status-message' >
                        {job.status ? job.status.message : 'waiting'}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          {/* Lower panel job count and clear-all button */}
          <div style={{ marginTop: 8 }}>
            <Button
              style={{ float: 'right' }}
              bsSize='small'
              disabled={retired.length === 0}
              onClick={this.removeAll}>
              <Icon type='times-circle' /> Clear completed
            </Button>
            <div style={{ paddingTop: 6, fontSize: 13 }}>
              {jobs.length ? jobs.length : 'No'} active job{!jobs.length || jobs.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
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
          <div style={{ float: 'right' }}>
            <Button
              className='close-job-button'
              bsStyle='link'
              style={{ padding: 'none' }}
              onClick={this.removeJob}>
              <Icon className='pull-right' type='times-circle' />
            </Button>
          </div>
          <div>
            <div style={{
              display: 'inline-block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: 170,
              whiteSpace: 'nowrap'
            }}>
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
        </div>
      </li>
    )
  }
}
