import React, {PropTypes, Component} from 'react'
import {Button, Panel, Glyphicon, Form, Checkbox, FormGroup, ControlLabel, FormControl} from 'react-bootstrap'

import {getMessage, getComponentMessages} from '../../common/util/config'

export default class OtpServer extends Component {
  static propTypes = {
    index: PropTypes.number,
    onChange: PropTypes.func,
    server: PropTypes.object
  }
  _onChange = (evt) => this.props.onChange(this.props.index, {[evt.target.name]: evt.target.value})

  _onChangeAdmin = (evt) => this.props.onChange(this.props.index, {[evt.target.name]: evt.target.checked})

  _onChangeUrls = (evt) => this.props.onChange(this.props.index, {[evt.target.name]: evt.target.value.split(',')})

  _onRemove = () => this.props.onRemove(this.props.index)

  render () {
    const {server} = this.props
    const messages = getComponentMessages('ProjectSettings')
    const title = (
      <h5>
        {server.name}{'  '}
        <small>{server.publicUrl}</small>
      </h5>
    )
    return (
      <Panel
        header={server.name ? title : `[${getMessage(messages, 'deployment.servers.serverPlaceholder')}]`}
        defaultExpanded={server.name === ''}
        collapsible>
        <Form>
          <Button
            bsSize='xsmall'
            bsStyle='danger'
            className='pull-right'
            onClick={this._onRemove}>
            Remove <Glyphicon glyph='remove' />
          </Button>
          <FormGroup>
            <ControlLabel>{getMessage(messages, 'deployment.servers.name')}</ControlLabel>
            <FormControl
              type='text'
              placeholder={getMessage(messages, 'deployment.servers.namePlaceholder')}
              defaultValue={server.name}
              name='name'
              onChange={this._onChange} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{getMessage(messages, 'deployment.servers.public')}</ControlLabel>
            <FormControl
              type='text'
              placeholder='http://otp.example.com'
              defaultValue={server.publicUrl}
              name='publicUrl'
              onChange={this._onChange} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{getMessage(messages, 'deployment.servers.internal')}</ControlLabel>
            <FormControl
              type='text'
              placeholder='http://127.0.0.1/otp,http://0.0.0.0/otp'
              defaultValue={server.internalUrl && server.internalUrl.join(',')}
              name='internalUrl'
              onChange={this._onChangeUrls} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{getMessage(messages, 'deployment.servers.s3Bucket')}</ControlLabel>
            <FormControl
              type='text'
              placeholder='s3_bucket_name'
              defaultValue={server.s3Bucket}
              name='s3Bucket'
              onChange={this._onChange} />
          </FormGroup>
          <Checkbox
            checked={server.admin}
            name='admin'
            onChange={this._onChangeAdmin}>
            {getMessage(messages, 'deployment.servers.admin')}
          </Checkbox>
        </Form>
      </Panel>
    )
  }
}
