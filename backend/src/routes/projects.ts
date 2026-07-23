import { Router } from "express";
import { prisma } from "../db";
import { asyncHandler } from "../lib/asyncHandler";
import { ApiError } from "../lib/apiError";

export const projectsRouter = Router();

projectsRouter.get(
  "/:projectId",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) throw new ApiError(404, "Project not found.");
    res.json({ data: project, error: null });
  })
);
