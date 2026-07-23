import { useEffect, useState } from "react";
import { createInitialSessionState } from "../state/sessionState";
import { getSocket } from "../socket/socket";

// Display-side state. This hook never dispatches anything of its own — it
// only ever replaces its local state with whatever the server relays from
// the executive, which is what makes the display a pure mirror.
export function useMirrorReceiver(projectId) {
  const [state, setState] = useState(() => createInitialSessionState(projectId));

  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    socket.connect();
    socket.emit("join", { projectId, role: "display" });

    const handleAction = (payload) => setState(payload.state);
    const handleSync = (fullState) => setState(fullState);

    socket.on("mirror:action", handleAction);
    socket.on("mirror:sync", handleSync);

    return () => {
      socket.off("mirror:action", handleAction);
      socket.off("mirror:sync", handleSync);
      socket.disconnect();
    };
  }, [projectId]);

  return state;
}
