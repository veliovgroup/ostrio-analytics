/*! ostrio-analytics v2.0.0 | BSD-3-Clause */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.OstrioTrackerClass = factory());
})(this, (function () { 'use strict';

    var Transport;
    (function (Transport) {
        Transport["Fetch"] = "fetch";
        Transport["Beacon"] = "beacon";
        Transport["Img"] = "img";
    })(Transport || (Transport = {}));
    var SUPPORTED_TRANSPORTS = [Transport.Fetch, Transport.Beacon, Transport.Img];
    var DEFAULTS = {
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
    var QUERY = {
        href: '6',
        title: '2',
        referrer: '1',
        event: '3',
        noise: '9',
        version: 'v',
        timestamp: '11'
    };
    var LIMITS = {
        href: 1024,
        referrer: 1024,
        title: 512,
        eventKey: 24,
        eventValue: 64,
        errorValue: 512
    };
    var WARN = {
        sidError: '[init] {{trackingId}} is missing or incorrect!',
        pushEventMissing: '[pushEvent] Can\'t add event without key or value!',
        fetchError: '[track] [fetch] Error:'
    };
    var OstrioWebAnalytics = /** @class */ (function () {
        function OstrioWebAnalytics(sid, opts) {
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
            var cfg = typeof opts === 'boolean' ? { auto: opts } : (opts || {});
            this.sid = sid;
            this.auto = !(cfg.auto === false);
            this.trackErrors = !(cfg.trackErrors === false);
            cfg.ignoredQueries && this.ignoreQueries(cfg.ignoredQueries);
            cfg.ignoredPaths && this.ignorePaths(cfg.ignoredPaths);
            this.applySettings(cfg);
            this.warn = function () {
                if (typeof console === 'undefined')
                    return;
                var fn = typeof console.warn === 'function' ? console.warn : typeof console.log === 'function' ? console.log : null;
                if (!fn)
                    return;
                var args = Array.from(arguments);
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
        OstrioWebAnalytics.prototype.on = function (obj, type, fn) {
            obj.addEventListener(type, fn, false);
            this.eventRemovers.push(function () {
                obj.removeEventListener(type, fn, false);
            });
        };
        OstrioWebAnalytics.prototype.applySettings = function (cfg) {
            if (typeof cfg.trackHash !== 'undefined') {
                this.trackHash = !(cfg.trackHash === false);
            }
            if (typeof cfg.trackQuery !== 'undefined') {
                this.trackQuery = !(cfg.trackQuery === false);
            }
            if (cfg.serviceUrl && typeof cfg.serviceUrl === 'string' && cfg.serviceUrl.length) {
                this.serviceUrl = cfg.serviceUrl;
                this.serviceUrl = this.serviceUrl.endsWith('/') ? this.serviceUrl : "".concat(this.serviceUrl, "/");
            }
            if (cfg.transport) {
                this.setTransport(cfg.transport);
            }
        };
        OstrioWebAnalytics.prototype.setTransport = function (t) {
            if (SUPPORTED_TRANSPORTS.includes(t)) {
                this.transport = t;
            }
        };
        OstrioWebAnalytics.prototype.ignorePath = function (path) {
            this.ignoredPaths.add(path);
        };
        OstrioWebAnalytics.prototype.ignorePaths = function (paths) {
            if (Array.isArray(paths)) {
                paths.forEach(this.ignorePath.bind(this));
            }
        };
        OstrioWebAnalytics.prototype.ignoreQuery = function (queryKey) {
            this.ignoredQueries.add(queryKey.toLowerCase());
        };
        OstrioWebAnalytics.prototype.ignoreQueries = function (queryKeys) {
            if (Array.isArray(queryKeys)) {
                queryKeys.forEach(this.ignoreQuery.bind(this));
            }
        };
        OstrioWebAnalytics.prototype.onPushEvent = function (callback) {
            if (typeof callback === 'function') {
                this.onEventArr.push(callback);
            }
        };
        OstrioWebAnalytics.prototype.onTrack = function (callback) {
            if (typeof callback === 'function') {
                this.onTrackArr.push(callback);
            }
        };
        OstrioWebAnalytics.prototype.pushEvent = function (rawKey, rawValue) {
            var _a, _b;
            var key = String(rawKey).trim();
            var value = String(rawValue).trim();
            if (!key || !value) {
                this.warn(WARN.pushEventMissing);
                return;
            }
            for (var i = this.onEventArr.length - 1; i >= 0; i--) {
                (_b = (_a = this.onEventArr)[i]) === null || _b === void 0 ? void 0 : _b.call(_a, rawKey, rawValue);
            }
            var event = {};
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
            var query = new URLSearchParams();
            query.set(QUERY.event, JSON.stringify(event));
            this.send(query);
        };
        OstrioWebAnalytics.prototype.track = function () {
            var _a, _b;
            if (this.isIgnored(this.loc.pathname)) {
                return false;
            }
            for (var i = this.onTrackArr.length - 1; i >= 0; i--) {
                (_b = (_a = this.onTrackArr)[i]) === null || _b === void 0 ? void 0 : _b.call(_a);
            }
            return this.send(new URLSearchParams());
        };
        OstrioWebAnalytics.prototype.send = function (query) {
            var _this = this;
            query.set(QUERY.noise, String(Date.now()).slice(-7));
            query.set(QUERY.version, String(this.version));
            if (query.has(QUERY.event)) {
                this.fetch(query, function () { });
                return true;
            }
            if ((!this.sending && this.current !== this.getCurrentUrl())) {
                this.sending = true;
                setTimeout(function () {
                    _this.current = _this.getCurrentUrl();
                    if (_this.lastTrackTimestamp) {
                        query.set(QUERY.timestamp, String(_this.lastTrackTimestamp));
                    }
                    _this.lastTrackTimestamp = Date.now();
                    query.set(QUERY.href, _this.current.slice(0, LIMITS.href));
                    query.set(QUERY.title, document.title.trim().slice(0, LIMITS.title));
                    if (document.referrer && document.referrer.indexOf(_this.loc.origin) === -1) {
                        query.set(QUERY.referrer, document.referrer.trim().slice(0, LIMITS.referrer));
                    }
                    _this.fetch(query, function () {
                        _this.sending = false;
                    });
                }, DEFAULTS.trackDelayMs);
                return true;
            }
            return false;
        };
        OstrioWebAnalytics.prototype.fetch = function (query, cb) {
            var _this = this;
            var url = "".concat(this.serviceUrl).concat(this.sid, ".gif?").concat(query.toString());
            if (this.transport === Transport.Beacon && 'sendBeacon' in navigator) {
                navigator.sendBeacon(url);
                cb();
                return;
            }
            if (this.transport === Transport.Img) {
                var imageLoader_1 = 'Image' in window ? new Image() : document.createElement('img');
                imageLoader_1.onload = function () { imageLoader_1 = null; };
                imageLoader_1.src = url;
                cb();
                return;
            }
            fetch(url, DEFAULTS.fetchConf).then(cb).catch(function (err) {
                _this.warn(WARN.fetchError, err);
                cb();
            });
        };
        OstrioWebAnalytics.prototype.initAutoTracking = function () {
            var _this = this;
            var autoTrack = function () {
                _this.track();
            };
            if (this.trackHash) {
                this.on(window, EventName.HashChange, autoTrack);
            }
            this.on(window, EventName.PopState, autoTrack);
            this.autoTimer = setInterval(function () {
                if (!_this.sending && _this.current !== _this.getCurrentUrl()) {
                    autoTrack();
                }
            }, DEFAULTS.pollMs);
            autoTrack();
        };
        OstrioWebAnalytics.prototype.initGlobalErrors = function () {
            var _this = this;
            var prev = window.onerror;
            window.onerror = (function (msg, url, line, column, error) {
                var m = String(msg || DEFAULTS.globalError.msg);
                var u = String(url || DEFAULTS.globalError.url);
                var ln = String(line || DEFAULTS.globalError.line);
                var col = String(column || DEFAULTS.globalError.column);
                if (u.includes(_this.loc.origin)) {
                    _this.pushEvent(EventName.GlobalError, "Error: ".concat(m, ". File: ").concat(u.replace(_this.loc.origin, ''), " at ").concat(_this.loc.href, ":").concat(ln, ":").concat(col));
                }
                if (typeof prev === 'function') {
                    prev.call(window, msg, url, line, column, error);
                }
            });
            this.on(window, EventName.UnhandledRejection, function (evt) {
                var _a;
                var e = evt;
                var v = (e && typeof e.reason === 'object' && e.reason && 'message' in e.reason) ? String(e.reason.message) : String((_a = e === null || e === void 0 ? void 0 : e.reason) !== null && _a !== void 0 ? _a : 'Undefined Rejection Reason');
                _this.pushEvent(EventName.GlobalError, "Unhandled Rejection: ".concat(v, ". At: ").concat(_this.loc.href));
            });
        };
        OstrioWebAnalytics.prototype.isIgnored = function (pathname) {
            if (!this.ignoredPaths.size) {
                return false;
            }
            var paths = Array.from(this.ignoredPaths);
            for (var i = paths.length - 1; i >= 0; i--) {
                var rule = paths[i];
                if (typeof rule === 'string') {
                    if (rule.endsWith('*')) {
                        var prefix = rule.slice(0, -1);
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
        };
        OstrioWebAnalytics.prototype.getCurrentUrl = function () {
            var _this = this;
            var url = new URL(this.loc.href);
            if (!this.trackHash) {
                url.hash = '';
            }
            if (!this.trackQuery) {
                url.search = '';
            }
            else if (this.ignoredQueries.size) {
                Array.from(url.searchParams.keys()).forEach(function (key) {
                    if (_this.ignoredQueries.has(key.toLowerCase())) {
                        url.searchParams.delete(key);
                    }
                });
            }
            return url.href;
        };
        OstrioWebAnalytics.prototype.destroy = function () {
            var _a, _b;
            for (var i = this.eventRemovers.length - 1; i >= 0; i--) {
                (_b = (_a = this.eventRemovers)[i]) === null || _b === void 0 ? void 0 : _b.call(_a);
            }
            this.eventRemovers.length = 0;
            if (this.autoTimer) {
                clearInterval(this.autoTimer);
                this.autoTimer = null;
            }
        };
        return OstrioWebAnalytics;
    }());

    return OstrioWebAnalytics;

}));
//# sourceMappingURL=ostrio-analytics.umd.js.map
