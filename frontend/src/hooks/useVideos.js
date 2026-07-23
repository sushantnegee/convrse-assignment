import { useEffect, useState } from "react";
import { api } from "../api/client";

export function useVideos(projectId) {
  const [videos, setVideos] = useState([]);
  const [status, setStatus] = useState("loading"); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setStatus("loading");

    api.getVideos(projectId).then(({ data, error: reqError }) => {
      if (cancelled) return;
      if (reqError) {
        setStatus("error");
        setError(reqError.message);
        return;
      }
      setVideos(data);
      setStatus("ready");
    });

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadToken]);

  const reload = () => setReloadToken((t) => t + 1);

  return { videos, status, error, reload };
}
