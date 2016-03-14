'use strict';
(function() {

  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  var ScreenDetector = (function() {
    function ScreenDetector() {
      var _orientation;
      this.screen     = window.screen || screen;
      this.height     = this.screen.height;
      this.width      = this.screen.width;
      this.colorDepth = this.screen.colorDepth;
      this.pixelDepth = this.screen.pixelDepth;
      _orientation    = screen.orientation || screen.mozOrientation || screen.msOrientation;
      if (_orientation && _orientation.type) {
        this.orientation = _orientation.type.split('-')[0];
      } else {
        this.orientation = this.detect();
      }
    }

    ScreenDetector.prototype.detect = function() {
      if (this.width >= this.height) {
        return 'landscape';
      } else {
        return 'portrait';
      }
    };

    ScreenDetector.prototype.toJson = function() {
      var wW = window.innerWidth || window.clientHeight;
      var wH = window.innerHeight || window.clientHeight;
      var obj = {};
      if (this.width && this.height) {
        obj.screen = this.width+'x'+this.height;
      }
      if (wW && wH) {
        obj.window = wW+'x'+wH;
      }
      if (this.pixelDepth) {
        obj.pixelDepth = this.pixelDepth;
      }
      if (this.colorDepth) {
        obj.colorDepth = this.colorDepth;
      }
      if (this.orientation) {
        obj.orientation = this.orientation;
      }
      return JSON.stringify(obj);
    };

    return ScreenDetector;
  })();

  var OstrioTrackerClass;
  module.exports = OstrioTrackerClass = (function() {
    function OstrioTrackerClass(serverId) {
      var self         = this;
      self.track       = bind(self.track, self);
      self.getHref     = bind(self.getHref, self);
      self.addEvent    = bind(self.addEvent, self);
      self.pushEvent   = bind(self.pushEvent, self);
      self.removeEvent = bind(self.removeEvent, self);
      self.screen      = encodeURIComponent((new ScreenDetector()).toJson());
      self.location    = location || window.location || document.location;
      self.currentHref = '';
      self.followClick = false;
      self.serverId    = serverId;

      var tracking     = document.getElementById('__tracking__');
      if (!tracking) {
        tracking       = document.createElement("div");
        tracking.id    = '__tracking__';
        tracking.style.position = 'absolute';
        tracking.style.top      = '-1000px';
        tracking.style.left     = '-1000px';
        document.body.appendChild(tracking);
      }

      setTimeout(self.track, 1);

      var handleClick = function (e) {
        var target = e.currentTarget;
        if (target && target.href && target.href !== self.currentHref + '#' && target.href !== self.currentHref + '/#') {
          self.followClick = true;
          if (!!~target.href.indexOf(self.location.origin)) {
            self.track('&event=click');
          } else {
            self.track('&event=click&exitPage=' + self.getHref() + '&follow=' + target.href, false);
          }
        }
      };

      self.listenLinks = function() {
        var elements = Array.prototype.slice.call(document.getElementsByTagName('a'));
        for (var i = elements.length - 1; i >= 0; i--) {
          self.removeEvent(elements[i], 'click', handleClick);
          self.addEvent(elements[i], 'click', handleClick);
        }
      };

      self.listenLinks();

      var MO = window.MutationObserver || window.WebKitMutationObserver;

      if (MO) {
        var observer = new MO(function(mutations){

        for (var i = mutations.length - 1; i >= 0; i--) {
          for (var j = mutations[i].addedNodes.length - 1; j >= 0; j--) {
            if (mutations[i].addedNodes[j].nodeName) {
              if (mutations[i].addedNodes[j].nodeName === 'A') {
                self.addEvent(mutations[i].addedNodes[j], 'click', handleClick);
              }
            }
          }

          for (var k = mutations[i].removedNodes.length - 1; k >= 0; k--) {
            if (mutations[i].removedNodes[k].nodeName) {
              if (mutations[i].removedNodes[k].nodeName === 'A') {
                self.removeEvent(mutations[i].removedNodes[k], 'click', handleClick);
              }
            }
          }
        }
        });
        observer.observe(document.body, {childList: true, subtree: true});

      } else {
        self.addEvent(document.body, 'DOMSubtreeModified', self.listenLinks);
      }

      self.addEvent(window, 'hashchange', function() {
        if (!self.followClick) {
          self.track('&event=hashchange');
        }
      });

      self.addEvent(window, 'popstate', function() {
        if (!self.followClick) {
          self.track('&event=popstate');
        }
      });

      self.addEvent(window, 'beforeunload', function() {
        if (!self.followClick) {
          self.track('&exitPage=' + self.getHref(), false);
        }
      });

      self.addEvent(document, 'beforeunload', function() {
        if (!self.followClick) {
          self.track('&exitPage=' + self.getHref(), false);
        }
      });

      self.addEvent(document.body, 'beforeunload', function() {
        if (!self.followClick) {
          self.track('&exitPage=' + self.getHref(), false);
        }
      });

      var _history = window.History || History || window.history || history;

      if (_history && _history.Adapter) {
        _history.Adapter.bind(window, 'statechange', function() {
          if (!self.followClick) {
            self.track('&event=statechange');
          }
        });
      }

      setInterval(function (){
        if (self.currentHref !== self.location.href && !self.followClick) {
          self.track('&event=interval');
          self.listenLinks();
        }
      }, 750);

      var origWOE = window.onerror;

      window.onerror = function(msg, url, line) {
        self.pushEvent('[Global Error]', 'Error: ' + msg + ' File: ' + url + ' On line: ' + line);
        if (origWOE) {
          origWOE.apply(this, arguments);
        }
      };
    }

    OstrioTrackerClass.prototype.addEvent = function(obj, type, fn) {
      if (obj.addEventListener) {
        obj.addEventListener(type, fn, false);
      } else {
        obj.attachEvent('on' + type, fn);
      }
    };

    OstrioTrackerClass.prototype.removeEvent = function(obj, type, fn) {
      if (obj.removeEventListener) {
        obj.removeEventListener(type, fn, false);
      } else {
        obj.detachEvent('on' + type, fn);
      }
    };

    OstrioTrackerClass.prototype.pushEvent = function(key, value) {
      if (key && value && key.length && value.length) {
        var event = {};
        if (key === '[Global Error]') {
          value = value.trim().substring(0, 512);
        } else {
          value = value.trim().substring(0, 64);
        }
        event[key.trim().substring(0, 24)] = value;
        this.track('&pushEvent=' + encodeURIComponent(JSON.stringify(event)));
      } else {
        console.warn('[ostrio] [tracking] [pushEvent]: Can\'t add event without key or value, both arguments must present, and be a {String}!');
      }
    };

    OstrioTrackerClass.prototype.getHref = function() {
      return encodeURIComponent(this.location.href);
    };

    OstrioTrackerClass.prototype.track = function(query, delay) {
      if (!query) { query = ''; }
      var self          = this;
      var insertTracker = function() {
        if (self.currentHref !== self.location.href || !!~query.indexOf('follow') || !!~query.indexOf('pushEvent')) {
          var page     = self.getHref();
          var title    = encodeURIComponent(document.title);
          var referral = encodeURIComponent(document.referrer);
          var locale   = navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || 'null';

          document.getElementById('__tracking__').innerHTML = '<img src="https://analytics.ostr.io/' + self.serverId + '.gif?referral=' + referral + '&pageTitle=' + title + '&screen=' + self.screen + '&locale=' + locale + '&page=' + page + query + '" width="0" height="0" style="width:0px;height:0px;position:absolute;top:-1000px;left:-1000px" />';

          self.currentHref = self.location.href;
          setTimeout(function() {
            self.followClick = false;
            self.listenLinks();
          }, 25);
        }
      };

      if (delay === false) {
        insertTracker();
      } else {
        setTimeout(insertTracker, 1);
      }
    };

    return OstrioTrackerClass;
  })();
}).call(this);