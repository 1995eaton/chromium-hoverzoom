var imgur, container, container_img, container_caption, container_album_index, hover_timeout, caption_height, x, y, timeout_length, currentElement, fadeContainer, adjustImageSize, waitForLoad, matchSite, appendImage, getUrlPath, offset, orig_url, imageLoaded, basicMatch, stripUrl, onMouseMove, onMouseWheel, onMouseOver, onKeyDown, showLoadingCursor;
var log = console.log.bind(console);

timeout_length = 100;
fade_duration = 10;
offset = 15;

basicMatch = function(url) {
  var match = new RegExp("\.(png|jpeg|jpg|svg|gif)(\\?([^?])+$)?(:large)?$", "i");
  return match.test(url);
};

stripUrl = function(url) {
  if (!url) return;
  url = url.replace(/^http(s)?:\/\//, "");
  url = "."+url.replace(/\/.*/, "");
  url = url.replace(/.*\.(([^\.]+)\.([^\.]+)$)/, "$1");
  return url;
}

imgur = {

  isAlbum: null,
  albumImages: [],
  albumCaptions: [],
  currentIndex: null,

  getAlbum: function(id) {
    var x = new XMLHttpRequest();
    x.open("GET", "https://api.imgur.com/2/album/"+id+"/images", false);
    x.send();
    var resp = x.responseXML;

    imgur.albumImages = resp.firstChild.getElementsByTagName('original');
    imgur.albumCaptions = resp.firstChild.getElementsByTagName('caption');
    if (!imgur.albumImages) return;
    imgur.isImgurAlbum = true;
    imgur.currentIndex = 0;
    if (imgur.albumImages.length > 1) {
      adjustImageSize();
      container_album_index.innerText = "1/"+imgur.albumImages.length;
      container_album_index.style.display = "block";
    }
    if (imgur.albumCaptions[0].innerHTML != "") {
      adjustImageSize();
      container_caption.innerText = imgur.albumCaptions[0].innerHTML;
      container_caption.style.display = "block";
    }

    return imgur.albumImages[0].innerHTML;
  }

};

waitForLoad = function(url) {
  var t = 0;
  var timeout = setInterval(function() {
    if (hover_timeout) clearInterval(timeout);
    t++;
    if (t >= timeout_length) {
      imageLoaded = true;
      if (hover_timeout == false) {
        adjustImageSize();
        hover_timeout = true;
        chrome.runtime.sendMessage({url: orig_url});
        fadeContainer.In();
      }
    }
  }, 1);
}

matchSite = {

  twitter: function (elem) {
    return (/is-preview/.test(elem.parentNode.className))? elem.src : false;
  },

  livememe: function(elem) {
    var base = new RegExp("livememe\.com", "i");
    if (!base.test(stripUrl(elem.href)) || !base.test(stripUrl(elem.parentNode.href))) return;
    var match = /[a-zA-Z0-9]{7}/;
    if (match.test(elem.href)) return elem.href + ".jpg";
    if (match.test(elem.parentNode.href)) return elem.parentNode.href + ".jpg";
  },

  imgur: function(url) {
    imgur.isImgurAlbum = false;
    var base = new RegExp("imgur\.com", "i");
    if (/\/random/.test(url) || !base.test(stripUrl(url))) return;
    var suffix = url.replace(new RegExp(".*"+stripUrl(url)+"(\/)?"), "");
    if (!basicMatch(url)) {
      if (/\/a\//.test(url)) {
        return imgur.getAlbum(url.replace(/.*\/a\//, ""));
    } else if (/\/gallery\/(([a-zA-Z0-9]){7})/.test(url)) {
      return url.replace('/gallery/', '/')+".jpg";
    } else if (/\/gallery\//.test(url)) {
      return imgur.getAlbum(url.replace(/.*gallery/, ""));
    } else {
      if (suffix.length == 7) {
        return url + ".jpg";
      }
    }
    }
    return url;
  },

  wikimedia: function(url) {
    var base = new RegExp("(wikipedia|wikimedia)\.org", "i");
    if (!base.test(url) || !basicMatch(url)) return;
    url = url.replace(/\/thumb/, "");
    url = url.replace(/\/([^/]+)$/, "");
    return url;
  },

  deviantart: function(url) {
    var base = new RegExp("deviantart\.(com|net)", "i");
    if (/\/(avatars|emoticons)\//.test(url) || !base.test(stripUrl(url)) || !basicMatch(url)) return;
    return (url.replace(/(\.(com|net)\/([^\/]+))\/([^\/]+)/g, "$1"));
  },

  facebook: function(elem) {
    if (elem.className === "img" || !/facebook\.com/.test(document.URL)) return;
    if (/ContentWrapper/.test(elem.className)) return;
    function trimUrl(url) {
      url = url.replace(/url\(/, "");
      url = url.replace(/\)/, "");
      url = url.replace(/(\/[a-z])?\/t([0-9]+)\/.*[0-9]x([0-9]+)\//, "/");
      url = url.replace(/_[a-z](\.([a-zA-Z]+))$/, "_o$1");
      return url;
    }
    if (elem.nodeName === "I" && elem.style.backgroundImage) {
      return trimUrl(elem.style.backgroundImage);
    }
    var e = elem.firstChild;
    if (e && e.firstChild && e.firstChild.src){
      return !basicMatch(e.firstChild.src) || trimUrl(e.firstChild.src);
    }
    return !basicMatch(elem.src) || trimUrl(elem.src);
  },

  normal: function(url) {
    if (basicMatch(url)) {
      return url.replace(/.*url=/, "");
    }
  }

};

adjustImageSize = function() {

  if (fadeContainer.transition) return;
  caption_height = container_caption.offsetHeight;

  if (x < window.innerWidth/2) {
    if (container_img.offsetWidth < window.innerWidth) {
      container.style.left = offset + x +  "px";
      container.style.maxWidth = window.innerWidth - x - 3*offset + "px";
      container_img.style.maxWidth = window.innerWidth - x - 3*offset - 4 + "px";
    } else {
      container.style.left = offset + "px";
      container.style.maxWidth = window.innerWidth - 3*offset + "px";
      container_img.style.maxWidth = window.innerWidth - 3*offset - 4 + "px";
    }
  } else {
    if (container_img.offsetWidth < window.innerWidth) {
      container.style.left = x - offset - container_img.offsetWidth +  "px";
      container.style.maxWidth = x - 3*offset + "px";
      container_img.style.maxWidth = x - 3*offset - 4 + "px";
    } else {
      container.style.left = offset + "px";
      container.style.maxWidth = window.innerWidth - 3*offset + "px";
      container_img.style.maxWidth = window.innerWidth - 3*offset - 4 + "px";
    }
  }

  if (y - container.offsetHeight < offset*2) {
    if (y > window.innerHeight/2) {
      container.style.top = document.body.scrollTop + offset + "px";
    } else {
      if (y + 2*offset + container.offsetHeight > window.innerHeight) {
        container.style.top = document.body.scrollTop+ y - (container.offsetHeight-(window.innerHeight-y)) - offset + "px";;
      } else {
        container.style.top = document.body.scrollTop + offset + y + "px";;
      }
    }
  } else if (y + container.offsetHeight > window.innerHeight/2 - 2*offset) {
    container.style.top = document.body.scrollTop + y - container.offsetHeight - offset + "px";
  } else {
    container.style.top = document.body.scrollTop + y + offset + "px";
  }
  if (container_img.offsetWidth > container_img.offsetHeight) {
    if (y < window.innerHeight/2) {
      container.style.height = container_img.offsetHeight + caption_height + 2 +  "px";
      container_img.style.maxHeight = window.innerHeight - y - caption_height - 2*offset + "px";
    } else {
      container.style.height = container_img.offsetHeight + caption_height + 2 +  "px";
      container_img.style.maxHeight = y - caption_height - 2*offset + "px";
    }
  }
  container_img.style.maxHeight = window.innerHeight - caption_height - 2*offset - 4 + "px";
  container.style.height = container_img.offsetHeight + caption_height + 2 +  "px";
  container.style.maxHeight = window.innerHeight + caption_height - 2*offset + "px";
  if (container_img.offsetHeight > window.innerHeight - 2*offset) {
    container.style.top = offset+"px";
  }
}

fadeContainer = {

  transition: null,

  In: function() {
    if (fadeContainer.transition) return;
    container.style.display = "block";
    container.style.opacity = "0";
    adjustImageSize();
    var i = 0;
    var fade = setInterval(function() {
      adjustImageSize();
      i += 1/fade_duration;
      container.style.opacity = i;
      if (i >= 1) {
        imageLoaded = true;
        hover_timeout = true;
        container.style.opacity = "1";
        adjustImageSize();
        clearInterval(fade);
      }
    }, 15);
  },

  Out: function() {
    if (fadeContainer.transition) return;
    fadeContainer.transition = true;
    var i = 1;
    var fade = setInterval(function() {
      i -= 1/fade_duration;
      container.style.opacity = i;
      if (i <= 0) {
        container.style.opacity = "0";
        fadeContainer.transition = false;
        container.style.display = "none";
        container_caption.style.display = "none";
        container_album_index.style.display = "none";
        container_caption.innerHTML = "";
        container_album_index.innerHTML = "";
        clearInterval(fade);
      }
    }, 15);
  }

};

showLoadingCursor = function(elem) {
  var loadLoop = setInterval(function() {
    elem.style.cursor = "wait";
    if (imageLoaded) {
      elem.style.cursor = "";
      clearInterval(loadLoop);
      return false;
    }
  }, 50);
}

appendImage = function(image_url) {
  if (!container) return;
  container.style.top = document.body.scrollTop + offset + "px";
  container_img.style.maxHeight = window.innerHeight - offset + "px";
  container_img.src = image_url;
  waitForLoad(image_url);
}

getUrlPath = function(elem) {
  var url = elem.href || elem.parentNode.href || elem.src;
  if (/hvzoom/.test(elem.id)) return;
  var match = ((matchSite.twitter(elem)
        || matchSite.livememe(elem)
        || matchSite.imgur(elem.href || elem.parentNode.href)
        || matchSite.wikimedia(elem.src)
        || matchSite.facebook(elem)
        || matchSite.deviantart(elem.src)
        || matchSite.normal(elem.href || elem.parentNode.href || elem.parentNode.parentNode.href)));
  if (basicMatch(match)) {
    orig_url = url;
    currentElement = elem;
    imageLoaded = false;
    showLoadingCursor(elem);
    return appendImage(match);
  } else {
    hover_timeout = false;
  }
}

onKeyDown = function(e) {
  if (imgur.isImgurAlbum) {
    var key = e.which;
    var album_length = imgur.albumImages.length;
    if (album_length > 1) {
      if (key == 39) {
        imgur.currentIndex = (imgur.currentIndex + 1 < album_length)? imgur.currentIndex + 1 : 0;
      } else if (key == 37) {
        imgur.currentIndex = (imgur.currentIndex - 1 < 0)? album_length - 1 : imgur.currentIndex - 1;
      }
      if (key == 37 || key == 39) {
        container_album_index.innerText = imgur.currentIndex+1+"/"+imgur.albumImages.length;
        container_img.src = imgur.albumImages[imgur.currentIndex].innerHTML;
        if (imgur.albumCaptions[imgur.currentIndex].innerHTML != "") {
          container_caption.innerText = imgur.albumCaptions[imgur.currentIndex].innerHTML;
          container_caption.style.display = "block";
        } else {
          container_caption.innerHTML = "";
          container_caption.style.display = "none";
        }
        adjustImageSize();
      }
    }
  }
}

onMouseMove = function(e) {
  x = e.x; y = e.y;
  if (container.style.display === "block") {
    adjustImageSize();
    if (e.target != currentElement) {
      fadeContainer.Out();
    }
  }
};

onMouseWheel = function(e) {
  if (container.style.display == "block" && e.target != currentElement) {
    fadeContainer.Out();
  }
};

onMouseOver = function(e) {
  if (/(^I$|IMG|A)/.test(e.target.nodeName) || (e.target.firstChild && /(^I$|IMG|A)/.test(e.target.firstChild.nodeName))) {
    hover_timeout = false;
    getUrlPath(e.target);
  } else {
    hover_timeout = true;
    currentElement = null;
  }
};

function setupElements() {

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

}

window.onload = function() {
  setupElements();
  document.addEventListener("keydown", onKeyDown, false);
  document.addEventListener("mousewheel", onMouseWheel, false);
  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("mouseover", onMouseOver, false);
}
