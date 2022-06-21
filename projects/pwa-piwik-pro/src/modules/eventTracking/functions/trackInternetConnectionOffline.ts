import { trackEvent } from '../../customEventTracking';
import { EVENT_ACTIONS, EVENT_CATEGORIES } from '../constants/constants';

export function trackInternetConnectionOffline() {
  trackEvent(
    EVENT_CATEGORIES.INTERNET_CONNECTION,
    EVENT_ACTIONS.INTERNET_CONNECTION_OFFLINE,
  )
}
