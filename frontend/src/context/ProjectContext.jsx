import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("loading"); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!projectId) {
      setStatus("error");
      setError("No project specified. Open this app with ?projectId=<id> in the URL.");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    api.getProject(projectId).then(({ data, error: reqError }) => {
      if (cancelled) return;
      if (reqError) {
        setStatus("error");
        setError(reqError.message);
        return;
      }
      setProject(data);
      setStatus("ready");
    });

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadToken]);

  const reload = () => setReloadToken((t) => t + 1);

  return (
    <ProjectContext.Provider value={{ projectId, project, status, error, reload }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within a ProjectProvider");
  return ctx;
}
