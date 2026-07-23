import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../lib/apiError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ data: null, error: { message: err.message, fields: err.fields } });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      res.status(404).json({ data: null, error: { message: "Not found." } });
      return;
    }
    if (err.code === "P2002") {
      res.status(409).json({ data: null, error: { message: "This unit has already been booked." } });
      return;
    }
  }

  console.error(err);
  res.status(500).json({ data: null, error: { message: "Something went wrong. Please try again." } });
};
