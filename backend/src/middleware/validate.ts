import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../lib/apiError";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "_";
        fields[key] = issue.message;
      }
      next(new ApiError(422, "Please fix the highlighted fields.", fields));
      return;
    }
    req.body = result.data;
    next();
  };
}
