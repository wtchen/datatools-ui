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
      backgroundColor: '#f2f2f2',
      cursor: 'pointer'
    }
    return (
      <div>
        <h4>
          <ButtonToolbar
            className='pull-right'
          >
            <Button
              onClick={() => updateEditSetting('addStops', !editSettings.addStops)}
              bsStyle={editSettings.addStops ? 'default' : 'success'}
              bsSize='small'
            >
              {editSettings.addStops
                ? <span><Icon type='times' /> Cancel</span>
                : <span><Icon type='plus' /> Add stop</span>
              }
            </Button>
          </ButtonToolbar>
          {editSettings.addStops && mapState.zoom <= 14
            ? <small className='pull-right' style={{margin: '5px'}}>Zoom to view stops</small>
            : null
          }
          Stops
        </h4>
        {/* List of pattern stops */}
        <div className='pull-left' style={{width: '50%'}}>
          <p style={{marginBottom: '0px'}}>Stop sequence</p>
        </div>
        <div className='pull-right' style={{width: '50%'}}>
          <p style={{marginBottom: '0px'}} className='text-right'>Travel time</p>
        </div>
        <div className='clearfix' />
        <PatternStopContainer
          stops={stops}
          cardStyle={cardStyle}
          activePattern={activePattern}
          updateActiveEntity={updateActiveEntity}
          saveActiveEntity={saveActiveEntity}
          editSettings={editSettings}
          updateEditSetting={updateEditSetting} />
        {/* Add stop selector */}
        {editSettings.addStops
          ? <div style={cardStyle}>
            <VirtualizedEntitySelect
              component={'stop'}
              entities={stops}
              onChange={this.addStopFromSelect}
            />
            <div style={{marginTop: '5px'}} className='text-center'>
              <Button
                bsSize='small'
                bsStyle='default'
                block
                onClick={() => updateEditSetting('addStops', !editSettings.addStops)}
              >
                <Icon type='times' /> Cancel
              </Button>
            </div>
          </div>
          : <div style={cardStyle}>
            <p
              style={{width: '100%', margin: '0px'}}
              onClick={() => updateEditSetting('addStops', !editSettings.addStops)}
              className='small'
            >
              <Icon type='plus' /> Add stop
            </p>
          </div>
        }
      </div>
    )
  }
}
