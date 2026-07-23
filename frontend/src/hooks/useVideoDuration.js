import { useEffect, useState } from "react";

// Lazily reads the real duration from the video file's own metadata (via a
// hidden, unmounted video element) rather than showing a fabricated number —
// we have no duration column in the DB, but the file itself always knows.
export function useVideoDuration(url) {
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    if (!url) return;
    setDuration(null);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.src = url;
    const handleLoaded = () => setDuration(el.duration);
    el.addEventListener("loadedmetadata", handleLoaded);
    return () => {
      el.removeEventListener("loadedmetadata", handleLoaded);
      el.src = "";
    };
  }, [url]);

  return duration;
}

export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
