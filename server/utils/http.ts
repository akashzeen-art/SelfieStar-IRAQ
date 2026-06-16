import { Request, Response, NextFunction } from "express";

export class HttpError extends Error {
  statusCode: number;
  data?: Record<string, unknown>;

  constructor(statusCode: number, message: string, data?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
