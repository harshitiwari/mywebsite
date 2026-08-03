(function () {
  const root = document.documentElement;
  const canvas = document.getElementById("lorenz-canvas");
  const lorenzButton = document.getElementById("lorenz-toggle");
  const musicButton = document.getElementById("music-toggle");
  const music = document.getElementById("ambient-music");

  if (!lorenzButton || !musicButton || !music) return;

  function getStoredValue(storage, key) {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  function setStoredValue(storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch {
      // Storage can be unavailable in private browsing or strict privacy modes.
    }
  }

  function setLorenzEnabled(enabled, persist) {
    root.classList.toggle("lorenz-disabled", !enabled);
    if (canvas) canvas.hidden = !enabled;

    lorenzButton.setAttribute("aria-pressed", String(enabled));
    lorenzButton.setAttribute(
      "aria-label",
      enabled ? "Turn Lorenz background off" : "Turn Lorenz background on",
    );
    lorenzButton.title = enabled
      ? "Turn Lorenz background off"
      : "Turn Lorenz background on";
    lorenzButton.innerHTML = enabled
      ? '<i class="fa-solid fa-water" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>';

    if (persist) {
      setStoredValue(localStorage, "flow-background-enabled", String(enabled));
    }

    window.dispatchEvent(
      new CustomEvent("lorenz-toggle", { detail: { enabled } }),
    );
  }

  const savedLorenzPreference =
    getStoredValue(localStorage, "flow-background-enabled") ??
    getStoredValue(localStorage, "lorenz-enabled");
  setLorenzEnabled(savedLorenzPreference !== "false", false);

  lorenzButton.addEventListener("click", () => {
    const isEnabled = lorenzButton.getAttribute("aria-pressed") === "true";
    setLorenzEnabled(!isEnabled, true);
  });

  music.volume = 1;

  function updateMusicButton(isPlaying) {
    musicButton.setAttribute("aria-pressed", String(isPlaying));
    musicButton.setAttribute(
      "aria-label",
      isPlaying
        ? "Pause Mozart Piano Concerto No. 21"
        : "Play Mozart Piano Concerto No. 21",
    );
    musicButton.title = isPlaying
      ? "Pause Mozart Piano Concerto No. 21"
      : "Play Mozart Piano Concerto No. 21";
    musicButton.innerHTML = isPlaying
      ? '<i class="fa-solid fa-pause" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-music" aria-hidden="true"></i>';
  }

  const savedMusicTime = Number(
    getStoredValue(sessionStorage, "ambient-music-time"),
  );
  let resumeMusicOnNavigation =
    getStoredValue(sessionStorage, "ambient-music-playing") === "true";

  function restoreMusicPosition() {
    if (
      Number.isFinite(savedMusicTime) &&
      savedMusicTime > 0 &&
      savedMusicTime < music.duration
    ) {
      music.currentTime = savedMusicTime;
    }
  }

  async function restoreMusicSession() {
    restoreMusicPosition();
    if (!resumeMusicOnNavigation) return;

    try {
      await music.play();
    } catch {
      // Some browsers still require one click after a full navigation.
      updateMusicButton(false);
    }
  }

  if (music.readyState >= HTMLMediaElement.HAVE_METADATA) {
    restoreMusicSession();
  } else {
    music.addEventListener("loadedmetadata", restoreMusicSession, {
      once: true,
    });
  }

  musicButton.addEventListener("click", async () => {
    if (!music.paused) {
      resumeMusicOnNavigation = false;
      setStoredValue(sessionStorage, "ambient-music-playing", "false");
      music.pause();
      return;
    }

    musicButton.disabled = true;
    try {
      await music.play();
    } catch {
      resumeMusicOnNavigation = false;
      setStoredValue(sessionStorage, "ambient-music-playing", "false");
      musicButton.title = "Playback was blocked; click to try again";
    } finally {
      musicButton.disabled = false;
    }
  });

  music.addEventListener("play", () => {
    resumeMusicOnNavigation = true;
    setStoredValue(sessionStorage, "ambient-music-playing", "true");
    updateMusicButton(true);
  });
  music.addEventListener("pause", () => updateMusicButton(false));

  let lastSavedSecond = -1;
  music.addEventListener("timeupdate", () => {
    const currentSecond = Math.floor(music.currentTime);
    if (currentSecond !== lastSavedSecond) {
      lastSavedSecond = currentSecond;
      setStoredValue(
        sessionStorage,
        "ambient-music-time",
        String(music.currentTime),
      );
    }
  });

  window.addEventListener("pagehide", () => {
    setStoredValue(
      sessionStorage,
      "ambient-music-time",
      String(music.currentTime),
    );
    setStoredValue(
      sessionStorage,
      "ambient-music-playing",
      String(resumeMusicOnNavigation),
    );
  });

  if ("mediaSession" in navigator && "MediaMetadata" in window) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Piano Concerto No. 21 in C major, K. 467",
      artist: "Wolfgang Amadeus Mozart",
      album: "Classical background music",
    });
  }
})();
