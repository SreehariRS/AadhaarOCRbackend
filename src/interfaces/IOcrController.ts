import { Request, Response } from 'express';

export interface IOcrController {
  processImages(req: Request, res: Response): Promise<void>;
}