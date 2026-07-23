import { useEffect, useRef, useState } from "react";
import UnitHoverCard from "./UnitHoverCard";
import ImageWithFallback from "../common/ImageWithFallback";

const STATUS_STYLE = {
  available: {
    fill: "rgba(59,130,246,0.16)",
    fillHover: "rgba(99,213,240,0.65)",
    stroke: "rgba(147,197,253,0.9)",
  },
  booked: {
    fill: "rgba(239,68,68,0.28)",
    stroke: "rgba(252,165,165,0.85)",
  },
};

// The container's aspect-ratio is pinned to the tower image's own natural
// pixel size (stored in the DB alongside it), and the SVG viewBox uses that
// same pixel size — so polygon points authored against the image's
// coordinate space stay aligned at any rendered container size, with no
// letterboxing or distortion.
//
// The hover card is positioned from the hovered polygon's own bounding rect
// rather than the mouse cursor, so it's correct whether hoveredUnitId comes
// from a real local hover (executive) or from mirrored state with no mouse
// involved at all (display).
export default function TowerSvgOverlay({ tower, units, hoveredUnitId, selectedUnitId, onHoverUnit, onSelectUnit }) {
  const [hoverPos, setHoverPos] = useState(null);
  const polygonRefs = useRef(new Map());
  const hoveredUnit = units.find((u) => u.id === hoveredUnitId) ?? null;

  useEffect(() => {
    if (!hoveredUnitId) {
      setHoverPos(null);
      return;
    }
    const el = polygonRefs.current.get(hoveredUnitId);
    if (!el) {
      setHoverPos(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setHoverPos({ x: rect.right, y: rect.top });
  }, [hoveredUnitId]);

  return (
    <div className="relative h-full" style={{ width: "auto", aspectRatio: `${tower.imageWidth} / ${tower.imageHeight}` }}>
      <ImageWithFallback
        src={tower.imageUrl}
        alt={tower.name}
        draggable={false}
        className="block h-full w-full select-none rounded-xl"
      />
      <svg
        viewBox={`0 0 ${tower.imageWidth} ${tower.imageHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
      >
        {units.map((unit) => {
          const isBooked = unit.status === "booked";
          const style = STATUS_STYLE[isBooked ? "booked" : "available"];
          const isHovered = unit.id === hoveredUnitId;
          const isSelected = unit.id === selectedUnitId;

          return (
            <polygon
              key={unit.id}
              ref={(el) => {
                if (el) polygonRefs.current.set(unit.id, el);
                else polygonRefs.current.delete(unit.id);
              }}
              points={unit.polygonPoints}
              fill={isHovered && !isBooked ? style.fillHover : style.fill}
              stroke={isSelected || isHovered ? "#ffffff" : style.stroke}
              strokeWidth={isSelected || isHovered ? 4 : 1.5}
              style={{
                cursor: isBooked ? "not-allowed" : "pointer",
                transition: "fill 0.12s ease, stroke 0.12s ease, stroke-width 0.12s ease",
                filter: isHovered && !isBooked ? "drop-shadow(0 0 6px rgba(99,213,240,0.9))" : "none",
              }}
              onMouseEnter={() => onHoverUnit(unit.id)}
              onMouseLeave={() => onHoverUnit(null)}
              onClick={() => {
                if (!isBooked) onSelectUnit(unit.id);
              }}
            />
          );
        })}
      </svg>

      {hoveredUnit && hoverPos && <UnitHoverCard unit={hoveredUnit} position={hoverPos} />}
    </div>
  );
}
