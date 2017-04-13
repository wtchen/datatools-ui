import React from 'react'
import { Grid, Row, Col, Button, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'

import PublicPage from './PublicPage'

export default class SignupPage extends React.Component {
  render () {
    const email = (
      <FormGroup controlId='formControlsEmail'>
        <ControlLabel>Email</ControlLabel>
        <FormControl
          type='email'
          placeholder='user@example.com'
          onChange={(evt) => {
            const email = evt.target.value
            this.setState({email})
          }}
        />
      </FormGroup>
    )
    const password = (
      <FormGroup controlId='formControlsPassword'>
        <ControlLabel>Password</ControlLabel>
        <FormControl
          type='password'
          placeholder='password'
          onChange={(evt) => {
            const password = evt.target.value
            this.setState({password})
          }}
        />
      </FormGroup>
    )
    return (
      <PublicPage ref='publicPage'>
        <Grid>
          <Row>
            <Col xs={12}>
              <h2>
                Create an account
              </h2>
            </Col>
          </Row>

          <Row>
            <Col xs={4}>
              <form>
                <p>Already have an account? <Button href='#' bsStyle='link' onClick={this.props.loginHandler}>Sign in</Button></p>
                {/* username */}
                {email}
                {password}
                <Button
                  href='#'
                  bsStyle='primary'
                  onClick={(evt) => {
                    evt.preventDefault()
                    console.log(this.state)
                    this.props.signupHandler(this.state)
                  }}
                >
                  Sign up!
                </Button>
              </form>
            </Col>
          </Row>
        </Grid>
      </PublicPage>
    )
  }
}
