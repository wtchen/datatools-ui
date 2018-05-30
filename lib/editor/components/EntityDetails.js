import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import { Form } from 'react-bootstrap'

import ActiveTripPatternList from '../containers/ActiveTripPatternList'
import EditorInput from './EditorInput'
import FareRulesForm from './FareRulesForm'
import EntityDetailsHeader from './EntityDetailsHeader'
import ScheduleExceptionForm from './ScheduleExceptionForm'
import { getZones, getEditorTable, canApproveGtfs } from '../util'
import { getTableById } from '../util/gtfs'

export default class EntityDetails extends Component {
  static propTypes = {
    feedSource: PropTypes.object,
    project: PropTypes.object,
    entities: PropTypes.array,
    activeEntity: PropTypes.object,
    mapState: PropTypes.object,
    activeEntityId: PropTypes.number,
    width: PropTypes.number.isRequired,
    setActiveEntity: PropTypes.func.isRequired,
    saveActiveEntity: PropTypes.func.isRequired,
    resetActiveEntity: PropTypes.func.isRequired,
    updateActiveEntity: PropTypes.func.isRequired,
    deleteEntity: PropTypes.func.isRequired,
    newGtfsEntity: PropTypes.func.isRequired,
    uploadBrandingAsset: PropTypes.func,
    getGtfsEntity: PropTypes.func,
    showConfirmModal: PropTypes.func,
    updateMapSetting: PropTypes.func,
    activeComponent: PropTypes.string.isRequired,
    subEntity: PropTypes.number,
    user: PropTypes.object,
    offset: PropTypes.number,
    tableData: PropTypes.object,
    entityEdited: PropTypes.bool,
    subComponent: PropTypes.string,
    validationErrors: PropTypes.array
  }

  state = {}

  _hasValidationIssue = field => {
    return this.props.validationErrors.find(e => e.field === field.name)
  }

  _toggleFareRules = (editFareRules) => this.setState({editFareRules})

  render () {
    const {
      activeComponent,
      project,
      feedSource,
      user,
      activeEntity,
      width,
      offset,
      tableData,
      subComponent,
      showConfirmModal,
      validationErrors
    } = this.props
    const approveGtfsDisabled = canApproveGtfs(project, feedSource, user)
    const panelStyle = {
      width: `${width}px`,
      height: '100%',
      position: 'absolute',
      overflowX: 'visible',
      top: '0px',
      left: offset || '0px',
      zIndex: 2,
      backgroundColor: '#F2F2F2',
      paddingRight: '5px',
      paddingLeft: '5px',
      borderRight: '1px solid #ddd'
    }
    if (!activeEntity) {
      return (
        <div style={panelStyle}>
          <div className='entity-details-loading' style={{height: '100%'}}>
            <h1
              className='text-center'
              style={{marginTop: '150px'}}>
              <Icon className='fa-5x fa-spin' type='refresh' />
            </h1>
          </div>
        </div>
      )
    }
    const {zones, zoneOptions} = getZones(getTableById(tableData, 'stop'), activeEntity)
    const currentTable = getEditorTable(activeComponent)
    // Render the default form if not viewing trip patterns, schedule exceptions,
    // or fare rules.
    const renderDefault = subComponent !== 'trippattern' &&
      !this.state.editFareRules &&
      activeComponent !== 'scheduleexception'
    return (
      <div style={panelStyle}>
        <div className='entity-details'>
          <EntityDetailsHeader
            validationErrors={validationErrors}
            editFareRules={this.state.editFareRules}
            toggleEditFareRules={this._toggleFareRules}
            {...this.props} />
          {/* Entity Details Body */}
          <div className='entity-details-body'>
            {/* Render relevant form based on entity type */}
            {subComponent === 'trippattern'
              ? <ActiveTripPatternList
                showConfirmModal={showConfirmModal} />
              : this.state.editFareRules && activeEntity
                ? <FareRulesForm
                  zones={zones}
                  zoneOptions={zoneOptions}
                  {...this.props} />
                : activeComponent === 'scheduleexception'
                  ? <ScheduleExceptionForm {...this.props} />
                  : <div>
                    <Form>
                      {/* Editor Inputs */}
                      {renderDefault && currentTable.fields
                        .map((field, i) => (
                          <div data-test-id={`${activeComponent}-${field.name}-input-container`}>
                            <EditorInput
                              field={field}
                              currentValue={activeEntity[field.name]}
                              key={`${activeComponent}-${activeEntity.id}-${i}`}
                              approveGtfsDisabled={approveGtfsDisabled}
                              zoneOptions={zoneOptions}
                              isNotValid={this._hasValidationIssue(field)}
                              {...this.props} />
                          </div>
                        ))
                      }
                    </Form>
                  </div>
            }
          </div>
        </div>
      </div>
    )
  }
}
