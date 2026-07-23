const STATUS_LABEL = {
  available: { label: "Available", bg: "var(--status-available-bg)", color: "var(--status-available-color)" },
  booked: { label: "Booked", bg: "var(--status-booked-bg)", color: "var(--status-booked-color)" },
};

const CARD_WIDTH = 224;
const CARD_HEIGHT = 168;

export default function UnitHoverCard({ unit, position }) {
  const status = STATUS_LABEL[unit.status] ?? STATUS_LABEL.available;

  const left = Math.min(position.x + 18, window.innerWidth - CARD_WIDTH - 12);
  const top = Math.min(position.y + 18, window.innerHeight - CARD_HEIGHT - 12);

  return (
    <div
      className="pointer-events-none fixed z-[150] rounded-xl border border-black/5 bg-white p-4 text-left shadow-2xl"
      style={{ left, top, width: CARD_WIDTH }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-900">Unit {unit.unitNumber}</span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Stat label="Floor" value={unit.floor} />
        <Stat label="Config" value={unit.config} />
        <Stat label="Area" value={`${unit.areaSqft} sqft`} />
        {unit.price != null && <Stat label="Price" value={`₹${(unit.price / 100000).toFixed(1)}L`} />}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-semibold text-slate-800">{value}</div>
    </div>
  );
}
