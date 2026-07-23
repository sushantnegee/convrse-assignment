import ImageWithFallback from "../common/ImageWithFallback";
import { useVideoDuration, formatDuration } from "../../hooks/useVideoDuration";

// A single tile in the video grid. `variant` controls treatment: 'feature'
// gets the big badge + title + duration overlay, 'medium' gets a smaller
// title + duration caption.
export default function VideoTile({ video, variant = "medium", onOpen, interactive = true, isHovered = false, onHover }) {
  const duration = useVideoDuration(video.url);

  return (
    <button
      onClick={interactive ? () => onOpen(video.id) : undefined}
      onMouseEnter={interactive ? () => onHover?.(video.id) : undefined}
      onMouseLeave={interactive ? () => onHover?.(null) : undefined}
      className="group relative h-full w-full overflow-hidden rounded-xl border border-white/5 text-left transition-all duration-200 hover:border-[#63d5f0]/70 hover:shadow-[0_0_28px_rgba(99,213,240,0.4)]"
      style={{
        cursor: interactive ? "pointer" : "default",
        ...(isHovered ? { borderColor: "rgba(99,213,240,0.7)", boxShadow: "0 0 28px rgba(99,213,240,0.4)" } : {}),
      }}
    >
      <ImageWithFallback
        src={video.thumbnailUrl}
        alt={video.title ?? ""}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        style={isHovered ? { transform: "scale(1.05)" } : undefined}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2) 40%, transparent 70%)" }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100"
        style={isHovered ? { opacity: 1 } : undefined}
      >
        <div
          className="flex items-center justify-center rounded-full text-[#003640] shadow-2xl"
          style={{ width: variant === "feature" ? 80 : 56, height: variant === "feature" ? 80 : 56, background: "rgba(99,213,240,0.9)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: variant === "feature" ? 40 : 28, fontVariationSettings: "'FILL' 1" }}>
            play_arrow
          </span>
        </div>
      </div>

      <div className={variant === "feature" ? "absolute bottom-0 left-0 w-full p-8" : "absolute bottom-0 left-0 p-6"}>
        {variant === "feature" && (
          <span className="mb-4 inline-block rounded-full border border-[#63d5f0]/30 bg-[#63d5f0]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#63d5f0] backdrop-blur-md">
            Featured Tour
          </span>
        )}
        <h3
          className={variant === "feature" ? "mb-2 text-3xl text-white" : "mb-1 text-lg text-white"}
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
        >
          {video.title}
        </h3>
        <div className="flex items-center gap-1 text-white/60">
          <span className="material-symbols-outlined text-sm">schedule</span>
          <span className="text-xs">{formatDuration(duration)}</span>
        </div>
      </div>
    </button>
  );
}
