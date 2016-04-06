'use strict';
;(function(root) {
  var SD = (function() {
    function SD() {
      this.s   = window.screen || screen || {};
      this.h   = this.s.height;
      this.w   = this.s.width;
      this.cD  = this.s.colorDepth;
      this.pD  = this.s.pixelDepth;
      var _rtt = this.s.orientation || this.s.mozOrientation || this.s.msOrientation || null;
      if (_rtt && _rtt.type) {
        this.rtt = _rtt.type.split('-')[0];
        if (!!~this.rtt.indexOf('landscape')) {
          this.rtt = '-';
        }
        if (!!~this.rtt.indexOf('portrait')) {
          this.rtt = '|';
        }
      } else {
        this.rtt = this.d();
      }
    }

    SD.prototype.d = function() {
      if (this.w >= this.h) {
        return '-';
      } else {
        return '|';
      }
    };

    SD.prototype.toJ = function() {
      var obj = {};
      obj['4a'] = this.w + 'x' + this.h;
      obj['4b'] = (window.innerWidth || window.clientHeight) + 'x' + (window.innerHeight || window.clientHeight);
      if (this.pD) { obj['4c'] = this.pD; }
      if (this.cD) { obj['4d'] = this.cD; }
      obj['4e'] = this.rtt;
      return JSON.stringify(obj);
    };
    return SD;
  })();

  var OTC = (function() {
    function OTC(sid, auto) {
      if (auto === undefined) { auto = true; }
      this.scr = (new SD()).toJ();
      this.loc = location || window.location || document.location;
      this.ch  = '';
      this.fc  = false;
      this.sid = sid;
      this.DNT = !!parseInt(navigator.doNotTrack || 0);
      this.ver = 102;

      if (window.Image === undefined) {
        this.iL = document.createElement('img');
      } else {
        this.iL = new Image();
      }

      if (!this.DNT) {
        if (auto) {
          this._s();
        }
      } else {
        console.log('We are respect you decision to be not tracked. DNT policy: https://en.wikipedia.org/wiki/Do_Not_Track');
        console.log('For better experience we recommend to turn off DNT on your browser, more info: https://allaboutdnt.com/#adjust-settings');
        console.log('Sincerely, ostrio: https://ostr.io');
      }
    }

    OTC.prototype._hc = function hcl(e) {
      var target = e.currentTarget;
      if (target && target.href && target.href !== this.ch + '#' && target.href !== this.ch + '/#') {
        this.fc = true;
        if (!!~target.href.indexOf(this.loc.origin)) {
          this.track();
        } else {
          this.track('&7=' + this._gH() + '&8=' + target.href, false);
        }
      }
    };

    OTC.prototype._lL = function() {
      var self        = this;
      var elements    = Array.prototype.slice.call(document.getElementsByTagName('a'));
      var handleClick = function (e) { self._hc(e); };

      for (var i = elements.length - 1; i >= 0; i--) {
        this._rE(elements[i], 'click', handleClick);
        this._aE(elements[i], 'click', handleClick);
      }
    };

    OTC.prototype._s = function() {
      var self = this;
      setTimeout(function(){ return self.track.apply(self); }, 1);
      self._lL();

      var MO = window.MutationObserver || window.WebKitMutationObserver;

      if (MO) {
        var observer = new MO(function(mutations){
          for (var i = mutations.length - 1; i >= 0; i--) {
            for (var j = mutations[i].addedNodes.length - 1; j >= 0; j--) {
              if (mutations[i].addedNodes[j].nodeName) {
                if (mutations[i].addedNodes[j].nodeName === 'A') {
                  self._aE(mutations[i].addedNodes[j], 'click', self.handleClick);
                }
              }
            }

            for (var k = mutations[i].removedNodes.length - 1; k >= 0; k--) {
              if (mutations[i].removedNodes[k].nodeName) {
                if (mutations[i].removedNodes[k].nodeName === 'A') {
                  self._rE(mutations[i].removedNodes[k], 'click', self.handleClick);
                }
              }
            }
          }
        });
        observer.observe(document.body, {childList: true, subtree: true});

      } else {
        self._aE(document.body, 'DOMSubtreeModified', self.lL);
      }

      var hc = function() {
        if (!self.fc) {
          self.track();
        }
      };

      var hx = function() {
        if (!self.fc) {
          self.track('&7=' + self._gH(), false);
        }
      };

      self._aE(window, 'hashchange', hc);
      self._aE(window, 'popstate', hc);
      self._aE(window, 'beforeunload', hx);
      self._aE(document, 'beforeunload', hx);
      self._aE(document.body, 'beforeunload', hx);

      var _history = window.History || History || window.history || history;

      if (_history && _history.Adapter) {
        _history.Adapter.bind(window, 'statechange', hc);
      }

      setInterval(function (){
        if (self.ch !== self.loc.href && !self.fc) {
          self.track();
          self._lL();
        }
      }, 750);

      var origWoE = window.onerror;

      window.onerror = function(msg, url, line) {
        self.pushEvent('[Global Error]', 'Error: ' + msg + '. File: ' + url.replace(self.loc.origin, '') + ' On line: ' + line);
        if (origWoE) {
          origWoE.apply(this, arguments);
        }
      };
    };

    OTC.prototype._aE = function(obj, type, fn) {
      if (obj.addEventListener) {
        obj.addEventListener(type, fn, false);
      } else {
        obj.attachEvent('on' + type, fn);
      }
    };

    OTC.prototype._rE = function(obj, type, fn) {
      if (obj.removeEventListener) {
        obj.removeEventListener(type, fn, false);
      } else {
        obj.detachEvent('on' + type, fn);
      }
    };

    OTC.prototype.pushEvent = function(key, value) {
      if (!this.DNT) {
        if (key && value && key.length && value.length) {
          var event = {};
          if (key === '[Global Error]') {
            value = value.trim().substring(0, 512);
          } else {
            value = value.trim().substring(0, 64);
          }
          event[key.trim().substring(0, 24)] = value;
          this.track('&3=' + JSON.stringify(event));
        } else {
          console.warn('[ostrio] [pushEvent]: Can\'t add event without key or value!');
        }
      }
    };

    OTC.prototype._gH = function() {
      return this.loc.href;
    };

    OTC.prototype.track = function(q, delay) {
      if (!this.DNT) {
        if (!q) { q = ''; }
        var self = this;
        var iT   = function() {
          if (self.ch !== self.loc.href || /&(8|3)=/.test(q)) {
            var query  = '?';
            query     += '6=' + encodeURIComponent(self._gH());

            if (!~q.indexOf('&3=')) {
              query   += '&2=' + encodeURIComponent(document.title);
              query   += '&4=' + encodeURIComponent(self.scr);
              if (document.referrer && !~document.referrer.indexOf(self.loc.origin)) {
                query += '&1=' + encodeURIComponent(document.referrer);
              }

              var locale   = navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || false;

              if (locale) {
                query   += '&5=' + encodeURIComponent(locale);
              }
              self.ch = self.loc.href;
            }

            self.iL.src = 'https://analytics.ostr.io/' + self.sid + '.gif' + query + q + '&9=' + ((''+(+new Date())).substr(-7))+ '&v=' + self.ver;

            setTimeout(function() {
              self.fc = false;
              self._lL();
            }, 25);
          }
        };

        if (delay === false) {
          iT();
        } else {
          setTimeout(iT, 26);
        }
      }
    };

    return OTC;
  })();

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = OTC;
    }
    exports.OstrioTrackerClass = OTC;
  } else if (typeof Meteor !== 'undefined') {
    OstrioTrackerClass = OTC;
  } else {
    root.OstrioTrackerClass = OTC;
  }

  if (typeof define == 'function' && define.amd) {
    define('OstrioTrackerClass', [], function() {
      return OTC;
    });
  }

}(this));