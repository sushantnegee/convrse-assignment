import { motion } from "framer-motion";

// A deliberately standalone visual moment (own fonts/color palette, not the
// convrse.ai-inspired look used by Gallery/Videos/Inventory). Background is
// a placeholder gradient in the same twilight palette until a real tower
// photo is provided — swap the `background-1` div's style to a bg-cover
// image and it's a one-line change.
export default function EntrySplash({ onEnter, interactive = true }) {
  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-[#111316]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(15,158,183,0.35), transparent 55%), linear-gradient(200deg, #0c2b33 0%, #111316 45%, #050608 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111316] via-transparent to-[#111316]/40" />
      </div>

      <header className="fixed left-0 right-0 top-0 z-10 flex h-20 items-center justify-between px-5 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#63d5f0] shadow-lg">
            <span className="material-symbols-outlined text-[#003640]" style={{ fontVariationSettings: "'FILL' 1" }}>
              domain
            </span>
          </div>
          <span
            className="tracking-tighter text-[#63d5f0]"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 24, lineHeight: "32px" }}
          >
            LUXE GALLERY
          </span>
        </div>
      </header>

      <main className="relative z-10 flex h-full flex-col justify-end px-5 pb-24 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl space-y-6"
        >
          <div className="space-y-4">
            <h1
              className="uppercase tracking-tighter text-[#63d5f0]"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(32px, 6vw, 48px)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              Estate Elite
            </h1>
            <p className="max-w-2xl text-[18px] leading-7 text-[#bcc9cc]">
              Embark on a journey through architectural excellence. Experience the most prestigious residences
              through interactive discovery and immersive media galleries designed for the sophisticated investor.
            </p>
          </div>

          <div className="pt-8">
            <button
              onClick={interactive ? onEnter : undefined}
              className="group inline-flex items-center gap-4 rounded-full bg-[#63d5f0] px-8 py-4 text-[#003640] transition-all hover:pr-12 hover:shadow-[0_0_40px_rgba(99,213,240,0.5)] active:scale-95"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 20 }}
            >
              <span>Enter Experience</span>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">
                arrow_forward
              </span>
            </button>
          </div>
        </motion.div>

        <div className="absolute bottom-12 right-10 hidden items-center gap-4 opacity-60 md:flex">
          <div className="text-right">
            <div className="text-[12px] font-medium text-[#bcc9cc]">CURATED BY</div>
            <div className="text-[14px] font-semibold tracking-wide text-[#e2e2e6]">SUSHANT KUMAR</div>
          </div>
          <div className="h-12 w-px bg-white/20" />
          <div className="animate-pulse text-[#63d5f0]">
            <span className="material-symbols-outlined text-[40px]">architecture</span>
          </div>
        </div>
      </main>
    </div>
  );
}
