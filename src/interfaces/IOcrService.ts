import { IOcrResult } from './IOcrResult';

export interface IOcrService {
  processImages(frontImage: Express.Multer.File, backImage: Express.Multer.File): Promise<IOcrResult>;
}