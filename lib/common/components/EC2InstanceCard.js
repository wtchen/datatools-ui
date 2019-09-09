// @flow

import moment from 'moment'
import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import { Panel } from 'react-bootstrap'
import { Link } from 'react-router'

import { formatTimestamp } from '../util/date-time'

import type { EC2InstanceSummary } from '../../types'

type Props = {
  instance: EC2InstanceSummary,
  showDeploymentLink?: boolean
}

export default class EC2InstanceCard extends Component<Props> {
  _getTimeActive = () => {
    const { instance } = this.props
    // If instance hasn't launched, don't calculate time.
    if (!instance.launchTime) return 'N/A'
    // Set end time as termination time or now.
    const endTimestamp = this._getTerminationTime()
    let endTime = endTimestamp ? moment(endTimestamp) : moment()
    const launchTime = moment(instance.launchTime)
    const duration = moment.duration(endTime.diff(launchTime))
    return duration.asDays() < 1
      ? `${duration.asHours().toFixed(2)} hours`
      : `${duration.asDays().toFixed(2)} days`
  }

  _getInstanceUrl = () => {
    const { instance } = this.props
    return `https://console.aws.amazon.com/ec2/v2/home?region=${instance.availabilityZone.slice(0, -1)}#Instances:search=${instance.instanceId}`
  }

  _getStatusIcon = (instance: EC2InstanceSummary) => {
    // 'pending' | 'running' | 'shutting-down' | 'stopping' | 'stopped' | 'terminated'
    const color = instance.state.name === 'running'
      ? 'green'
      : instance.state.name === 'pending' || instance.state.name === 'shutting-down'
        ? 'yellow'
        : 'red'
    return <Icon title={instance.state.name} type='circle' style={{ color }} />
  }

  _getTerminationTime = () => {
    // Try to parse stateTransitionReason for date. Otherwise, use now as end time.
    const regExp = /\(([^)]+)\)/
    const matches = regExp.exec(this.props.instance.stateTransitionReason)
    if (matches && matches[1]) {
      return matches[1]
    }
    return null
  }

  render () {
    const { instance } = this.props
    const { deploymentId, projectId } = instance
    const terminationTime = this._getTerminationTime()
    return (
      <Panel>
        <div>
          {this._getStatusIcon(instance)} {instance.instanceId}{' '}
        </div>
        <div>
          <small>
            <div className='overflow' style={{ width: '212px' }}>
              <Icon type='id-card-o' /> {instance.name}
            </div>
            {this.props.showDeploymentLink
              ? <div>
                <Icon type='globe' />{' '}
                <Link to={`/project/${projectId}/deployments/${deploymentId}`}>
                  View deployment
                </Link>
              </div>
              : null
            }
            <div>
              <Icon type='rocket' /> {this._getTimeActive()}{' '}
              ({formatTimestamp(instance.launchTime)})
            </div>
            <div>
              {instance.publicIpAddress
                ? <a target='_blank' href={`http://${instance.publicIpAddress}`}>
                  {instance.publicIpAddress}
                </a>
                : 'No public IP'
              }
              <a
                style={{ marginLeft: '60px' }}
                target='_blank'
                href={this._getInstanceUrl()}>view in console</a>
            </div>
            {terminationTime
              ? <div><Icon type='times' /> {formatTimestamp(terminationTime)}</div>
              : null
            }
          </small>
        </div>
      </Panel>
    )
  }
}
