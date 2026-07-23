import ImageWithFallback from "../common/ImageWithFallback";
import { API_BASE_URL } from "../../api/client";

const STATUS_STYLE = {
  available: { bg: "rgba(34,197,94,0.2)", color: "#4ade80", label: "Available" },
  booked: { bg: "#454749", color: "#c6c6c9", label: "Booked" },
};

export default function UnitCard({ unit, isSelected, onHover, onClick }) {
  const isBooked = unit.status === "booked";
  const status = STATUS_STYLE[isBooked ? "booked" : "available"];
  const floorPlanUrl = `${API_BASE_URL}/assets/floorplans/${unit.config.toLowerCase()}.svg`;

  return (
    <div
      onMouseEnter={() => onHover(unit.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => {
        if (!isBooked) onClick(unit.id);
      }}
      className="flex gap-4 rounded-xl border p-4 transition-all"
      style={{
        background: "rgba(26,28,31,0.7)",
        backdropFilter: "blur(20px)",
        borderColor: isSelected ? "#63d5f0" : "rgba(255,255,255,0.1)",
        cursor: isBooked ? "default" : "pointer",
        opacity: isBooked ? 0.6 : 1,
        transform: isSelected ? "translateY(-4px)" : "none",
      }}
    >
      <div className="flex-1">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-base font-semibold text-[#e2e2e6]">Unit {unit.unitNumber}</h3>
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight"
            style={{ background: status.bg, color: status.color }}
          >
            {status.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-y-2 text-[11px] text-[#bcc9cc]">
          <span>Area</span>
          <span className="font-semibold text-[#e2e2e6]">{unit.areaSqft} sq.ft</span>
          <span>Type</span>
          <span className="font-semibold text-[#e2e2e6]">{unit.config}</span>
          <span>Floor</span>
          <span className="font-semibold text-[#e2e2e6]">{String(unit.floor).padStart(2, "0")}</span>
        </div>
      </div>
      <div
        className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-white/5 bg-[#333538]"
        style={{ filter: isBooked ? "grayscale(1)" : "none" }}
      >
        <ImageWithFallback src={floorPlanUrl} alt={`${unit.config} floor plan`} className="h-full w-full object-contain p-2" />
      </div>
    </div>
  );
}
