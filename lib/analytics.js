module.exports = (function () {
  function OTC(sid, auto) {
    var self = this;
    this.sid = sid;
    this.version = 220;
    this.sending = false;
    this.loc = location || window.location || document.location;
    this.current = '';
    this.auto = !(auto === false);
    this._euc = encodeURIComponent || function (str) {return str;};
    this.warn = console.warn.bind(console) || console.log.bind(console) || function () {return;};
    this.errs = [];
    this.onTrackArr = [];
    this.onEventArr = [];

    if (this.auto) {
      var autoTrack = function () {
        self.track();
      };

      /* handle url changes */
      this.on(window, 'hashchange', autoTrack);
      this.on(window, 'popstate', autoTrack);

      /* Fallback to long-polling URI changes */
      setInterval(function (){
        if (self.current !== self.loc.href && !self.sending) {
          autoTrack();
        }
      }, 500);

      /* Listen for Global Errors */
      var _onerror = window.onerror;
      window.onerror = function (_msg, _url, _line, _column) {
        var url = _url || '';
        var msg = _msg || 'N/A';
        var line = _line || '0';
        var column = _column || '0';

        if (!!~url.indexOf(self.loc.origin)) {
          self.pushEvent('[Global Error]', 'Error: ' + msg + '. File: ' + url.replace(self.loc.origin, '') + ' at ' + self.loc.href + ':' + line + ':' + column);
        }
        if (_onerror) {
          _onerror.apply(this, arguments);
        }
      };

      autoTrack();
    }
  }

  /* Bulletproof addEventListener */
  OTC.prototype.on = function (obj, type, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(type, fn, false);
    } else {
      obj.attachEvent('on' + type, fn);
    }
  };

  OTC.prototype.onPushEvent = function (callback) {
    if (callback && typeof callback === 'function') {
      this.onEventArr.push(callback);
    }
  };

  OTC.prototype.onTrack = function (callback) {
    if (callback && typeof callback === 'function') {
      this.onTrackArr.push(callback);
    }
  };

  /* Custom events method */
  OTC.prototype.pushEvent = function (_key, _value) {
    for (var i = this.onEventArr.length - 1; i >= 0; i--) {
      this.onEventArr[i](_key, _value);
    }

    if (_key && _value && '' + _key.length && '' + _value.length) {
      var key = '' + _key;
      var value = '' + _value;
      var event = {};
      if (key === '[Global Error]') {
        value = value.trim().substring(0, 512);
        if (!!~this.errs.indexOf(value)) {
          return;
        }
        this.errs.push(value);
      } else {
        value = value.trim().substring(0, 64);
      }
      event[key.trim().substring(0, 24)] = value;
      this.track('?3=' + this._euc(JSON.stringify(event)));
    } else {
      this.warn('[ostrio] [pushEvent]: Can\'t add event without key or value!');
    }
  };

  OTC.prototype.track = function (_query) {
    var query = _query || '';
    if (!~query.indexOf('?3=')) {
      for (var i = this.onTrackArr.length - 1; i >= 0; i--) {
        this.onTrackArr[i]();
      }
    }

    if ((!this.sending && this.current !== this.loc.href) || !!~query.indexOf('?3=')) {
      this.sending = true;
      var self = this;

      setTimeout(function () {
        self.current = self.loc.href;

        if (!~query.indexOf('?3=')) {
          query  = ('?6=' + self._euc(self.loc.href.trim().substring(0, 1024)) + query);
          query += '&2=' + self._euc(document.title.trim().substring(0, 512));
          if (document.referrer && !~document.referrer.indexOf(self.loc.origin)) {
            query += '&1=' + self._euc(document.referrer.trim().substring(0, 1024));
          }
        }

        var url = 'https://analytics.ostr.io/' + self.sid + '.gif' + query + '&9=' + ('' + Date.now()).substr(-7) + '&v=' + self.version;

        var imageLoader;
        if (!window.Image) {
          imageLoader = document.createElement('img');
        } else {
          imageLoader = new Image();
        }

        imageLoader.onload = function () {
          imageLoader = null;
        };

        imageLoader.src = url;
        self.sending = false;
      }, 64);
    }
  };

  return OTC;
})();
