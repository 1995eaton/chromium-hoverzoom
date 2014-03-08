var loadSettings, mouseDown, saveRelease, resetRelease;
var fade, save, save_clicked, reset_clicked, reset, fadeVal, cssVal, css, hoverDelay, settings, editor;

loadSettings = function () {
  for (var key in settings) {
    if (/true|false/.test(settings[key])) {
      document.getElementById(key).checked = Boolean(settings[key]);
    } else {
      document.getElementById(key).value = settings[key];
    }
  }
  if (editor) {
    editor.setValue(settings[key]);
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
      if (typeof(settings[key]) === "boolean") {
        localStorage[key] = document.getElementById(key).checked;
      }
      else if (key === "cssVal") {
        localStorage[key] = editor.getValue();
      } else {
        localStorage[key] = document.getElementById(key).value;
      }
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

editMode = function (e) {
  if (editor) {
    if (e.target.value === "Vim") {
      editor.setOption("keyMap", "vim");
    } else {
      editor.setOption("keyMap", "default");
    }
  }
};

document.addEventListener("DOMContentLoaded", function () {
  document.body.spellcheck = false;
  save = document.getElementById("save_button");
  reset = document.getElementById("reset_button");
  fadeVal = document.getElementById("fadeDuration");
  hoverVal = document.getElementById("hoverDelay");
  cssVal = document.getElementById("cssVal");
  dropDown = document.getElementById("edit_mode");
  chrome.runtime.sendMessage({getSettings: true}, function (s) {
    settings = s;
    loadSettings();
    editor = CodeMirror.fromTextArea(document.getElementById("cssVal"), {lineNumbers: true});
  });
  document.addEventListener("mousedown", mouseDown, false);
  dropDown.addEventListener("change", editMode, false);
  save.addEventListener("mouseup", saveRelease, false);
  reset.addEventListener("mouseup", resetRelease, false);
});
