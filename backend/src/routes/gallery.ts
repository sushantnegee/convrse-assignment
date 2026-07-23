import { Router } from "express";
import { prisma } from "../db";
import { asyncHandler } from "../lib/asyncHandler";
import { ApiError } from "../lib/apiError";

export const galleryRouter = Router();

galleryRouter.get(
  "/:projectId/gallery",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) throw new ApiError(404, "Project not found.");

    const images = await prisma.galleryImage.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ data: images, error: null });
  })
);
