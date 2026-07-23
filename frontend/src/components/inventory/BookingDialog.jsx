import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../../api/client";

const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,14}$/;

// Mirrors the server's zod rules so obviously-invalid input is caught
// instantly, without a round trip — the server in src/routes/bookings.ts
// remains the actual source of truth and is still checked on submit.
function validate(customerName, phoneNumber) {
  const fields = {};
  if (customerName.trim().length < 2) fields.customerName = "Enter the customer's full name.";
  if (!PHONE_PATTERN.test(phoneNumber.trim())) fields.phoneNumber = "Enter a valid phone number.";
  return fields;
}

export default function BookingDialog({ open, unit, onClose, onBooked }) {
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCustomerName("");
      setPhoneNumber("");
      setFieldErrors({});
      setSubmitError(null);
      setSubmitting(false);
    }
  }, [open, unit?.id]);

  if (!unit) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const clientErrors = validate(customerName, phoneNumber);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    const { error } = await api.bookUnit(unit.id, { customerName, phoneNumber });

    if (error) {
      setSubmitting(false);
      if (error.fields) {
        setFieldErrors(error.fields);
      } else {
        setSubmitError(error.message);
      }
      return;
    }

    setSubmitting(false);
    onBooked(unit.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 text-lg font-bold">Book Unit {unit.unitNumber}</h2>
            <p className="mb-4 text-xs text-slate-500">
              Floor {unit.floor} · {unit.config} · {unit.areaSqft} sqft
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Customer Name</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  placeholder="Full name"
                  disabled={submitting}
                />
                {fieldErrors.customerName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.customerName}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Phone Number</label>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  placeholder="+91 98765 43210"
                  disabled={submitting}
                />
                {fieldErrors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.phoneNumber}</p>
                )}
              </div>

              {submitError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{submitError}</p>
              )}

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Booking…" : "Confirm Booking"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
