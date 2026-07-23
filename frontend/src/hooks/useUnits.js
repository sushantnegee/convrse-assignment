import { useEffect, useState } from "react";
import { api } from "../api/client";

export function useUnits(towerId) {
  const [units, setUnits] = useState([]);
  const [status, setStatus] = useState("loading"); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!towerId) return;
    let cancelled = false;
    setStatus("loading");

    api.getUnits(towerId).then(({ data, error: reqError }) => {
      if (cancelled) return;
      if (reqError) {
        setStatus("error");
        setError(reqError.message);
        return;
      }
      setUnits(data);
      setStatus("ready");
    });

    return () => {
      cancelled = true;
    };
  }, [towerId, reloadToken]);

  const reload = () => setReloadToken((t) => t + 1);

  // Local, immediate patch after a successful booking — single-device
  // feedback without waiting on a refetch. Stage 6's live broadcast is what
  // propagates this to *other* devices.
  const markUnitBooked = (unitId) => {
    setUnits((prev) => prev.map((u) => (u.id === unitId ? { ...u, status: "booked" } : u)));
  };

  return { units, status, error, reload, markUnitBooked };
}
