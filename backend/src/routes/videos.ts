import { Router } from "express";
import { prisma } from "../db";
import { asyncHandler } from "../lib/asyncHandler";
import { ApiError } from "../lib/apiError";

export const videosRouter = Router();

videosRouter.get(
  "/:projectId/videos",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) throw new ApiError(404, "Project not found.");

    const videos = await prisma.video.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ data: videos, error: null });
  })
);
