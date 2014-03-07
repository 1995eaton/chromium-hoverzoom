var loadSettings, assignValues, mouseDown, saveRelease;
var fade, save, save_clicked, fadeDuration;

loadSettings = function () {
  if (!localStorage["fadeDuration"]) {
    fadeDuration = 0.2;
  } else {
    fadeDuration = parseFloat(localStorage["fadeDuration"]);
  }
};

assignValues = function () {
  fade.value = fadeDuration;
};

saveRelease = function (e) {
  if (save_clicked) {
    console.log(fade.value);
    localStorage["fadeDuration"] = fade.value;
  }
};

mouseDown = function (e) {
  if (e.target.id === "save_button") {
    save_clicked = true;
  } else {
    save_clicked = false;
  }
};

document.addEventListener("DOMContentLoaded", function () {
  save = document.getElementById("save_button");
  fade = document.getElementById("fadeDuration");
  loadSettings();
  assignValues();
  document.addEventListener("mousedown", mouseDown, false);
  save.addEventListener("mouseup", saveRelease, false);
});
