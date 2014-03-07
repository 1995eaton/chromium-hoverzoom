var settingsDefault = {

  fadeVal: 0.2,
  hoverVal: 0.3,
  offsetVal: 25,
  updateIntervalVal: 5,
  cssVal: "#hvzoom_img_container_main {\n  position: absolute;\n  left: 0;\n  top: 0;\n  opacity: 0;\n  text-align: center;\n  background-color: rgba(255, 255, 255, 0.75);\n  box-shadow: 0px 0px 8px #000;\n  z-index: 2147483647;\n  display: none;\n}\n\n#hvzoom_img_container_caption {\n  position: absolute;\n  text-align: center;\n  background-color: rgba(0, 0, 0, 0.75);\n  color: #fff;\n  word-wrap: break-word;\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n  width: calc(100% - 4px);\n  left: 2px;\n  bottom: 2px;\n  box-sizing: border-box;\n  padding: 3px;\n  display: none;\n}\n\n#hvzoom_img_album_index {\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  box-sizing: border-box;\n  background-color: rgba(0, 0, 0, 0.75);\n  color: #fff;\n  padding: 2px;\n  border-top-right-radius: 0;\n  border-bottom-left-radius: 0;\n  display: none;\n}\n\n#hvzoom_img_container_image {\n  position: absolute;\n  left: 2px;\n  top: 2px;\n  text-align: center;\n  height: calc(100% - 4px);\n  width: calc(100% - 4px);\n}\n\n#hvzoom_img_container_video {\n  position: absolute;\n  left: 2px;\n  top: 2px;\n  height: calc(100% - 4px);\n  width: calc(100% - 4px);\n  display: none;\n}"

};

chrome.runtime.onMessage.addListener(function (request, sender, response) {
  if (request.getSettings) {
    var settings = {};
    for (var key in settingsDefault) {
      if (localStorage[key]) {
        settings[key] = localStorage[key];
      } else {
        settings[key] = settingsDefault[key];
      }
    }
    response(settings);
  }
});
