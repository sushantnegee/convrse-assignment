import { useMemo, useState } from "react";
import UnitCard from "./UnitCard";
import { useScrollEmitter, useScrollReceiver } from "../../hooks/useScrollMirror";

const STATUS_OPTIONS = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "booked", label: "Booked" },
];

function FilterPill({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1 text-[11px] font-semibold transition-colors"
      style={{
        background: isActive ? "rgba(99,213,240,0.2)" : "rgba(255,255,255,0.05)",
        color: isActive ? "#63d5f0" : "#bcc9cc",
        border: isActive ? "1px solid rgba(99,213,240,0.5)" : "1px solid transparent",
      }}
    >
      {label}
    </button>
  );
}

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
  statusFilter = "all",
  configFilter = "all",
  onStatusFilterChange,
  onConfigFilterChange,
}) {
  const [sortDesc, setSortDesc] = useState(false);

  // Executive: emits real scroll. Display: applies the mirrored ratio and
  // never emits — only one of these two refs actually attaches below.
  const emitterRef = useScrollEmitter(onScrollChange, interactive);
  const receiverRef = useScrollReceiver(scrollRatio, !interactive);
  const listRef = interactive ? emitterRef : receiverRef;

  const configOptions = useMemo(() => ["all", ...Array.from(new Set(units.map((u) => u.config))).sort()], [units]);

  const filteredUnits = useMemo(
    () =>
      units.filter(
        (u) => (statusFilter === "all" || u.status === statusFilter) && (configFilter === "all" || u.config === configFilter)
      ),
    [units, statusFilter, configFilter]
  );

  const sortedUnits = useMemo(() => {
    const copy = [...filteredUnits];
    copy.sort((a, b) => (sortDesc ? b.unitNumber.localeCompare(a.unitNumber) : a.unitNumber.localeCompare(b.unitNumber)));
    return copy;
  }, [filteredUnits, sortDesc]);

  return (
    <section
      className="z-30 flex h-[45vh] w-full flex-shrink-0 flex-col border-b border-r border-white/5 lg:h-full lg:w-[380px] lg:border-b-0"
      style={{ background: "rgba(26,28,31,0.7)", backdropFilter: "blur(20px)" }}
    >
      <div className="border-b border-white/5 p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#63d5f0]">filter_list</span>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#63d5f0]">Filters</h2>
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

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <FilterPill
              key={opt.id}
              label={opt.label}
              isActive={statusFilter === opt.id}
              onClick={interactive ? () => onStatusFilterChange?.(opt.id) : undefined}
            />
          ))}
        </div>

        {configOptions.length > 2 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {configOptions.map((config) => (
              <FilterPill
                key={config}
                label={config === "all" ? "All Types" : config}
                isActive={configFilter === config}
                onClick={interactive ? () => onConfigFilterChange?.(config) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-[#1a1c1f]/50 px-6 py-4">
        <span className="text-sm text-[#e2e2e6]">{sortedUnits.length} Units Found</span>
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
        {sortedUnits.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#bcc9cc]">No units match these filters.</div>
        ) : (
          sortedUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              isSelected={unit.id === selectedUnitId || unit.id === hoveredUnitId}
              onHover={onHoverUnit}
              onClick={onSelectUnit}
            />
          ))
        )}
      </div>
    </section>
  );
}
