(function() {
  var DOMAIN_RE, LikeButtonShadow, SECRET, facebook_off, like_button_beforeload;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  DOMAIN_RE = /^https?:\/\/(www\.)?(facebook.com|facebook.net|fbcdn.net)/i;
  SECRET = "" + Math.random();
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
      return this.custom_button.replaceWith(this.iframe);
    };
    return LikeButtonShadow;
  })();
  like_button_beforeload = function(event) {
    var iframe, shadow;
    iframe = event.target;
    if (shadow = iframe[SECRET]) {
      shadow.turn_on();
      return true;
    } else {
      new LikeButtonShadow(iframe);
      event.preventDefault();
      return false;
    }
  };
  facebook_off = function(event) {
    var md;
    if (md = event.url.match(DOMAIN_RE)) {
      if (event.target.constructor === HTMLIFrameElement) {
        console.log("like:", event.url);
        return like_button_beforeload(event);
      } else {
        return event.preventDefault();
      }
    }
  };
  document.addEventListener("beforeload", facebook_off, true);
}).call(this);
