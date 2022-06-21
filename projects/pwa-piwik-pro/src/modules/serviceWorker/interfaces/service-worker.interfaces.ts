export interface PiwikProInitializeOptions {
  containerURL: string;
  containerId: string;
  cacheName?: string;
  parameterOverrides?: {[paramName: string]: string};
  hitFilter?: (params: URLSearchParams) => void;
  debug?: boolean,
}
