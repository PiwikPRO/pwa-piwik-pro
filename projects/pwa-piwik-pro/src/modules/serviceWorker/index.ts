import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { Queue } from 'workbox-background-sync/Queue.js';
import { getFriendlyURL } from 'workbox-core/_private/getFriendlyURL.js';
import { logger } from 'workbox-core/_private/logger.js';
import { RouteMatchCallbackOptions } from 'workbox-core/types.js';
import { NetworkFirst } from 'workbox-strategies/NetworkFirst.js';
import { Route } from 'workbox-routing/Route.js';
import { Router } from 'workbox-routing/Router.js';
import {
  COLLECT_PATHS_REGEX,
  MAX_RETENTION_TIME,
  OVERRIDE_REQUEST_TIME_PARAM,
  TRACKING_CLIENT_JS_PATH
} from './constants/service-worker.constans';
import { NetworkOnly } from 'workbox-strategies/NetworkOnly';
import { PiwikProInitializeOptions } from './interfaces/service-worker.interfaces';
import './_version';

/**
 * Creates the requestWillDequeue callback to be used with the background
 * sync plugin. The callback takes the failed request and adds the
 * `cdt` param based on the current time, as well as applies any other
 * user-defined hit modifications.
 *
 * @param {Object} config.
 * @return {Function} The requestWillDequeue callback function.
 *
 * @private
 */

const createOnSyncCallback = (config: PiwikProInitializeOptions) => {
  return async ({queue}: {queue: Queue}) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      const {request, timestamp} = entry;
      const url = new URL(request.url);

      try {
        // Measurement protocol requests can set their payload parameters in
        // either the URL query string (for GET requests) or the POST body.
        const params =
          request.method === 'POST'
            ? new URLSearchParams(await request.clone().text())
            : url.searchParams;

        // Calculate the cdt param, accounting for the fact that an existing
        // cdt param may be present and should be updated rather than replaced.
        // const originalHitTime = timestamp! - (Number(params.get('cdt')) || 0);
        // const queueTime = Date.now() - originalHitTime;

        // Set the override request time param prior to applying hitFilter or parameterOverrides.
        // @ts-ignore
        params.set(OVERRIDE_REQUEST_TIME_PARAM, String((timestamp / 1000).toFixed(0)));

        // Apply `parameterOverrides`, if set.
        if (config.parameterOverrides) {
          for (const param of Object.keys(config.parameterOverrides)) {
            const value = config.parameterOverrides[param];
            params.set(param, value);
          }
        }

        // Apply `hitFilter`, if set.
        if (typeof config.hitFilter === 'function') {
          config.hitFilter.call(null, params);
        }

        // Retry the fetch. Ignore URL search params from the URL as they're
        // now in the post body.
        await fetch(
          new Request(`${url.origin}${url.pathname}?${params}`, {
            // body: params.toString(),
            method: 'GET',
            // mode: 'cors',
            // credentials: 'omit',
            // headers: {'Content-Type': 'text/plain'},
          }),
        );

        if (config.debug) {
          logger.log(
            `Request for '${getFriendlyURL(url.href)}' ` + `has been replayed`,
          );
        }
      } catch (err) {
        await queue.unshiftRequest(entry);

        if (config.debug) {
          logger.log(
            `Request for '${getFriendlyURL(url.href)}' ` +
            `failed to replay, putting it back in the queue.`,
          );
        }
        throw err;
      }
    }
    if (config.debug) {
      logger.log(
        `All Piwik Pro request successfully replayed; ` +
        `the queue is now empty!`,
      );
    }
  };
};

/**
 * Creates GET and POST routes to catch failed Measurement Protocol hits.
 *
 * @param {BackgroundSyncPlugin} bgSyncPlugin
 * @return {Array<Route>} The created routes.
 *
 * @private
 */
const createCollectRoutes = (bgSyncPlugin: BackgroundSyncPlugin) => {
  // const match = ({url}: RouteMatchCallbackOptions) =>
  //   /^\/(\w+\/)?ppms/.test(url.pathname);

  const match = ({url}: RouteMatchCallbackOptions) => {
    return COLLECT_PATHS_REGEX.test(url.pathname);
  };


  const handler = new NetworkOnly({
    plugins: [bgSyncPlugin],
  });

  return [new Route(match, handler, 'GET'), new Route(match, handler, 'POST')];
};

const createTrackingClientJsRoute = (cacheName: string) => {
  const match = ({url}: RouteMatchCallbackOptions) =>
    url.pathname === TRACKING_CLIENT_JS_PATH;

  const handler = new NetworkFirst({cacheName});

  return new Route(match, handler, 'GET');
};

const createContainerJsRoute = (cacheName: string, containerId: string) => {
  const match = ({url}: RouteMatchCallbackOptions) => {
    return url.pathname.indexOf(containerId) > -1;
  };

  const handler = new NetworkFirst({cacheName});

  return new Route(match, handler, 'GET');
};

const initialize = (options: PiwikProInitializeOptions): void => {

  const cacheName = options.cacheName || 'piwikpro_cache';

  const bgSyncPlugin = new BackgroundSyncPlugin(
    'PIWIK_PRO_QUEUE',
    {
      onSync: createOnSyncCallback(options),
      maxRetentionTime: MAX_RETENTION_TIME
    }
  );

  const routes = [
    createTrackingClientJsRoute('trackingClientJS'),
    createContainerJsRoute('containerJS', options.containerId),
    ...createCollectRoutes(bgSyncPlugin),
  ];

  const router = new Router();
  for (const route of routes) {
    router.registerRoute(route);
  }

  router.addFetchListener();
}

export {
  initialize,
  PiwikProInitializeOptions
}
