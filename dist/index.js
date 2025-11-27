/*! ostrio-analytics v2.0.0 | BSD-3-Clause */
var Transport;
(function (Transport) {
    Transport["Fetch"] = "fetch";
    Transport["Beacon"] = "beacon";
    Transport["Img"] = "img";
})(Transport || (Transport = {}));
const SUPPORTED_TRANSPORTS = [Transport.Fetch, Transport.Beacon, Transport.Img];
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
};
var EventName;
(function (EventName) {
    EventName["GlobalError"] = "[Global Error]";
    EventName["HashChange"] = "hashchange";
    EventName["PopState"] = "popstate";
    EventName["UnhandledRejection"] = "unhandledrejection";
})(EventName || (EventName = {}));
const QUERY = {
    href: '6',
    title: '2',
    referrer: '1',
    event: '3',
    noise: '9',
    version: 'v',
    timestamp: '11'
};
const LIMITS = {
    href: 1024,
    referrer: 1024,
    title: 512,
    eventKey: 24,
    eventValue: 64,
    errorValue: 512
};
const WARN = {
    sidError: '[init] {{trackingId}} is missing or incorrect!',
    pushEventMissing: '[pushEvent] Can\'t add event without key or value!',
    fetchError: '[track] [fetch] Error:'
};
class OstrioWebAnalytics {
    constructor(sid, opts) {
        this.version = DEFAULTS.version;
        this.sending = false;
        this.loc = globalThis.location;
        this.current = '';
        this.trackHash = true;
        this.trackQuery = true;
        this.ignoredQueries = new Set();
        this.transport = Transport.Fetch;
        this.serviceUrl = DEFAULTS.serviceUrl;
        this.ignoredPaths = new Set();
        this.onTrackArr = [];
        this.onEventArr = [];
        this.cachedErrors = new Set();
        this.eventRemovers = [];
        this.autoTimer = null;
        this.lastTrackTimestamp = false;
        const cfg = typeof opts === 'boolean' ? { auto: opts } : (opts || {});
        this.sid = sid;
        this.auto = !(cfg.auto === false);
        this.trackErrors = !(cfg.trackErrors === false);
        cfg.ignoredQueries && this.ignoreQueries(cfg.ignoredQueries);
        cfg.ignoredPaths && this.ignorePaths(cfg.ignoredPaths);
        this.applySettings(cfg);
        this.warn = function () {
            if (typeof console === 'undefined')
                return;
            const fn = typeof console.warn === 'function' ? console.warn : typeof console.log === 'function' ? console.log : null;
            if (!fn)
                return;
            const args = Array.from(arguments);
            args.unshift('[ostrio]');
            fn.apply(console, args);
        };
        if (!this.sid || typeof this.sid !== 'string' || this.sid.length !== 17) {
            this.warn(WARN.sidError);
            return;
        }
        if (this.auto) {
            this.initAutoTracking();
        }
        if (this.trackErrors) {
            this.initGlobalErrors();
        }
    }
    on(obj, type, fn) {
        obj.addEventListener(type, fn, false);
        this.eventRemovers.push(() => {
            obj.removeEventListener(type, fn, false);
        });
    }
    applySettings(cfg) {
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
        if (cfg.transport) {
            this.setTransport(cfg.transport);
        }
    }
    setTransport(t) {
        if (SUPPORTED_TRANSPORTS.includes(t)) {
            this.transport = t;
        }
    }
    ignorePath(path) {
        this.ignoredPaths.add(path);
    }
    ignorePaths(paths) {
        if (Array.isArray(paths)) {
            paths.forEach(this.ignorePath.bind(this));
        }
    }
    ignoreQuery(queryKey) {
        this.ignoredQueries.add(queryKey.toLowerCase());
    }
    ignoreQueries(queryKeys) {
        if (Array.isArray(queryKeys)) {
            queryKeys.forEach(this.ignoreQuery.bind(this));
        }
    }
    onPushEvent(callback) {
        if (typeof callback === 'function') {
            this.onEventArr.push(callback);
        }
    }
    onTrack(callback) {
        if (typeof callback === 'function') {
            this.onTrackArr.push(callback);
        }
    }
    pushEvent(rawKey, rawValue) {
        let key = String(rawKey).trim();
        let value = String(rawValue).trim();
        if (!key || !value) {
            this.warn(WARN.pushEventMissing);
            return;
        }
        for (let i = this.onEventArr.length - 1; i >= 0; i--) {
            this.onEventArr[i]?.(rawKey, rawValue);
        }
        const event = {};
        if (key === EventName.GlobalError) {
            value = value.trim().slice(0, LIMITS.errorValue);
            if (this.cachedErrors.has(value)) {
                return;
            }
            this.cachedErrors.add(value);
        }
        else {
            value = value.trim().slice(0, LIMITS.eventValue);
        }
        key = key.trim().slice(0, LIMITS.eventKey);
        event[key] = value;
        const query = new URLSearchParams();
        query.set(QUERY.event, JSON.stringify(event));
        this.send(query);
    }
    track() {
        if (this.isIgnored(this.loc.pathname)) {
            return false;
        }
        for (let i = this.onTrackArr.length - 1; i >= 0; i--) {
            this.onTrackArr[i]?.();
        }
        return this.send(new URLSearchParams());
    }
    send(query) {
        query.set(QUERY.noise, String(Date.now()).slice(-7));
        query.set(QUERY.version, String(this.version));
        if (query.has(QUERY.event)) {
            this.fetch(query, () => { });
            return true;
        }
        if ((!this.sending && this.current !== this.getCurrentUrl())) {
            this.sending = true;
            setTimeout(() => {
                this.current = this.getCurrentUrl();
                if (this.lastTrackTimestamp) {
                    query.set(QUERY.timestamp, String(this.lastTrackTimestamp));
                }
                this.lastTrackTimestamp = Date.now();
                query.set(QUERY.href, this.current.slice(0, LIMITS.href));
                query.set(QUERY.title, document.title.trim().slice(0, LIMITS.title));
                if (document.referrer && document.referrer.indexOf(this.loc.origin) === -1) {
                    query.set(QUERY.referrer, document.referrer.trim().slice(0, LIMITS.referrer));
                }
                this.fetch(query, () => {
                    this.sending = false;
                });
            }, DEFAULTS.trackDelayMs);
            return true;
        }
        return false;
    }
    fetch(query, cb) {
        const url = `${this.serviceUrl}${this.sid}.gif?${query.toString()}`;
        if (this.transport === Transport.Beacon && 'sendBeacon' in navigator) {
            navigator.sendBeacon(url);
            cb();
            return;
        }
        if (this.transport === Transport.Img) {
            let imageLoader = 'Image' in window ? new Image() : document.createElement('img');
            imageLoader.onload = () => { imageLoader = null; };
            imageLoader.src = url;
            cb();
            return;
        }
        fetch(url, DEFAULTS.fetchConf).then(cb).catch((err) => {
            this.warn(WARN.fetchError, err);
            cb();
        });
    }
    initAutoTracking() {
        const autoTrack = () => {
            this.track();
        };
        if (this.trackHash) {
            this.on(window, EventName.HashChange, autoTrack);
        }
        this.on(window, EventName.PopState, autoTrack);
        this.autoTimer = setInterval(() => {
            if (!this.sending && this.current !== this.getCurrentUrl()) {
                autoTrack();
            }
        }, DEFAULTS.pollMs);
        autoTrack();
    }
    initGlobalErrors() {
        const prev = window.onerror;
        window.onerror = ((msg, url, line, column, error) => {
            const m = String(msg || DEFAULTS.globalError.msg);
            const u = String(url || DEFAULTS.globalError.url);
            const ln = String(line || DEFAULTS.globalError.line);
            const col = String(column || DEFAULTS.globalError.column);
            if (u.includes(this.loc.origin)) {
                this.pushEvent(EventName.GlobalError, `Error: ${m}. File: ${u.replace(this.loc.origin, '')} at ${this.loc.href}:${ln}:${col}`);
            }
            if (typeof prev === 'function') {
                prev.call(window, msg, url, line, column, error);
            }
        });
        this.on(window, EventName.UnhandledRejection, (evt) => {
            const e = evt;
            const v = (e && typeof e.reason === 'object' && e.reason && 'message' in e.reason) ? String(e.reason.message) : String(e?.reason ?? 'Undefined Rejection Reason');
            this.pushEvent(EventName.GlobalError, `Unhandled Rejection: ${v}. At: ${this.loc.href}`);
        });
    }
    isIgnored(pathname) {
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
                }
                else {
                    if (pathname === rule) {
                        return true;
                    }
                }
            }
            else if (rule instanceof RegExp) {
                if (rule.test(pathname)) {
                    return true;
                }
            }
        }
        return false;
    }
    getCurrentUrl() {
        const url = new URL(this.loc.href);
        if (!this.trackHash) {
            url.hash = '';
        }
        if (!this.trackQuery) {
            url.search = '';
        }
        else if (this.ignoredQueries.size) {
            Array.from(url.searchParams.keys()).forEach((key) => {
                if (this.ignoredQueries.has(key.toLowerCase())) {
                    url.searchParams.delete(key);
                }
            });
        }
        return url.href;
    }
    destroy() {
        for (let i = this.eventRemovers.length - 1; i >= 0; i--) {
            this.eventRemovers[i]?.();
        }
        this.eventRemovers.length = 0;
        if (this.autoTimer) {
            clearInterval(this.autoTimer);
            this.autoTimer = null;
        }
    }
}

export { OstrioWebAnalytics, SUPPORTED_TRANSPORTS, Transport, OstrioWebAnalytics as default };
//# sourceMappingURL=index.js.map
