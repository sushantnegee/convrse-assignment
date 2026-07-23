import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatDuration } from "../../hooks/useVideoDuration";

// Custom player UI (not native <video controls>) — center play button,
// scrubber, volume/time, prev/next between videos. Closed-caption/settings/
// fullscreen buttons stay decorative, same treatment as Inventory's
// camera/dark-mode icons: visual fidelity to the source design without
// inventing features out of scope.
export default function VideoPlayerModal({
  video,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  onPlay,
  onPause,
  onTimeUpdate,
  hoveredControl = null,
  onHoverControl,
}) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setFailed(false);
  }, [video?.id]);

  if (!video) return null;

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const handleScrub = (e) => {
    const el = videoRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    el.currentTime = newTime;
    setCurrentTime(newTime);
    onTimeUpdate?.(newTime);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center"
      >
        <div
          className="absolute inset-0 bg-black/90"
          style={{ backdropFilter: "blur(24px)" }}
          onClick={onClose}
        />

        <div className="relative flex h-full max-h-[90vh] w-full max-w-[95vw] flex-col items-center justify-center p-6">
          <div className="absolute left-10 top-8 text-left">
            <h2 className="text-3xl text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
              {video.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            onMouseEnter={() => onHoverControl?.("close")}
            onMouseLeave={() => onHoverControl?.(null)}
            className="absolute right-10 top-8 flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-150"
            style={
              hoveredControl === "close"
                ? { transform: "scale(1.1)", backgroundColor: "#63d5f0", color: "#003640", backdropFilter: "blur(20px)" }
                : { background: "rgba(26,28,31,0.7)", backdropFilter: "blur(20px)" }
            }
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          {hasPrev && (
            <button
              onClick={onPrev}
              onMouseEnter={() => onHoverControl?.("prev")}
              onMouseLeave={() => onHoverControl?.(null)}
              className="absolute left-6 top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition-all duration-150"
              style={
                hoveredControl === "prev"
                  ? {
                      transform: "translateY(-50%) scale(1.1)",
                      backgroundColor: "#63d5f0",
                      color: "#003640",
                      boxShadow: "0 0 20px rgba(99,213,240,0.6)",
                      backdropFilter: "blur(20px)",
                    }
                  : { background: "rgba(26,28,31,0.7)", backdropFilter: "blur(20px)" }
              }
            >
              <span className="material-symbols-outlined text-4xl">chevron_left</span>
            </button>
          )}
          {hasNext && (
            <button
              onClick={onNext}
              onMouseEnter={() => onHoverControl?.("next")}
              onMouseLeave={() => onHoverControl?.(null)}
              className="absolute right-6 top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition-all duration-150"
              style={
                hoveredControl === "next"
                  ? {
                      transform: "translateY(-50%) scale(1.1)",
                      backgroundColor: "#63d5f0",
                      color: "#003640",
                      boxShadow: "0 0 20px rgba(99,213,240,0.6)",
                      backdropFilter: "blur(20px)",
                    }
                  : { background: "rgba(26,28,31,0.7)", backdropFilter: "blur(20px)" }
              }
            >
              <span className="material-symbols-outlined text-4xl">chevron_right</span>
            </button>
          )}

          <div
            className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/5"
            style={{ background: "rgba(26,28,31,0.7)", backdropFilter: "blur(20px)", boxShadow: "0 0 80px rgba(0,0,0,0.8)" }}
          >
            {failed ? (
              <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
                This video could not be loaded.
              </div>
            ) : (
              <video
                ref={videoRef}
                key={video.id}
                src={video.url}
                muted={muted}
                autoPlay
                className="h-full w-full object-contain"
                onClick={togglePlay}
                onError={() => setFailed(true)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onPlay={(e) => {
                  setPlaying(true);
                  onPlay?.(e.currentTarget.currentTime);
                }}
                onPause={(e) => {
                  setPlaying(false);
                  onPause?.(e.currentTarget.currentTime);
                }}
                onTimeUpdate={(e) => {
                  setCurrentTime(e.currentTarget.currentTime);
                  onTimeUpdate?.(e.currentTarget.currentTime);
                }}
              />
            )}

            {!failed && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex cursor-pointer items-center justify-center"
                style={{ pointerEvents: playing ? "none" : "auto" }}
              >
                {!playing && (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#63d5f0]/50 text-[#63d5f0]" style={{ background: "rgba(99,213,240,0.2)", backdropFilter: "blur(20px)" }}>
                    <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </div>
                )}
              </div>
            )}

            {!failed && (
              <div className="absolute bottom-0 left-0 right-0 p-8" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
                <div onClick={handleScrub} className="relative mb-6 h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20">
                  <div className="absolute left-0 top-0 h-full rounded-full bg-[#63d5f0]" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <button onClick={togglePlay} className="text-white transition-colors hover:text-[#63d5f0]">
                      <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {playing ? "pause" : "play_arrow"}
                      </span>
                    </button>
                    {hasNext && (
                      <button onClick={onNext} className="text-white transition-colors hover:text-[#63d5f0]">
                        <span className="material-symbols-outlined text-3xl">skip_next</span>
                      </button>
                    )}
                    <button onClick={() => setMuted((m) => !m)} className="flex items-center gap-2 text-white transition-colors hover:text-[#63d5f0]">
                      <span className="material-symbols-outlined text-2xl">{muted ? "volume_off" : "volume_up"}</span>
                    </button>
                    <span className="text-sm font-semibold text-white">
                      {formatDuration(currentTime)} / {formatDuration(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-white">
                    <span className="material-symbols-outlined text-2xl opacity-60">closed_caption</span>
                    <span className="material-symbols-outlined text-2xl opacity-60">settings</span>
                    <span className="material-symbols-outlined text-2xl opacity-60">fullscreen</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
