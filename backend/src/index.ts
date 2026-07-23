import "dotenv/config";
import path from "node:path";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { projectsRouter } from "./routes/projects";
import { galleryRouter } from "./routes/gallery";
import { videosRouter } from "./routes/videos";
import { towersRouter, unitsRouter } from "./routes/inventory";
import { createBookingsRouter } from "./routes/bookings";
import { errorHandler } from "./middleware/errorHandler";
import { attachSockets } from "./sockets";
import { getCorsOrigin } from "./lib/corsOrigins";

const app = express();
const httpServer = createServer(app);
const io = attachSockets(httpServer);

app.use(cors({ origin: getCorsOrigin() }));
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "..", "public", "assets")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/projects", projectsRouter);
app.use("/api/projects", galleryRouter);
app.use("/api/projects", videosRouter);
app.use("/api/projects", towersRouter);
app.use("/api/towers", unitsRouter);
app.use("/api/units", createBookingsRouter(io));

app.use("/api", (_req, res) => {
  res.status(404).json({ data: null, error: { message: "Not found." } });
});

app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
httpServer.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
