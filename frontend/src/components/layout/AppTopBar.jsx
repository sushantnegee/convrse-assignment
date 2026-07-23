import { useState } from "react";

const NAV_TABS = [
  { id: "gallery", label: "Gallery" },
  { id: "videos", label: "Videos" },
  { id: "inventory", label: "Inventory" },
];

// Shared app-shell topbar, used by Gallery, Videos, and Inventory.
export default function AppTopBar({ activeTab, onNavigate, interactive = true, projectId }) {
  const [copied, setCopied] = useState(false);

  const handleCopyDisplayLink = async () => {
    if (!projectId) return;
    const displayUrl = `${window.location.origin}/display?projectId=${projectId}`;
    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access can be denied by the browser — fail silently, the
      // icon just won't show the "Copied!" confirmation
    }
  };

  return (
    <header className="fixed left-0 top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/10 bg-[#111316]/80 px-10 backdrop-blur-xl">
      <div
        className="tracking-tighter text-[#63d5f0]"
        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 24 }}
      >
        LUXE GALLERY
      </div>

      <nav className="hidden items-center gap-10 md:flex">
        {NAV_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={interactive ? () => onNavigate(tab.id) : undefined}
              className="pb-2 text-sm font-semibold transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.05em",
                color: isActive ? "#63d5f0" : "#bcc9cc",
                borderBottom: isActive ? "2px solid #63d5f0" : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={interactive ? handleCopyDisplayLink : undefined}
            title={interactive ? "Copy display link to share with the client" : undefined}
            className="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-white/5"
            style={{ cursor: interactive ? "pointer" : "default" }}
          >
            <span className="material-symbols-outlined text-[#63d5f0]">{copied ? "check" : "sensors"}</span>
          </button>
          {copied && (
            <div
              className="absolute right-0 top-14 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-[#e2e2e6]"
              style={{ background: "rgba(26,28,31,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(99,213,240,0.3)" }}
            >
              Display link copied!
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#282a2d]">
          <span className="material-symbols-outlined text-[#bcc9cc]" style={{ fontSize: 20 }}>
            person
          </span>
        </div>
      </div>
    </header>
  );
}
