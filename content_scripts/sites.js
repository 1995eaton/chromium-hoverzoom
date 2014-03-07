var Sites = {};

var imgurAlbum = {

  isAlbum: null,
  images: [],
  captions: [],
  index: null,

  getAlbum: function (id) {
    imgurAlbum.isAlbum = false;
    imgurAlbum.images = [];
    imgurAlbum.captions = [];
    imgurAlbum.index = null;
    var x = new XMLHttpRequest();
    x.open("GET", "https://api.imgur.com/2/album/" + id + "/images", false);
    x.send();
    x = x.responseXML;

    imgurAlbum.images = x.firstChild.getElementsByTagName('original');
    imgurAlbum.captions = x.firstChild.getElementsByTagName('caption');
    if (!imgurAlbum.images) {
      return;
    }
    imgurAlbum.index = 0;
    if (imgurAlbum.images.length > 1) {
      container_album_index.innerText = "1/" + imgurAlbum.images.length;
    }
    if (imgurAlbum.captions[0].innerHTML !== "") {
      container_caption.innerText = imgurAlbum.captions[0].innerHTML;
    }
    container_caption.style.display = "block";
    imgurAlbum.isAlbum = true;
    return imgurAlbum.images[0].innerHTML;
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
  var url = elem.src;
  if (!url || !/avatars/.test(url) || !/githubusercontent\.com/.test(stripUrl(url))) {
    return;
  }
  callback(url);
};

Sites.gravatar = function (elem, callback) {
  var url = elem.src;
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
  var urlArray = [];
  if (elem.href) {
    urlArray.push(elem.href);
  }
  if (elem.parentNode && elem.parentNode.href) {
    urlArray.push(elem.parentNode.href);
  }
  if (urlArray.length === 0) {
    return false;
  }

  var url;
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
  var url = elem.src;
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
    url = url.replace(/url\(/, "");
    url = url.replace(/\)/, "");
    url = url.replace(/(\/[a-z])?\/t([0-9]+)\/.*[0-9]x([0-9]+)\//, "/");
    url = url.replace(/_[a-z](\.([a-zA-Z]+))$/, "_o$1");
    return url;
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
  if (!base.test(elem.src)) {
    return;
  }
  if (!/\/(avatars|emoticons)\//.test(elem.src) && (base.test(stripUrl(elem.src)) || basicMatch(elem.src))) {
    callback((elem.src.replace(/(\.(com|net)\/([^\/]+))\/([^\/]+)/g, "$1")));
  }
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
  var url;
  var urlArray = [];
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
      log(url);
      callback(url.replace(/.*url=/, ""));
    }
  }
};

Sites.gfycat = function (elem, callback) {
  var urlArray = [];
  if (elem.href && !basicMatch(elem.href)) {
    urlArray.push(elem.href);
  }
  if (elem.parentNode && !basicMatch(elem.parentNode.href)) {
    urlArray.push(elem.parentNode.href);
  }
  if (urlArray.length === 0) {
    return false;
  }
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
    if (/\.gif$/.test(url) || !/gfycat\.com/.test(stripUrl(url))) {
      continue;
    }
    isVideo = true;
    getGfySource(url.replace(/[^a-zA-Z_-]+$/, ""));
    break;
  }
};

Sites.xkcd = function (elem, callback) {
  var urlArray = [];
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
