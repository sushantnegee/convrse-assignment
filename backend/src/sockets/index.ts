import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { getCorsOrigin } from "../lib/corsOrigins";

type MirrorState = Record<string, unknown>;

// Last-known full mirrored state per project, so a display that connects
// (or reconnects) mid-session gets caught up immediately via 'mirror:sync'
// instead of showing nothing until the next executive action.
const mirrorStates = new Map<string, MirrorState>();

export function attachSockets(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: getCorsOrigin() },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join", ({ projectId, role }: { projectId?: string; role?: string }) => {
      if (!projectId) return;
      socket.data.projectId = projectId;
      socket.data.role = role;

      // Every viewer (executive, display, or a stray browser tab) joins the
      // inventory room so booking changes broadcast to "every other device",
      // not just the mirrored executive/display pair.
      socket.join(`inventory:${projectId}`);

      if (role === "display") {
        socket.join(`mirror:${projectId}`);
        const cached = mirrorStates.get(projectId);
        if (cached) socket.emit("mirror:sync", cached);
      }
    });

    // The display is a pure mirror and must never drive state — only
    // sockets that joined as 'executive' are allowed to push mirror updates.
    socket.on("mirror:action", (payload: { type?: string; state?: MirrorState }) => {
      if (socket.data.role !== "executive") return;
      const projectId = socket.data.projectId as string | undefined;
      if (!projectId || !payload?.state) return;

      mirrorStates.set(projectId, payload.state);
      socket.to(`mirror:${projectId}`).emit("mirror:action", payload);
    });
  });

  return io;
}

export function broadcastUnitBooked(
  io: Server,
  projectId: string,
  payload: { unitId: string; towerId: string }
) {
  io.to(`inventory:${projectId}`).emit("unit:booked", payload);
}
