// Renders the executive's live cursor position on the display, so the
// client can see exactly where the sales person is pointing — not just
// which unit/image ends up selected. Purely visual, never emits anything.
export default function MirrorPointer({ pointer }) {
  if (!pointer?.visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-[600] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pointer.xRatio * 100}%`, top: `${pointer.yRatio * 100}%` }}
    >
      <div className="relative flex h-6 w-6 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#63d5f0] opacity-50" />
        <span
          className="relative inline-flex h-3 w-3 rounded-full bg-[#63d5f0]"
          style={{ boxShadow: "0 0 14px 4px rgba(99,213,240,0.8)" }}
        />
      </div>
    </div>
  );
}
