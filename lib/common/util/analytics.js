// @flow

import ReactGA from 'react-ga'

/**
 * Check if Google Analytics is enabled for the application.
 */
export function hasAnalytics (): boolean {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    // Do not initialize Google Analytics if in dev mode
    return false
  } else if (!process.env.GOOGLE_ANALYTICS_TRACKING_ID) {
    // Google Analytics tracking code is missing
    console.warn('GOOGLE_ANALYTICS_TRACKING_ID not set')
    return false
  } else {
    return true
  }
}

/**
 * Initialize Google Analytics for the application.
 * @return {Boolean} whether Google Analytics was initialized
 */
export function initializeAnalytics (): boolean {
  if (hasAnalytics()) {
    ReactGA.initialize(process.env.GOOGLE_ANALYTICS_TRACKING_ID)
    return true
  } else {
    return false
  }
}

/**
 * Log page views in Google Analytics. Should only be called if ReactGA has
 * been initialized.
 */
export function logPageView (): void {
  ReactGA.set({ page: window.location.pathname + window.location.search })
  ReactGA.pageview(window.location.pathname + window.location.search)
}
