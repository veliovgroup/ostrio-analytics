module.exports = (function () {
  function OTC(sid, auto) {
    var self     = this;
    this.sid     = sid;
    this.DNT     = !!parseInt(navigator.doNotTrack || 0);
    this.version = 204;
    this.sending = false;
    this.loc     = location || window.location || document.location;
    this.current = '';
    this.auto    = !(auto === false);
    this._euc    = encodeURIComponent || function (str) {return str;};
    this.info    = console.info.bind(console) || console.log.bind(console) || function () {return;};
    this.warn    = console.warn.bind(console) || console.log.bind(console) || function () {return;};
    this.errs    = [];

    if (this.DNT) {
      this.info('We respect your decision to be not tracked. DNT policy: https://en.wikipedia.org/wiki/Do_Not_Track');
      this.info('For better experience, we recommend to turn off DNT on your browser, more info: https://allaboutdnt.com/#adjust-settings');
      this.info('Sincerely, https://ostr.io');
      return false;
    }

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

      /* handle anchor clicks */
      this.on(document, 'click', function (event) {
        if (event.target.nodeName === 'A') {
          autoTrack();
        }
      });

      /* Listen for Global Errors */
      var _onerror   = window.onerror;
      window.onerror = function (msg, url, line, column) {
        if (!!~url.indexOf(self.loc.origin)) {
          self.pushEvent('[Global Error]', 'Error: ' + msg + '. File: ' + url.replace(self.loc.origin, '') + ' At: ' + line + ':' + column);
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

  /* Custom events method */
  OTC.prototype.pushEvent = function (_key, _value) {
    if (!this.DNT) {
      if (_key && _value && '' + _key.length && '' + _value.length) {
        var key   = '' + _key;
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
    }
  };

  OTC.prototype.track = function (_query) {
    if (!this.DNT) {
      var query = _query || '';

      if ((!this.sending && this.current !== this.loc.href) || !!~query.indexOf('?3=')) {
        this.sending = true;
        var self     = this;

        setTimeout(function () {
          self.current = self.loc.href;
          var imageLoader;

          if (!~query.indexOf('?3=')) {
            query    = ('?6=' + self._euc(self.loc.href.trim().substring(0, 1024)) + query);
            query   += '&2=' + self._euc(document.title.trim().substring(0, 512));
            if (document.referrer && !~document.referrer.indexOf(self.loc.origin)) {
              query += '&1=' + self._euc(document.referrer.trim().substring(0, 1024));
            }
          }

          if (window.Image === undefined) {
            imageLoader = document.createElement('img');
          } else {
            imageLoader = new Image();
          }

          imageLoader.onload = function () {
            imageLoader = null;
          };

          imageLoader.src = 'https://analytics.ostr.io/' + self.sid + '.gif' + query + '&9=' + (('' + (+new Date())).substr(-7)) + '&v=' + self.version;
          self.sending = false;
        }, 64);
      }
    }
  };

  return OTC;
})();
