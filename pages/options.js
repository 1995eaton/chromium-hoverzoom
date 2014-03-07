var loadSettings, mouseDown, saveRelease, resetRelease;
var fade, save, save_clicked, reset_clicked, reset, fadeVal, cssVal, css, hoverDelay, settings;

loadSettings = function () {
  for (var key in settings) {
    document.getElementById(key).value = settings[key];
  }
};

resetRelease = function () {
  if (reset_clicked) {
    for (var key in settings) {
      localStorage[key] = "";
    }
    loadSettings();
  }
};

saveRelease = function (e) {
  if (save_clicked) {
    for (var key in settings) {
      localStorage[key] = document.getElementById(key).value;
    }
  }
};

mouseDown = function (e) {
  save_clicked = false;
  reset_clicked = false;
  if (e.target.id === "save_button") {
    save_clicked = true;
  } else if (e.target.id === "reset_button") {
    reset_clicked = true;
  }
};

document.addEventListener("DOMContentLoaded", function () {
  document.body.spellcheck = false;
  save = document.getElementById("save_button");
  reset = document.getElementById("reset_button");
  fadeVal = document.getElementById("fadeDuration");
  hoverVal = document.getElementById("hoverDelay");
  cssVal = document.getElementById("css");
  chrome.runtime.sendMessage({getSettings: true}, function (s) {
    settings = s;
    loadSettings();
  });
  document.addEventListener("mousedown", mouseDown, false);
  save.addEventListener("mouseup", saveRelease, false);
  reset.addEventListener("mouseup", resetRelease, false);
});
