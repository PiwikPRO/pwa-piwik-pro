import '../_version.js';

export const QUEUE_NAME = 'piwik-pro-analytics';
export const MAX_RETENTION_TIME = 60 * 48; // Two days in minutes
// export const GOOGLE_ANALYTICS_HOST = 'www.google-analytics.com';
// export const GTM_HOST = 'www.googletagmanager.com';
export const TRACKING_CLIENT_JS_PATH = '/ppms.js';
// export const GTAG_JS_PATH = '/gtag/js';
// export const GTM_JS_PATH = '/gtm.js';
// export const COLLECT_DEFAULT_PATH = '/collect';

// This RegExp matches all known Measurement Protocol single-hit collect
// endpoints. Most of the time the default path (/collect) is used, but
// occasionally an experimental endpoint is used when testing new features,
// (e.g. /r/collect or /j/collect)
export const COLLECT_PATHS_REGEX = /^\/(\w+\/)?ppms/;
export const OVERRIDE_REQUEST_TIME_PARAM = 'cdt';
