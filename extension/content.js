(function() {
  var $, DEBUG, DOMAIN_RE, FBLikeTag, FakeLike, LOAD, LikeIFrame, SECRET, XFBML, console, facebook_off, like_button_beforeload, make_loadable, p, sdk_beforeload;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $ = jQuery;
  DEBUG = false;
  if (!DEBUG) {
    console = {};
    console.log = function() {};
  } else {
    console = window.console;
  }
  p = function(o) {
    return console.log(o);
  };
  DOMAIN_RE = /^https?:\/\/(www\.)?(facebook.com|facebook.net|fbcdn.net|connect.facebook)/i;
  LOAD = SECRET = "" + Math.random();
  make_loadable = function(o) {
    if (o.constructor === jQuery) {
      o = o[0];
    }
    return o[LOAD] = true;
  };
  FakeLike = (function() {
    function FakeLike(button, onclick) {
      this.trigger = onclick;
      this.button = button;
      this.fake_button = this.create_fake_button();
      this.button.replaceWith(this.fake_button);
    }
    FakeLike.prototype.create_fake_button = function() {
      var button, imgURL;
      button = $("<span class='faceOff-like'></span>");
      imgURL = chrome.extension.getURL("faceoff-icon.png");
      button.css({
        "background": "url(" + imgURL + ") 0 0 no-repeat",
        "height": "24px",
        "width": "51px",
        "display": "inline-block"
      });
      button.bind("mouseenter", __bind(function() {
        return button.css({
          "background-position": "0 -24px"
        });
      }, this));
      button.bind("mouseleave", __bind(function() {
        return button.css({
          "background-position": "0 0"
        });
      }, this));
      button.click(__bind(function(e) {
        return this.trigger(e);
      }, this));
      return button;
    };
    FakeLike.prototype.loading = function(element) {
      this.show_spinner();
      this.fake_button.replaceWith($(element));
      return this.fake_button = null;
    };
    FakeLike.prototype.loaded = function() {
      this.spinner.remove();
      return this.spinner = null;
    };
    FakeLike.prototype.show_spinner = function() {
      var imgURL;
      this.spinner = $("<img/>");
      imgURL = chrome.extension.getURL("loader.gif");
      this.spinner.attr("src", imgURL);
      return this.fake_button.before(this.spinner);
    };
    return FakeLike;
  })();
  LikeIFrame = (function() {
    function LikeIFrame(iframe) {
      this.button = $(iframe);
      this.fake = new FakeLike(this.button, __bind(function() {
        return this.turn_on();
      }, this));
    }
    LikeIFrame.prototype.reload_iframe = function() {
      this.button = this.button.clone();
      this.button[0][SECRET] = this;
      return this.button.hide();
    };
    LikeIFrame.prototype.turn_on = function() {
      this.reload_iframe();
      this.fake.loading(this.button);
      return this.button.load(__bind(function() {
        this.button.show();
        return this.fake.loaded();
      }, this));
    };
    return LikeIFrame;
  })();
  FBLikeTag = (function() {
    function FBLikeTag(tag, sdk) {
      this.sdk = sdk;
      this.tag = $(tag);
      this.fake = new FakeLike(this.tag, __bind(function() {
        return this.turn_on();
      }, this));
    }
    FBLikeTag.prototype.turn_on = function() {
      return this.sdk.load();
    };
    FBLikeTag.prototype.loading = function() {
      this.tag.hide();
      return this.fake.loading(this.tag);
    };
    FBLikeTag.prototype.loaded = function() {
      this.tag.show();
      return this.fake.loaded();
    };
    return FBLikeTag;
  })();
  XFBML = (function() {
    function XFBML(script) {
      this.script = $(script);
      this.script.detach();
      $(document).ready(__bind(function() {
        return this.prevent_loading();
      }, this));
    }
    XFBML.prototype.prevent_loading = function() {
      return this.replace_likes();
    };
    XFBML.prototype.replace_likes = function() {
      var likes, tag;
      likes = $("fb\\:like");
      return this.likes = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = likes.length; _i < _len; _i++) {
          tag = likes[_i];
          _results.push(new FBLikeTag(tag, this));
        }
        return _results;
      }).call(this);
    };
    XFBML.prototype.load = function() {
      var tag, _i, _len, _ref;
      _ref = this.likes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        tag.loading();
      }
      return this.load_script();
    };
    XFBML.prototype.load_script = function() {
      var script;
      if (XFBML[LOAD]) {
        return;
      }
      XFBML[LOAD] = true;
      script = document.createElement('script');
      script.src = this.script.attr("src");
      script.addEventListener('load', __bind(function() {
        return this.sdk_loaded();
      }, this));
      return document.head.appendChild(script);
    };
    XFBML.prototype.sdk_loaded = function() {
      var tag, _i, _len, _ref, _results;
      this.loaded = true;
      _ref = this.likes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        _results.push(tag.loaded());
      }
      return _results;
    };
    return XFBML;
  })();
  like_button_beforeload = function(event) {
    var iframe;
    iframe = event.target;
    if (iframe[SECRET]) {
      return true;
    } else {
      new LikeIFrame(iframe);
      event.preventDefault();
      return false;
    }
  };
  sdk_beforeload = function(event) {
    var script, sdk;
    script = event.target;
    sdk = new XFBML(script);
    event.preventDefault();
    return false;
  };
  facebook_off = function(event) {
    var md, type;
    if (md = event.url.match(DOMAIN_RE)) {
      p("attempt:" + event.url);
      if (event.target[LOAD]) {
        p("made loadable: " + event.url);
        return;
      }
      type = event.target.constructor;
      if (type === HTMLIFrameElement) {
        p("block iframe:" + event.url);
        return like_button_beforeload(event);
      } else if (type === HTMLScriptElement) {
        if (XFBML[LOAD]) {
          return;
        }
        p("block script:" + event.url);
        return sdk_beforeload(event);
      } else {
        p("block:", event.url);
        return event.preventDefault();
      }
    } else {
      return console.log("load: " + event.url);
    }
  };
  document.addEventListener("beforeload", facebook_off, true);
}).call(this);
