// @flow

import Icon from '@conveyal/woonerf/components/icon'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Button, Checkbox, FormControl, ListGroup, ListGroupItem, Panel } from 'react-bootstrap'

import SelectFileModal from '../../../common/components/SelectFileModal'
import { getHeaders } from '../../../common/util/util'
import * as deploymentActions from '../../actions/deployments'
import {SECURE_API_PREFIX} from '../../../common/constants'
import type {
  Deployment
  , Project } from '../../../types'
import type { ManagerUserState } from '../../../types/reducers'

type Props = {
  deployment: Deployment,
  project: Project,
  updateDeployment: typeof deploymentActions.updateDeployment,
  user: ManagerUserState
}

type State = {
  fileToDeleteOnSuccesfulUpload: string,
  peliasPassword: string,
  peliasUsername: string,
  peliasWebhookUrl: string
}

class PeliasPanel extends Component<Props, State> {
  state = {
    fileToDeleteOnSuccesfulUpload: null,
    peliasWebhookUrl: '',
    peliasPassword: '',
    peliasUsername: ''
  };

  componentDidMount = () => {
    const { deployment, project } = this.props
    this.setState({
    // Auto-populate blank field if project has webhook URL in it
      peliasWebhookUrl: deployment.peliasWebhookUrl || project.lastUsedPeliasWebhookUrl || '',
      peliasPassword: deployment.peliasPassword || '',
      peliasUsername: deployment.peliasUsername || ''
    })
  };

  /**
   *  Method fired when Pelias Update checkbox is checked
   */
  _onChangeUpdatePelias = () =>
    this._updateDeployment({
      peliasUpdate: !this.props.deployment.peliasUpdate
    });

  /**
   * Updates state on input changes. Does not persist changes to deployment
   */
  _onChangeTextInput = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { target } = event
    const { value, id } = target
    this.setState({ [id]: value })
  };
  /**
   * Fires when input field is blurred, and persists state changes to the deployment by
   * making a network request
  */
  _onBlurTextInput = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { target } = event
    const { value, id } = target
    this._updateDeployment({ [id]: value })
  };

  /**
   * Takes files submitted via the file uploader modal and sends them to datatools server where they are
   * uploaded to S3
   * @param files Array of files returned by the file upload modal
   * @returns     True or false depending on if the upload was a success
   */
  _onConfirmUpload = async (files: Array<File>) => {
    const { user, deployment } = this.props
    const { fileToDeleteOnSuccesfulUpload } = this.state

    let peliasCsvFiles = deployment.peliasCsvFiles || []

    if (!user.token || user.token === null) {
      return false
    }

    const file = files[0]
    // TODO: more extensive csv validation?
    if (file.type === 'text/csv') {
      const url = `${SECURE_API_PREFIX}deployments/${deployment.id}/upload`
      const formData = new FormData()
      formData.append('file', file)

      const s3UploadResponse = await fetch(url, {
        method: 'post',
        // $FlowFixMe user.token is tested above, but not detected by flow
        headers: getHeaders(user.token, false),
        body: formData
      })
      const s3UploadUrl = await s3UploadResponse.text()

      // If a file is set to delete on successful upload, delete it here
      if (fileToDeleteOnSuccesfulUpload) {
        peliasCsvFiles = peliasCsvFiles.filter(csv => csv !== fileToDeleteOnSuccesfulUpload)
        this.setState({ fileToDeleteOnSuccesfulUpload: null })
      }

      this._updateDeployment({ 'peliasCsvFiles': [ ...peliasCsvFiles, s3UploadUrl ] })
      return true
    } else {
      return false
    }
  }

  /**
   * Removes a csv file from the list of Pelias csv files associated with a deployment
   * WARNING: DOES NOT REMOVE THE FILE FROM S3!
   * @param url   The URL of the csv file to remove from the deployment
   */
  _deleteCsvFile = async (url: string) => {
    const { deployment } = this.props
    if (!deployment.peliasCsvFiles) return

    const updatedCsvFiles = deployment.peliasCsvFiles.filter(u => u !== url)
    this._updateDeployment({'peliasCsvFiles': updatedCsvFiles})
  }

  /**
   * Persists changes to the deployment object by making a request to the datatools server
   */
  _updateDeployment = (props: { [string]: any }) => {
    const { deployment, updateDeployment } = this.props
    updateDeployment(deployment, props)
  };

  /**
   * Renders a csv link associated with the deployment. Renders the file name (or URI if not added by datatools) and
   * buttons to replace or remove the file
   * @param {*} url     The URL to add to the list of csv files associated with the deployment
   * @param {*} enabled Whether the buttons should be enabled
   * @returns           JSX including the file name and buttons
   */
  renderCsvUrl = (url: string, enabled: boolean) => {
    // Usually, files will be rendered by https://github.com/ibi-group/datatools-server/blob/dev/src/main/java/com/conveyal/datatools/manager/controllers/api/DeploymentController.java
    // so we can take advantage of a predictable filename
    // As a fallback, render the full url
    const fileName = url.split('_').length === 2 ? url.split('_')[1] : url
    return (
      <li key={url}>
        {fileName}{' '}
        <Button disabled={!enabled} bsSize='xsmall' onClick={() => {
          this.refs.uploadModal.open()
          this.setState({fileToDeleteOnSuccesfulUpload: url})
        }}>
          Replace
        </Button>
        <Button disabled={!enabled} bsSize='xsmall' onClick={() => {
          if (confirm('Are you sure you want to delete this CSV file?')) {
            this._deleteCsvFile(url)
          }
        }}>Delete</Button>
      </li>
    )
  }

  render () {
    const { deployment } = this.props
    const { peliasWebhookUrl, peliasPassword, peliasUsername } = this.state

    const optionsEnabled = peliasWebhookUrl !== ''

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
              id='peliasWebhookUrl'
              placeholder='Update webhook URL'
              value={peliasWebhookUrl}
              onChange={this._onChangeTextInput}
              onBlur={this._onBlurTextInput}
            />
            <h5>Username</h5>
            <FormControl
              type='text'
              id='peliasUsername'
              disabled={!optionsEnabled}
              autoComplete='off'
              placeholder='Webhook Username'
              value={peliasUsername}
              onChange={this._onChangeTextInput}
              onBlur={this._onBlurTextInput}
            />
            <h5>Password</h5>
            <FormControl
              type='password'
              id='peliasPassword'
              disabled={!optionsEnabled}
              autoComplete='off'
              placeholder='Webhook Password'
              value={peliasPassword}
              onChange={this._onChangeTextInput}
              onBlur={this._onBlurTextInput}
            />
          </ListGroupItem>
          <ListGroupItem>
            <h5>Send GTFS feeds to custom geocoder</h5>
            <Checkbox
              disabled={!optionsEnabled}
              checked={deployment.peliasUpdate}
              onChange={this._onChangeUpdatePelias}
            >
              Update Custom Geocoder
            </Checkbox>
          </ListGroupItem>
          <ListGroupItem>
            <h5>Custom POI CSV Files</h5>
            <SelectFileModal
              ref='uploadModal'
              title='Upload CSV File'
              body='Select a CSV file of POIs to upload:'
              onConfirm={this._onConfirmUpload}
              onCancel={() => this.setState({fileToDeleteOnSuccesfulUpload: null})}
              errorMessage='Uploaded file must be a valid csv file (.csv).'
            />
            <ul>
              {deployment.peliasCsvFiles &&
                deployment.peliasCsvFiles.map((url) =>
                  this.renderCsvUrl(url, optionsEnabled)
                )}
            </ul>
            <Button
              style={{ marginTop: '5px' }}
              disabled={!optionsEnabled}
              onClick={() => this.refs.uploadModal.open()}
            >
              Upload New CSV File
            </Button>
          </ListGroupItem>
        </ListGroup>
      </Panel>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PeliasPanel)
