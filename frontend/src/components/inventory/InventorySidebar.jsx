import { useMemo, useState } from "react";
import UnitCard from "./UnitCard";
import { useScrollEmitter, useScrollReceiver } from "../../hooks/useScrollMirror";

export default function InventorySidebar({
  towers,
  selectedTowerId,
  onSelectTower,
  units,
  selectedUnitId,
  hoveredUnitId,
  onHoverUnit,
  onSelectUnit,
  interactive = true,
  scrollRatio,
  onScrollChange,
}) {
  const [sortDesc, setSortDesc] = useState(false);

  // Executive: emits real scroll. Display: applies the mirrored ratio and
  // never emits — only one of these two refs actually attaches below.
  const emitterRef = useScrollEmitter(onScrollChange, interactive);
  const receiverRef = useScrollReceiver(scrollRatio, !interactive);
  const listRef = interactive ? emitterRef : receiverRef;

  const sortedUnits = useMemo(() => {
    const copy = [...units];
    copy.sort((a, b) => (sortDesc ? b.unitNumber.localeCompare(a.unitNumber) : a.unitNumber.localeCompare(b.unitNumber)));
    return copy;
  }, [units, sortDesc]);

  return (
    <section
      className="z-30 flex h-full w-[380px] flex-shrink-0 flex-col border-r border-white/5"
      style={{ background: "rgba(26,28,31,0.7)", backdropFilter: "blur(20px)" }}
    >
      <div className="border-b border-white/5 p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#63d5f0]">filter_list</span>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#63d5f0]"></h2>
        </div>

        <div className="flex gap-1 rounded-lg bg-[#0c0e11] p-1">
          {towers.map((tower) => {
            const isActive = tower.id === selectedTowerId;
            return (
              <button
                key={tower.id}
                onClick={interactive ? () => onSelectTower(tower.id) : undefined}
                className="flex-1 rounded py-2 text-xs font-semibold transition-colors"
                style={{
                  background: isActive ? "rgba(99,213,240,0.2)" : "transparent",
                  color: isActive ? "#63d5f0" : "#bcc9cc",
                  boxShadow: isActive ? "0 0 15px rgba(99,213,240,0.4)" : "none",
                }}
              >
                {tower.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#1a1c1f]/50 px-6 py-4">
        <span className="text-sm text-[#e2e2e6]">{units.length} Units Found</span>
        <button
          onClick={interactive ? () => setSortDesc((s) => !s) : undefined}
          className="flex items-center gap-1 text-[#63d5f0]"
        >
          <span className="text-xs">Sort: {sortDesc ? "Z-A" : "A-Z"}</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
      </div>

      <div
        ref={listRef}
        className="styled-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-4"
        style={{ pointerEvents: interactive ? "auto" : "none" }}
      >
        {sortedUnits.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            isSelected={unit.id === selectedUnitId || unit.id === hoveredUnitId}
            onHover={onHoverUnit}
            onClick={onSelectUnit}
          />
        ))}
      </div>
    </section>
  );
}
