import { useEffect, useRef } from "react";

const THROTTLE_MS = 80;

// Executive-side: emits this container's scroll position as a ratio
// (scrollTop / maxScrollTop), not raw pixels, so it lands correctly even if
// the two devices' containers render at slightly different sizes.
export function useScrollEmitter(onScroll, enabled = true) {
  const ref = useRef(null);
  const lastEmitRef = useRef(0);
  const trailingTimeoutRef = useRef(null);

  // Callers typically pass an inline `(ratio) => dispatch(...)` that gets a
  // new identity on every render (every dispatch re-renders the view that
  // owns this scroll container, including scroll:update itself). Reading it
  // through a ref — instead of putting it in the effect's dependency array —
  // means the scroll listener below is attached once and never torn down
  // mid-gesture just because the caller re-rendered.
  const onScrollRef = useRef(onScroll);
  onScrollRef.current = onScroll;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const emitNow = () => {
      const max = el.scrollHeight - el.clientHeight;
      onScrollRef.current?.(max > 0 ? el.scrollTop / max : 0);
    };

    const handleScroll = () => {
      const now = Date.now();
      // Throttle for a responsive live feel during the gesture...
      if (now - lastEmitRef.current >= THROTTLE_MS) {
        lastEmitRef.current = now;
        emitNow();
      }
      // ...but always schedule a trailing flush, so the exact resting
      // position is guaranteed to reach the display even if the gesture
      // ends inside a throttle window (otherwise the last few pixels of
      // every scroll never get mirrored).
      if (trailingTimeoutRef.current) clearTimeout(trailingTimeoutRef.current);
      trailingTimeoutRef.current = setTimeout(() => {
        lastEmitRef.current = Date.now();
        emitNow();
      }, THROTTLE_MS);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (trailingTimeoutRef.current) clearTimeout(trailingTimeoutRef.current);
    };
  }, [enabled]);

  return ref;
}

// Display-side: applies the mirrored ratio programmatically. The caller is
// responsible for also disabling pointer events on this element (e.g.
// `pointer-events-none`) — the display is a pure mirror, so this container
// should only ever move because the executive moved it, never from a local
// wheel/touch scroll on the display itself.
export function useScrollReceiver(ratio, enabled = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    el.scrollTop = (ratio ?? 0) * max;
  }, [ratio, enabled]);

  return ref;
}
