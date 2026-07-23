import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatDuration } from "../../hooks/useVideoDuration";

const NOOP = () => {};

// Read-only counterpart to VideoPlayerModal — imperatively synced to the
// mirrored play/pause/currentTime instead of driven by native events. Muted
// since browsers block programmatic unmuted autoplay without a prior user
// gesture on this device — reasonable for a showroom display screen.
export default function MirrorVideoPlayerModal({ video, playing, currentTime, hasPrev, hasNext, hoveredControl = null }) {
  const videoRef = useRef(null);
  const [localTime, setLocalTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLocalTime(0);
    setDuration(0);
    setFailed(false);
  }, [video?.id]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (Math.abs(el.currentTime - currentTime) > 1) el.currentTime = currentTime;
  }, [currentTime]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) el.play().catch(() => {});
    else el.pause();
  }, [playing]);

  if (!video) return null;

  const progress = duration ? (localTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/90" style={{ backdropFilter: "blur(24px)" }} />

        <div className="relative flex h-full max-h-[90vh] w-full max-w-[95vw] flex-col items-center justify-center p-6">
          <div className="absolute left-10 top-8 text-left">
            <h2 className="text-3xl text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
              {video.title}
            </h2>
          </div>

          <button
            onClick={NOOP}
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
              onClick={NOOP}
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
              onClick={NOOP}
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
                muted
                className="h-full w-full object-contain"
                onError={() => setFailed(true)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onTimeUpdate={(e) => setLocalTime(e.currentTarget.currentTime)}
              />
            )}

            {!failed && (
              <div className="absolute bottom-0 left-0 right-0 p-8" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
                <div className="relative mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                  <div className="absolute left-0 top-0 h-full rounded-full bg-[#63d5f0]" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <button onClick={NOOP} className="text-white">
                      <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {playing ? "pause" : "play_arrow"}
                      </span>
                    </button>
                    <span className="text-sm font-semibold text-white">
                      {formatDuration(localTime)} / {formatDuration(duration)}
                    </span>
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
