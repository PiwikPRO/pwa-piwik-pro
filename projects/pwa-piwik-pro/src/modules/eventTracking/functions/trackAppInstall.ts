import { trackEvent } from '../../customEventTracking';
import { EVENT_ACTIONS, EVENT_CATEGORIES } from '../constants/constants';

export function trackAppInstall() {
  trackEvent(
    EVENT_CATEGORIES.APP,
    EVENT_ACTIONS.APP_INSTALL,
  )
}
