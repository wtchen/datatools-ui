import React, { PropTypes } from 'react'
import { Popover, ProgressBar, Glyphicon } from 'react-bootstrap'
import { Icon } from 'react-fa'

export default class JobMonitor extends React.Component {

  static propTypes = {
    jobMonitor: PropTypes.object,
    setJobMonitorVisible: PropTypes.func
  }

  render () {
    if (!this.props.jobMonitor.visible || !this.props.jobMonitor.timer) return null

    const popoverWidth = 276 // max from bootstrap
    const popoverStyle = {
      width: popoverWidth,
      marginTop: 60,
      marginLeft: -popoverWidth / 2 + 22
    }

    const jobContainerStyle = {
      marginBottom: 15
    }

    const progressBarStyle = {
      marginBottom: 2
    }

    const statusMessageStyle = {
      fontSize: '12px',
      color: 'darkGray'
    }

    const title = (<div>
      <span>Job Status</span>
      <Glyphicon glyph='remove'
        className='pull-right'
        style={{ cursor: 'pointer' }}
        onClick={() => this.props.setJobMonitorVisible(false) }
      />
    </div>)

    return (
      <Popover
        ref='statusPopover'
        style={popoverStyle}
        id='status-popover'
        title={title}
        placement='bottom'
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
      </Popover>
    )
  }
}
