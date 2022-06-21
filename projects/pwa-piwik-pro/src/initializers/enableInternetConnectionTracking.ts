import { EVENT_LISTENER } from '../constants/event.constants'
import {
  trackInternetConnectionOffline,
  trackInternetConnectionOnline
} from '../modules/eventTracking';

export function enableInternetConnectionTracking() {
  window.addEventListener(EVENT_LISTENER.ONLINE, () => {
    trackInternetConnectionOnline();
  });

  window.addEventListener(EVENT_LISTENER.OFFLINE, () => {
    trackInternetConnectionOffline()
  });
}
