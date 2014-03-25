var container, container_img, container_close, container_caption, container_album_index, caption_height, x, y, currentElement, fadeContainer, fade_duration, adjustImageSize, appendImage, getUrlPath, offset, onMouseMove, onMouseWheel, onMouseOver, onKeyDown, showLoadingCursor, adjustmentInterval, adjustImageMonitor, containerActive, hideContainer, setupElements, setUpImage, tryMatch, siteFunctions, isVideo, imageFound, imageHeight, imageWidth, settings, ignoreHover, link, hoveredElement, metaHeld, shiftHeld, freezeImage, closeContainer, dragImage, dragX, dragY, metaHeld;
var isDisabled = false;
var isGoogleUrl = true;
var log = console.log.bind(console);


adjustmentInterval = 100;

getImagePosX = function () {
  if (container.offsetWidth - 2 * offset >= window.innerWidth) {
    if (x > window.innerWidth / 2) {
      return document.body.scrollLeft + offset + "px";
    } else {
      return document.body.scrollLeft + window.innerWidth - 2 * offset - container.offsetWidth + "px";
    }
  } else {
    if (x > window.innerWidth / 2) {
      if (container.offsetWidth > x - 2 * offset) {
        return document.body.scrollLeft + offset + "px";
      } else {
        return document.body.scrollLeft + x - container.offsetWidth - offset + "px";
      }
    } else {
      if (container.offsetWidth > window.innerWidth - x - 3 * offset) {
        return document.body.scrollLeft + window.innerWidth - container.offsetWidth - 2 * offset + "px";
      } else {
        return document.body.scrollLeft + x + offset + "px";
      }
    }
  }
};

getImagePosY = function () {
  if (container.offsetHeight - 2 * offset >= window.innerHeight) {
    if (y > window.innerHeight / 2) {
      return document.body.scrollTop + window.innerHeight - offset - container.offsetHeight + "px";
    } else {
      return document.body.scrollTop + offset + "px";
    }
  } else {
    if (y > window.innerHeight / 2) {
      if (container.offsetHeight / 2 > window.innerHeight - y - 2 * offset) {
        if (container.offsetHeight + window.innerHeight - y + 2 * offset > window.innerHeight) {
          return document.body.scrollTop + offset + "px";
        } else {
          return document.body.scrollTop + y - container.offsetHeight - offset + "px";
        }
      } else {
        return document.body.scrollTop + y - offset - container.offsetHeight / 2 + "px";
      }
    } else {
      if (container.offsetHeight / 2 > y - 2 * offset) {
        if (container.offsetHeight + y + 2 * offset > window.innerHeight) {
          return document.body.scrollTop + window.innerHeight - container.offsetHeight - offset + "px";
        } else {
          return document.body.scrollTop + y + offset + "px";
        }
      } else {
        return document.body.scrollTop + y - offset - container.offsetHeight / 2 + "px";
      }
    }
  }
};

adjustImageSize = function () {
  if (imageWidth > window.innerWidth - 2 * offset || imageHeight > window.innerHeight - 2 * offset) {
    if (imageWidth / window.innerWidth > imageHeight / window.innerHeight) {
      container.style.width = window.innerWidth - 3 * offset + "px";
      container.style.height = (window.innerWidth - 2 * offset) / imageWidth * imageHeight + "px";
    } else {
      container.style.height = window.innerHeight - 2 * offset + "px";
      container.style.width = (window.innerHeight - 2 * offset) / imageHeight * imageWidth + "px";
    }
  } else {
    container.style.width = imageWidth + "px";
    container.style.height = imageHeight + "px";
  }
  if (!freezeImage) {
    container.style.left = getImagePosX();
    container.style.top = getImagePosY();
    if (link && !checkLinkHover()) {
      return fadeContainer.Out();
    }
  }

};

appendImage = function (imageUrl, disableTimeout) {
  var ce = currentElement;
  ce.style.cursor = "wait";
  container.style.display = "block";
  container.style.transition = "opacity " + settings.fadeVal + "s ease-out";
  document.addEventListener("mousewheel", onMouseWheel, false);
  if (imgurAlbum.isAlbum) {
    if (imgurAlbum.cached[imgurAlbum.id].captions[imgurAlbum.cached[imgurAlbum.id].index] !== "") {
      container_caption.style.display = "block";
    } else {
      container_caption.style.display = "none";
    }
    container_album_index.style.display = "block";
  } else {
    container_caption.style.display = "none";
    container_album_index.style.display = "none";
  }
  var img = new Image();
  img.onload = function () {
    if (!imgurAlbum.isAlbum && !freezeImage && !checkLinkHover()) {
      imageFound = false;
      return fadeContainer.Out();
    }
    ce.style.cursor = "";
    container_img.src = imageUrl;
    imageHeight = img.height;
    imageWidth = img.width;
    container.style.display = "block";
    container_img.style.display = "block";
    container_vid.style.display = "none";
    if (!freezeImage) {
      container.style.transition = "opacity" + settings.fadeVal + "s ease-out";
    } else {
      container.style.transition = "width 2s ease-out, height 2s ease-out, opacity " + settings.fadeVal + "s ease-out";
    }
    adjustImageSize();
    fadeContainer.In();
    if (!checkLinkHover()) return hideContainer();
    if (settings.addHistory === "true") {
      if (currentElement.nodeName === "IMG") {
        chrome.runtime.sendMessage({action: "addHistory", url: currentElement.parentNode.href});
      } else {
        chrome.runtime.sendMessage({action: "addHistory", url: currentElement.href});
      }
    }
    setTimeout(function () {
      container.style.transition = "left 0.2s ease-out, top 0.2s ease-out, opacity " + settings.fadeVal + "s ease-out";
    }, 25);
  }
  img.src = imageUrl;
};

adjustImageMonitor = function () {
  var interval = setInterval(function () {
    if (!fadeContainer.transition) {
      hideContainer();
    } else {
      if (!fadeContainer.fadingOut) {
        if (!freezeImage && !metaHeld) {
          adjustImageSize();
        }
      }
    }
    if (!containerActive) {
      clearInterval(interval);
    }
  }, 1000 / settings.updateIntervalVal);
};

hideContainer = function () {
  container.style.display = "none";
  container.style.opacity = "0";
  fadeContainer.transition = false;
  ignoreHover = false;
  fadeContainer.fadingOut = false;
  container_img.style.display = "none";
  container_vid.style.display = "none";
};

transitionEnd = function(e) {
  if (fadeContainer.fadingOut) {
    fadeContainer.fadingOut = false;
    fadeContainer.transition = false;
    hideContainer();
  }
};

disableContainer = function() {
  document.removeEventListener("mousedown", onMouseDown, false);
  document.removeEventListener("mouseup", onMouseUp, false);
  document.removeEventListener("mousewheel", onMouseWheel, false);
  container.removeEventListener("webkitTransitionEnd", transitionEnd, false);
};

checkLinkHover = function() {
  if ((x < link.left || x > link.left + link.width || y < link.top || y > link.top + link.height) && !fadeContainer.fadingOut) {
    return false;
  }
  return true;
};

fadeContainer = {

  In: function () {
    fadeContainer.fadingOut = false;
    containerActive = true;
    adjustImageMonitor();
    fadeContainer.transition = true;
    container.style.opacity = "1";
  },

  Out: function () {
    containerActive = false;
    isVideo = false;
    imgurAlbum.isAlbum = false;
    container_close.style.opacity = "0";
    disableContainer();
    fadeContainer.fadingOut = true;
    container.style.opacity = "0";
  }

};

appendVideo = function (video_url, elem, poster) {
  if (container.style.display !== "block") {
    container_img.src = "";
    container_vid_src.src = "";
  }
  container.style.transition = "opacity " + settings.fadeVal + "s ease-out";
  container_vid.removeAttribute("controls");
  container_img.style.display = "none";
  elem.style.cursor = "wait";
  container.poster = poster;
  container_vid_src.src = video_url;
  container_vid.onloadedmetadata = function () {
    container.style.display = "block";
    container_vid.style.display = "block";
    imageHeight = container_vid.videoHeight;
    imageWidth = container_vid.videoWidth;
    adjustImageSize();
    elem.style.cursor = "";
    if (!freezeImage) {
      container.style.transition = "opacity" + settings.fadeVal + "s ease-out";
    } else {
      container.style.transition = "width 2s ease-out, height 2s ease-out, opacity " + settings.fadeVal + "s ease-out";
    }
    isVideo = true;
  }
  fadeContainer.In();
  setTimeout(function () {
    container.style.transition = "left 0.2s ease-out, top 0.2s ease-out, opacity " + settings.fadeVal + "s ease-out";
  }, 25);
  container_vid.load();
  if (elem.href) {
    chrome.runtime.sendMessage({ url: elem.href });
  } else if (elem.parentNode.href) {
    chrome.runtime.sendMessage({ url: elem.parentNode.href });
  }
};

setUpImage = function (m, elem) {
  currentElement = elem;
  appendImage(m);
};

setUpVideo = function (m, elem, poster) {
  currentElement = elem;
  appendVideo(m, elem, poster);
};

tryMatch = function (func, elem) {
  func(elem, function (src, poster) {
    if (src) {
      imageFound = true;
      container.addEventListener("webkitTransitionEnd", transitionEnd, false);
      document.addEventListener("mousedown", onMouseDown, false);
      document.addEventListener("mouseup", onMouseUp, false);
      link = elem.getBoundingClientRect();
      Sites.foundMatch = true;
      if (!poster) {
        setUpImage(src, elem);
      } else {
        isVideo = true;
        setUpVideo(src, elem, poster);
      }
    }
  });
};

getUrlPath = function (elem) {
  if (basicMatch(document.URL))
    return;
  Sites.foundMatch = false;
  for (var i = 0; i < siteFunctions.length; i++) {
    if (Sites.foundMatch) {
      break;
    }
    tryMatch(siteFunctions[i], elem);
  }
};

onKeyDown = function (e) {
  if (e.which === 90) {
      isDisabled = !isDisabled;
      if (isDisabled) {
        document.removeEventListener("mouseover", onMouseOver, false);
        document.removeEventListener("mousemove", onMouseMove, false);
        if (containerActive) {
          closeContainer();
          fadeContainer.Out();
        }
      } else {
        document.addEventListener("mouseover", onMouseOver, false);
        document.addEventListener("mousemove", onMouseMove, false);
      }
  } else if (containerActive) {
    switch (e.which) {
      case 39:
        if (imgurAlbum.isAlbum)
          imgurAlbum.getImage(true);
        break;
      case 37:
        if (imgurAlbum.isAlbum)
          imgurAlbum.getImage(false);
        break;
      case 67:
        if (imgurAlbum.isAlbum)
          container_caption.style.display = (container_caption.style.display === "block") ? "none" : "block";
        break;
      case 91:
        metaHeld = true;
        container.style.pointerEvents = "auto";
        break;
      case 32:
        if (isVideo) {
          e.preventDefault();
          if (container_vid.paused)
            container_vid.play();
          else
            container_vid.pause();
        }
        break;
      case 65:
        if (containerActive && container_img.src) {
          chrome.runtime.sendMessage({action: "openLink", url: container_img.src});
        }
        break;
      default:
        if (!e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey) {
          closeContainer();
        }
        break;
    }
  }
};

onKeyUp = function (e) {
  if (e.which === 90) {
    metaHeld = false;
    if (!freezeImage) {
      fadeContainer.Out();
    }
  }
};

closeContainer = function () {
  freezeImage = false;
  dragImage = false;
  metaHeld = false;
  container.style.pointerEvents = "none";
  fadeContainer.Out();
};

onMouseUp = function (e) {
  dragImage = false;
  if (e.target === container_close) {
    closeContainer();
  }
};
var redetectImage = false;
onMouseMove = function (e) {
  x = e.x; y = e.y;
  if (wheelC.x === x && wheelC.y === y) {
    return false;
  } else if (redetectImage) {
    redetectImage = false;
    return detectImage(e.target);
  }
  if (imageFound) {
    if (dragImage) {
      e.preventDefault();
      container.style.left = document.body.scrollLeft + e.x - dragX + "px";
      container.style.top = document.body.scrollTop + e.y - dragY + "px";
    }
    if (link) {
      if (!freezeImage && !metaHeld) {
        if ((x < link.left || x > link.left + link.width || y < link.top || y > link.top + link.height) && !fadeContainer.fadingOut) {
          imageFound = false;
          fadeContainer.Out();
        }
      }
    }
  }
};

function detectImage(elem) {
  if (!freezeImage && !metaHeld || elem.nodeName === "DIV" || elem.nodeName === "A" || elem.nodeName === "IMG") {
    setTimeout(function() {
      if (hoveredElement === elem) {
        getUrlPath(elem);
      }
    }, parseFloat(settings.hoverVal) * 1000);
    hoveredElement = elem;
  }
}

var wheelC = {
  x: 0,
  y: 0
};
onMouseWheel = function (e) {
  wheelC.x = x; wheelC.y = y;
  if (imgurAlbum.isAlbum && (settings.scrollAlbum || freezeImage)) {
    if (!freezeImage || (/hvzoom/.test(e.target.id) && freezeImage)) {
      e.preventDefault();
      if (e.wheelDeltaY < 0) {
        imgurAlbum.getImage(true);
      } else {
        imgurAlbum.getImage(false);
      }
    }
  } else if (!freezeImage) {
    fadeContainer.Out();
  }
};

onMouseDown = function (e) {
  if (dragImage) {
    dragImage = false;
  }
  if (e.target === container_img || e.target === container_vid) {
    if (isVideo) {
      container_vid.setAttribute("controls", "controls");
    }
    if (freezeImage) {
      if ((isVideo && e.pageY < container.offsetHeight + container.offsetTop - 40) || !isVideo) {
        container.style.transition = "opacity " + settings.fadeVal + "s ease-out";
        dragImage = true;
      }
      dragX = document.body.scrollLeft + e.x - container.offsetLeft;
      dragY = document.body.scrollTop + e.y - container.offsetTop;
    } else if (metaHeld) {
      container_close.style.opacity = "1";
      freezeImage = true;
      metaHeld = false;
    }
  }
};

onMouseOver = function (e) {
  if (wheelC.x === x && wheelC.y === y) {
    redetectImage = true;
  } else {
    if (!freezeImage && !metaHeld || e.nodeName === "DIV" || e.nodeName === "A" || e.nodeName === "IMG") {
      detectImage(e.target);
    }
    ignoreHover = /hvzoom/.test(e.target.id);
  }
};

setupElements = function () {
  container = document.createElement("div");
  container.id = "hvzoom_img_container_main";
  document.children[0].appendChild(container);
  container_img = document.createElement("img");
  container_img.id = "hvzoom_img_container_image";
  container.appendChild(container_img);
  container_close = document.createElement("div");
  container_close.id = "hvzoom_img_close_icon";
  container_close.innerText = "Close";
  container.appendChild(container_close);
  container_caption = document.createElement("div");
  container_caption.id = "hvzoom_img_container_caption";
  container.appendChild(container_caption);
  container_album_index = document.createElement("div");
  container_album_index.id = "hvzoom_img_album_index";
  container.appendChild(container_album_index);
  container_vid = document.createElement("video");
  container_vid.autoplay = true;
  container_vid.loop = true;
  container_vid.muted = "muted";
  container_vid.id = "hvzoom_img_container_video";
  container_vid_src = document.createElement("source");
  container_vid_src.id = "hvzoom_vid_src";
  container_vid_src.type = "video/webm";
  container.appendChild(container_vid);
  container_vid.appendChild(container_vid_src);
}

document.addEventListener("DOMContentLoaded", function() {
  setupElements();
  chrome.runtime.sendMessage({getSettings: true}, function (s) {
    settings = s;
    var blacklists = s.blacklists.trim();
    if (/\n/.test(blacklists)) {
      blacklists = blacklists.split("\n");
    } else {
      blacklists = [blacklists];
    }
    var docURL = stripUrl(document.URL);
    for (var i = 0, l = blacklists.length; i < l; i++) {
      if (stripUrl(blacklists[i]) === docURL) {
        return false;
      }
    }
    var cssStyle = document.createElement("style");
    cssStyle.innerText = settings.cssVal;
    offset = parseInt(settings.offsetVal);
    siteFunctions = [Sites.flickr, Sites.webm, Sites.imgur, Sites.gfycat, Sites.livememe, Sites.twitter, Sites.facebook, Sites.googleUserContent, Sites.google, Sites.wikimedia, Sites.xkcd, Sites.github, Sites.gravatar, Sites.normal, Sites.deviantart];
    document.getElementsByTagName("head")[0].appendChild(cssStyle);
    document.addEventListener("mousemove", onMouseMove, false);
    document.addEventListener("mouseover", onMouseOver, false);
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
  });
});
