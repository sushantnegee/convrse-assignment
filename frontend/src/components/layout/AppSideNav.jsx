const NAV_ITEMS = [
  { id: "gallery", label: "Gallery", icon: "photo_library" },
  { id: "videos", label: "Videos", icon: "play_circle" },
  { id: "inventory", label: "Inventory", icon: "apartment" },
];

// Shared app-shell left icon rail — see AppTopBar.jsx for scope notes.
export default function AppSideNav({ activeTab, onNavigate, projectName, interactive = true }) {
  const shortLabel = (projectName ?? "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();

  return (
    <aside className="fixed bottom-0 left-0 top-20 z-40 flex w-[120px] flex-col items-center border-r border-white/5 bg-[#1a1c1f]/90 py-4 backdrop-blur-2xl">
      <div className="mb-8 flex flex-col items-center gap-1">
        <span className="material-symbols-outlined text-3xl text-[#63d5f0]">domain</span>
        <span className="text-[11px] font-bold text-[#e2e2e6]">{shortLabel || "—"}</span>
      </div>

      <div className="flex w-full flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={interactive ? () => onNavigate(item.id) : undefined}
              className="flex flex-col items-center justify-center py-4 transition-all"
              style={{
                color: isActive ? "#63d5f0" : "#bcc9cc",
                background: isActive ? "rgba(99,213,240,0.1)" : "transparent",
                borderLeft: isActive ? "4px solid #63d5f0" : "4px solid transparent",
                opacity: isActive ? 1 : 0.7,
              }}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="mt-1 text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
