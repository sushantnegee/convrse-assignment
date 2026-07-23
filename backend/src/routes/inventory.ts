import { Router } from "express";
import { prisma } from "../db";
import { asyncHandler } from "../lib/asyncHandler";
import { ApiError } from "../lib/apiError";

export const towersRouter = Router();
export const unitsRouter = Router();

towersRouter.get(
  "/:projectId/towers",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) throw new ApiError(404, "Project not found.");

    const towers = await prisma.tower.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ data: towers, error: null });
  })
);

unitsRouter.get(
  "/:towerId/units",
  asyncHandler(async (req, res) => {
    const tower = await prisma.tower.findUnique({ where: { id: req.params.towerId } });
    if (!tower) throw new ApiError(404, "Tower not found.");

    const units = await prisma.unit.findMany({
      where: { towerId: req.params.towerId },
      orderBy: [{ floor: "desc" }, { unitNumber: "asc" }],
    });

    const data = units.map((u) => ({
      id: u.id,
      unitNumber: u.unitNumber,
      floor: u.floor,
      config: u.config,
      areaSqft: Number(u.areaSqft),
      price: u.price ? Number(u.price) : null,
      polygonPoints: u.polygonPoints,
      status: u.status,
    }));

    res.json({ data, error: null });
  })
);
