import { io } from "socket.io-client";
import { API_BASE_URL } from "../api/client";

// Lazily created singleton so both the executive and display pages share one
// connection per browser tab. Wired up fully in the realtime stage; imported
// early so the folder shape matches the rest of the app from the start.
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_BASE_URL, { autoConnect: false });
  }
  return socket;
}
