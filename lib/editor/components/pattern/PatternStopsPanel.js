import Icon from '@conveyal/woonerf/components/icon'
import Pure from '@conveyal/woonerf/components/pure'
import React, {PropTypes} from 'react'
import { Button, ButtonToolbar } from 'react-bootstrap'

import PatternStopContainer from './PatternStopContainer'
import VirtualizedEntitySelect from '../VirtualizedEntitySelect'

export default class PatternStopsPanel extends Pure {
  static propTypes = {
    activePattern: PropTypes.object,
    editSettings: PropTypes.object,
    mapState: PropTypes.object,
    saveActiveEntity: PropTypes.func,
    stops: PropTypes.array,
    updateActiveEntity: PropTypes.func,
    updateEditSetting: PropTypes.func
  }

  _onClickAddStop = () => this.props.updateEditSetting('addStops', !this.props.editSettings.addStops)

  addStopFromSelect = (input) => {
    if (!input) {
      return
    }
    const stop = input.entity
    return this.props.addStopToPattern(this.props.activePattern, stop)
  }
  render () {
    const {
      activePattern,
      editSettings,
      mapState,
      saveActiveEntity,
      stops,
      updateActiveEntity,
      updateEditSetting
    } = this.props
    const cardStyle = {
      border: '1px dashed gray',
      padding: '0.5rem 0.5rem',
      marginBottom: '.5rem',
      backgroundColor: '#f2f2f2'
    }
    return (
      <div>
        <h4 className='line'>Stops</h4>
        <div style={{width: '100%'}}>
          <Button
            onClick={this._onClickAddStop}
            className='pull-right'
            bsStyle={editSettings.addStops ? 'default' : 'success'}
            bsSize='small'>
            {editSettings.addStops
              ? <span><Icon type='times' /> Cancel</span>
              : <span><Icon type='plus' /> Add stop</span>
            }
          </Button>
          <small className='pull-right' style={{margin: '5px'}}>{editSettings.addStops && mapState.zoom <= 14
            ? 'Zoom to view stops'
            : `Add stops via map`
          }</small>
        </div>
        {/* List of pattern stops */}
        <div id='pattern-stop-list-header'>
          <div className='pull-left' style={{width: '50%'}}>
            <p className='small' style={{marginBottom: '0px'}}><strong>Stop sequence</strong></p>
          </div>
          <div className='pull-right' style={{width: '50%'}}>
            <p style={{marginBottom: '0px'}} className='small text-right'><strong>Travel time</strong></p>
          </div>
          <div className='clearfix' />
        </div>
        {activePattern.patternStops && activePattern.patternStops.length > 0
          ? <PatternStopContainer
            stops={stops}
            cardStyle={cardStyle}
            activePattern={activePattern}
            updateActiveEntity={updateActiveEntity}
            saveActiveEntity={saveActiveEntity}
            editSettings={editSettings}
            updateEditSetting={updateEditSetting} />
          : <p className='lead text-center'>This pattern has no stops.</p>
        }
        {/* Add stop selector */}
        {editSettings.addStops
          ? <div style={cardStyle}>
            <VirtualizedEntitySelect
              component={'stop'}
              entities={stops}
              onChange={this.addStopFromSelect}
            />
            <div style={{marginTop: '5px'}}>
              <Button
                bsSize='small'
                bsStyle='default'
                block
                onClick={this._onClickAddStop}
                >
                <Icon type='times' /> Cancel
              </Button>
            </div>
          </div>
          : <Button
            bsSize='small'
            bsStyle='success'
            block
            onClick={this._onClickAddStop}
            >
            <Icon type='plus' /> Add stop by name
          </Button>
        }
      </div>
    )
  }
}
