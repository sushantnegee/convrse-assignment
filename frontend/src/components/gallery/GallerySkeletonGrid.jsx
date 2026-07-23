function SkeletonBlock({ className }) {
  return (
    <div
      className={`relative animate-pulse overflow-hidden rounded-xl border border-white/5 ${className}`}
      style={{ background: "rgba(26,28,31,0.7)", backdropFilter: "blur(20px)" }}
    >
      <div className="absolute inset-0 bg-white/5" />
      <div className="absolute bottom-4 left-4 right-4 z-10 space-y-3">
        <div className="h-4 w-2/3 rounded bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function GallerySkeletonGrid() {
  return (
    <div className="grid grid-cols-12 gap-6 pb-24">
      <SkeletonBlock className="col-span-8 h-[400px]" />
      <div className="col-span-4 flex h-[400px] flex-col gap-6">
        <SkeletonBlock className="flex-1" />
        <SkeletonBlock className="flex-1" />
      </div>
      <SkeletonBlock className="col-span-4 h-[240px]" />
      <SkeletonBlock className="col-span-4 h-[240px]" />
      <SkeletonBlock className="col-span-4 h-[240px]" />
    </div>
  );
}
