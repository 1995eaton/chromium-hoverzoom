var imageZoom = {};
var onKey, key, mouse, transitionEnd, onMouse, listeners;
var log = console.log.bind(console);

function initSites() {
  imageZoom.sites = [
    Sites.flickr,
    Sites.imgur,
    Sites.gfycat,
    Sites.video,
    Sites.livememe,
    Sites.twitter,
    Sites.facebook,
    Sites.googleUserContent,
    Sites.wikimedia,
    Sites.xkcd,
    Sites.github,
    Sites.gravatar,
    Sites.normal,
    Sites.deviantart
  ];
}

imageZoom.init = function() {

  this.main = document.createElement("div");
  this.main.id = "hvzoom_img_container_main";

  this.image = document.createElement("img");
  this.image.id = "hvzoom_img_container_image";
  this.main.appendChild(this.image);

  this.close = document.createElement("div");
  this.close.id = "hvzoom_img_close_icon";
  this.close.innerText = "Close";
  this.main.appendChild(this.close);

  this.caption = document.createElement("div");
  this.caption.id = "hvzoom_img_container_caption";
  this.main.appendChild(this.caption);

  this.albumIndex = document.createElement("div");
  this.albumIndex.id = "hvzoom_img_album_index";
  this.main.appendChild(this.albumIndex);

  this.video = document.createElement("video");
  this.video.id = "hvzoom_img_container_video";
  this.video.autoplay = true;
  this.video.loop = true;

  this.videoSource = document.createElement("source");
  this.videoSource.id = "hvzoom_vid_src";
  this.videoSource.type = "video/webm";
  this.video.appendChild(this.videoSource);

  this.main.appendChild(this.video);

  document.children[0].appendChild(this.main);

};

imageZoom.getImagePosX = function() {
  if (this.main.offsetWidth - 2 * this.settings.offsetVal >= window.innerWidth) {
    if (mouse.x > window.innerWidth / 2)
      return document.body.scrollLeft + this.settings.offsetVal + "px";
    return document.body.scrollLeft + window.innerWidth - 2 * this.settings.offsetVal - this.main.offsetWidth + "px";
  }
  if (mouse.x > window.innerWidth / 2) {
    if (this.main.offsetWidth > mouse.x - 2 * this.settings.offsetVal)
      return document.body.scrollLeft + this.settings.offsetVal + "px";
    return document.body.scrollLeft + mouse.x - this.main.offsetWidth - this.settings.offsetVal + "px";
  }
  if (this.main.offsetWidth > window.innerWidth - mouse.x - 3 * this.settings.offsetVal)
    return document.body.scrollLeft + window.innerWidth - this.main.offsetWidth - 2 * this.settings.offsetVal + "px";
  return document.body.scrollLeft + mouse.x + this.settings.offsetVal + "px";
};

imageZoom.getImagePosY = function() {
  if (this.main.offsetHeight - 2 * this.settings.offsetVal >= window.innerHeight) {
    if (mouse.y > window.innerHeight / 2)
      return document.body.scrollTop + window.innerHeight - this.settings.offsetVal - this.main.offsetHeight + "px";
    return document.body.scrollTop + this.settings.offsetVal + "px";
  }
  if (mouse.y > window.innerHeight / 2) {
    if (this.main.offsetHeight / 2 > window.innerHeight - mouse.y - 2 * this.settings.offsetVal) {
      if (this.main.offsetHeight + window.innerHeight - mouse.y + 2 * this.settings.offsetVal > window.innerHeight)
        return document.body.scrollTop + this.settings.offsetVal + "px";
      return document.body.scrollTop + mouse.y - this.main.offsetHeight - this.settings.offsetVal + "px";
    }
    return document.body.scrollTop + mouse.y - this.settings.offsetVal - this.main.offsetHeight / 2 + "px";
  }
  if (this.main.offsetHeight / 2 > mouse.y - 2 * this.settings.offsetVal) {
    if (this.main.offsetHeight + mouse.y + 2 * this.settings.offsetVal > window.innerHeight)
      return document.body.scrollTop + window.innerHeight - this.main.offsetHeight - this.settings.offsetVal + "px";
    return document.body.scrollTop + mouse.y + this.settings.offsetVal + "px";
  }
  return document.body.scrollTop + mouse.y - this.settings.offsetVal - this.main.offsetHeight / 2 + "px";
};

imageZoom.adjustImage = function() {
  if (this.width > window.innerWidth - 2 * this.settings.offsetVal || this.height > window.innerHeight - 2 * this.settings.offsetVal) {
    if (this.width / window.innerWidth > this.height / window.innerHeight) {
      this.main.style.width = window.innerWidth - 3 * this.settings.offsetVal + "px";
      this.main.style.height = (window.innerWidth - 2 * this.settings.offsetVal) / this.width * this.height + "px";
    } else {
      this.main.style.height = window.innerHeight - 2 * this.settings.offsetVal + "px";
      this.main.style.width = (window.innerHeight - 2 * this.settings.offsetVal) / this.height * this.width + "px";
    }
  } else {
    this.main.style.width = this.width + "px";
    this.main.style.height = this.height + "px";
  }
  if (!this.frozen) {
    this.main.style.left = this.getImagePosX();
    this.main.style.top = this.getImagePosY();
  }

};

imageZoom.startMonitor = function() {
  var loop = setInterval(function() {
    if (!this.transition.active) {
      this.transition.out();
    } else if (!this.transition.fadingOut && !this.frozen && !key.meta) {
      this.adjustImage();
    }
    if (!this.active) {
      clearInterval(loop);
    }
  }.bind(this), 1000 / parseInt(this.settings.updateIntervalVal));
};

imageZoom.checkHoveredLink = function() {
  return !((mouse.x < this.linkRect.left || mouse.x > this.linkRect.left + this.linkRect.width ||
            mouse.y < this.linkRect.top  || mouse.y > this.linkRect.top  + this.linkRect.height) &&
            !this.transition.fadingOut);
};

imageZoom.transition = {
  in: function() {
    this.fadingOut = false;
    imageZoom.active = true;
    imageZoom.startMonitor();
    this.active = true;
    imageZoom.main.style.opacity = "1";
  },
  out: function() {
    imageZoom.active = false;
    if (imageZoom.isVideo) {
      imageZoom.video.pause();
    }
    imageZoom.isVideo = false;
    this.active = false;
    imgurAlbum.isAlbum = false;
    imageZoom.close.style.opacity = "0";
    this.fadingOut = true;
    imageZoom.main.style.opacity = "0";
  },
  hide: function() {
    imageZoom.main.style.display = "none";
    onMouse.ignore = false;
    this.active = false;
    Sites.foundMatch = false;
    imageZoom.active = false;
    imageZoom.image.style.display = "none";
    imageZoom.video.style.display = "none";
  }
};

imageZoom.appendVideo = function(src, elem, poster) {
  if (this.main.style.display !== "block") {
    this.image.src = "";
    this.videoSource.src = "";
  }
  var currentElTemp = this.activeEl;
  this.main.style.transition = "opacity " + this.settings.fadeVal + "s ease-out";
  this.video.removeAttribute("controls");
  this.image.style.display = "none";
  currentElTemp.style.cursor = "wait";
  if (poster) {
    this.video.poster = poster;
  }
  this.videoSource.src = src;
  this.video.onloadedmetadata = function() {
    this.main.style.display = "block";
    this.video.style.display = "block";
    this.height = this.video.videoHeight;
    this.width  = this.video.videoWidth;
    this.adjustImage();
    if (!this.frozen) {
      this.main.style.transition = "opacity " + this.settings.fadeVal + "s ease-out";
    } else {
      this.main.style.transition = "width 2s ease-out, height 2s ease-out, opacity " + this.settings.fadeVal + "s ease-out";
    }
    this.isVideo = true;
    this.transition.in();
    setTimeout(function() {
      currentElTemp.style.cursor = "";
      this.main.style.transition = "left 0.2s ease-out, top 0.2s ease-out, opacity " + this.settings.fadeVal + "s ease-out";
    }.bind(this), 25);
  }.bind(this);
  this.video.load();
  chrome.runtime.sendMessage({url: elem.href || elem.parentNode.href});
};

imageZoom.appendImage = function(src) {
  if (!this.frozen && !this.checkHoveredLink()) {
    return this.transition.hide();
  }
  var currentElTemp = this.activeEl;
  currentElTemp.style.cursor = "wait";
  this.main.style.display = "block";
  this.main.style.transition = "opacity " + this.settings.fadeVal + "s ease-out";
  if (imgurAlbum.isAlbum) {
    if (imgurAlbum.cached[imgurAlbum.id].captions[imgurAlbum.cached[imgurAlbum.id].index] !== "") {
      this.caption.style.display = "block";
    } else {
      this.caption.style.display = "none";
    }
    this.albumIndex.style.display = "block";
  } else {
    this.caption.style.display = "none";
    this.albumIndex.style.display = "none";
  }
  var img = new Image();
  img.onload = function() {
    if (!this.frozen && !this.checkHoveredLink()) {
      return this.transition.hide();
    }
    currentElTemp.style.cursor = "";
    this.image.src = src;
    this.height = img.height;
    this.width = img.width;
    this.main.style.display = "block";
    this.image.style.display = "block";
    this.video.style.display = "none";
    if (!this.frozen) {
      this.main.style.transition = "opacity" + this.settings.fadeVal + "s ease-out";
    } else {
      this.main.style.transition = "width 2s ease-out, height 2s ease-out, opacity " + this.settings.fadeVal + "s ease-out";
    }
    this.adjustImage();
    this.transition.in();
    setTimeout(function() {
      this.main.style.transition = "left 0.2s ease-out, top 0.2s ease-out, opacity " + this.settings.fadeVal + "s ease-out";
    }.bind(this), 25);
  }.bind(this);
  img.src = src;
};

imageZoom.tryMatch = function(f, elem) {
  urlArray = [];
  f(elem, function(src, poster) {
    if (!src) return false;
    Sites.foundMatch = true;
    this.linkRect = elem.getBoundingClientRect();
    this.activeEl = elem;
    if (!imageZoom.isVideo) {
      return this.appendImage(src);
    }
    return this.appendVideo(src, elem, poster);
  }.bind(this));
};

imageZoom.testUrl = function(elem) {
  if (basicMatch(document.URL)) {
    return false;
  }
  Sites.foundMatch = false;
  for (var i = 0, l = this.sites.length; i < l; i++) {
    if (Sites.foundMatch) {
      break;
    }
    this.tryMatch(this.sites[i], elem);
  }
};

imageZoom.detectImage = function(elem) {
  if (!this.frozen && !key.meta || /DIV|A|IMG/.test(elem.nodeName)) {
    setTimeout(function() {
      if (mouse.hoverEl === elem) {
        this.testUrl(elem);
      }
    }.bind(this), parseFloat(this.settings.hoverVal) * 1000);
    mouse.hoverEl = elem;
  }
};

imageZoom.closeContainer = function() {
  this.frozen = false;
  mouse.drag = false;
  key.meta = false;
  this.main.style.pointerEvents = "none";
  this.transition.out();
};

onKey = {
  down: function(e) {
    if (e.which === 90 && !e.modifiers() && !document.activeElement.isInput()) {
        imageZoom.disabled = !imageZoom.disabled;
        if (imageZoom.disabled) {
          listeners.disable(false, true);
          imageZoom.closeContainer();
        } else {
          listeners.enable(false, true);
        }
    } else if (imageZoom.active && !e.modifiers() && !document.activeElement.isInput()) {
      switch (e.which) {
        case 39: case 37:
          if (imgurAlbum.isAlbum) {
            imgurAlbum.getImage(e.which === 39);
          }
          break;
        case 67:
          if (imgurAlbum.isAlbum && imageZoom.caption.innerText.trim() !== "") {
            imageZoom.caption.style.display = (imageZoom.caption.style.display === "block") ? "none" : "block";
          }
          break;
        case 91:
          key.meta = true;
          imageZoom.main.style.pointerEvents = "auto";
          break;
        case 32:
          if (imageZoom.isVideo) {
            e.preventDefault();
            if (imageZoom.video.paused)
              imageZoom.video.play();
            else
              imageZoom.video.pause();
          }
          break;
        case 65:
          if (imageZoom.active && !imageZoom.isVideo && imageZoom.image.src) {
            chrome.runtime.sendMessage({action: "openLink", url: imageZoom.image.src});
            imageZoom.closeContainer();
          } else if (imageZoom.active && imageZoom.isVideo && imageZoom.videoSource.src) {
            chrome.runtime.sendMessage({action: "openLink", url: imageZoom.videoSource.src});
            imageZoom.closeContainer();
          }
          break;
        default:
          imageZoom.closeContainer();
          break;
      }
    }
  },
  up: function(e) {
    if (e.which === 91) {
      key.meta = false;
      if (!imageZoom.frozen) {
        imageZoom.transition.out();
      }
    }
  }
};

key = {
  meta: false
};

mouse = {
  x: null,
  y: null,
  dragX: null,
  dragY: null,
  wheelX: null,
  wheelY: null,
  hoverEl: null
};

transitionEnd = function(e) {
  if (!imageZoom.frozen && e.propertyName === "opacity") {
    if (imageZoom.transition.fadingOut) {
      imageZoom.transition.fadingOut = false;
      imageZoom.transition.active = false;
      imageZoom.transition.hide();
    } else if (imageZoom.active) {
      if (!imageZoom.checkHoveredLink()) {
        return imageZoom.transition.out();
      }
      if (imageZoom.settings.addHistory === "true") {
        if (imageZoom.activeEl.nodeName === "IMG") {
          chrome.runtime.sendMessage({action: "addHistory", url: imageZoom.activeEl.parentNode.href});
        } else {
          chrome.runtime.sendMessage({action: "addHistory", url: imageZoom.activeEl.href});
        }
      }
    }
  }
};

onMouse = {
  ignore: false,
  move: function(e) {
    mouse.x = e.x; mouse.y = e.y;
    if (mouse.wheelX === mouse.x && mouse.wheelY === mouse.y) {
      return false;
    }
    if (!imageZoom.frozen && imageZoom.redetectImage) {
      imageZoom.redetectImage = false;
      return imageZoom.detectImage(e.target);
    }
    if (imageZoom.active) {
      if (mouse.drag) {
        e.preventDefault();
        imageZoom.main.style.left = document.body.scrollLeft + mouse.x - mouse.dragX + "px";
        imageZoom.main.style.top  = document.body.scrollTop  + mouse.y - mouse.dragY + "px";
      }
      if (imageZoom.linkRect && !imageZoom.frozen && !key.meta) {
        if (!imageZoom.checkHoveredLink()) {
          Sites.foundMatch = false;
          imageZoom.transition.out();
        }
      }
    }
  },
  over: function(e) {
    if (mouse.wheelX === mouse.x && mouse.wheelY === mouse.y) {
      return imageZoom.redetectImage = true;
    }
    if (!imageZoom.frozen && !key.meta && /DIV|A|IMG/.test(e.target.nodeName)) {
      imageZoom.detectImage(e.target);
    }
    imageZoom.ignore = /hvzoom/.test(e.target.id);
  },
  wheel: function(e) {
    mouse.wheelX = mouse.x; mouse.wheelY = mouse.y;
    if (imgurAlbum.isAlbum && (imageZoom.settings.scrollAlbum === "true" || imageZoom.frozen)) {
      if (!imageZoom.frozen || (/hvzoom/.test(e.target.id) && imageZoom.frozen)) {
        e.preventDefault();
        if (e.wheelDeltaY < 0) {
          imgurAlbum.getImage(true);
        } else {
          imgurAlbum.getImage(false);
        }
      }
    } else if (!imageZoom.frozen) {
      imageZoom.transition.out();
    }
  },
  leave: function() {
    if (!imageZoom.frozen) {
      imageZoom.transition.out();
    }
  },
  down: function(e) {
    if (mouse.drag) {
      mouse.drag = false;
    }
    if (e.target === imageZoom.image || e.target === imageZoom.video) {
      if (imageZoom.isVideo) {
        imageZoom.video.setAttribute("controls", "controls");
      }
      if (imageZoom.frozen) {
        if ((imageZoom.isVideo && e.pageY < imageZoom.main.offsetHeight + imageZoom.main.offsetTop - 40) || !imageZoom.isVideo) {
          imageZoom.main.style.transition = "opacity " + imageZoom.settings.fadeVal + "s ease-out";
          mouse.drag = true;
        }
        mouse.dragX = document.body.scrollLeft + e.x - imageZoom.main.offsetLeft;
        mouse.dragY = document.body.scrollTop  + e.y - imageZoom.main.offsetTop;
      } else if (key.meta) {
        imageZoom.close.style.opacity = "1";
        imageZoom.frozen = true;
        key.meta = false;
      }
    }
  },
  up: function(e) {
    mouse.drag = false;
    if (e.target === imageZoom.close) {
      imageZoom.closeContainer();
    }
  }
};

listeners = {
  enable: function(keyOnly, mouseOnly) {
    if (keyOnly) {
      document.addEventListener("keydown", onKey.down, false);
      document.addEventListener("keyup", onKey.up, false);
    }
    if (mouseOnly) {
      document.addEventListener("mousemove", onMouse.move, false);
      document.addEventListener("mousedown", onMouse.down, false);
      document.addEventListener("mouseup", onMouse.up, false);
      document.addEventListener("mouseleave", onMouse.leave, false);
      document.addEventListener("mouseover", onMouse.over, false);
      document.addEventListener("mousewheel", onMouse.wheel, false);
    }
    imageZoom.main.addEventListener("transitionend", transitionEnd, false);
  },
  disable: function(keyOnly, mouseOnly) {
    if (keyOnly) {
      document.removeEventListener("keydown", onKey.down, false);
      document.removeEventListener("keyup", onKey.up, false);
    }
    if (mouseOnly) {
      document.removeEventListener("mousemove", onMouse.move, false);
      document.removeEventListener("mouseover", onMouse.over, false);
      document.removeEventListener("mouseleave", onMouse.leave, false);
      document.removeEventListener("mousedown", onMouse.down, false);
      document.removeEventListener("mouseup", onMouse.up, false);
      document.removeEventListener("mousewheel", onMouse.wheel, false);
    }
    imageZoom.main.removeEventListener("transitionend", transitionEnd, false);
  }
};

function parseSettings(callback) {
  chrome.runtime.sendMessage({getSettings: true}, function(s) {
    var blacklists = s.blacklists.trim();
    if (/\n/.test(blacklists)) {
      blacklists = blacklists.split("\n");
    } else {
      blacklists = [blacklists];
    }
    var docURL = stripUrl(document.URL);
    for (var i = 0, l = blacklists.length; i < l; i++) {
      if (stripUrl(blacklists[i]) === docURL) {
        callback(false);
      }
    }
    callback(s);
  });
}

function parseBlacklists(list) {
  list = list.trim();
  if (/\n/.test(list)) {
    list = list.split("\n");
  } else {
    list = [];
  }
  var domain = stripUrl(document.URL);
  for (var i = 0, l = list.length; i < l; i++) {
    if (stripUrl(list[i]) === domain) {
      return false;
    }
  }
  return true;
}

function addCustomStylesheet(css) {
  var style = document.createElement("style");
  style.innerText = css;
  if (document.getElementsByTagName("head").length === 0) {
    if (document.getElementsByTagName("body").length === 0) {
      return false;
    }
    document.body.appendChild(style);
  } else {
    document.getElementsByTagName("head")[0].appendChild(style);
  }
  return true;
}

function setup() {
  imageZoom.init();
  var b = parseBlacklists(imageZoom.settings.blacklists);
  if (!b) return false;
  var s = addCustomStylesheet(imageZoom.settings.cssVal);
  if (!s) return false;
  imageZoom.settings.offsetVal = parseInt(imageZoom.settings.offsetVal);
  initSites();
  listeners.enable(true, true);
}

parseSettings(function(s) {
  if (s && typeof s === "object") {
    imageZoom.settings = s;
    if (document.readyState === "complete" || document.readyState === "interactive") {
      return setup();
    }
    document.addEventListener("DOMContentLoaded", function() {
      setup();
    }, false);
  }
});
