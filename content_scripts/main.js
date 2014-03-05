var container, container_img, container_caption, container_album_index, hover_timeout, caption_height, x, y, timeout_length, currentElement, fadeContainer, fade_duration, adjustImageSize, appendImage, getUrlPath, offset, onMouseMove, onMouseWheel, onMouseOver, onKeyDown, showLoadingCursor, adjustmentInterval, adjustImageMonitor, containerActive, hideContainer, setupElements, setUpImage, tryMatch, siteFunctions, isVideo, adjustVideoSize;
//var isGoogleUrl = true;
var log = console.log.bind(console);


timeout_length = 75;
fade_duration = 5;
offset = 15;
adjustmentInterval = 5;

adjustImageSize = function () {

  caption_height = container_caption.offsetHeight;
  if (container.style.display === "none" || fadeContainer.fadingOut) {
    return;
  }

  if (x < window.innerWidth / 2) {
    if (container_img.offsetWidth < window.innerWidth) {
      container.style.left = offset + x +  "px";
      container.style.maxWidth = window.innerWidth - x - 3 * offset + "px";
      container_img.style.maxWidth = window.innerWidth - x - 3 * offset - 4 + "px";
    } else {
      container.style.left = offset + "px";
      container.style.maxWidth = window.innerWidth - 3 * offset + "px";
      container_img.style.maxWidth = window.innerWidth - 3 * offset - 4 + "px";
    }
  } else {
    if (container_img.offsetWidth < window.innerWidth) {
      container.style.left = x - offset - container_img.offsetWidth +  "px";
      container.style.maxWidth = x - 3 * offset + "px";
      container_img.style.maxWidth = x - 3 * offset - 4 + "px";
    } else {
      container.style.left = offset + "px";
      container.style.maxWidth = window.innerWidth - 3 * offset + "px";
      container_img.style.maxWidth = window.innerWidth - 3 * offset - 4 + "px";
    }
  }

  if (y - container.offsetHeight < offset * 2) {
    if (y > window.innerHeight / 2) {
      container.style.top = document.body.scrollTop + offset + "px";
    } else {
      if (y + 2 * offset + container.offsetHeight > window.innerHeight) {
        container.style.top = document.body.scrollTop + y - (container.offsetHeight - (window.innerHeight - y)) - offset + "px";
      } else {
        container.style.top = document.body.scrollTop + offset + y + "px";
      }
    }
  } else if (y + container.offsetHeight > window.innerHeight / 2 - 2 * offset) {
    container.style.top = document.body.scrollTop + y - container.offsetHeight - offset + "px";
  } else {
    container.style.top = document.body.scrollTop + y + offset + "px";
  }
  if (container_img.offsetWidth > container_img.offsetHeight) {
    if (y < window.innerHeight / 2) {
      container.style.height = container_img.offsetHeight + caption_height + 2 +  "px";
      container_img.style.maxHeight = window.innerHeight - y - caption_height - 2 * offset + "px";
    } else {
      container.style.height = container_img.offsetHeight + caption_height + 2 +  "px";
      container_img.style.maxHeight = y - caption_height - 2 * offset + "px";
    }
  }
  container_img.style.maxHeight = window.innerHeight - caption_height - 2 * offset - 4 + "px";
  if (container_img.offsetHeight > window.innerHeight - 2 * offset) {
    container.style.top = offset + "px";
  }
};

adjustVideoSize = function () {

  if (fadeContainer.fadingOut) {
    return;
  }

  if (x < window.innerWidth / 2) {
    if (container_vid.offsetWidth < window.innerWidth) {
      container.style.left = offset + x + "px";
      container.style.maxWidth = window.innerWidth - x - 3 * offset + "px";
      container_vid.style.maxWidth = window.innerWidth - x - 3 * offset - 4 + "px";
    } else {
      container.style.left = offset + "px";
      container.style.maxWidth = window.innerWidth - 3 * offset + "px";
      container_vid.style.maxWidth = window.innerWidth - 3 * offset - 4 + "px";
    }
  } else {
    if (container_vid.offsetWidth < window.innerWidth) {
      container.style.left = x - offset - container_vid.offsetWidth +  "px";
      container.style.maxWidth = x - 3 * offset + "px";
      container_vid.style.maxWidth = x - 3 * offset - 4 + "px";
    } else {
      container.style.left = offset + "px";
      container.style.maxWidth = window.innerWidth - 3 * offset + "px";
      container_vid.style.maxWidth = window.innerWidth - 3 * offset - 4 + "px";
    }
  }

  if (y - container.offsetHeight < offset * 2) {
    if (y > window.innerHeight / 2) {
      container.style.top = document.body.scrollTop + offset + "px";
    } else {
      if (y + 2 * offset + container.offsetHeight > window.innerHeight) {
        container.style.top = document.body.scrollTop + y - (container_vid.offsetHeight - (window.innerHeight - y)) - offset + "px";
      } else {
        container.style.top = document.body.scrollTop + offset + y + "px";
      }
    }
  } else if (y + container_vid.offsetHeight > window.innerHeight / 2 - 2 * offset) {
    container.style.top = document.body.scrollTop + y - container_vid.offsetHeight - 2 * offset + "px";
  } else {
    container.style.top = document.body.scrollTop + y + 2 * offset + "px";
  }
  if (container_vid.offsetWidth > container_vid.offsetHeight) {
    if (y < window.innerHeight / 2) {
      container.style.height = container_vid.offsetHeight + 2 +  "px";
      container_vid.style.maxHeight = window.innerHeight - y - 2 * offset + "px";
    } else {
      container.style.height = container_vid.offsetHeight + 2 + "px";
      container_vid.style.maxHeight = y - 2 * offset + "px";
    }
  }
  container_vid.style.maxHeight = window.innerHeight - 2 * offset - 4 + "px";
  container.style.height = container_vid.offsetHeight + offset + 2 +  "px";
  container.style.maxHeight = window.innerHeight - 20 - offset + "px";
  if (container_vid.offsetHeight > window.innerHeight - 2 * offset) {
    container.style.top = offset + "px";
  }
};

adjustImageMonitor = function () {
  var interval = setInterval(function () {
    if (isVideo) {
      adjustVideoSize();
    } else {
      if (container.style.opacity === 0 || container.style.display === "none") {
        container.style.display = "none";
      } else {
        adjustImageSize();
      }
    }
  }, adjustmentInterval);
};

hideContainer = function () {
  container.style.opacity = "0";
  container.style.display = "none";
  container_vid.style.display = "none";
  container_caption.style.display = "none";
  container_album_index.style.display = "none";
  container_caption.innerHTML = "";
  container_album_index.innerHTML = "";
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
    if (hover_timeout) {
      return;
    }
    fadeContainer.fadingOut = false;
    containerActive = true;
    container.style.opacity = "1";
    if (isVideo) {
      adjustVideoSize();
    } else {
      adjustImageSize();
    }
  },

  Out: function () {
    containerActive = false;
    isVideo = false;
    container_vid.pause();
    fadeContainer.fadingOut = true;
    fadeContainer.transition = true;
    hover_timeout = true;
    container.style.opacity = "0";
  }

};

appendImage = function (image_url, elem) {
  var t, timeout;
  t = 0;
  timeout = setInterval(function () {
    if (hover_timeout) {
      fadeContainer.Out();
      clearInterval(timeout);
    }
    t += 1;
    if (t >= timeout_length) {
      container.style.display = "block";
      elem.style.cursor = "wait";
      var img = new Image();
      img.onload = function () {
        elem.style.cursor = "";
        container_img.src = image_url;
        container.style.display = "block";
        fadeContainer.In();
        adjustImageSize();
        if (elem.nodeName === "IMG") {
          chrome.runtime.sendMessage({ url: elem.parentNode.href });
        } else {
          chrome.runtime.sendMessage({ url: elem.href });
        }
      }
      img.src = image_url;
      clearInterval(timeout);
    }
  }, 1)
};

appendVideo = function (video_url, elem, poster) {
  var t, timeout;
  if (container.style.display !== "block") {
    container_img.src = "";
    container_vid_src.src = "";
  }
  t = 0;
  timeout = setInterval(function () {
    if (hover_timeout) {
      fadeContainer.Out();
      clearInterval(timeout);
    }
    t += 1;
    if (t >= timeout_length) {
      container.style.display = "block";
      container_vid.style.display = "block";
      elem.style.cursor = "wait";
      container.poster = poster;
      container_vid_src.src = video_url;
      adjustVideoSize();
      container_vid.load();
      fadeContainer.In();
      elem.style.cursor = "";
      chrome.runtime.sendMessage({ url: video_url });
      clearInterval(timeout);
    }
  }, 1)
};

setUpImage = function (m, elem) {
  hover_timeout = false;
  currentElement = elem;
  appendImage(m, elem);
};

setUpVideo = function (m, elem, poster) {
  hover_timeout = false;
  currentElement = elem;
  appendVideo(m, elem, poster);
};

tryMatch = function (func, elem) {
  if (typeof(func) === "function") {
    func(elem, function (src, poster) {
      if (src) {
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
  hover_timeout = true;
  Sites.foundMatch = false;
  if (/hvzoom/.test(elem.id)) return;
  for (var i = 0; i < siteFunctions.length; i++) {
    if (Sites.foundMatch) {
      break;
    }
    tryMatch(siteFunctions[i], elem);
  }
};


onKeyDown = function (e) {
  if (imgurAlbum.isAlbum) {
    if (imgurAlbum.images.length > 1) {
      if (e.which === 39) {
        imgurAlbum.index = (imgurAlbum.index + 1 < imgurAlbum.images.length) ? imgurAlbum.index + 1 : 0;
      } else if (e.which === 37) {
        imgurAlbum.index = (imgurAlbum.index - 1 < 0) ? imgurAlbum.images.length - 1 : imgurAlbum.index - 1;
      }

      if (e.which === 37 || e.which === 39) {
        container_album_index.innerText = imgurAlbum.index + 1 + "/" + imgurAlbum.images.length;
        container_img.src = imgurAlbum.images[imgurAlbum.index].innerHTML;
        if (imgurAlbum.captions[imgurAlbum.index].innerHTML !== "") {
          container_caption.innerText = imgurAlbum.captions[imgurAlbum.index].innerHTML;
          container_caption.style.display = "block";
        } else {
          container_caption.innerHTML = "";
          container_caption.style.display = "none";
        }
        adjustImageSize();
      }
    }
  }
};

onMouseMove = function (e) {
  x = e.x;
  y = e.y;
  if (container.style.display === "block" && !/hvzoom/.test(e.target.id) && e.target !== currentElement) {
    fadeContainer.Out();
    currentElement = null;
  }
  //if (isGoogleUrl) {
  //  if (e.target !== currentElement) {
  //    getUrlPath(e.target);
  //    hover_timeout = true;
  //  }
  //  currentElement = e.target;
  //}
};

onMouseWheel = function (e) {
  if (container.style.display === "block") {
    fadeContainer.Out();
  }
};

onMouseOver = function (e) {
  if ((/(DIV|^I$|IMG|A)/.test(e.target.nodeName) || (e.target.firstChild && /(^I$|IMG|A)/.test(e.target.firstChild.nodeName)))) {
    getUrlPath(e.target);
    hover_timeout = false;
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
  adjustImageMonitor();
  siteFunctions = [
    Sites.normal,
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
    Sites.deviantart
  ];
};
