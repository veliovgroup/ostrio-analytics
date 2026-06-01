/*! ostrio-analytics v2.0.0 | BSD-3-Clause */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

exports.Transport = void 0;
(function (Transport) {
    Transport["Fetch"] = "fetch";
    Transport["Beacon"] = "beacon";
    Transport["Img"] = "img";
})(exports.Transport || (exports.Transport = {}));
const SUPPORTED_TRANSPORTS = [exports.Transport.Fetch, exports.Transport.Beacon, exports.Transport.Img];
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
        this.transport = exports.Transport.Fetch;
        this.serviceUrl = DEFAULTS.serviceUrl;
        this.ignoredPaths = new Set();
        this.onTrackArr = [];
        this.onEventArr = [];
        this.cachedErrors = new Set();
        this.eventRemovers = [];
        this.autoTimer = null;
        this.lastTrackTimestamp = false;
        this.warn = function (..._args) {
            if (typeof console === 'undefined')
                return;
            /* eslint-disable no-console,no-nested-ternary */
            const fn = typeof console.warn === 'function' ? console.warn : typeof console.log === 'function' ? console.log : null;
            if (!fn)
                return;
            const args = Array.from(arguments);
            args.unshift('[ostrio]');
            fn.apply(console, args);
        };
        const cfg = typeof opts === 'boolean' ? { auto: opts } : (opts || {});
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
        this.setTransport(cfg.transport || this.transport);
    }
    setTransport(t) {
        const transport = t;
        if (SUPPORTED_TRANSPORTS.includes(transport)) {
            if (transport === exports.Transport.Fetch && typeof fetch !== 'function') {
                this.transport = exports.Transport.Img;
            }
            else {
                this.transport = transport;
            }
        }
    }
    ignorePath(path) {
        this.ignoredPaths.add(path);
    }
    ignorePaths(paths) {
        if (Array.isArray(paths)) {
            paths.forEach(this.ignorePath, this);
        }
    }
    ignoreQuery(queryKey) {
        this.ignoredQueries.add(queryKey.toLowerCase());
    }
    ignoreQueries(queryKeys) {
        if (Array.isArray(queryKeys)) {
            queryKeys.forEach(this.ignoreQuery, this);
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
                if (this.isExternalReferrer(document.referrer)) {
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
        if (this.transport === exports.Transport.Beacon && typeof navigator.sendBeacon === 'function') {
            if (navigator.sendBeacon(url)) {
                cb();
                return;
            }
        }
        if (this.transport === exports.Transport.Img || typeof fetch !== 'function') {
            this.sendImage(url);
            cb();
            return;
        }
        fetch(url, DEFAULTS.fetchConf).then(cb).catch((err) => {
            this.warn(WARN.fetchError, err);
            cb();
        });
    }
    sendImage(url) {
        let imageLoader = 'Image' in window ? new Image() : document.createElement('img');
        imageLoader.onload = () => { imageLoader = null; };
        imageLoader.src = url;
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
        let active = true;
        const handler = ((msg, url, line, column, error) => {
            if (active) {
                const m = String(msg || DEFAULTS.globalError.msg);
                const u = String(url || DEFAULTS.globalError.url);
                const ln = String(line || DEFAULTS.globalError.line);
                const col = String(column || DEFAULTS.globalError.column);
                const source = this.parseSameOriginUrl(u);
                if (source) {
                    this.pushEvent(EventName.GlobalError, `Error: ${m}. File: ${source.href.replace(source.origin, '')} at ${this.loc.href}:${ln}:${col}`);
                }
            }
            if (typeof prev === 'function') {
                return prev.call(window, msg, url, line, column, error);
            }
            return undefined;
        });
        window.onerror = handler;
        this.eventRemovers.push(() => {
            active = false;
            if (window.onerror === handler) {
                window.onerror = prev;
            }
        });
        this.on(window, EventName.UnhandledRejection, (evt) => {
            const e = evt;
            const v = (e && typeof e.reason === 'object' && e.reason && 'message' in e.reason) ? String(e.reason.message) : String(e?.reason ?? 'Undefined Rejection Reason');
            this.pushEvent(EventName.GlobalError, `Unhandled Rejection: ${v}. At: ${this.loc.href}`);
        });
    }
    parseSameOriginUrl(url) {
        try {
            const source = new URL(url);
            return source.origin === this.loc.origin ? source : null;
        }
        catch (_err) {
            return null;
        }
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
    isExternalReferrer(referrer) {
        if (!referrer.trim()) {
            return false;
        }
        try {
            return new URL(referrer).origin !== this.loc.origin;
        }
        catch (_err) {
            return true;
        }
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

exports.OstrioWebAnalytics = OstrioWebAnalytics;
exports.SUPPORTED_TRANSPORTS = SUPPORTED_TRANSPORTS;
exports.default = OstrioWebAnalytics;
module.exports = Object.assign(exports.default, exports);
//# sourceMappingURL=index.cjs.map
