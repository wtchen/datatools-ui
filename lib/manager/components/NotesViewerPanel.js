import React, {Component, PropTypes} from 'react'
import { Panel, Glyphicon } from 'react-bootstrap'

import NotesViewer from './NotesViewer'
import { getComponentMessages, getMessage } from '../../common/util/config'

export default class NotesViewerPanel extends Component {
  static propTypes = {
    feedSource: PropTypes.object,
    noteCount: PropTypes.number,
    notes: PropTypes.array,
    type: PropTypes.string,
    user: PropTypes.object,
    version: PropTypes.object,

    newNotePosted: PropTypes.func,
    notesRequested: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.notes) this.setState({ expanded: false })
  }

  noteCount () {
    if (this.props.notes) return this.props.notes.length
    if (this.props.noteCount != null) return this.props.noteCount
    return null
  }

  _toggleExpanded = () => {
    const {notes, notesRequested} = this.props
    const {expanded} = this.state
    if (!notes) notesRequested()
    this.setState({ expanded: !expanded })
  }

  render () {
    const messages = getComponentMessages('NotesViewer')
    const type = this.props.type === 'feed-source'
      ? getMessage(messages, 'feedSource')
      : getMessage(messages, 'feedVersion')
    const header = (
      <h3
        onClick={this._toggleExpanded}
        onKeyDown={(e) => {
          if (document.activeElement === e.target && e.which === 13) {
            this._toggleExpanded()
          }
        }}
        role='button'
        tabIndex={0}
        >
        <Glyphicon glyph='comment' /> {getMessage(messages, 'title')} {type} {this.noteCount() !== null ? `(${this.noteCount()})` : ''}
      </h3>
    )
    return (
      <Panel
        header={header}
        collapsible
        expanded={this.state.expanded}
      >
        <NotesViewer {...this.props} />
      </Panel>
    )
  }
}
