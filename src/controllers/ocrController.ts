import { Request, Response } from 'express';
import { IOcrService } from '../interfaces/IOcrService';
import { IOcrController } from '../interfaces/IOcrController';
import { HttpStatusCode } from '../enums/HttpStatusCode';
import fs from 'fs';

export class OcrController implements IOcrController {
  constructor(private ocrService: IOcrService) {}

  async processImages(req: Request, res: Response): Promise<void> {
    try {
      console.log('Processing images request received');
      console.log('Files:', req.files);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || !files.front || !files.back) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ error: 'Please upload both front and back images.' });
        return;
      }

      const frontImage = files.front[0];
      const backImage = files.back[0];

      if (!['image/jpeg', 'image/png'].includes(frontImage.mimetype) || 
          !['image/jpeg', 'image/png'].includes(backImage.mimetype)) {
     
        fs.unlink(frontImage.path, () => {});
        fs.unlink(backImage.path, () => {});
        res.status(HttpStatusCode.BAD_REQUEST).json({ error: 'Only JPEG or PNG images are allowed.' });
        return;
      }

      console.log('Processing images with OCR service');
      const result = await this.ocrService.processImages(frontImage, backImage);

      fs.unlink(frontImage.path, () => {});
      fs.unlink(backImage.path, () => {});

      console.log('OCR processing completed successfully');
      res.status(HttpStatusCode.OK).json(result);
    } catch (error: any) {
      console.error('OCR Controller Error:', error);


      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files.front && files.front[0]) {
          fs.unlink(files.front[0].path, () => {});
        }
        if (files.back && files.back[0]) {
          fs.unlink(files.back[0].path, () => {});
        }
      }

      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to process images.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}