import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ImagePreviewModal({
  image,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  interactive = true,
  hoveredControl = null,
  onHoverControl,
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [image?.id]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
          onClick={onClose}
        >
          {failed ? (
            <div className="rounded-lg bg-white/10 px-6 py-4 text-sm text-white/80" onClick={(e) => e.stopPropagation()}>
              This image could not be loaded.
            </div>
          ) : (
            <motion.img
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              src={image.url}
              alt={image.caption ?? ""}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={() => setFailed(true)}
            />
          )}

          <button
            onClick={onClose}
            onMouseEnter={interactive ? () => onHoverControl?.("close") : undefined}
            onMouseLeave={interactive ? () => onHoverControl?.(null) : undefined}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-all duration-150 hover:scale-110 hover:bg-[#63d5f0] hover:text-[#003640]"
            style={hoveredControl === "close" ? { transform: "scale(1.1)", backgroundColor: "#63d5f0", color: "#003640" } : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" width={16} height={16}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              onMouseEnter={interactive ? () => onHoverControl?.("prev") : undefined}
              onMouseLeave={interactive ? () => onHoverControl?.(null) : undefined}
              className="absolute left-6 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-all duration-150 hover:scale-110 hover:bg-[#63d5f0] hover:text-[#003640] hover:shadow-[0_0_20px_rgba(99,213,240,0.6)]"
              style={
                hoveredControl === "prev"
                  ? { transform: "translateY(-50%) scale(1.1)", backgroundColor: "#63d5f0", color: "#003640", boxShadow: "0 0 20px rgba(99,213,240,0.6)" }
                  : undefined
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              onMouseEnter={interactive ? () => onHoverControl?.("next") : undefined}
              onMouseLeave={interactive ? () => onHoverControl?.(null) : undefined}
              className="absolute right-6 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-all duration-150 hover:scale-110 hover:bg-[#63d5f0] hover:text-[#003640] hover:shadow-[0_0_20px_rgba(99,213,240,0.6)]"
              style={
                hoveredControl === "next"
                  ? { transform: "translateY(-50%) scale(1.1)", backgroundColor: "#63d5f0", color: "#003640", boxShadow: "0 0 20px rgba(99,213,240,0.6)" }
                  : undefined
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {image.caption && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white">
              {image.caption}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
