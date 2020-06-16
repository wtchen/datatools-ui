// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {
  Button,
  ButtonToolbar,
  Col,
  DropdownButton,
  ListGroup,
  ListGroupItem,
  MenuItem,
  Panel
} from 'react-bootstrap'
import Select from 'react-select'

import {RETRIEVAL_METHODS} from '../../common/constants'
import {getGtfsSpec, getGtfsPlusSpec, isModuleEnabled} from '../../common/util/config'
import toSentenceCase from '../../common/util/to-sentence-case'
import VersionRetrievalBadge from './version/VersionRetrievalBadge'
import VersionSelectorDropdown from './version/VersionSelectorDropdown'

import type {FeedVersion} from '../../types'
// import type {ManagerUserState} from '../../types/reducers'

function newRuleSet (
  retrievalMethods = ['FETCHED_AUTOMATICALLY', 'MANUALLY_UPLOADED'],
  transformations = []
) {
  return {
    retrievalMethods,
    transformations
  }
}

/**
 * Returns human readable name for transformation type.
 */
function getTransformationName (type: string, transformation?: *, versions?: Array<FeedVersion>) {
  let name = type
    // Remove transformation from name.
    .replace('Transformation', '')
    // Regex finds/captures words in camel case string and splits camel-cased words.
    // Derived from: https://stackoverflow.com/a/18379358/915811
    .replace(/([a-z])([A-Z])/g, '$1 $2')
  name = toSentenceCase(name)
  // Contextualize name if transformation is provided.
  if (transformation) {
    const {csvData, table, sourceVersionId} = transformation
    const stringText = csvData ? `below text` : '[insert text]'
    name = name.replace('string', stringText)
    const tableText = table ? `${table} file` : '[choose table]'
    name = name.replace('file', tableText)
    if (versions) {
      const version = versions.find(v => v.id === sourceVersionId)
      const versionText = version ? `version ${version.version}` : '[choose version]'
      name = name.replace('version', versionText)
    }
  }
  return name
}

export default class FeedTransformationSettings extends Component<*, *> {
  _addRuleSet = () => {
    const {feedSource, updateFeedSource} = this.props
    const transformRules = [...feedSource.transformRules]
    // If adding first rule set, use default retrieval methods. Otherwise,
    // initialize to empty.
    const ruleSet = transformRules.length === 0
      ? newRuleSet()
      : newRuleSet([])
    transformRules.push(ruleSet)
    updateFeedSource(feedSource, {transformRules})
  }

  _deleteRuleSet = (index: number) => {
    const {feedSource, updateFeedSource} = this.props
    const transformRules = [...feedSource.transformRules]
    transformRules.splice(index, 1)
    updateFeedSource(feedSource, {transformRules})
  }

  _saveRuleSet = (ruleSet: any, index: number) => {
    const {feedSource, updateFeedSource} = this.props
    const transformRules = [...feedSource.transformRules]
    transformRules.splice(index, 1, ruleSet)
    updateFeedSource(feedSource, {transformRules})
  }

  render () {
    const {
      disabled,
      feedSource
    } = this.props
    // Do not allow users without manage-feed permission to modify feed
    // transformation settings.
    // TODO: Should we improve this to show the feed transformations, but disable
    // making any changes?
    if (disabled) {
      return (
        <p className='lead'>
          User is not authorized to modify feed transformation settings.
        </p>
      )
    }
    return (
      <Col xs={7}>
        {/* Settings */}
        <Panel header={<h3>Transformation Settings</h3>}>
          <ListGroup fill>
            <ListGroupItem>
              <p>
                Feed transformations provide a way to automatically transform
                GTFS data that is loaded into Data Tools. Add a transformation,
                describe when it should be applied (e.g., only to feeds uploaded
                manually), and then define a series of steps to modify the data.
              </p>
              <Button onClick={this._addRuleSet}>
                Add transformation
              </Button>
            </ListGroupItem>
            {feedSource.transformRules.map((ruleSet, i) => {
              return (
                <FeedTransformRules
                  key={i}
                  feedSource={feedSource}
                  index={i}
                  onChange={this._saveRuleSet}
                  onDelete={this._deleteRuleSet}
                  ruleSet={ruleSet}
                />
              )
            })}
          </ListGroup>
        </Panel>
      </Col>
    )
  }
}

export function newFeedTransformation (type: string = 'ReplaceFileFromVersionTransformation', props: any = {}) {
  return {
    '@type': type,
    ...props
  }
}

const feedTransformationTypes = [
  'ReplaceFileFromVersionTransformation',
  'ReplaceFileFromStringTransformation'
]

class FeedTransformRules extends Component<*, *> {
  _addTransformation = (type: string) => {
    const {index, onChange, ruleSet} = this.props
    const transformations = [...ruleSet.transformations]
    transformations.push(newFeedTransformation(type))
    onChange({...ruleSet, transformations}, index)
  }

  _removeRuleSet = () => {
    const {index, onDelete} = this.props
    const ok = window.confirm(
      `Are you sure you would like to delete Transformation ${index + 1}?`
    )
    if (ok) onDelete(index)
  }

  _onChangeTransformation = (changes, transformationIndex) => {
    const {index, onChange, ruleSet} = this.props
    const transformations = [...ruleSet.transformations]
    transformations[transformationIndex] = {...transformations[transformationIndex], ...changes}
    onChange({...ruleSet, transformations}, index)
  }

  _onChangeRetrievalMethods = (options) => {
    const {index, onChange, ruleSet} = this.props
    const retrievalMethods = options.map(o => o.value)
    onChange({...ruleSet, retrievalMethods}, index)
  }

  _onToggleEnabled = (evt) => {
    const {index, onChange, ruleSet} = this.props
    onChange({...ruleSet, active: !ruleSet.active}, index)
  }

  _removeTransformation = (transformationIndex: number) => {
    const {index, onChange, ruleSet} = this.props
    const transformations = [...ruleSet.transformations]
    transformations.splice(transformationIndex, 1)
    onChange({...ruleSet, transformations}, index)
  }

  _retrievalMethodToOption = (method) => {
    return {
      value: method,
      label: toSentenceCase(method.toLowerCase().split('_').join(' '))
    }
  }

  render () {
    const {feedSource, ruleSet, index} = this.props
    const methodBadges = ruleSet.retrievalMethods.map(method =>
      <VersionRetrievalBadge key={method} retrievalMethod={method} />)
    return (
      <ListGroupItem className={ruleSet.active ? '' : 'disabled'}>
        <h4>
          <ButtonToolbar className='pull-right'>
            <Button
              bsSize='xsmall'
              onClick={this._onToggleEnabled}>
              {ruleSet.active
                ? <span><Icon type='pause' /> Pause</span>
                : <span><Icon type='play' /> Resume</span>
              }
            </Button>
            <Button
              bsSize='xsmall'
              onClick={this._removeRuleSet}>
              <Icon type='trash' /> Delete
            </Button>
          </ButtonToolbar>
          <Icon type='wrench' /> Transformation {index + 1}{' '}
          {!ruleSet.active ? '(Paused) ' : ''}
          <small>{methodBadges}</small>
        </h4>
        <small>
          Indicate which GTFS files this transformation applies to.
        </small>
        <Select
          style={{margin: '5px 0px 10px 0px'}}
          clearable={false}
          multi
          placeholder='Select GTFS retrieval methods'
          options={RETRIEVAL_METHODS.map(this._retrievalMethodToOption)}
          value={ruleSet.retrievalMethods.map(this._retrievalMethodToOption)}
          onChange={this._onChangeRetrievalMethods} />
        {ruleSet.transformations.length > 0
          ? ruleSet.transformations.map((t, i) => {
            return (
              <FeedTransformation
                key={i}
                feedSource={feedSource}
                onChange={this._onChangeTransformation}
                onRemove={this._removeTransformation}
                ruleSet={ruleSet}
                transformation={t}
                index={i} />
            )
          })
          : <div className='lead'>No transformation steps defined.</div>
        }
        <ButtonToolbar>
          <DropdownButton
            title='Add step to transformation'
            id='add-transformation-dropdown'
            onSelect={this._addTransformation}>
            {feedTransformationTypes.map(t => <MenuItem key={t} eventKey={t}>{getTransformationName(t)}</MenuItem>)}
          </DropdownButton>
        </ButtonToolbar>
      </ListGroupItem>
    )
  }
}

class FeedTransformation extends Component<*, *> {
  state = { csvData: null }

  _getFieldsForType = (type: string) => {
    const {feedSource, transformation} = this.props
    // Get selected version (if applicable).
    const version = feedSource.feedVersions &&
      feedSource.feedVersions.find(v => v.id === transformation.sourceVersionId)
    const fields = []
    let index = 0
    switch (type) {
      case 'ReplaceFileFromVersionTransformation':
        fields.push(
          <VersionSelectorDropdown
            key={index++}
            dropdownProps={{
              id: 'merge-versions-dropdown',
              onSelect: this._onSelectVersion
            }}
            title={version
              ? `From source version ${version.version}`
              : 'Select a source version'
            }
            version={version}
            versions={feedSource.feedVersions}
          />
        )
        break
      case 'ReplaceFileFromStringTransformation':
        const inputIsUnchanged = this.state.csvData === null
        const csvData = inputIsUnchanged
          ? transformation.csvData
          : this.state.csvData
        const textValue = csvData || ''
        const numLines = !textValue ? 0 : textValue.split(/\r*\n/).length
        fields.push(
          <div>
            <label>Add the CSV data to add to/replace in the incoming GTFS:</label>
            <textarea
              onChange={this._onChangeCsvData}
              style={{
                fontFamily: 'monospace',
                fontSize: 'x-small',
                height: '80px',
                overflow: 'auto',
                width: '400px',
                whiteSpace: 'pre'
              }}
              placeholder={
                `stop_id,stop_code,stop_name,stop_lat,stop_lon
1234567,188390987,Broad Ave,33.98768,-87.72686`
              }
              value={textValue} />
            <div style={{marginBottom: '10px'}}>
              <Button
                bsSize='xsmall'
                disabled={inputIsUnchanged}
                style={{marginRight: '5px'}}
                onClick={this._onSaveCsvData}>
                Save CSV
              </Button>
              <small>{numLines} lines</small>
            </div>
          </div>
        )
        break
      default:
        break
    }
    return fields
  }

  _getValidationIssues = () => {
    const {feedSource, transformation} = this.props
    // Get selected version (if applicable).
    const version = feedSource.feedVersions &&
      feedSource.feedVersions.find(v => v.id === transformation.sourceVersionId)
    const issues = []
    if (!transformation.table) {
      issues.push('Table must be defined')
    }
    switch (transformation['@type']) {
      case 'ReplaceFileFromVersionTransformation':
        // Only trigger validation issue if versions have been loaded.
        if (!version && feedSource.feedVersions) {
          issues.push('Version must be defined')
        }
        break
      case 'ReplaceFileFromStringTransformation':
        if (!transformation.csvData) {
          issues.push('CSV Data must be defined')
        }
        break
      default:
        break
    }
    return issues
  }

  _onChangeCsvData = (evt) => {
    this.setState({csvData: evt.target.value})
  }

  _onSaveCsvData = () => {
    const csvData = this.state.csvData || null
    this.setState({csvData: null})
    this.props.onChange({csvData}, this.props.index)
  }

  _onRemoveTransformation = () => {
    this.props.onRemove(this.props.index)
  }

  _onSelectTable = (tableOption) => {
    this.props.onChange({table: tableOption.value}, this.props.index)
  }

  _onSelectVersion = (versionIndex) => {
    const version = this.props.feedSource.feedVersions[versionIndex - 1]
    this.props.onChange({sourceVersionId: version.id}, this.props.index)
  }

  render () {
    const {feedSource, index, transformation} = this.props
    const tables = [...getGtfsSpec()].filter(t => !t.datatools)
    if (isModuleEnabled('gtfsplus')) tables.push(...getGtfsPlusSpec())
    const transformationType = transformation['@type']
    const validationIssues = this._getValidationIssues()
    const backgroundColor = validationIssues.length === 0
      ? '#f7f7f7'
      : '#ffdf68'
    return (
      <div style={{
        backgroundColor,
        padding: '2px 10px 10px 10px',
        marginBottom: '10px',
        border: '#ccc 1px solid',
        borderRadius: '10px'
      }}>
        <h5>
          <Button
            bsSize='xsmall'
            className='pull-right'
            onClick={this._onRemoveTransformation}>
            Delete step
          </Button>
          Step {index + 1} - {getTransformationName(transformationType, transformation, feedSource.feedVersions)}
        </h5>
        <div className='feed-transformation-body'>
          <Select
            style={{margin: '10px 0px', width: '230px'}}
            clearable={false}
            placeholder='Choose the file/table to replace'
            options={tables.map(table => ({value: table.name.split('.txt')[0], label: table.name}))}
            value={transformation.table}
            onChange={this._onSelectTable} />
          {this._getFieldsForType(transformationType)}
          {validationIssues.length > 0
            ? <ul className='list-unstyled'>
              <Icon type='exclamation-triangle' /> <strong>Validation Issues</strong>
              {validationIssues.map((issue, i) => {
                return (
                  <li style={{marginLeft: '10px'}} key={`issue-${i}`}>
                    {issue}
                  </li>
                )
              })}
            </ul>
            : null
          }
        </div>
      </div>
    )
  }
}
