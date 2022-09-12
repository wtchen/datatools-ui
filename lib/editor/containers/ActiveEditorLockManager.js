// @flow

import { Component } from 'react'
import { connect } from 'react-redux'

import * as editorActions from '../actions/editor'
import type { AppState, StatusState } from '../../types/reducers'

type Props = {
  checkLockStatus: typeof editorActions.checkLockStatus,
  disableLock?: boolean,
  errorStatus: StatusState,
  feedIsLocked: boolean,
  feedSourceId: string,
  itemToLock: string,
  lockEditorFeedSource: typeof editorActions.lockEditorFeedSource,
  lockEditorFeedSourceIfNeeded: typeof editorActions.lockEditorFeedSourceIfNeeded,
  removeEditorLock: typeof editorActions.removeEditorLock,
  removeEditorLockLastGasp: typeof editorActions.removeEditorLockLastGasp,
  stopLockTimer: typeof editorActions.stopLockTimer,
}

/**
 * Figures out the correct event name to use.
 */
function getNormalizedEvent (eventName: string) {
  return window.attachEvent ? `on${eventName}` : eventName
}

class EditorLockManager extends Component<Props> {
  componentCleanUp = () => {
    // When the user exits the editor, as a last-gasp action, remove the editor lock on the feed.
    const { feedSourceId, itemToLock, removeEditorLockLastGasp, stopLockTimer } = this.props
    stopLockTimer()
    removeEditorLockLastGasp(feedSourceId, itemToLock)
  }

  onFocus = () => {
    const { checkLockStatus, disableLock, feedSourceId, itemToLock } = this.props
    if (!disableLock) {
      // Only claim (back) an editor lock if this action is not (temporarily) disabled by the containing component.
      checkLockStatus(feedSourceId, itemToLock)
    }
  }

  onVisibilityChange = () => {
    const {
      disableLock,
      errorStatus,
      feedSourceId,
      itemToLock,
      lockEditorFeedSource,
      stopLockTimer
    } = this.props
    if (document.visibilityState === 'visible') {
      // If the page is visible/activated again, resume lock check-in,
      // unless a modal prompt is shown or no editor was loaded for this feed.
      if (!errorStatus.modal && !disableLock) {
        lockEditorFeedSource(feedSourceId, itemToLock)
      }
    } else {
      // When the user exits the editor (i.e. switches, closes, or reloads the tab/window,
      // or navigates away using the browser buttons),
      // stop the editor lock timer (don't remove the lock in case the page gets activated again).
      // Note: this case does not cover the user navigating to other datatool views using regular links from the ui,
      //   see componentWillUnmount for that.
      stopLockTimer()
    }
  }

  componentDidMount () {
    // If the browser window/tab is closed, the component does not have a chance
    // to run componentWillUnmount. This event listener runs clean up in those
    // cases.
    window.addEventListener(getNormalizedEvent('pagehide'), this.componentCleanUp)

    // Listen to the window focus event so we can check for things like editor lock status right away.
    window.addEventListener(getNormalizedEvent('focus'), this.onFocus)

    // Listen to the page visibilityChange event so we can check for things like editor lock status
    // or pause/resume lock timers right away.
    window.addEventListener(getNormalizedEvent('visibilitychange'), this.onVisibilityChange)
  }

  componentWillUnmount () {
    // Run component clean-up
    this.componentCleanUp()
    // And remove the event handlers for normal unmounting
    window.removeEventListener(getNormalizedEvent('pagehide'), this.componentCleanUp)
    window.removeEventListener(getNormalizedEvent('focus'), this.onFocus)
    window.removeEventListener(getNormalizedEvent('visibilitychange'), this.onVisibilityChange)
  }

  componentWillReceiveProps (nextProps: Props) {
    const {
      disableLock,
      feedSourceId,
      itemToLock,
      lockEditorFeedSourceIfNeeded,
      removeEditorLock,
      stopLockTimer
    } = this.props
    if (nextProps.feedSourceId !== feedSourceId) {
      // Remove editor lock.
      removeEditorLock(itemToLock, feedSourceId, false)
      // Re-establish lock for new feed source and fetch GTFS.
      lockEditorFeedSourceIfNeeded(nextProps.feedSourceId, itemToLock)
    } else if (this.props.feedIsLocked && !disableLock) {
      // The actions below apply if content has been loaded into the GTFS+ editor.
      if (!nextProps.feedIsLocked) {
        // If user clicked "Re-lock feed",
        // re-establish lock for the feed source and fetch GTFS to resume editing.
        lockEditorFeedSourceIfNeeded(nextProps.feedSourceId, itemToLock)
      } else {
        // If the user dismissed the "Relock feed" dialog, stop the lock timer and leave the UI disabled.
        // The "Relock feed" modal will reappear next time the user switches back to the tab.
        stopLockTimer()
      }
    }
  }

  render () {
    // Component renders nothing
    return null
  }
}

const mapStateToProps = (state: AppState) => {
  const errorStatus = state.status
  const feedIsLocked = !state.editor.data.lock.sessionId
  return {
    errorStatus,
    feedIsLocked
  }
}

const mapDispatchToProps = {
  checkLockStatus: editorActions.checkLockStatus,
  lockEditorFeedSource: editorActions.lockEditorFeedSource,
  lockEditorFeedSourceIfNeeded: editorActions.lockEditorFeedSourceIfNeeded,
  removeEditorLock: editorActions.removeEditorLock,
  removeEditorLockLastGasp: editorActions.removeEditorLockLastGasp,
  stopLockTimer: editorActions.stopLockTimer
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorLockManager)
