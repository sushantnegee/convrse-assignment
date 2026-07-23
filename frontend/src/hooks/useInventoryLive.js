import { useEffect } from "react";
import { getSocket } from "../socket/socket";

// Live inventory sync — every viewer of a project's inventory (executive or
// display, own booking or someone else's) gets patched without a refresh.
// This only registers a listener; connecting/joining the socket is owned by
// the page-level hook (useMirrorEmitter / useMirrorReceiver) so multiple
// components mounting/unmounting (e.g. switching tabs) can't tear down a
// connection another part of the page still needs.
export function useInventoryLive(projectId, onUnitBooked) {
  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    const handler = (payload) => onUnitBooked(payload);
    socket.on("unit:booked", handler);
    return () => {
      socket.off("unit:booked", handler);
    };
  }, [projectId, onUnitBooked]);
}
