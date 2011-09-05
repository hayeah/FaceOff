(function() {
  var DEBUG, DOMAIN_RE, FBLikeTag, FakeLike, LikeButtonShadow, SECRET, XFBML, console, facebook_off, like_button_beforeload, p, sdk_beforeload;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  DEBUG = true;
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
  SECRET = "" + Math.random();
  FakeLike = (function() {
    function FakeLike(button, onclick) {
      this.trigger = onclick;
      this.button = button;
      this.create_fake_button();
      this.button.replaceWith(this.fake_button);
    }
    FakeLike.prototype.create_fake_button = function() {
      var imgURL;
      this.fake_button = $("<span class='faceOff-like'></span>");
      imgURL = chrome.extension.getURL("faceoff-icon.png");
      this.fake_button.css({
        "background": "url(" + imgURL + ") 0 0 no-repeat",
        "height": "24px",
        "width": "51px",
        "display": "inline-block"
      });
      this.fake_button.bind("mouseenter", __bind(function() {
        return this.fake_button.css({
          "background-position": "0 -24px"
        });
      }, this));
      this.fake_button.bind("mouseleave", __bind(function() {
        return this.fake_button.css({
          "background-position": "0 0"
        });
      }, this));
      this.fake_button.click(__bind(function(e) {
        this.loading();
        return this.trigger(e);
      }, this));
      return this.fake_button;
    };
    FakeLike.prototype.loading = function() {
      var imgURL;
      this.spinner = $("<img/>");
      imgURL = chrome.extension.getURL("loader.gif");
      this.spinner.attr("src", imgURL);
      this.fake_button.replaceWith(this.spinner);
      return this.fake_button = null;
    };
    FakeLike.prototype.loaded = function(element) {
      this.spinner.replaceWith(element);
      return this.spinner = null;
    };
    return FakeLike;
  })();
  LikeButtonShadow = (function() {
    function LikeButtonShadow(iframe) {
      iframe.shadow = this;
      this.iframe = $(iframe);
      this.turn_off();
    }
    LikeButtonShadow.prototype.turn_off = function() {
      return this.iframe.replaceWith(this.create_custom_button());
    };
    LikeButtonShadow.prototype.create_custom_button = function() {
      var imgURL;
      this.custom_button = $("<span class='faceOff-like'></span>");
      imgURL = chrome.extension.getURL("faceoff-icon.png");
      this.custom_button.css({
        "background": "url(" + imgURL + ") 0 0 no-repeat",
        "height": "24px",
        "width": "51px",
        "display": "inline-block"
      });
      this.custom_button.bind("mouseenter", __bind(function() {
        return this.custom_button.css({
          "background-position": "0 -24px"
        });
      }, this));
      this.custom_button.bind("mouseleave", __bind(function() {
        return this.custom_button.css({
          "background-position": "0 0"
        });
      }, this));
      this.custom_button.bind("click", __bind(function() {
        return this.turn_on();
      }, this));
      return this.custom_button;
    };
    LikeButtonShadow.prototype.reload_iframe = function() {
      this.iframe = this.iframe.clone();
      return this.iframe[0][SECRET] = this;
    };
    LikeButtonShadow.prototype.turn_on = function() {
      this.reload_iframe();
      this.custom_button.replaceWith(this.iframe);
      this.iframe.hide();
      this.show_spinner();
      return this.iframe.load(__bind(function() {
        this.hide_spinner();
        return this.iframe.show();
      }, this));
    };
    LikeButtonShadow.prototype.show_spinner = function() {
      var imgURL;
      this.spinner = $("<img/>");
      imgURL = chrome.extension.getURL("loader.gif");
      this.spinner.attr("src", imgURL);
      return this.iframe.before(this.spinner);
    };
    LikeButtonShadow.prototype.hide_spinner = function() {
      this.spinner.remove();
      return this.spinner = null;
    };
    return LikeButtonShadow;
  })();
  FBLikeTag = (function() {
    function FBLikeTag(tag) {
      this.tag = $(tag);
      this.fake = new FakeLike(this.tag, __bind(function() {
        return this.turn_on();
      }, this));
    }
    FBLikeTag.prototype.turn_on = function() {
      return setTimeout(__bind(function() {
        return this.display();
      }, this), 2000);
    };
    FBLikeTag.prototype.display = function() {
      return this.fake.loaded($("<div>Great Success</div>"));
    };
    return FBLikeTag;
  })();
  XFBML = (function() {
    function XFBML(script) {
      this.script = script;
      $(document).ready(__bind(function() {
        return this.prevent_loading();
      }, this));
    }
    XFBML.prototype.prevent_loading = function() {
      return this.replace_likes();
    };
    XFBML.prototype.replace_likes = function() {
      var likes, tag, _i, _len, _results;
      likes = $("fb\\:like");
      console.log(likes);
      _results = [];
      for (_i = 0, _len = likes.length; _i < _len; _i++) {
        tag = likes[_i];
        _results.push(new FBLikeTag(tag));
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
      new LikeButtonShadow(iframe);
      event.preventDefault();
      return false;
    }
  };
  sdk_beforeload = function(event) {
    var script;
    script = event.target;
    new XFBML(script);
    event.preventDefault();
    return false;
  };
  facebook_off = function(event) {
    var md, type;
    if (md = event.url.match(DOMAIN_RE)) {
      type = event.target.constructor;
      if (type === HTMLIFrameElement) {
        console.log("block iframe:", event.url);
        return like_button_beforeload(event);
      } else if (type === HTMLScriptElement) {
        console.log("block script:", event.url);
        return sdk_beforeload(event);
      } else {
        console.log("block:", event.url);
        return event.preventDefault();
      }
    } else {
      return console.log("load: " + event.url);
    }
  };
  document.addEventListener("beforeload", facebook_off, true);
}).call(this);
