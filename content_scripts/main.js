var container, container_img, container_caption, container_album_index, caption_height, x, y, currentElement, fadeContainer, fade_duration, adjustImageSize, appendImage, getUrlPath, offset, onMouseMove, onMouseWheel, onMouseOver, onKeyDown, showLoadingCursor, adjustmentInterval, adjustImageMonitor, containerActive, hideContainer, setupElements, setUpImage, tryMatch, siteFunctions, isVideo, imageFound, imageHeight, imageWidth, settings;
//var isGoogleUrl = true;
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

  container.style.left = getImagePosX();
  container.style.top = getImagePosY();

};

appendImage = function (imageUrl, disableTimeout) {
  var ce = currentElement;
  ce.style.cursor = "wait";
  container.style.display = "block";
  container.style.transition = "";
  container.style.top = document.body.scrollTop + offset + "px";
  //container.style.transition = "width 0.2s ease-out, height 0.2s ease-out, left 0.2s ease-out, top 0.2s ease-out, opacity " + settings.fadeVal + "s ease-out";
  container.style.transition = "left 0.2s ease-out, top 0.2s ease-out, opacity " + settings.fadeVal + "s ease-out";
  var img = new Image();
  img.onload = function () {
    ce.style.cursor = "";
    if (imgurAlbum.isAlbum) {
      if (container_caption.innerHTML != "") {
        container_caption.style.display = "block";
      } else {
        container_caption.style.display = "none";
      }
      container_album_index.style.display = "block";
    } else {
      container_caption.style.display = "none";
      container_album_index.style.display = "none";
    }
    container_img.src = imageUrl;
    adjustImageSize();
    imageHeight = img.height;
    imageWidth = img.width;
    container.style.display = "block";
    container_img.style.display = "block";
    container_vid.style.display = "none";
    fadeContainer.In();
    if (currentElement.nodeName === "IMG") {
      chrome.runtime.sendMessage({ url: currentElement.parentNode.href });
    } else {
      chrome.runtime.sendMessage({ url: currentElement.href });
    }
  }
  img.src = imageUrl;
};

adjustImageMonitor = function () {
  var interval = setInterval(function () {
    if (container.style.display === "none" || container.style.opacity === "0") {
      hideContainer();
    } else {
      adjustImageSize();
    }
  }, 1000 / settings.updateIntervalVal);
};

hideContainer = function () {
  container.style.display = "none";
  container_img.style.display = "none";
  container_vid.style.display = "none";
};

transitionEnd = function(e) {
  if (fadeContainer.fadingOut) {
    fadeContainer.transition = false;
    fadeContainer.fadingOut = false;
    hideContainer();
  }
};

fadeContainer = {

  In: function () {
    fadeContainer.fadingOut = false;
    containerActive = true;
    container.style.opacity = "1";
    adjustImageSize();
  },

  Out: function () {
    containerActive = false;
    isVideo = false;
    container_vid.pause();
    fadeContainer.fadingOut = true;
    fadeContainer.transition = true;
    container.style.opacity = "0";
  }

};

appendVideo = function (video_url, elem, poster) {
  if (container.style.display !== "block") {
    container_img.src = "";
    container_vid_src.src = "";
  }
  container_img.style.display = "none";
  elem.style.cursor = "wait";
  container.poster = poster;
  container_vid_src.src = video_url;
  container_vid.onloadedmetadata = function () {
    imageHeight = container_vid.videoHeight;
    imageWidth = container_vid.videoWidth;
    adjustImageSize();
    elem.style.cursor = "";
    container.style.display = "block";
    container_vid.style.display = "block";
    isVideo = true;
    fadeContainer.In();
  }
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

var linkLeft, linkTop, linkWidth, linkHeight;
tryMatch = function (func, elem) {
  if (typeof(func) === "function") {
    func(elem, function (src, poster) {
      if (src) {
        imageFound = true;
        var elemRect = elem.getBoundingClientRect();
        linkLeft = elemRect.left;
        linkTop = elemRect.top;
        linkWidth = elemRect.width;
        linkHeight = elemRect.height;
        Sites.foundMatch = true;
        if (!poster) {
          setUpImage(src, elem);
        } else {
          isVideo = true;
          setUpVideo(src, elem, poster);
        }
      }
    });
  }
};

getUrlPath = function (elem) {
  Sites.foundMatch = false;
  for (var i = 0; i < siteFunctions.length; i++) {
    if (Sites.foundMatch) {
      break;
    }
    tryMatch(siteFunctions[i], elem);
  }
};


onKeyDown = function (e) {
  if (imgurAlbum.images.length > 1) {
    if (e.which === 39) {
      imgurAlbum.index = (imgurAlbum.index + 1 < imgurAlbum.images.length) ? imgurAlbum.index + 1 : 0;
    } else if (e.which === 37) {
      imgurAlbum.index = (imgurAlbum.index - 1 < 0) ? imgurAlbum.images.length - 1 : imgurAlbum.index - 1;
    }
    if (e.which === 37 || e.which === 39) {
      container_album_index.innerText = imgurAlbum.index + 1 + "/" + imgurAlbum.images.length;
      var img = new Image();
      currentElement.style.cursor = "wait";
      img.onload = function () {
        currentElement.style.cursor = "";
        if (imgurAlbum.isAlbum) {
          container_caption.innerText = imgurAlbum.captions[imgurAlbum.index].innerHTML;
          container_caption.style.display = "block";
        } else {
          container_caption.innerHTML = "";
          container_caption.style.display = "none";
        }
        appendImage(img.src, true);
      }
      img.src = imgurAlbum.images[imgurAlbum.index].innerHTML;
    }
  }
};

onMouseMove = function (e) {
  x = e.x;
  y = e.y;
  if (/hvzoom/.test(e.target.id) || currentElement != e.target) {
    if (x < linkLeft || x > linkLeft + linkWidth || y < linkTop || y > linkTop + linkHeight) {
      if (!fadeContainer.fadingOut) {
        imageFound = false;
        fadeContainer.Out();
      }
    }
  }
  currentElement = e.target;
};

onMouseWheel = function (e) {
  fadeContainer.Out();
};

var ce;
onMouseOver = function (e) {
  if ((/(DIV|^I$|IMG|A)/.test(e.target.nodeName) || (e.target.firstChild && /(^I$|IMG|A)/.test(e.target.firstChild.nodeName)))) {
    ce = e.target;
    setTimeout(function () {
      if (ce === e.target) {
          getUrlPath(e.target);
      }
    }, parseFloat(settings.hoverVal) * 1000);
  }
};

setupElements = function () {

  container = document.createElement("div");
  container.id = "hvzoom_img_container_main";
  document.body.appendChild(container);

  container_img = document.createElement("img");
  container_img.id = "hvzoom_img_container_image";
  container.appendChild(container_img);

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

window.onload = function () {
  setupElements();
  document.addEventListener("keydown", onKeyDown, false);
  document.addEventListener("mousewheel", onMouseWheel, false);
  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("mouseover", onMouseOver, false);
  container.addEventListener("webkitTransitionEnd", transitionEnd, false);
  chrome.runtime.sendMessage({getSettings: true}, function (s) {
    settings = s;
    offset = parseInt(settings.offsetVal);
    adjustImageMonitor();
    siteFunctions = [
      Sites.imgur,
      Sites.gfycat,
      Sites.livememe,
      Sites.twitter,
      Sites.facebook,
      Sites.googleUserContent,
      Sites.google,
      Sites.wikimedia,
      Sites.xkcd,
      Sites.github,
      Sites.gravatar,
      Sites.normal,
      Sites.deviantart
    ];
  });
};
