var container, container_img, container_caption, container_album_index, album_images, album_captions, hover_timeout, cur_index, caption_height, x, y, isImgurAlbum, timeout_length;
var img_match = new RegExp("\.(png|jpeg|jpg|gif)(|:large)$");
var log = console.log.bind(console);

timeout_length = 200;
fade_duration = 25;

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
    }, 4);
  },
  Out: function(callback) {
    container.style.opacity = "1";
    var i = 1;
    var fade = setInterval(function() {
      i -= 1/fade_duration;
      container.style.opacity = i;
      if (i <= 0) {
        callback();
        clearInterval(fade);
      }
    }, 4);
  }
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

function getImgurAlbum(id) {
  var x = new XMLHttpRequest();
  x.open("GET", "https://api.imgur.com/2/album/"+id+"/images", false);
  x.send();
  var resp = x.responseXML;
  album_images = resp.firstChild.getElementsByTagName('original');
  album_captions = resp.firstChild.getElementsByTagName('caption');
  if (!album_images) return;
  isImgurAlbum = true;
  cur_index = 0;
  if (album_images.length > 1) {
    container_album_index.innerText = "1/"+album_images.length;
    container_album_index.style.display = "block";
  }
  if (album_captions[0].innerHTML != "") {
    container_caption.innerText = album_captions[0].innerHTML;
    container_caption.style.display = "block";
  }
  return album_images[0].innerHTML;
}

function waitForLoad(url) {
  var test_img = new Image();
  test_img.src = url;
  container.style.display = "block";
  var waitForLoad = setInterval(function() {
    adjustImageSize();
    if (test_img.height != 0) {
      setTimeout(function() {
        adjustImageSize();
        clearInterval(waitForLoad);
      }, 50);
    }
  }, 10);
}

window.onkeydown = function(e) {
  if (isImgurAlbum) {
    var key = e.which;
    var album_length = album_images.length;
    if (album_length > 1) {
      if (key == 39) { //right arrow
        if (cur_index + 1 < album_length) {
          cur_index++;
        } else {
          cur_index = 0;
        }
        waitForLoad(album_images[cur_index].innerHTML);
        container_album_index.innerText = cur_index+1+"/"+album_images.length;
        container_img.src = album_images[cur_index].innerHTML;
        if (album_captions[cur_index].innerHTML != "") {
          container_caption.innerText = album_captions[cur_index].innerHTML;
          container_caption.style.display = "block";
        } else {
          container_caption.innerHTML = "";
          container_caption.style.display = "none";
        }
      } else if (key == 37) { //left arrow
        if (cur_index - 1 < 0) {
          cur_index = album_length - 1;
        } else {
          cur_index--;
        }
        waitForLoad(album_images[cur_index].innerHTML);
        container_album_index.innerText = cur_index+1+"/"+album_images.length;
        container_img.src = album_images[cur_index].innerHTML;
        if (album_captions[cur_index].innerHTML != "") {
          container_caption.innerText = album_captions[cur_index].innerHTML;
          container_caption.style.display = "block";
        } else {
          container_caption.innerHTML = "";
          container_caption.style.display = "none";
        }
      }
    }
  }
}

function parseUrl(url) {
  isImgurAlbum = false;
  var m = img_match.test(url);
  if (/imgur\.com/.test(url) && !m) {
    if (/\/a\//.test(url)) {
      return getImgurAlbum(url.replace(/.*\/a\//, ""));
  } else {
    container_album_index.style.display = "none";
    return url.replace(/http.*\.com/, "http://i.imgur.com")+".jpg";
  }
  } else if (m) {
    return url;
  }
}

function appendImage(image_url) {
  fadeContainer.In();
  container.style.top = document.body.scrollTop+10+"px";
  container_img.style.maxWidth = window.innerWidth+"px";
  container_img.style.maxHeight = window.innerHeight-20-caption_height+"px";
  container_img.src = image_url;
  waitForLoad(image_url);
}

function getUrlPath(elem) {
  var url;
  if (!container) return;
  switch (elem.nodeName) {
    case "A":
      container_album_index.style.display = "none";
      container_caption.innerHTML = "";
      container_caption.style.display = "none";
      setTimeout(function() {
        if (hover_timeout) return;
        url = parseUrl(elem.href);
        if (url) {
          appendImage(url);
        }
      }, timeout_length);
      break;
    case "IMG":
      container_album_index.style.display = "none";
      container_caption.innerHTML = "";
      container_caption.style.display = "none";
      if (elem.parentNode.nodeName = "A") {
        setTimeout(function() {
          if (hover_timeout) return;
          url = parseUrl(elem.parentNode.href);
          if (url) {
            appendImage(url);
          }
        }, timeout_length);
      }
      break;
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
}
