import { Router } from "express";
import type { Server } from "socket.io";
import { z } from "zod";
import { prisma } from "../db";
import { asyncHandler } from "../lib/asyncHandler";
import { ApiError } from "../lib/apiError";
import { validateBody } from "../middleware/validate";
import { broadcastUnitBooked } from "../sockets";

const bookUnitSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Enter the customer's full name.")
    .max(100, "Name is too long."),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{6,14}$/, "Enter a valid phone number."),
});

export function createBookingsRouter(io: Server) {
  const bookingsRouter = Router();

  bookingsRouter.post(
    "/:unitId/book",
    validateBody(bookUnitSchema),
    asyncHandler(async (req, res) => {
      const { unitId } = req.params;
      const { customerName, phoneNumber } = req.body as z.infer<typeof bookUnitSchema>;

      const existing = await prisma.unit.findUnique({
        where: { id: unitId },
        include: { tower: { select: { projectId: true } } },
      });
      if (!existing) throw new ApiError(404, "Unit not found.");

      // The atomic guarantee lives here: a single conditional UPDATE (row-level
      // lock makes check-and-flip indivisible) plus the UNIQUE constraint on
      // bookings.unit_id as an independent second guard. See PLAN.md /
      // README.md "Atomic booking" section for the full reasoning.
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.$queryRaw<{ id: string }[]>`
          UPDATE units
          SET status = 'booked'
          WHERE id = ${unitId} AND status = 'available'
          RETURNING id
        `;

        if (updated.length === 0) {
          throw new ApiError(409, "This unit has already been booked.");
        }

        const booking = await tx.booking.create({
          data: { unitId, customerName, phoneNumber },
        });

        const unit = await tx.unit.findUniqueOrThrow({ where: { id: unitId } });

        return { booking, unit };
      });

      broadcastUnitBooked(io, existing.tower.projectId, {
        unitId: result.unit.id,
        towerId: result.unit.towerId,
      });

      res.status(201).json({
        data: {
          unit: {
            id: result.unit.id,
            unitNumber: result.unit.unitNumber,
            floor: result.unit.floor,
            config: result.unit.config,
            areaSqft: Number(result.unit.areaSqft),
            price: result.unit.price ? Number(result.unit.price) : null,
            polygonPoints: result.unit.polygonPoints,
            status: result.unit.status,
          },
          booking: result.booking,
        },
        error: null,
      });
    })
  );

  return bookingsRouter;
}
