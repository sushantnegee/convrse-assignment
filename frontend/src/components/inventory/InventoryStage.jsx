import TowerSvgOverlay from "./TowerSvgOverlay";

// Wraps the existing tower + SVG polygon overlay (unchanged). The tower
// fits to the available height (margins on all sides via p-10), with width
// auto-derived from its own aspect ratio — see TowerSvgOverlay.jsx.
export default function InventoryStage({ tower, units, hoveredUnitId, selectedUnitId, onHoverUnit, onSelectUnit, interactive = true }) {
  return (
    <section
      className="relative h-full flex-1 overflow-hidden bg-[#0c0e11]"
      style={{ pointerEvents: interactive ? "auto" : "none" }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-10">
        <TowerSvgOverlay
          tower={tower}
          units={units}
          hoveredUnitId={hoveredUnitId}
          selectedUnitId={selectedUnitId}
          onHoverUnit={onHoverUnit}
          onSelectUnit={onSelectUnit}
        />
      </div>
    </section>
  );
}
