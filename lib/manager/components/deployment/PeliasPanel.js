// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import { Checkbox, FormControl, ListGroup, ListGroupItem, Panel } from 'react-bootstrap'

import * as deploymentActions from '../../actions/deployments'
import type {
  Deployment
} from '../../../types'

type Props = {
  deployment: Deployment,
  updateDeployment: typeof deploymentActions.updateDeployment,
}

type State = {
  webhookUrl: string
}

export default class PeliasPanel extends Component<Props, State> {
  state = { webhookUrl: '' };

  componentDidMount = () => {
    const { deployment } = this.props
    this.setState({ webhookUrl: (deployment.peliasWebhookUrl || '') })
  };

  _onChangeUpdatePelias = () =>
    this._updateDeployment({
      peliasUpdate: !this.props.deployment.peliasUpdate
    });

  _onBlurWebhookUrl = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { target } = event
    const { value } = target
    this._updateDeployment({ peliasWebhookUrl: value })
  };
  _onChangeWebhookUrl = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { target } = event
    const { value } = target
    this.setState({ webhookUrl: value })
  };

  _updateDeployment = (props: { [string]: any }) => {
    const { deployment, updateDeployment } = this.props
    updateDeployment(deployment, props)
  };

  render () {
    const { deployment } = this.props
    const { webhookUrl } = this.state

    return (
      <Panel
        header={
          <h3>
            <Icon type='map-marker' /> Custom Geocoder Settings
          </h3>
        }
      >
        <ListGroup fill>
          <ListGroupItem>
            <h5>Custom Geocoder Webhook URL</h5>
            <FormControl
              type='url'
              placeholder='Update webhook URL'
              value={webhookUrl}
              onChange={this._onChangeWebhookUrl}
              onBlur={this._onBlurWebhookUrl}
            />
          </ListGroupItem>
          <ListGroupItem>
            <h5>Send GTFS feeds to custom geocoder</h5>
            <Checkbox
              checked={deployment.peliasUpdate}
              onChange={this._onChangeUpdatePelias}
            >
              Update Custom Geocoder
            </Checkbox>
          </ListGroupItem>
          <ListGroupItem>
            <h5>Custom POI CSV Upload</h5>
            TODO
          </ListGroupItem>
        </ListGroup>
      </Panel>
    )
  }
}
