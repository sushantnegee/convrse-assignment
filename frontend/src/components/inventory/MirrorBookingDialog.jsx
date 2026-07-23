import { AnimatePresence, motion } from "framer-motion";

// Read-only counterpart to BookingDialog — reflects that a dialog is open
// and which unit it's for, without any form fields (the display never
// collects input, only shows what the executive is doing).
export default function MirrorBookingDialog({ open, unit }) {
  if (!unit) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
          >
            <h2 className="mb-1 text-lg font-bold">Booking Unit {unit.unitNumber}</h2>
            <p className="mb-4 text-xs text-slate-500">
              Floor {unit.floor} · {unit.config} · {unit.areaSqft} sqft
            </p>
            <p className="text-sm text-slate-400">Executive is entering customer details…</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
