let DURATION = 1, START = 0, END = 1, WAIT = 0;
let playing = false;

// Grab elements
const selectFile = document.getElementById("selectFile")
const audio = document.getElementById("audio");
const timeSelector = document.getElementById("timeSelector");
const togglePlayback = document.getElementById("togglePlayback");
const waitBetweenRepeat = document.getElementById("waitBetweenRepeat");

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

selectFile.addEventListener("change", () => {
  if (!selectFile.files[0]) return;
  if (audio.src) URL.revokeObjectURL(audio.src);
  audio.src = URL.createObjectURL(selectFile.files[0]);
});

// Audio actions
togglePlayback.addEventListener("click", () => {
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
});
waitBetweenRepeat.addEventListener("change", () => {
  WAIT = parseInt(waitBetweenRepeat.value, 10) * 1000;
});

// Audio events
audio.addEventListener("durationchange", () => {
  END = DURATION = audio.duration;
  START = 0;
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
