DOMAIN_RE = /^https?:\/\/(www\.)?(facebook.com|facebook.net|fbcdn.net)/i

SECRET = "" + Math.random()

class LikeButtonShadow
  constructor: (iframe) ->
    iframe.shadow = this
    @iframe = $(iframe)
    this.turn_off()
  turn_off: () ->
    @iframe.replaceWith(this.create_custom_button())
  create_custom_button: () ->
    @custom_button = $("<span class='facebookOff-like'>no like</span>")
    @custom_button.bind "click", () =>
      this.turn_on()
    return @custom_button
  reload_iframe: () ->
    # replace the old iframe with a clone
    @iframe = @iframe.clone()
    # store the secret on the iframe object so it actually loads
    @iframe[0][SECRET] = this
  turn_on: () ->
    this.reload_iframe()
    @custom_button.replaceWith @iframe

like_button_beforeload = (event) ->
  iframe = event.target
  # second time we attempt to load this iframe. let proceed
  if shadow = iframe[SECRET]
    shadow.turn_on()
    return true
  else
    new LikeButtonShadow(iframe)
    event.preventDefault()
    return false

facebook_off = (event) ->
  if md = event.url.match(DOMAIN_RE)
    if event.target.constructor == HTMLIFrameElement
      # replace if it's the like button iframe
      # TODO detect URL for like.php
      console.log("like:", event.url)
      like_button_beforeload(event)
    else
      # block everything else
      event.preventDefault()

document.addEventListener "beforeload", facebook_off, true
