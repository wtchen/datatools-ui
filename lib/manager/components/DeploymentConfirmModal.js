// @flow

import * as React from 'react'
import {Alert as BootstrapAlert, Button, Glyphicon, Modal} from 'react-bootstrap'
import {Map, TileLayer, Rectangle} from 'react-leaflet'

import {getComponentMessages, getMessage} from '../../common/util/config'
import {defaultTileURL} from '../../common/util/maps'
import {getFeedNames, versionHasExpired} from '../util/version'
import polygon from 'turf-polygon'
import area from '@turf/area'

import type {Deployment} from '../../types'

type Props = {
  deployment: Deployment,
  deployToTargetClicked: (Deployment, string) => void,
  oldDeployment: ?Deployment,
  onClose: () => void,
  target: string
}

type State = {
  isDeployed?: boolean
}

const BOUNDS_LIMIT = 10 // Limit for the decimal degrees span

export default class DeploymentConfirmModal extends React.Component<Props, State> {
  state = {}

  messages = getComponentMessages('DeploymentConfirmModal')

  _onClickDeploy = () => {
    const {deployment, deployToTargetClicked, target} = this.props
    deployToTargetClicked(deployment, target)
    this.setState({isDeployed: true})
  }

  _onClose = () => this.props.onClose()

  render () {
    const {Body, Footer, Header, Title} = Modal
    const {deployment, oldDeployment, target} = this.props
    const {isDeployed} = this.state
    const isMissingFeeds = deployment.feedVersions.length === 0
    const isMissingBounds = !deployment.projectBounds
    const {east, north, south, west} = deployment.projectBounds || {east: 10, north: 10, west: -10, south: -10}
    const boundsTooLarge = east - west > BOUNDS_LIMIT || north - south > BOUNDS_LIMIT
    const bounds = [[north, east], [south, west]]
    let deploymentAreaKm = 0
    if (!isMissingBounds) {
      const boundsPolygon = polygon([[[north, east], [north, west], [south, west], [south, east], [north, east]]])
      const boundsArea: number = area(boundsPolygon)
      deploymentAreaKm = (boundsArea / (1000 * 1000)).toFixed(3)
    }
    const deploymentIsDisabled = isDeployed || boundsTooLarge || isMissingBounds || isMissingFeeds
    const expiredFeeds = deployment.feedVersions.filter(versionHasExpired)
    return (
      <Modal show onHide={this._onClose}>
        <Header>
          <Title>
            {getMessage(this.messages, 'deploy')} {deployment.name}{' '}
            {getMessage(this.messages, 'to')} {target}?
          </Title>
        </Header>
        <Body>
          <h3>Deployment Settings</h3>
          <ul className='list-unstyled'>
            <li>
              <Glyphicon glyph='fullscreen' />{' '}OSM bounds:{' '}
              {isMissingBounds
                ? getMessage(this.messages, 'invalidBounds')
                : `${north.toFixed(6)}, ${east.toFixed(6)} ${getMessage(this.messages, 'to')} ${south.toFixed(6)}, ${west.toFixed(6)} (${deploymentAreaKm} sq. km)`
              }
            </li>
            <li>
              <Glyphicon glyph='list' />{' '}Deploying {deployment.feedVersions.length} feeds:{' '}
              {getFeedNames(deployment.feedVersions)}
            </li>
          </ul>
          <h3>OpenTripPlanner Settings</h3>
          <ul className='list-unstyled'>
            <li data-test-id='deployment-router-id'>
              Router ID: {deployment.routerId || '[default]'}
            </li>
            <li>Build config: {deployment.customBuildConfig ? 'custom' : 'default'}</li>
            <li>Router config: {deployment.customRouterConfig ? 'custom' : 'default'}</li>
          </ul>
          <Map
            ref='map'
            bounds={bounds}
            scrollWheelZoom={false}
            style={{width: '100%', height: '300px'}}>
            <TileLayer
              url={defaultTileURL()}
              attribution={process.env.MAPBOX_ATTRIBUTION} />
            {!isMissingBounds &&
              <Rectangle
                bounds={bounds}
                fillOpacity={0} />
            }
          </Map>
          {isMissingFeeds &&
            <Alert
              type='danger'
              label={getMessage(this.messages, 'alert.missingFeeds')} />
          }
          {isMissingBounds &&
            <Alert
              type='danger'
              label={getMessage(this.messages, 'alert.missingBounds')} />
          }
          {boundsTooLarge &&
            <Alert
              type='danger'
              label={getMessage(this.messages, 'alert.boundsTooLarge')} />
          }
          {expiredFeeds.length > 0 &&
            <Alert label={`${getMessage(this.messages, 'alert.expiredFeeds')}: ${getFeedNames(expiredFeeds)}`} />
          }
          {/* Show succces alert. */}
          {isDeployed && oldDeployment &&
            <Alert type='success' label={getMessage(this.messages, 'alert.success')} />
          }
          {/* Warn that there is already a deployment to this router. */}
          {!isDeployed && oldDeployment &&
            <Alert label={
              <span>
                <strong>{oldDeployment.name}</strong>{' '}
                {getMessage(this.messages, 'alert.alreadyDeployed')}
              </span>
            } />
          }
        </Body>
        <Footer>
          <Button
            bsStyle='primary'
            data-test-id='confirm-deploy-server-button'
            disabled={deploymentIsDisabled}
            onClick={this._onClickDeploy}
          >
            {getMessage(this.messages, 'deploy')}
          </Button>
          <Button
            onClick={this._onClose}>
            {isDeployed
              ? getMessage(this.messages, 'close')
              : getMessage(this.messages, 'cancel')
            }
          </Button>
        </Footer>
      </Modal>
    )
  }
}

type AlertProps = {
  label: React.Node,
  type: string
}

class Alert extends React.Component<AlertProps> {
  static defaultProps = {
    type: 'warning'
  }

  messages = getComponentMessages('DeploymentConfirmModal')

  render () {
    const {type, label} = this.props
    return (
      <BootstrapAlert
        style={{marginTop: '15px', marginBottom: '0px'}}
        bsStyle={type}>
        <strong>{getMessage(this.messages, type)}</strong>{' '}
        {label}
      </BootstrapAlert>
    )
  }
}
