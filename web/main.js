let DURATION = 1, START = 0, END = 1, WAIT = 0;
let playing = false;

// Grab elements
const firstPane = document.getElementsByClassName("Pane")[0];
const selectFile = document.getElementById("selectFile");
const selectFileInput = document.getElementById("selectFileInput");
const audio = document.getElementById("audio");
const timeSelector = document.getElementById("timeSelector");
const selectedTime = document.getElementById("selectedTime");
const togglePlayback = document.getElementById("togglePlayback");
const waitBetweenRepeat = document.getElementById("waitBetweenRepeat");
const fileTitle = document.getElementById("fileTitle");
const fileDuration = document.getElementById("fileDuration");

// Setup slider
noUiSlider.create(timeSelector, {
  start: [0, 1],
  connect: true,
  range: {
    "min": [0],
    "max": [1],
  },
});
timeSelector.noUiSlider.on("change", () => {
  const values = timeSelector.noUiSlider.get();
  audio.currentTime = START;
  START = parseFloat(values[0]).toFixed(2);
  END = parseFloat(values[1]).toFixed(2);
});
timeSelector.noUiSlider.on("update", () => {
  const values = timeSelector.noUiSlider.get();
  const s = parseFloat(values[0]).toFixed(2);
  const e = parseFloat(values[1]).toFixed(2);
  selectedTime.textContent = formatTime(s) + " - " + formatTime(e);
});

const updateSlider = () => {
  timeSelector.noUiSlider.updateOptions({
    start: [0, DURATION],
    range: {
      "min": [0],
      "max": [DURATION],
    },
  });
}

// File upload actions
const console_log = s => eel.console_log(JSON.stringify(s));
selectFileInput.addEventListener("change", () => {
  if (!selectFileInput.files[0]) return;

  const file = selectFileInput.files[0];
  if (audio.src) URL.revokeObjectURL(audio.src);
  audio.src = URL.createObjectURL(file);

  fileTitle.textContent = file.name;
  firstPane.classList.add("Pane--advanced");
});

// Audio actions
togglePlayback.addEventListener("click", togglePlaying);
window.addEventListener("keydown", (e) => {
  if (e.keyCode === 32) togglePlaying();
});
function togglePlaying () {
  if (playing) {
    playing = false;
    audio.pause();
    togglePlayback.textContent = "Play";
  } else {
    audio.play().then(function () {
      playing = true;
      togglePlayback.textContent = "Pause";
    }).catch(function (e) {
      console.error("Error playing audio", e);
    });
  }
};
waitBetweenRepeat.addEventListener("change", () => {
  WAIT = parseInt(waitBetweenRepeat.value, 10) * 1000;
});

// Audio events
audio.addEventListener("durationchange", () => {
  END = DURATION = audio.duration;
  START = 0;
  fileDuration.textContent = formatTime(DURATION);
  updateSlider();
});
let repeatTimeout;
audio.addEventListener("timeupdate", () => {
  if (repeatTimeout) return;
  if (audio.currentTime > END || audio.currentTime < START) {
    audio.muted = true;
    repeatTimeout = setTimeout(() => {
      audio.muted = false;
      audio.currentTime = START;
      repeatTimeout = null;
    }, WAIT);
  }
});

// Misc functions
function formatTime (seconds) {
  let result = parseInt(seconds % 60);
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60) % 60;
    result = (m < 10 ? "0" + m : m) + ":" + (result < 10 ? "0" + result : result);
  } else {
    return "0:" + (result < 10 ? "0" + result : result);
  }

  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600) % 24;
    result = (h < 10 ? "0" + h : h) + ":" + result;
  }
  if (seconds >= 86400) {
    const d = Math.floor(seconds / 86400);
    result = d + "d, " + result;
  }
  return result.charAt(0) === "0" ? result.slice(1) : result;
};
