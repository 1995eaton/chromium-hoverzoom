var url, urlArray, Sites, imgurAlbum;
Sites = {};

imgurAlbum = {

  isAlbum: null,
  id: null,
  images: function() {
    if (imgurAlbum.id && imgurAlbum.isAlbum)
      return imgurAlbum.cached[id].images;
  },
  captions: function() {
    if (imgurAlbum.id && imgurAlbum.isAlbum)
      return imgurAlbum.cached[id].captions;
  },
  index: null,
  cached: {},

  getAlbum: function (id) {
    if (!imgurAlbum.cached[id]) {
      var x = new XMLHttpRequest();
      x.open("GET", "https://api.imgur.com/2/album/" + id.replace(/#.*/, "") + ".json", false);
      x.onreadystatechange = function() {
        var images = JSON.parse(x.responseText).album.images;
        imgurAlbum.cached[id] = {};
        imgurAlbum.cached[id].index = 0;
        imgurAlbum.cached[id].images = [];
        imgurAlbum.cached[id].captions = [];
        for (var i = 0; i < images.length; i++) {
          imgurAlbum.cached[id].images.push(images[i].links.original);
          imgurAlbum.cached[id].captions.push(images[i].image.caption);
        }
      };
      x.send();
    }
    this.id = id;
    this.isAlbum = true;
    container_album_index.innerText = this.cached[id].index + 1 + "/" + this.cached[id].images.length;
    container_caption.innerText = this.cached[this.id].captions[this.cached[this.id].index];
    if (container_caption.innerText !== "") {
      container_caption.style.display = "block";
    }
    return this.cached[id].images[this.cached[id].index];
  },

  getImage: function (next) {
    var albumLength = this.cached[this.id].images.length;
    var index = this.cached[this.id].index;
    if (this.cached[this.id].images.length > 1) {
      if (next) {
        this.cached[this.id].index = (index + 1 < albumLength) ? index + 1 : 0;
      } else {
        this.cached[this.id].index = (index - 1 < 0) ? albumLength - 1 : index - 1;
      }
      container_album_index.innerText = this.cached[this.id].index + 1 + "/" + albumLength;
      var img = new Image();
      img.onload = function () {
        currentElement.style.cursor = "";
        if (imgurAlbum.isAlbum) {
          container_caption.innerText = imgurAlbum.cached[imgurAlbum.id].captions[imgurAlbum.cached[imgurAlbum.id].index];
          container_caption.style.display = "block";
        }
        if (container_caption.innerHTML === "") {
          container_caption.innerHTML = "";
          container_caption.style.display = "none";
        }
        appendImage(img.src, true);
      }
      img.src = this.cached[this.id].images[this.cached[this.id].index];
    }
  }

};

var basicMatch = function (url) {
  return (/\.(png|jpeg|jpg|svg|gif|tif)((:large|((\\?[^?])+))$)?/i).test(url);
};

var stripUrl = function (url) {
  if (!url) {
    return;
  }
  url = url.replace(/^http(s)?:\/\//, "");
  url = "." + url.replace(/\/.*/, "");
  url = url.replace(/.*\.(([^\.]+)\.([^\.]+)$)/, "$1");
  return url;
};

Sites.github = function (elem, callback) {
  url = elem.src;
  if (!url || !/avatars/.test(url) || !/githubusercontent\.com/.test(stripUrl(url))) {
    return;
  }
  callback(url);
};

Sites.gravatar = function (elem, callback) {
  url = elem.src;
  if (!url || !/gravatar\.com/.test(stripUrl(url)) || !basicMatch(url)) {
    return;
  }
  var img = new Image();
  img.onload = function () {
    if (img.width > elem.width) {
      callback(url);
    };
  };
  img.src = url;
};

Sites.twitter = function (elem, callback) {
  var img;
  if (elem.className === "media-overlay" && elem.previousElementSibling.src) {
    img = elem.previousElementSibling.src;
  } else if (/twimg.*_(normal|bigger)/.test(elem.src)) {
    img = elem.src.replace(/(twimg.*)_(normal|bigger)/, "$1");
  } else if (/twimg/.test(stripUrl(elem.src))) {
    img = elem.src.replace(/:thumb/, "") + ":large";
  } else if (elem.firstChild && /twimg/.test(elem.firstChild.src)) {
    img = elem.firstChild.src + ":large";
  } else if (/is-preview/.test(elem.parentNode.className)) {
    img = elem.src;
  }
  callback(img);
};

Sites.livememe = function (elem, callback) {
  var base = /livememe\.com/i;
  if (base.test(stripUrl(elem.href)) || base.test(stripUrl(elem.parentNode.href))) {
    base = /[a-zA-Z0-9]{7}/;
    if (elem.href && base.test(elem.href)) {
      callback(elem.href + ".jpg");
    } else if (elem.parentNode.href && base.test(elem.parentNode.href)) {
      callback(elem.parentNode.href + ".jpg");
    }
  }
};


Sites.imgur = function (elem, callback) {
  urlArray = [];
  if (elem.href) {
    urlArray.push(elem.href);
  }
  if (elem.parentNode && elem.parentNode.href) {
    urlArray.push(elem.parentNode.href);
  }
  if (urlArray.length === 0) {
    return false;
  }

  for (var i = 0; i < urlArray.length; i++) {
    url = urlArray[i];
    if (/\/random/.test(url) || !/imgur\.com/i.test(stripUrl(url))) {
      continue;
    }
    imgurAlbum.isAlbum = false;
    if (basicMatch(url)) {
      return callback(url);
    }
    if (/\/a\//.test(url)) {
      return callback(imgurAlbum.getAlbum(url.replace(/.*\/a\//, "")));
    }
    if (/\/gallery\/(([a-zA-Z0-9]){7})/.test(url)) {
      return callback(url.replace('/gallery/', '/') + ".jpg");
    }
    if (/\/gallery\//.test(url)) {
      return callback(imgurAlbum.getAlbum(url.replace(/.*gallery/, "")));
    }
    var suffix = url.replace(new RegExp(".*" + stripUrl(url) + "(\/)?", "i"), "");
    if (suffix.length === 7) {
      return callback(url + ".jpg");
    }
  }
};

Sites.wikimedia = function (elem, callback) {
  url = elem.src;
  if (/(wikipedia|wikimedia)\.org/i.test(stripUrl(url)) && !/\.ogv|\.ogg/.test(url) && basicMatch(url)) {
    url = url.replace(/\/thumb/, "");
    if (/.*\.(png|jpg|jpeg|gif|svg|tif).*\.(png|jpg|jpeg|gif|svg|tif)/i.test(url)) {
      url = url.replace(/\/([^\/]+)$/, "");
    }
    callback(url);
  }
};

Sites.facebook = function (elem, callback) {
  if (!/facebook\.com/.test(document.URL) || /ContentWrapper/.test(elem.className) || /(fbexternal|_b\.([a-zA-Z]+)$)/.test(elem.src)) {
    return;
  }
  function trimUrl(url) {
    if (!url) {
      return;
    }
    return url.replace(/url\(/, "").replace(/\)/, "").replace(/(\/[a-z])?\/t([0-9]+)\/.*[0-9]x([0-9]+)\//, "/").replace(/_[a-z](\.([a-zA-Z]+))$/, "_o$1");
  }
  if (/ImageContainer/.test(elem.className) && elem.firstChild && elem.firstChild.src) {
    callback(trimUrl(elem.firstChild.src));
  } else if (elem.nodeName === "I" && elem.style.backgroundImage) {
    callback(trimUrl(elem.style.backgroundImage));
  } else {
    var e = elem.firstChild;
    if (e && e.firstChild && e.firstChild.src) {
      callback(trimUrl(e.firstChild.src));
    } else {
      callback(trimUrl(elem.src));
    }
  }
};


Sites.deviantart = function (elem, callback) {
  var base = /deviantart\.(com|net)/i;
  if (!base.test(document.URL))
    return;

  if (elem.nodeName === "DIV" && elem.style.backgroundImage)
    url = elem.style.backgroundImage.replace(/url\(/i, "").replace(/\)$/i, "");
  else
    url = elem.src;

  if (/\/fs([0-9]+)\/[a-zA-Z]\//.test(url))
    callback(url);
  else if (!/\/(avatars|emoticons)\//.test(url) && (base.test(stripUrl(url)) || basicMatch(url)))
    callback((url.replace(/(\.(com|net)\/([^\/]+))\/([^\/]+)/g, "$1")));
};

Sites.googleUserContent = function (elem, callback) {
  if (!/googleusercontent\.com/.test(stripUrl(elem.src)) || !basicMatch(elem.src)) {
    return;
  }
  function trimUrl(url) {
    return url.replace(/\/[a-z][0-9]([^\/]+)(\/([^\/]+)\.(jpg|svg|jpeg|png|gif|tif)$)/i, "/s0$2");
  }
  var img = new Image();
  img.onload = function () {
    if (img.width > elem.width) {
      callback(img.src);
    }
  };
  img.src = trimUrl(elem.src);
};

Sites.google = function (elem, callback) {
  if (!/google\.com/.test(stripUrl(document.URL))) {
    isGoogleUrl = false;
    return;
  }
  if (elem.parentNode && /img/.test(elem.parentNode.href)) {
    callback(unescape(decodeURIComponent(elem.parentNode.href.replace(/.*imgurl=([^\&]+\.(jpg|gif|png|jpeg|svg|tif)).*/i, "$1"))));
  } else if (elem.id === "irc_mi" && basicMatch(elem.src)) {
    callback(elem.src);
  }
};

Sites.normal = function (elem, callback) {
  var imageFound;
  urlArray = [];
  if (elem.href && basicMatch(elem.href)) {
    urlArray.push(elem.href);
  }
  if (elem.parentNode && basicMatch(elem.parentNode.href)) {
    urlArray.push(elem.parentNode.href);
  }
  if (urlArray.length === 0) {
    return false;
  }
  for (var i = 0; i < urlArray.length; i++) {
    if (imageFound) {
      return;
    }
    url = urlArray[i];
    if (basicMatch(url)) {
      callback(url.replace(/.*url=/, ""));
    }
  }
};

Sites.gfycat = function (elem, callback) {
  urlArray = [];
  if (elem.href && !basicMatch(elem.href))
    urlArray.push(elem.href);
  if (elem.parentNode && !basicMatch(elem.parentNode.href))
    urlArray.push(elem.parentNode.href);
  if (urlArray.length === 0) return false;
  function getGfySource (url) {
    var x = new XMLHttpRequest();
    x.open("GET", url);
    x.onload = function () {
      callback(x.responseText.match(/source id=('|")webmsource('|") src=('|")([^('|")]+)('|")/i)[0].replace(/^.*src=('|")/, "").replace(/('|")$/, ""),
      x.responseText.match(/poster=('|")([^('|")]+)('|")/i)[0].replace(/^.*=('|")/, "").replace(/('|")$/, ""));
    };
    x.send();
  }
  for (var i = 0; i < urlArray.length; i++) {
    url = urlArray[i];
    if (/\.gif$/.test(url) || !/gfycat\.com/.test(stripUrl(url))) continue;
    isVideo = true;
    getGfySource(url.replace(/[^a-zA-Z_-]+$/, ""));
    break;
  }
};

Sites.webm = function (elem, callback) {
  if (/\.webm$/.test(elem.parentNode.href)) {
    callback(elem.parentNode.href, "1");
  } else if (/\.webm$/.test(elem.href)) {
    callback(elem.href, "1");
  } else if (/\.m4v$/.test(elem.href)) {
    isVideo = true;
    container_vid_src.type = "video/mp4";
    callback(elem.href, "1");
  }
};

Sites.xkcd = function (elem, callback) {
  urlArray = [];
  if (elem.href) {
    urlArray.push(elem.href);
  }
  if (elem.parentNode && elem.parentNode.href) {
    urlArray.push(elem.parentNode.href);
  }
  if (urlArray.length === 0) {
    return false;
  }
  for (var i = 0; i < urlArray.length; i++) {
    url = urlArray[i];
    if (!/xkcd\.com/i.test(stripUrl(url)) || !/xkcd\.com\/([0-9]+)(\/)?$/i.test(url)) {
      continue;
    }
    var x = new XMLHttpRequest();
    x.open("GET", "http://xkcd.com/" + url.replace(/[^0-9]+/g, "") + "/info.0.json");
    x.onload = function () {
      x = x.responseText;
      var img = x.replace(/.*(http:\\\/\\\/([^\"]+)\.(png|jpg|jpeg|svg|tif)).*/i, "$1");
      img = unescape(decodeURIComponent(img.replace(/\\\//g, "/")));
      if (img) {
        callback(img);
      }
    };
    x.send();
  }
};
