import { EVENT_LISTENER } from '../constants/event.constants';
import {
  trackAppInstall,
} from '../modules/eventTracking';

export function enableInstallTracking() {
  window.addEventListener(EVENT_LISTENER.APP_INSTALLED, () => {
    trackAppInstall();
  });
}
