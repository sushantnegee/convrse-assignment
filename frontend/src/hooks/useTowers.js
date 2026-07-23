import { useEffect, useState } from "react";
import { api } from "../api/client";

export function useTowers(projectId) {
  const [towers, setTowers] = useState([]);
  const [status, setStatus] = useState("loading"); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setStatus("loading");

    api.getTowers(projectId).then(({ data, error: reqError }) => {
      if (cancelled) return;
      if (reqError) {
        setStatus("error");
        setError(reqError.message);
        return;
      }
      setTowers(data);
      setStatus("ready");
    });

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadToken]);

  const reload = () => setReloadToken((t) => t + 1);

  return { towers, status, error, reload };
}
