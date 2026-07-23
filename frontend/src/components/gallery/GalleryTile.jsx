import { useState } from "react";

// A single bento-grid cell. `variant` controls the visual treatment:
// 'feature' gets the gradient + badge + title overlay (the big card),
// everything else is a plain image with a hover-lighten effect, matching
// the source design exactly.
export default function GalleryTile({ image, variant = "small", onOpen, interactive = true, isHovered = false, onHover }) {
  const [failed, setFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  const handleRetry = (e) => {
    e.stopPropagation();
    setFailed(false);
    setRetryToken((t) => t + 1);
  };

  if (failed) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center rounded-xl border p-6 text-center"
        style={{ background: "rgba(26,28,31,0.7)", backdropFilter: "blur(20px)", borderColor: "rgba(255,180,171,0.3)" }}
      >
        <span className="material-symbols-outlined mb-2 text-4xl text-[#ffb4ab]">error_outline</span>
        <h4 className="text-sm font-semibold text-[#e2e2e6]">Stream Unavailable</h4>
        <p className="mt-1 text-xs text-[#bcc9cc]">Failed to load asset. Please try again.</p>
        <button
          onClick={handleRetry}
          className="mt-4 rounded-full border border-[#3d494c] bg-[#282a2d] px-4 py-2 text-xs font-semibold text-[#e2e2e6] transition-all hover:bg-[#333538]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={interactive ? () => onOpen(image.id) : undefined}
      onMouseEnter={interactive ? () => onHover?.(image.id) : undefined}
      onMouseLeave={interactive ? () => onHover?.(null) : undefined}
      className="group relative h-full w-full overflow-hidden rounded-xl border border-white/5 text-left transition-all duration-200 hover:border-[#63d5f0]/70 hover:shadow-[0_0_28px_rgba(99,213,240,0.4)]"
      style={{
        background: "rgba(26,28,31,0.7)",
        backdropFilter: "blur(20px)",
        cursor: interactive ? "pointer" : "default",
        ...(isHovered ? { borderColor: "rgba(99,213,240,0.7)", boxShadow: "0 0 28px rgba(99,213,240,0.4)" } : {}),
      }}
    >
      <img
        src={`${image.url}${retryToken ? `?retry=${retryToken}` : ""}`}
        alt={image.caption ?? ""}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        style={isHovered ? { transform: "scale(1.05)" } : undefined}
        onError={() => setFailed(true)}
      />

      {variant === "feature" ? (
        <>
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 z-20">
            <span className="mb-2 inline-block rounded-full bg-[#63d5f0] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#003640]">
              Featured Detail
            </span>
            <h3
              className="text-2xl text-white"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
            >
              {image.caption}
            </h3>
          </div>
        </>
      ) : (
        <div
          className="absolute inset-0 bg-black/20 transition-all group-hover:bg-transparent"
          style={isHovered ? { backgroundColor: "transparent" } : undefined}
        />
      )}
    </button>
  );
}
