import { useCallback, useEffect, useReducer, useRef } from "react";
import { createInitialSessionState, sessionReducer } from "../state/sessionState";
import { getSocket } from "../socket/socket";

// Executive-side state. Every dispatch both updates local state (so the
// executive's own UI reacts instantly) and — via the effect below — emits
// the resulting full state to the paired display through the server. The
// display never runs this reducer itself; it only ever applies what it's
// sent, which is what keeps it a pure mirror.
export function useMirrorEmitter(projectId) {
  const [state, baseDispatch] = useReducer(sessionReducer, projectId, createInitialSessionState);
  const lastActionType = useRef(null);

  const dispatch = useCallback((action) => {
    lastActionType.current = action.type;
    baseDispatch(action);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    socket.connect();
    socket.emit("join", { projectId, role: "executive" });
    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    socket.emit("mirror:action", { type: lastActionType.current, state });
  }, [projectId, state]);

  return [state, dispatch];
}
