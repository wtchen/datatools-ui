// @flow

import React, { Component } from 'react'
import { Col, ListGroup, Panel, Row, ListGroupItem, Badge } from 'react-bootstrap'

import type {FeedVersion} from '../../types'

type Props = {
  version: FeedVersion,
}

export default class TransformationsViewer extends Component<Props> {
  render () {
    const {
      version
    } = this.props

    if (version.feedTransformResult && version.feedTransformResult.tableTransformResults) {
      const {tableTransformResults} = version.feedTransformResult
      tableTransformResults[1] = {...tableTransformResults[0]}
      tableTransformResults[1].tableName = 'test'
      const transformContent = tableTransformResults.map(res => {
        const badge = res.transformType === 'TABLE_MODIFIED'
          ? <Badge>Table Modified</Badge>
          : res.transformType === 'TABLE_ADDED'
            ? <Badge>Table Added</Badge>
            : res.transformType === 'TABLE_REPLACED'
              ? <Badge>Table Replaced</Badge>
              : res.transformType === 'TABLE_DELETED'
                ? <Badge>Table Deleted</Badge>
                : null
        return (
          <ListGroupItem key={res.tableName}>
            <div>
              <h4 style={{marginTop: '5px'}}>{res.tableName} {badge}</h4>
              <Row style={{textAlign: 'center'}}>
                <Col xs={4}>Rows added: {res.addedCount}</Col>
                <Col xs={4}>Rows deleted: {res.deletedCount}</Col>
                <Col xs={4}>Rows updated: {res.updatedCount}</Col>
              </Row>
            </div>
          </ListGroupItem>
        )
      })
      return (
        <div>
          <Panel header={<h2>Transformations:</h2>}>
            <ListGroup>
              {transformContent}
            </ListGroup>
          </Panel>
        </div>
      )
    } else {
      return <div><h3>No transformations applied.</h3></div>
    }
  }
}
