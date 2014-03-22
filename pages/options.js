var loadSettings, mouseDown, saveRelease, resetRelease, fetchSettings;
var fade, save, save_clicked, reset_clicked, reset, fadeVal, cssVal, css, hoverDelay, settings, editor;

loadSettings = function () {
  for (var key in settings) {
    if (/true|false/.test(settings[key])) {
      if (settings[key] === "true") {
        document.getElementById(key).checked = true;
      } else {
        document.getElementById(key).checked = false;
      }
    } else {
      console.log(settings[key]);
      document.getElementById(key).value = settings[key];
    }
  }
  if (editor) {
    editor.setValue(settings["cssVal"]);
  }
};

resetRelease = function () {
  if (reset_clicked) {
    for (var key in settings) {
      localStorage[key] = "";
    }
    fetchSettings();
  }
};

saveRelease = function (e) {
  if (save_clicked) {
    for (var key in settings) {
      if (/true|false/.test(settings[key])) {
        if (document.getElementById(key).checked) {
          localStorage[key] = "true";
        } else {
          localStorage[key] = "false";
        }
      }
      else if (key === "cssVal") {
        localStorage[key] = editor.getValue();
      } else {
        localStorage[key] = document.getElementById(key).value;
      }
    }
  }
  save.innerText = "Saved";
  setTimeout(function () {
    save.innerText = "Save";
  }, 3000);
};

mouseDown = function (e) {
  save_clicked = false;
  reset_clicked = false;
  if (e.target.id === "save_button") {
    save_clicked = true;
  } else if (e.target.id === "reset_button") {
    reset_clicked = true;
  }
  save.innerText = "Save";
};

fetchSettings = function (callback) {
  chrome.runtime.sendMessage({getSettings: true}, function (s) {
    console.log(s);
    settings = s;
    console.log(s);
    loadSettings();
    if (callback) {
      callback();
    }
  });
};

var activeDescription;

var mouseOver = function(e) {
  if (!activeDescription && e.target.className === "help" && e.target.firstChild) {
    if (e.target.firstElementChild.className === "description") {
  console.log(e);
      if (e.target.firstElementChild.style.display === "none") {
        setTimeout(function() {
          activeDescription = e.target.firstElementChild;
        }, 550);
        e.target.firstElementChild.style.display = "block";
      }
    }
  } else if (activeDescription && e.target.className !== "help" && e.target.className !== "description") {
    activeDescription.style.display = "none";
    activeDescription = null;
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
  fetchSettings(function () {
    editor = CodeMirror.fromTextArea(document.getElementById("cssVal"), {lineNumbers: true});
  });
  document.addEventListener("mousedown", mouseDown, false);
  document.addEventListener("mouseover", mouseOver, false);
  dropDown.addEventListener("change", editMode, false);
  save.addEventListener("mouseup", saveRelease, false);
  reset.addEventListener("mouseup", resetRelease, false);
});
