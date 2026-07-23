export default function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/70">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
