var container, container_img, container_caption, container_album_index, hover_timeout, caption_height, x, y, timeout_length, currentElement;
var img_match = new RegExp("\.(png|jpeg|jpg|gif)(\\?([^?])+$)?(:large)?$");
var log = console.log.bind(console);
var imageLoaded = false;

timeout_length = 300;
fade_duration = 10;

var imgur = {

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

function waitForLoad(url) {
  var test_img = new Image();
  test_img.src = url;
  test_img.onload = function() {
    setTimeout(function() {
      imageLoaded = true;
      if (hover_timeout == false) {
        hover_timeout = true;
        fadeContainer.In();
        container.style.display = "block";
        adjustImageSize();
      }
    }, timeout_length);
  }
}

var matchSite = {

  twitter: function (elem) {
    return (/is-preview/.test(elem.parentNode.className))? elem.src : false;
  },

  livememe: function(elem) {
    var r = /http(s)?:\/\/.*livememe\.com\/([a-zA-Z0-9]){7}/;
    if (r.test(elem.href || elem.parentNode.href)) {
      return (elem.href || elem.parentNode.href) + ".jpg";
    }
  },

  imgur: function(url) {

    imgur.isImgurAlbum = false;
    var m = img_match.test(url);
    if (/(http(s)?:\/\/|www\.)imgur\.com/.test(url)) {
      if (/\/random/.test(url)) return;
      if (!m && /\/a\//.test(url)) {
        return imgur.getAlbum(url.replace(/.*\/a\//, ""));
    } else if (!m && /\/gallery\//.test(url)) {
      if (/\/gallery\/(([a-zA-Z0-9]){7})/.test(url)) {
        return url.replace('/gallery/', '/')+".jpg";
      } else {
        return imgur.getAlbum(url.replace(/.*gallery\//, ''));
      }
    } else {
      var updated_url = url.replace(/http.*\.com/, "");
      if (updated_url == "/" || updated_url == null) return;
      else return "https://i.imgur.com/"+updated_url+".jpg";
    }
    } else if (m) {
      return url;
    }
  }

};

var fadeContainer = {
  In: function() {
    container.style.opacity = "0";
    var i = 0;
    var fade = setInterval(function() {
      i += 1/fade_duration;
      container.style.opacity = i;
      if (i >= 1) {
        clearInterval(fade);
      }
    }, 15);
  },
};

function adjustImageSize() {
  container.style.left = x+20+"px";

  if (container_caption.style.display != "none") {
    caption_height = container_caption.clientHeight;
  } else {
    caption_height = 0;
  }

  if (x > window.innerWidth/2) {

    if (x - container_img.clientWidth-20 < 0) {
      container.style.left = 5+"px";
    } else {
      container.style.left = x - container_img.clientWidth-20+"px";
    }
    container_img.style.maxWidth = x - 20 + "px";

  } else {
    container_img.style.maxWidth = window.innerWidth-x-40+"px";
  }

  if (y - container_img.clientHeight < 0) {
    container.style.top = document.body.scrollTop+10+"px";;
  } else if (y+container_img.clientHeight > window.innerHeight/2) {
    container.style.top = document.body.scrollTop+y-container_img.clientHeight+"px";
  } else {
    container.style.top = document.body.scrollTop+y+10+"px";
  }

  container.style.height = container_img.offsetHeight + caption_height + 2 +  "px";
  container_img.style.maxHeight = window.innerHeight - caption_height - 20 + "px";

}

function showLoadingCursor(elem) {
  var loadLoop = setInterval(function() {
    elem.style.cursor = "wait";
    if (imageLoaded) {
      elem.style.cursor = "";
      clearInterval(loadLoop);
      return false;
    }
  }, 50);
}

window.onkeydown = function(e) {
  if (imgur.isImgurAlbum) {
    var key = e.which;
    var album_length = imgur.albumImages.length;
    if (album_length > 1) {
      if (key == 39) { //right arrow
        if (currentElement) {
          imageLoaded = false;
          showLoadingCursor(currentElement);
        }
        if (imgur.currentIndex + 1 < album_length) {
          imgur.currentIndex++;
        } else {
          imgur.currentIndex = 0;
        }
        waitForLoad(imgur.albumImages[imgur.currentIndex].innerHTML);
        container_album_index.innerText = imgur.currentIndex+1+"/"+imgur.albumImages.length;
        container_img.src = imgur.albumImages[imgur.currentIndex].innerHTML;
        if (imgur.albumCaptions[imgur.currentIndex].innerHTML != "") {
          container_caption.innerText = imgur.albumCaptions[imgur.currentIndex].innerHTML;
          container_caption.style.display = "block";
        } else {
          container_caption.innerHTML = "";
          container_caption.style.display = "none";
        }
      } else if (key == 37) { //left arrow
        if (currentElement) {
          imageLoaded = false;
          showLoadingCursor(currentElement);
        }
        if (imgur.currentIndex - 1 < 0) {
          imgur.currentIndex = album_length - 1;
        } else {
          imgur.currentIndex--;
        }
        waitForLoad(imgur.albumImages[imgur.currentIndex].innerHTML);
        container_album_index.innerText = imgur.currentIndex+1+"/"+imgur.albumImages.length;
        container_img.src = imgur.albumImages[imgur.currentIndex].innerHTML;
        if (imgur.albumCaptions[imgur.currentIndex].innerHTML != "") {
          container_caption.innerText = imgur.albumCaptions[imgur.currentIndex].innerHTML;
          container_caption.style.display = "block";
        } else {
          container_caption.innerHTML = "";
          container_caption.style.display = "none";
        }
      }
    }
  }
}

function appendImage(image_url) {
  container.style.top = document.body.scrollTop+10+"px";
  container_img.style.maxWidth = window.innerWidth+"px";
  container_img.style.maxHeight = window.innerHeight-20-caption_height+"px";
  container_img.src = image_url;
  waitForLoad(image_url);
}

function getUrlPath(elem) {
  var url;
  var match = ((matchSite.twitter(elem)
        || matchSite.livememe(elem)
        || matchSite.imgur(elem.href || elem.parentNode.href)));
  if (img_match.test(match)) {
    currentElement = elem;
    elem.style.cursor = "wait";
    imageLoaded = false;
    showLoadingCursor(elem);
    return appendImage(match);
  } else {
    hover_timeout = false;
  }
}

window.onmousemove = function(e) {

  x = e.x;
  y = e.y;

  if (container && container.style.display === "block") {
    adjustImageSize();
  }

}

window.onmouseover = function(e) {
  if (/(IMG|A)/.test(e.target.nodeName)) {

    hover_timeout = false;
    getUrlPath(e.target);

  } else {

    hover_timeout = true;
    currentElement = null;
    if (container) {
      container.style.display = "none";
      container_caption.style.display = "none";
      container_album_index.style.display = "none";
    }

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

  setInterval(function() {
    if (container && container.style.display === "block") {
      adjustImageSize();
    }
  }, 50);

}
