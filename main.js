var log = console.log.bind(console);
var container, container_img, container_caption, container_album_index;
var album_images;
var album_captions;
var cur_index;
var img_match = new RegExp("\.(png|jpeg|jpg|gif)(|:large)$");
var x, y;
var isImgurAlbum = false;
var caption_height = 0;

function adjustImageSize() {
  container.style.left = x+20+"px";
  if (container_caption.style.display != "none") {
    caption_height = container_caption.clientHeight;
  } else {
    caption_height = 0;
  }
  if (x > window.innerWidth/2) {
    if (x - container_img.clientWidth-20 < 0) {
      container.style.left = 0+"px";
    } else {
      container.style.left = x - container_img.clientWidth-40+"px";
    }
    container_img.style.maxWidth = x+"px";
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
  //if (caption_height != 0) {
  //  if (container.offsetHeight > window.innerHeight) {
      container.style.height = container_img.offsetHeight + caption_height + "px";
      container_img.style.maxHeight = window.innerHeight - caption_height + "px";
    //}
  //}
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

window.onkeydown = function(e) {
  if (isImgurAlbum) {
    var key = e.which;
    var album_length = album_images.length;
    if (album_length > 1) {
      if (key == 39) { //right
        if (cur_index + 1 < album_length) {
          cur_index++;
        } else {
          cur_index = 0;
        }
        container_album_index.innerText = cur_index+1+"/"+album_images.length;
        container_img.src = album_images[cur_index].innerHTML;
        if (album_captions[cur_index].innerHTML != "") {
          container_caption.innerText = album_captions[cur_index].innerHTML;
          container_caption.style.display = "block";
        } else {
          container_caption.style.display = "none";
        }
        adjustImageSize();
      } else if (key == 37) { //left
        if (cur_index - 1 < 0) {
          cur_index = album_length - 1;
        } else {
          cur_index--;
        }
        container_album_index.innerText = cur_index+1+"/"+album_images.length;
        container_img.src = album_images[cur_index].innerHTML;
        if (album_captions[cur_index].innerHTML != "") {
          container_caption.innerText = album_captions[cur_index].innerHTML;
          container_caption.style.display = "block";
        } else {
          container_caption.style.display = "none";
        }
        adjustImageSize();
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
  container.style.top = document.body.scrollTop+10+"px";
  container_img.style.maxWidth = window.innerWidth+"px";
  container_img.style.maxHeight = window.innerHeight-20-caption_height+"px";
  var test_img = new Image();
  test_img.src = image_url;
  container_img.src = image_url;
  var waitForLoad = setInterval(function() {
    if (test_img.height != 0) {
      container.style.display = "block";
      adjustImageSize();
      clearInterval(waitForLoad);
    }
  }, 100);
}

function getUrlPath(elem) {
  var url;
  switch (elem.nodeName) {
    case "A":
      container_album_index.style.display = "none";
      container_caption.innerHTML = "";
      container_caption.style.display = "none";
      url = parseUrl(elem.href);
      if (url) {
        appendImage(url);
      }
      break;
    case "IMG":
      container_album_index.style.display = "none";
      container_caption.innerHTML = "";
      container_caption.style.display = "none";
      if (elem.parentNode.nodeName = "A") {
        url = parseUrl(elem.parentNode.href);
        if (url) {
          appendImage(url);
        }
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
  if (/IMG|A/.test(e.target.nodeName)) {
    getUrlPath(e.target);
  } else if (container) {
    container.style.display = "none";
    container_caption.style.display = "none";
    container_album_index.style.display = "none";
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
