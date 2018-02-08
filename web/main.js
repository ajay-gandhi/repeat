let DURATION = 1, START = 0, END = 1, WAIT = 0;
let playing = false;

// Grab elements
const elementIds = ["selectFile", "selectFileInput", "audio", "timeSelector", "selectedTime", "togglePlayback", "waitBetweenRepeat", "fileTitle", "fileDuration"];
const SELECTORS = elementIds.reduce((memo, id) => {
  memo[id] = document.getElementById(id);
  return memo;
}, {});
SELECTORS.firstPane = document.getElementsByClassName("Pane")[0];

// Setup slider
noUiSlider.create(SELECTORS.timeSelector, {
  start: [0, 1],
  connect: true,
  range: {
    "min": [0],
    "max": [1],
  },
});
SELECTORS.timeSelector.noUiSlider.on("change", () => {
  const values = SELECTORS.timeSelector.noUiSlider.get();
  audio.currentTime = START;
  START = parseFloat(values[0]).toFixed(2);
  END = parseFloat(values[1]).toFixed(2);
});
SELECTORS.timeSelector.noUiSlider.on("update", () => {
  const values = SELECTORS.timeSelector.noUiSlider.get();
  const s = parseFloat(values[0]).toFixed(2);
  const e = parseFloat(values[1]).toFixed(2);
  SELECTORS.selectedTime.textContent = formatTime(s) + " - " + formatTime(e);
});

const updateSlider = () => {
  SELECTORS.timeSelector.noUiSlider.updateOptions({
    start: [0, DURATION],
    range: {
      "min": [0],
      "max": [DURATION],
    },
  });
}

// File upload actions
const console_log = s => eel.console_log(JSON.stringify(s));
SELECTORS.selectFileInput.addEventListener("change", () => {
  if (!SELECTORS.selectFileInput.files[0]) return;

  const file = SELECTORS.selectFileInput.files[0];
  if (SELECTORS.audio.src) URL.revokeObjectURL(SELECTORS.audio.src);
  SELECTORS.audio.src = URL.createObjectURL(file);

  SELECTORS.fileTitle.textContent = file.name;
  SELECTORS.firstPane.classList.add("Pane--advanced");
});

// Audio actions
SELECTORS.togglePlayback.addEventListener("click", togglePlaying);
window.addEventListener("keydown", (e) => {
  if (e.keyCode === 32) togglePlaying();
});
function togglePlaying () {
  if (playing) {
    playing = false;
    SELECTORS.audio.pause();
    SELECTORS.togglePlayback.textContent = "Play";
  } else {
    SELECTORS.audio.play().then(function () {
      playing = true;
      SELECTORS.togglePlayback.textContent = "Pause";
    }).catch(function (e) {
      console.error("Error playing audio", e);
    });
  }
};
SELECTORS.waitBetweenRepeat.addEventListener("change", () => {
  WAIT = parseInt(SELECTORS.waitBetweenRepeat.value, 10) * 1000;
});

// Audio events
SELECTORS.audio.addEventListener("durationchange", () => {
  END = DURATION = SELECTORS.audio.duration;
  START = 0;
  SELECTORS.fileDuration.textContent = formatTime(DURATION);
  updateSlider();
});
let repeatTimeout;
SELECTORS.audio.addEventListener("timeupdate", () => {
  if (repeatTimeout) return;
  if (SELECTORS.audio.currentTime > END || SELECTORS.audio.currentTime < START) {
    SELECTORS.audio.muted = true;
    repeatTimeout = setTimeout(() => {
      SELECTORS.audio.muted = false;
      SELECTORS.audio.currentTime = START;
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
