import { useEffect, useRef } from "react";

const THROTTLE_MS = 50;

// Tracks the executive's own mouse position (as ratios of the viewport, not
// raw pixels, so it maps onto the display's own screen regardless of actual
// resolution) and dispatches it — so the display can render a matching
// pointer, letting the client see exactly where the sales person is
// gesturing, not just which unit/image is selected.
export function usePointerEmitter(dispatch) {
  const lastEmitRef = useRef(0);

  useEffect(() => {
    const handleMove = (e) => {
      const now = Date.now();
      if (now - lastEmitRef.current < THROTTLE_MS) return;
      lastEmitRef.current = now;
      dispatch({
        type: "pointer:move",
        xRatio: e.clientX / window.innerWidth,
        yRatio: e.clientY / window.innerHeight,
      });
    };

    const handleLeave = () => dispatch({ type: "pointer:leave" });

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("blur", handleLeave);
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("blur", handleLeave);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [dispatch]);
}
