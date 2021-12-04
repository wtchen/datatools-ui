// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import { Col, ListGroup, Panel, Row, ListGroupItem, Label } from 'react-bootstrap'

import type { FeedVersion, TableTransformResult } from '../../types'

type Props = {
  version: FeedVersion,
}

export default class TransformationsViewer extends Component<Props> {
  _getBadge (transformResult: TableTransformResult) {
    switch (transformResult.transformType) {
      // ESLint thinks that these are form labels
      /* eslint jsx-a11y/label-has-for: "off" */
      case 'TABLE_MODIFIED':
        return <Label bsStyle='primary'>Table Modified</Label>
      case 'TABLE_ADDED':
        return <Label bsStyle='success'>Table Added</Label>
      case 'TABLE_REPLACED':
        return <Label bsStyle='warning'>Table Replaced</Label>
      case 'TABLE_DELETED':
        return <Label bsStyle='danger'>Table Deleted</Label>
    }
  }

  render () {
    const {
      version
    } = this.props

    if (version.feedTransformResult && version.feedTransformResult.tableTransformResults) {
      const {tableTransformResults} = version.feedTransformResult
      const transformContent = tableTransformResults.map(res => {
        const badge = this._getBadge(res)
        return (
          <ListGroupItem key={res.tableName} style={{maxWidth: '720px'}}>
            <Row>
              <Col sm={8}>
                <h4 style={{marginTop: '5px'}}>{res.tableName}</h4>
              </Col>
              <Col sm={4} style={{textAlign: 'right'}}>
                <h4>{badge}</h4>
              </Col>
            </Row>
            <Row style={{textAlign: 'center'}}>
              <Col xs={4}><Icon type='plus-square' />Rows added: {res.addedCount}</Col>
              <Col xs={4}><Icon type='minus-square' />Rows deleted: {res.deletedCount}</Col>
              <Col xs={4}><Icon type='exchange' />Rows updated: {res.updatedCount}</Col>
            </Row>
          </ListGroupItem>
        )
      })
      return (
        <Panel header={<h3>Transformations:</h3>}>
          <ListGroup>
            {transformContent}
          </ListGroup>
        </Panel>
      )
    } else {
      return <div><h3>No transformations applied.</h3></div>
    }
  }
}
