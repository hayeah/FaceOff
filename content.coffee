DEBUG = true

if !DEBUG
  console = {}
  console.log = ->
else
  console = window.console

p = (o) -> console.log(o)

DOMAIN_RE = /^https?:\/\/(www\.)?(facebook.com|facebook.net|fbcdn.net|connect.facebook)/i

SECRET = "" + Math.random()

class FakeLike
  constructor: (button,onclick) ->
    @trigger = onclick
    @button = button # thing to replace
    @fake_button = this.create_fake_button()
    @button.replaceWith(@fake_button)
  create_fake_button: ->
    button = $("<span class='faceOff-like'></span>")
    imgURL = chrome.extension.getURL("faceoff-icon.png");
    button.css
     "background": "url(#{imgURL}) 0 0 no-repeat"
     "height": "24px"
     "width": "51px"
     "display": "inline-block"
    button.bind "mouseenter", () =>
      button.css "background-position": "0 -24px"
    button.bind "mouseleave", () =>
      button.css "background-position": "0 0"
    button.click (e) => @trigger(e)
    return button
  loading: (element) ->
    this.show_spinner()
    @fake_button.replaceWith($(element))
    @fake_button = null
  loaded: () ->
    @spinner.remove()
    @spinner = null
  show_spinner: ->
    @spinner = $("<img/>")
    imgURL = chrome.extension.getURL("loader.gif")
    @spinner.attr("src",imgURL)
    @fake_button.before(@spinner)

class LikeIFrame
  constructor: (iframe) ->
    @button = $(iframe)
    @fake = new FakeLike(@button, => @turn_on())
  reload_iframe: () ->
    # replace the old iframe with a clone
    @button = @button.clone()
    # store the secret on the iframe object so it actually loads
    @button[0][SECRET] = this
    @button.hide()
  turn_on: () ->
    this.reload_iframe()
    @fake.loading(@button)
    @button.load () =>
      @button.show()
      @fake.loaded()

class FBLikeTag
  constructor: (tag) ->
    @tag = $(tag)
    @fake = new FakeLike(@tag, => @turn_on())
  turn_on: ->
    setTimeout \
      () => @display(),
      2000
  display: ->
    @fake.loaded $("<div>Great Success</div>")

class XFBML
  constructor: (script) ->
    @script = script
    $(document).ready () =>
      this.prevent_loading()
  prevent_loading: () ->
    this.replace_likes()
  replace_likes: () ->
    likes = $("fb\\:like")
    console.log likes
    for tag in likes
      new FBLikeTag(tag)

like_button_beforeload = (event) ->
  iframe = event.target
  # second time we attempt to load this iframe. let proceed
  if iframe[SECRET]
    return true
  else
    new LikeIFrame(iframe)
    event.preventDefault()
    return false

sdk_beforeload = (event) ->
  script = event.target
  new XFBML(script)
  event.preventDefault()
  return false

facebook_off = (event) ->
  if md = event.url.match(DOMAIN_RE)
    type = event.target.constructor
    if type == HTMLIFrameElement
      # replace if it's the like button iframe
      # TODO detect URL for like.php
      console.log("block iframe:", event.url)
      like_button_beforeload(event)
    else if type == HTMLScriptElement
      console.log("block script:", event.url)
      sdk_beforeload(event)
    else
      console.log("block:", event.url)
      # block everything else from facebook
      event.preventDefault()
  else
    # event.preventDefault()
    console.log("load: "+event.url)

document.addEventListener "beforeload", facebook_off, true
