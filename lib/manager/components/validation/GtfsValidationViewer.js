import Icon from '@conveyal/woonerf/components/icon'
import moment from 'moment'
import React, {Component, PropTypes} from 'react'
import {ListGroup, Table, ListGroupItem, Panel, Button, Col, Row} from 'react-bootstrap'
import {browserHistory} from 'react-router'

import {getTableFatalExceptions} from '../../util/version'
import Loading from '../../../common/components/Loading'
import OptionButton from '../../../common/components/OptionButton'
import toSentenceCase from '../../../common/util/to-sentence-case'

const DEFAULT_LIMIT = 10

export default class GtfsValidationViewer extends Component {
  static propTypes = {
    fetchValidationResult: PropTypes.func,
    fetchGTFSEntities: PropTypes.func,
    validationResult: PropTypes.object,
    version: PropTypes.object
  }

  state = {
    offset: 0,
    limit: DEFAULT_LIMIT
  }

  componentWillMount () {
    this.props.fetchValidationResult()
  }

  _onClickErrorType = errorType => {
    const {version: feedVersion, fetchValidationErrors} = this.props
    const {active, limit, offset} = this.state
    const {error_counts} = feedVersion.validationResult
    if (active === errorType) {
      // Close error type category
      this.setState({active: null})
    } else {
      const category = error_counts.find(c => c.type === errorType)
      if (!category.errors || category.errors.length === 0) {
        // Fetch errors and reset active error type, limit, and offset
        this.setState({active: errorType})
        fetchValidationErrors({feedVersion, errorType, offset, limit})
      } else {
        // Do not fetch errors if first batch has already been fetched.
        // reset active error type, limit, and offset
        this.setState({active: errorType, offset: 0})
      }
    }
  }

  _onClickLoadMoreErrors = errorType => {
    const {version: feedVersion, fetchValidationErrors} = this.props
    const {limit} = this.state
    const {error_counts} = feedVersion.validationResult
    const category = error_counts.find(c => c.type === errorType)
    // Update offset based on number of errors already fetched
    const offset = category.errors.length
    this.setState({offset})
    fetchValidationErrors({feedVersion, errorType, offset, limit})
  }

  render () {
    const {
      validationResult: result,
      version
    } = this.props
    const tableFatalExceptions = getTableFatalExceptions(version)
    const {active} = this.state
    const dateFormat = 'MMM. DD, YYYY'
    const timeFormat = 'h:MMa'
    const hasValidation = result && result.error_counts
    const versionHasErrors = hasValidation && result.error_counts.length
    return (
      <div>
        <h2 style={{marginTop: '0px'}}>
          {version.name}{' '}
          <small>
            {moment(version.updated).format(dateFormat + ', ' + timeFormat)}
          </small>
        </h2>
        {tableFatalExceptions.length > 0 &&
          <div>Fatal exceptions: {tableFatalExceptions.map(e => `${e.tableName}: ${e.fatalException}`).join(', ')}</div>
        }
        <Panel header={<h2>Validation errors</h2>}>
          {versionHasErrors
            ? result.error_counts.map((category, index) => {
              const errorTypeIsActive = active === category.type
              const firstError = category.errors && category.errors[0]
              let multiTyped = false
              firstError && category.errors.forEach(e => {
                if (e.entity_type !== firstError.entity_type) multiTyped = true
              })
              return (
                <ListGroup key={index} fill>
                  <ListGroupItem>
                    <Row
                      className='list-group-item-heading'
                      // FIXME
                      onClick={() => this._onClickErrorType(category.type)}
                      style={{cursor: 'pointer'}}>
                      <Col xs={12}>
                        <h4>
                          <Icon type={errorTypeIsActive ? 'caret-down' : 'caret-right'} />
                          {toSentenceCase(category.type.replace(/_/g, ' '))}
                          <span className='pull-right text-warning'>
                            <Icon type='exclamation-triangle' /> {category.count}
                          </span>
                        </h4>
                      </Col>
                    </Row>
                  </ListGroupItem>
                  {/* Render list of errors */}
                  <Panel collapsible bsClass='' expanded={errorTypeIsActive}>
                    <ListGroupItem>
                      <strong>Description:</strong> {category.message}
                    </ListGroupItem>
                    <Table striped hover fill className='table-fixed'>
                      <thead><tr>
                        <th>Line #</th>
                        {multiTyped && <th>Entity type</th>}
                        <th>{firstError && !multiTyped ? firstError.entity_type : 'Entity'} ID</th>
                        <th>Bad value</th>
                        <th>Action</th>
                      </tr></thead>
                      {category.errors
                        ? category.errors.map((error, index) => (
                          <ValidationErrorItem
                            {...this.props}
                            version={version}
                            multipleEntityTypes={multiTyped}
                            error={error}
                            index={index}
                            key={index} />
                        ))
                        : <Loading />
                      }
                    </Table>
                  </Panel>
                  {errorTypeIsActive &&
                    category.errors &&
                    category.errors.length < category.count
                    ? <ListGroupItem className='validation-item'>
                      <OptionButton
                        value={category.type}
                        onClick={this._onClickLoadMoreErrors}>
                        Load more
                      </OptionButton>
                    </ListGroupItem>
                    : errorTypeIsActive
                    ? <ListGroupItem className='validation-item'>
                      <span className='text-muted'>No more errors of this type</span>
                    </ListGroupItem>
                    : null
                  }
                </ListGroup>
              )
            })
            : <ListGroup fill>
              <ListGroupItem className='validation-item'>
                No validation errors!
              </ListGroupItem>
            </ListGroup>
          }
        </Panel>
      </div>
    )
  }
}

class ValidationErrorItem extends Component {
  state = {expanded: false}

  _onClickFetch = () => {
    const {expanded} = this.state
    const {error, gtfs, version: feedVersion, fetchGTFSEntities} = this.props
    const {entity_id: id, entity_type: type} = error
    const entity = gtfs.validation.data.find(e => e._id === `${type}:${id}`)
    if (!expanded) {
      if (!entity) {
        // fetch GTFS entity
        const {entity_id: id, entity_type: type} = error
        if (id) {
          fetchGTFSEntities({type, id: [id], namespace: feedVersion.namespace})
        } else {
          // FIXME: fetch by line number
          fetchGTFSEntities({type, id: [id], namespace: feedVersion.namespace})
        }
      }
    }
    this.setState({expanded: !expanded})
  }

  _renderEntityDetails = (entity, type, sequence) => {
    if (entity) {
      if (type === 'StopTime') {
        const items = [<tr key='zero'><td colSpan='4'>...</td></tr>]
        items.push(entity.stop_times.map((stopTime, index) => {
          if (stopTime.stop_sequence < sequence - 1 || stopTime.stop_sequence > sequence + 1) return null
          return <tr key={index} className={stopTime.stop_sequence === sequence ? 'danger' : ''}><td colSpan='4'>
            {Object.keys(stopTime).map(stKey => {
              let value = stopTime[stKey]
              if (stKey.endsWith('_time')) {
                const time = moment().startOf('day').seconds(stopTime[stKey])
                value = time && time.isValid() ? time.format('HH:mm:ss') : value
              }
              return <div key={stKey}><strong>{stKey}</strong>: {value}</div>
            })}
          </td></tr>
        }))
        items.push(<tr key='last'><td colSpan='4'>...</td></tr>)
        return items
      }
      return (
        <tr><td colSpan='4'>
          {Object.keys(entity).map(key => {
            if (key === '_id') return null
            return <div key={key}><strong>{key}</strong>: {entity[key]}</div>
          })}
        </td></tr>
      )
    } else {
      return null
    }
  }

  // FIXME: Add link to GTFS Editor with entity_id
  _onEditClick = () => {
    const {error, version} = this.props
    // Line numbers in validation errors also refer to unique ID field of each
    // table of entities
    const {line_number: id} = error
    // FIXME: use component
    browserHistory.push(`/feed/${version.feedSource.id}/edit/stop/${id}`)
    console.log(this.props.error.entity_id)
  }

  render () {
    const {error, gtfs, index, multipleEntityTypes} = this.props
    const {expanded} = this.state
    const {
      entity_id: gtfsId,
      entity_sequence: sequence,
      entity_type: type,
      line_number: lineNumber,
      bad_value: badValue
    } = error
    const entity = gtfs.validation.data.find(e => e._id === `${type}:${gtfsId}`)
    const idString = sequence !== null
      ? `${gtfsId}:${sequence}`
      : gtfsId

    // FIXME
    const editingIsDisabled = typeof type === 'undefined'
    return <tbody>
      {index % 2 === 0 ? <tr className='hidden' /> : null}
      <tr>
        <td>{lineNumber}</td>
        {multipleEntityTypes && <td>{type}</td>}
        <td>{idString}</td>
        <td>{badValue === null ? <span className='text-muted'>N/A</span> : badValue}</td>
        <td>
          <Button
            disabled={editingIsDisabled}
            style={{margin: 0, padding: 0}}
            title='Fix in editor'
            onClick={this._onEditClick}
            bsStyle='link'
          >
            <Icon type='wrench' />
          </Button>
          <Button
            onClick={this._onClickFetch}
            title={`View ${type} details`}
            style={{margin: 0, padding: 0}}
            bsStyle='link'
          >
            <Icon type='info' />
          </Button>
        </td>
      </tr>
      {expanded ? this._renderEntityDetails(entity, type, sequence) : null}
    </tbody>
  }
}
