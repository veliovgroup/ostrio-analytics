export enum Transport {
  Fetch = 'fetch',
  Beacon = 'beacon',
  Img = 'img'
}

export const SUPPORTED_TRANSPORTS = [Transport.Fetch, Transport.Beacon, Transport.Img] as const;

export type OstrioWebAnalyticsTransport = Transport | `${Transport}`;

const DEFAULTS = {
  serviceUrl: 'https://analytics.ostr.io/',
  version: 300,
  pollMs: 500,
  trackDelayMs: 64,
  globalError: {
    msg: 'N/A',
    url: '',
    line: '0',
    column: '0'
  },
  fetchConf: {
    credentials: 'include',
    mode: 'no-cors',
    cache: 'no-store',
  }
} as const;

enum EventName {
  GlobalError = '[Global Error]',
  HashChange = 'hashchange',
  PopState = 'popstate',
  UnhandledRejection = 'unhandledrejection'
}

const QUERY = {
  href: '6',
  title: '2',
  referrer: '1',
  event: '3',
  noise: '9',
  version: 'v',
  timestamp: '11'
} as const;

const LIMITS = {
  href: 1024,
  referrer: 1024,
  title: 512,
  eventKey: 24,
  eventValue: 64,
  errorValue: 512
} as const;

const WARN = {
  sidError: '[init] {{trackingId}} is missing or incorrect!',
  pushEventMissing: '[pushEvent] Can\'t add event without key or value!',
  fetchError: '[track] [fetch] Error:'
} as const;

export interface OstrioWebAnalyticsDynamicConfig {
  trackHash?: boolean;
  trackQuery?: boolean;
  transport?: OstrioWebAnalyticsTransport;
  serviceUrl?: string;
}

export interface OstrioWebAnalyticsConfig extends OstrioWebAnalyticsDynamicConfig {
  auto?: boolean;
  trackErrors?: boolean;
  ignoredQueries?: Array<string>;
  ignoredPaths?: Array<string | RegExp>;
}

type EvtRemvr = () => void;
type FetchCb = () => void;
type TrackCb = () => void;
type EventCb = (key: string, value: number | string) => void;
interface ErrorHandlerState {
  previous: OnErrorEventHandler;
  active: boolean;
}

const errorHandlerStates = new WeakMap<OnErrorEventHandlerNonNull, ErrorHandlerState>();

const getRestorableOnError = (handler: OnErrorEventHandler): OnErrorEventHandler => {
  let next = handler;
  while (typeof next === 'function') {
    const state = errorHandlerStates.get(next);
    if (!state || state.active) {
      return next;
    }
    next = state.previous;
  }

  return next;
};

export class OstrioWebAnalytics {
  public readonly sid: string;
  public readonly version: number = DEFAULTS.version;
  public sending: boolean = false;
  public readonly loc: Location = globalThis.location;
  public current: string = '';
  public trackHash: boolean = true;
  public trackQuery: boolean = true;
  public readonly ignoredQueries: Set<string> = new Set();
  public readonly auto: boolean;
  public readonly trackErrors: boolean;
  public transport: Transport = Transport.Fetch;
  public serviceUrl: string = DEFAULTS.serviceUrl;
  private readonly ignoredPaths: Set<string | RegExp> = new Set();
  private readonly onTrackArr: TrackCb[] = [];
  private readonly onEventArr: EventCb[] = [];
  private readonly cachedErrors: Set<string> = new Set();
  private readonly eventRemovers: EvtRemvr[] = [];
  private autoTimer: ReturnType<typeof setInterval> | null = null;
  private lastTrackTimestamp: number | false = false;

  constructor(sid: string, opts?: OstrioWebAnalyticsConfig | boolean) {
    const cfg: OstrioWebAnalyticsConfig = typeof opts === 'boolean' ? { auto: opts } : (opts || {});
    this.sid = sid;
    this.auto = !(cfg.auto === false);
    this.trackErrors = !(cfg.trackErrors === false);
    cfg.ignoredQueries && this.ignoreQueries(cfg.ignoredQueries);
    cfg.ignoredPaths && this.ignorePaths(cfg.ignoredPaths);

    this.applySettings(cfg);

    if (!this.sid || typeof this.sid !== 'string' || this.sid.length !== 17) {
      throw new Error(WARN.sidError);
    }

    if (this.auto) {
      this.initAutoTracking();
    }

    if (this.trackErrors) {
      this.initGlobalErrors();
    }
  }

  private on(obj: Window | Document | HTMLElement | EventTarget, type: string, fn: EventListenerOrEventListenerObject): void {
    obj.addEventListener(type, fn, false);
    this.eventRemovers.push(() => {
      obj.removeEventListener(type, fn, false);
    });
  }

  public applySettings(cfg: OstrioWebAnalyticsDynamicConfig): void {
    if (typeof cfg.trackHash !== 'undefined') {
      this.trackHash = !(cfg.trackHash === false);
    }

    if (typeof cfg.trackQuery !== 'undefined') {
      this.trackQuery = !(cfg.trackQuery === false);
    }

    if (cfg.serviceUrl && typeof cfg.serviceUrl === 'string' && cfg.serviceUrl.length) {
      this.serviceUrl = cfg.serviceUrl;
      this.serviceUrl = this.serviceUrl.endsWith('/') ? this.serviceUrl : `${this.serviceUrl}/`;
    }

    this.setTransport(cfg.transport || this.transport);
  }

  public setTransport(t: OstrioWebAnalyticsTransport): void {
    const transport = t as Transport;
    if (SUPPORTED_TRANSPORTS.includes(transport)) {
      if (transport === Transport.Fetch && typeof fetch !== 'function') {
        this.transport = Transport.Img;
      } else {
        this.transport = transport;
      }
    }
  }

  public ignorePath(path: string | RegExp): void {
    this.ignoredPaths.add(path);
  }

  public ignorePaths(paths: Array<string | RegExp>): void {
    if (Array.isArray(paths)) {
      paths.forEach(this.ignorePath, this);
    }
  }

  public ignoreQuery(queryKey: string): void {
    this.ignoredQueries.add(queryKey.toLowerCase());
  }

  public ignoreQueries(queryKeys: Array<string>): void {
    if (Array.isArray(queryKeys)) {
      queryKeys.forEach(this.ignoreQuery, this);
    }
  }

  public onPushEvent(callback: EventCb): void {
    if (typeof callback === 'function') {
      this.onEventArr.push(callback);
    }
  }

  public onTrack(callback: TrackCb): void {
    if (typeof callback === 'function') {
      this.onTrackArr.push(callback);
    }
  }

  public pushEvent(rawKey: string, rawValue: number | string): void {
    let key = String(rawKey).trim();
    let value = String(rawValue).trim();

    if (!key || !value) {
      this.warn(WARN.pushEventMissing);
      return;
    }

    for (let i = this.onEventArr.length - 1; i >= 0; i--) {
      this.onEventArr[i]?.(rawKey, rawValue);
    }

    const event: Record<string, string> = {};

    if (key === EventName.GlobalError) {
      value = value.trim().slice(0, LIMITS.errorValue);
      if (this.cachedErrors.has(value)) {
        return;
      }
      this.cachedErrors.add(value);
    } else {
      value = value.trim().slice(0, LIMITS.eventValue);
    }

    key = key.trim().slice(0, LIMITS.eventKey);
    event[key] = value;

    const query = new URLSearchParams();
    query.set(QUERY.event, JSON.stringify(event));
    this.send(query);
  }

  public track(): boolean {
    if (this.isIgnored(this.loc.pathname)) {
      return false;
    }

    for (let i = this.onTrackArr.length - 1; i >= 0; i--) {
      this.onTrackArr[i]?.();
    }

    return this.send(new URLSearchParams());
  }

  private send(query: URLSearchParams): boolean {
    query.set(QUERY.noise, String(Date.now()).slice(-7));
    query.set(QUERY.version, String(this.version));

    if (query.has(QUERY.event)) {
      this.fetch(query, (): void => {});
      return true;
    }

    if ((!this.sending && this.current !== this.getCurrentUrl())) {
      this.sending = true;

      setTimeout((): void => {
        this.current = this.getCurrentUrl();
        if (this.lastTrackTimestamp) {
          query.set(QUERY.timestamp, String(this.lastTrackTimestamp));
        }

        this.lastTrackTimestamp = Date.now();
        query.set(QUERY.href, this.current.slice(0, LIMITS.href));
        query.set(QUERY.title, document.title.trim().slice(0, LIMITS.title));

        if (this.isExternalReferrer(document.referrer)) {
          query.set(QUERY.referrer, document.referrer.trim().slice(0, LIMITS.referrer));
        }

        this.fetch(query, (): void => {
          this.sending = false;
        });
      }, DEFAULTS.trackDelayMs);

      return true;
    }

    return false;
  }

  private fetch(query: URLSearchParams, cb: FetchCb): void {
    const url = `${this.serviceUrl}${this.sid}.gif?${query.toString()}`;

    if (this.transport === Transport.Beacon && typeof navigator.sendBeacon === 'function') {
      if (navigator.sendBeacon(url)) {
        cb();
        return;
      }
    }

    if (this.transport === Transport.Img || typeof fetch !== 'function') {
      this.sendImage(url);
      cb();
      return;
    }

    fetch(url, DEFAULTS.fetchConf).then(cb).catch((err) => {
      this.warn(WARN.fetchError, err);
      cb();
    });
  }

  private sendImage(url: string): void {
    let imageLoader: HTMLImageElement | null = 'Image' in window ? new Image() : (document.createElement('img') as HTMLImageElement);
    imageLoader.onload = (): void => { imageLoader = null; };
    imageLoader.src = url;
  }

  private initAutoTracking(): void {
    const autoTrack = (): void => {
      this.track();
    };

    if (this.trackHash) {
      this.on(window, EventName.HashChange, autoTrack);
    }

    this.on(window, EventName.PopState, autoTrack);

    this.autoTimer = setInterval((): void => {
      if (!this.sending && this.current !== this.getCurrentUrl()) {
        autoTrack();
      }
    }, DEFAULTS.pollMs);

    autoTrack();
  }

  private initGlobalErrors(): void {
    const state: ErrorHandlerState = {
      previous: window.onerror,
      active: true
    };
    const handler = ((msg: Event | string, url?: string, line?: number, column?: number, error?: Error): boolean | void => {
      if (state.active) {
        const m = String(msg || DEFAULTS.globalError.msg);
        const u = String(url || DEFAULTS.globalError.url);
        const ln = String(line || DEFAULTS.globalError.line);
        const col = String(column || DEFAULTS.globalError.column);
        const source = this.parseSameOriginUrl(u);

        if (source) {
          this.pushEvent(EventName.GlobalError, `Error: ${m}. File: ${source.href.replace(source.origin, '')} at ${this.loc.href}:${ln}:${col}`);
        }
      }

      if (typeof state.previous === 'function') {
        return state.previous.call(window, msg, url, line, column, error);
      }

      return undefined;
    }) as OnErrorEventHandlerNonNull;

    errorHandlerStates.set(handler, state);
    window.onerror = handler;
    this.eventRemovers.push((): void => {
      state.active = false;
      if (window.onerror === handler) {
        window.onerror = getRestorableOnError(state.previous);
      }
    });

    this.on(window, EventName.UnhandledRejection, (evt: Event): void => {
      const e = evt as PromiseRejectionEvent;
      const v = (e && typeof e.reason === 'object' && e.reason && 'message' in e.reason) ? String(e.reason.message) : String(e?.reason ?? 'Undefined Rejection Reason');
      this.pushEvent(EventName.GlobalError, `Unhandled Rejection: ${v}. At: ${this.loc.href}`);
    });
  }

  private parseSameOriginUrl(url: string): URL | null {
    try {
      const source = new URL(url);
      return source.origin === this.loc.origin ? source : null;
    } catch (_err) {
      return null;
    }
  }

  private isIgnored(pathname: string): boolean {
    if (!this.ignoredPaths.size) {
      return false;
    }

    const paths = Array.from(this.ignoredPaths);
    for (let i = paths.length - 1; i >= 0; i--) {
      const rule = paths[i];
      if (typeof rule === 'string') {
        if (rule.endsWith('*')) {
          const prefix = rule.slice(0, -1);
          if (pathname.startsWith(prefix)) {
            return true;
          }
        } else {
          if (pathname === rule) {
            return true;
          }
        }
      } else if (rule instanceof RegExp) {
        if (rule.test(pathname)) {
          return true;
        }
      }
    }
    return false;
  }

  private isExternalReferrer(referrer: string): boolean {
    if (!referrer.trim()) {
      return false;
    }

    try {
      return new URL(referrer).origin !== this.loc.origin;
    } catch (_err) {
      return true;
    }
  }

  private getCurrentUrl() {
    const url = new URL(this.loc.href);
    if (!this.trackHash) {
      url.hash = '';
    }

    if (!this.trackQuery) {
      url.search = '';
    } else if (this.ignoredQueries.size) {
      Array.from(url.searchParams.keys()).forEach((key: string) => {
        if (this.ignoredQueries.has(key.toLowerCase())) {
          url.searchParams.delete(key);
        }
      });
    }

    return url.href;
  }

  public destroy(): void {
    for (let i = this.eventRemovers.length - 1; i >= 0; i--) {
      this.eventRemovers[i]?.();
    }
    this.eventRemovers.length = 0;
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  private readonly warn = function(..._args: unknown[]) {
    if (typeof console === 'undefined') return;
    /* eslint-disable no-console,no-nested-ternary */
    const fn = typeof console.warn === 'function' ? console.warn : typeof console.log === 'function' ? console.log : null;
    if (!fn) return;
    const args = Array.from(arguments);
    args.unshift('[ostrio]');
    fn.apply(console, args);
  };
}

export default OstrioWebAnalytics;
