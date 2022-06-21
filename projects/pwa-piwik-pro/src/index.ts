import { initialize, PiwikProInitializeOptions } from './modules/serviceWorker';
import { enableInstallTracking } from './initializers/enableInstallTracking';
import { enableInternetConnectionTracking } from './initializers/enableInternetConnectionTracking';

export {
  PiwikProInitializeOptions
}
export default {
  initialize,
  enableInstallTracking,
  enableInternetConnectionTracking,
}
