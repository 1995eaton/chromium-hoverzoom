var settingsDefault = {

  fadeVal: 0.2,
  hoverVal: 0.3,
  offsetVal: 25,
  addHistory: "true",
  blacklists: "",
  scrollAlbum: "false",
cssVal: "#hvzoom_img_container_main {\n text-align: center;\n background-color: rgba(0,0,0,0.75);\n box-shadow: 0 0 15px rgba(0,0,0,0.5);\n}\n\n#hvzoom_img_container_caption {\n width: 100%; left: 0;\n bottom: 0;\n padding: 3px;\n background-color: rgba(0, 0, 0, 0.75);\n color: #fff;\n box-sizing: border-box;\n word-wrap: break-word;\n}\n\n#hvzoom_img_album_index {\n top: 0px; left: 0px;\n padding: 2px;\n background-color: rgba(0, 0, 0, 0.75);\n color: #fff;\n box-sizing: border-box;\n}\n\n#hvzoom_img_container_image {\n height: 100%; top: 0;\n width: 100%; left: 0;\n}\n\n#hvzoom_img_container_video {\n height: 100%; top: 0;\n width: 100%; left: 0;\n}",
  updateIntervalVal: 5
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
