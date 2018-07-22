import Icon from '@conveyal/woonerf/components/icon'
import Pure from '@conveyal/woonerf/components/pure'
import React, {PropTypes} from 'react'
import { Button } from 'react-bootstrap'

import PatternStopContainer from './PatternStopContainer'
import VirtualizedEntitySelect from '../VirtualizedEntitySelect'

export default class PatternStopsPanel extends Pure {
  static propTypes = {
    addStopToPattern: PropTypes.func.isRequired,
    activePattern: PropTypes.object,
    editSettings: PropTypes.object,
    mapState: PropTypes.object,
    removeStopFromPattern: PropTypes.func.isRequired,
    saveActiveEntity: PropTypes.func.isRequired,
    setActiveEntity: PropTypes.func.isRequired,
    stops: PropTypes.array,
    updateActiveEntity: PropTypes.func.isRequired,
    updateEditSetting: PropTypes.func.isRequired
  }

  _toggleAddStopsMode = () => {
    const {editSettings, updateEditSetting} = this.props
    updateEditSetting('addStops', !editSettings.present.addStops)
  }

  _addStopFromSelect = (input) => {
    if (!input) {
      return
    }
    const stop = input.entity
    return this.props.addStopToPattern(this.props.activePattern, stop)
  }

  render () {
    const {
      addStopToPattern,
      activePattern,
      editSettings,
      mapState,
      patternStop,
      feedSource,
      patternEdited,
      controlPoints,
      patternSegments,
      updatePatternGeometry,
      removeStopFromPattern,
      saveActiveEntity,
      setActiveEntity,
      setActiveStop,
      status,
      stops,
      updateActiveEntity,
      updatePatternStops
    } = this.props
    const {addStops} = editSettings.present
    const patternHasStops = activePattern.patternStops &&
      activePattern.patternStops.length > 0
    return (
      <div>
        <h4 className='line'>
          Stops
          {' '}
          ({activePattern.patternStops ? activePattern.patternStops.length : 0})
        </h4>
        <div style={{width: '100%'}}>
          <Button
            onClick={this._toggleAddStopsMode}
            className='pull-right'
            bsSize='small'>
            {addStops
              ? <span><Icon type='times' /> Cancel</span>
              : <span><Icon type='plus' /> Add stop</span>
            }
          </Button>
          <small className='pull-right' style={{margin: '5px'}}>
            {addStops && mapState.zoom <= 14
              ? 'Zoom to view stops'
              : `Add stops via map`
            }
          </small>
        </div>
        {/* List of pattern stops */}
        <div id='pattern-stop-list-header'>
          <div className='pull-left' style={{width: '50%'}}>
            <p className='small' style={{marginBottom: '0px'}}>
              <strong>Stop sequence</strong>
            </p>
          </div>
          <div className='pull-right' style={{width: '50%'}}>
            <p style={{marginBottom: '0px'}} className='small text-right'>
              <strong>Travel time</strong>
            </p>
          </div>
          <div className='clearfix' />
        </div>
        {patternHasStops
          ? <PatternStopContainer
            stops={stops}
            activePattern={activePattern}
            patternStop={patternStop}
            controlPoints={controlPoints}
            patternSegments={patternSegments}
            updatePatternStops={updatePatternStops}
            updatePatternGeometry={updatePatternGeometry}
            status={status}
            updateActiveEntity={updateActiveEntity}
            saveActiveEntity={saveActiveEntity}
            addStopToPattern={addStopToPattern}
            removeStopFromPattern={removeStopFromPattern}
            setActiveEntity={setActiveEntity}
            feedSource={feedSource}
            patternEdited={patternEdited}
            setActiveStop={setActiveStop} />
          : <p className='lead text-center'>This pattern has no stops.</p>
        }
        {/* Add stop selector */}
        {addStops
          ? <div className='pattern-stop-card'>
            <VirtualizedEntitySelect
              component={'stop'}
              entities={stops}
              onChange={this._addStopFromSelect} />
            <div style={{marginTop: '5px'}}>
              <Button
                bsSize='small'
                bsStyle='default'
                block
                onClick={this._toggleAddStopsMode}>
                <Icon type='times' /> Cancel
              </Button>
            </div>
          </div>
          : <Button
            block
            bsSize='small'
            data-test-id='add-stop-by-name-button'
            onClick={this._toggleAddStopsMode}
            >
            <Icon type='plus' /> Add stop by name
          </Button>
        }
      </div>
    )
  }
}
