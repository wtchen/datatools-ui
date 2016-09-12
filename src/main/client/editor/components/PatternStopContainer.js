import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update'
import { shallowEqual } from 'react-pure-render'
import PatternStopCard from './PatternStopCard'
import { DropTarget, DragDropContext } from 'react-dnd'
import Scrollzone from 'react-dnd-scrollzone'
import HTML5Backend from 'react-dnd-html5-backend'

import { getEntityName } from '../util/gtfs'
import VirtualizedEntitySelect from './VirtualizedEntitySelect'
import PatternStopRow from './PatternStopRow'
import { polyline as getPolyline, getSegment } from '../../scenario-editor/utils/valhalla'
import ll from 'lonlng'

/*  This component and its child components (Card.js) are based on the react-dnd sortable
    example found here: http://gaearon.github.io/react-dnd/examples-sortable-cancel-on-drop-outside.html
*/
const scrollStyle = {
  // overflowX: 'scroll',
  overflowY: 'scroll',
}
const cardTarget = {
  drop () {
  }
}
@DragDropContext(HTML5Backend)
@DropTarget('card', cardTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
export default class PatternStopContainer extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired
  }
  constructor (props) {
    super(props)
    this.moveCard = this.moveCard.bind(this)
    this.findCard = this.findCard.bind(this)
    this.state = {
      cards: this.props.activePattern.patternStops.map(this.addUniqueId)
    }
  }
  // we need to add a unique ID to patternStops received from props in order to make the card drag and drop work
  addUniqueId (stop, index) {
    const id = `${index}-${stop.stopId}`
    return {
      ...stop,
      id
    }
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.activePattern.patternStops && !shallowEqual(nextProps.activePattern.patternStops, this.props.activePattern.patternStops)){
      this.setState({cards: nextProps.activePattern.patternStops.map(this.addUniqueId)})
    }
  }
  dropCard () {
    let patternStops = [...this.state.cards]
    let pattern = Object.assign({}, this.props.activePattern)
    pattern.patternStops = patternStops
    this.props.updateActiveEntity(this.props.activePattern, 'trippattern', {patternStops})
    this.props.saveActiveEntity('trippattern')
  }
  moveCard (id, atIndex) {
    const { card, index } = this.findCard(id);
    this.setState(update(this.state, {
      cards: {
        $splice: [
          [index, 1],
          [atIndex, 0, card]
        ]
      }
    }));
  }

  findCard (id) {
    const { cards } = this.state
    const card = cards.filter((c, i) => c.id === id)[0]
    return {
      card,
      index: cards.indexOf(card)
    }
  }

  render () {
    const { connectDropTarget } = this.props
    const { cards } = this.state
    if (!this.props.stops) return null

    let cumulativeTravelTime = 0
    return connectDropTarget(
      <div>
      {
        /*<Scrollzone style={scrollStyle}>*/
      }
        {cards.map((card, i) => {
          if (!card) {
            return null
          }
          const stop = this.props.stops && this.props.stops.find(st => st.id === card.stopId)
          cumulativeTravelTime += card.defaultDwellTime + card.defaultTravelTime
          return (
            <PatternStopCard
                  key={card.id}
                  id={card.id}
                  index={i}
                  style={this.props.cardStyle}
                  stopIsActive={false}
                  cumulativeTravelTime={cumulativeTravelTime}
                  stop={stop}
                  activePattern={this.props.activePattern}
                  updateActiveEntity={this.props.updateActiveEntity}
                  saveActiveEntity={this.props.saveActiveEntity}
                  patternStop={card}
                  moveCard={this.moveCard}
                  findCard={this.findCard}
                  dropCard={() => this.dropCard()}
                  activeStop={this.state.activeStop}
                  setActiveStop={(stopKey) => this.setState({activeStop: stopKey})}
            />
          )
        })}
      {
        /*</Scrollzone>*/
      }
      </div>
    )
  }
}
