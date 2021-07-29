// @flow

import React from 'react'
import {
  Button,
  Col,
  Checkbox,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  HelpBlock,
  ListGroup,
  ListGroupItem,
  Modal,
  Panel,
  Row
} from 'react-bootstrap'
import update from 'react-addons-update'
import { connect } from 'react-redux'

import { createLabel, updateLabel } from '../../manager/actions/labels'
import { validationState } from '../util'
import type { ManagerUserState } from '../../types/reducers'
import type { Label } from '../../types'

type Props = {
  createLabel: Function,
  label: Label,
  onDone?: Function,
  projectId: string,
  updateLabel: Function,
  user: ManagerUserState
}

type State = {
  labelIsNew?: boolean,
  newLabel: Label,
  validation: {
    description: boolean,
    name: boolean
  }
}

/**
 * Component to edit a label. If a label is specified, that label will be pre-filled. If a new label
 * is to be created, a blank object and project id must be passed in.
 */
class LabelEditor extends React.Component<Props, State> {
    state = {
      validation: {
        name: true,
        description: true
      },
      newLabel: {...this.props.label},
      labelIsNew: false
    }

    componentDidMount = () => {
      // If we didn't get a label passed in, declare the label to be new
      if (Object.keys(this.props.label).length === 0) {
        this.setState({
          labelIsNew: true
        })
      }
    }

    userIsAdmin = (user: ManagerUserState) => {
      const {permissions} = user
      if (!permissions) return false
      else return permissions.isApplicationAdmin() || permissions.canAdministerAnOrganization()
    }

  _onFormChange = ({target}: {target: HTMLInputElement}) => {
    const {name, value} = target

    this.setState(
      update(this.state, {
        newLabel: { $merge: {[name]: value} },
        validation: { [name]: { $set: value && value.length > 0 } }
      })
    )
  }

  _onCheckboxChange = ({target}: {target: HTMLInputElement}) => {
    const {name, checked} = target

    this.setState(
      update(this.state, {
        newLabel: { $merge: {[name]: checked} },
        // Checkboxes are valid in any state
        validation: { [name]: { $set: true } }
      })
    )
  }

  /**
   * Compares the dirty label from the old one to determine which keys changed
   * @returns Object with all changes
   */
  _getChanges = () => {
    const newLabel = this.state.newLabel
    const oldLabel = this.props.label

    const changes: any = {}
    Object.keys(newLabel).forEach(k => {
      if (newLabel[k] !== oldLabel[k]) {
        changes[k] = newLabel[k]
      }
    })
    return changes
  }

  _settingsAreUnedited = () => Object.keys(this._getChanges()).length === 0

  _formIsValid = () => {
    const {validation} = this.state
    return Object.keys(validation).every(k => validation[k])
  }

  _onSaveSettings = () => {
    const {labelIsNew, newLabel: label} = this.state
    const {createLabel, updateLabel} = this.props

    if (labelIsNew) {
      // Insert project ID
      label.projectId = this.props.projectId
      createLabel(label)
    } else {
      updateLabel(label)
    }

    // This passed method will close the editor
    this.props.onDone && this.props.onDone()
  }

  render () {
    const { newLabel, validation } = this.state
    const { user } = this.props

    return (
      <Form>
        <Panel>
          <ListGroup fill>
            <ListGroupItem>
              <FormGroup validationState={validationState(validation.name)}>
                <ControlLabel>Name</ControlLabel>
                <FormControl
                  value={newLabel.name}
                  name={'name'}
                  onChange={this._onFormChange}
                />
                <FormControl.Feedback />
                <HelpBlock>Required.</HelpBlock>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  value={newLabel.description}
                  name={'description'}
                  onChange={(e) => this._onFormChange(e, true)}
                />
                <FormControl.Feedback />
              </FormGroup>
            </ListGroupItem>
            <ListGroupItem>
              <Row>
                <Col xs={3}>
                  <FormGroup>
                    <ControlLabel>Color</ControlLabel>
                    <FormControl
                      value={newLabel.color}
                      name={'color'}
                      type='color'
                      onChange={this._onFormChange}
                    />
                    <FormControl.Feedback />
                  </FormGroup>
                </Col>
                {this.userIsAdmin(user) && (
                  <Col xs={9}>
                    <Checkbox
                      checked={newLabel.adminOnly}
                      name='adminOnly'
                      type='checkbox'
                      onChange={(e) => this._onCheckboxChange(e)}
                      style={{margin: 0}}
                    >
                      <strong>Visible to admins only?</strong>
                    </Checkbox>
                    <div style={{marginTop: 5}}>
                      If checked, this label will only be visible to project and application admins. Users with feed-specific priveleges will not see this label applied to any feed sources.
                    </div>
                  </Col>
                )}
              </Row>
            </ListGroupItem>
          </ListGroup>
        </Panel>
        <Modal.Footer>
          {/* Cancel button */}
          <Button onClick={this.props.onDone} style={{ marginRight: 10 }}>
              Cancel
          </Button>
          {/* Save button */}
          <Button
            bsStyle='primary'
            disabled={this._settingsAreUnedited() || !this._formIsValid()}
            type='submit'
            onClick={this._onSaveSettings}
          >
              Save
          </Button>
        </Modal.Footer>
      </Form>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    newLabel: state.newLabel,
    user: state.user
  }
}

const mapDispatchToProps = {
  createLabel, updateLabel
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LabelEditor)
