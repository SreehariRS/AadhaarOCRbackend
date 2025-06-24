import { Request, Response } from 'express';
import { OcrService } from '../services/ocrService';
import { OcrRepository } from '../repositories/OcrRepository';
import fs from 'fs';

const ocrService = new OcrService(new OcrRepository());

export const processImages = async (req: Request, res: Response) => {
  try {
    console.log('Processing images request received');
    console.log('Files:', req.files);
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || !files.front || !files.back) {
      return res.status(400).json({ error: 'Please upload both front and back images.' });
    }

    const frontImage = files.front[0];
    const backImage = files.back[0];

    // Validate file types
    if (!['image/jpeg', 'image/png'].includes(frontImage.mimetype) || 
        !['image/jpeg', 'image/png'].includes(backImage.mimetype)) {
      // Clean up uploaded files
      fs.unlink(frontImage.path, () => {});
      fs.unlink(backImage.path, () => {});
      return res.status(400).json({ error: 'Only JPEG or PNG images are allowed.' });
    }

    console.log('Processing images with OCR service');
    const result = await ocrService.processImages(frontImage, backImage);
    
    // Clean up uploaded files after processing
    fs.unlink(frontImage.path, () => {});
    fs.unlink(backImage.path, () => {});
    
    console.log('OCR processing completed successfully');
    res.json(result);
  } catch (error: any) {
    console.error('OCR Controller Error:', error);
    
    // Clean up files in case of error
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.front && files.front[0]) {
        fs.unlink(files.front[0].path, () => {});
      }
      if (files.back && files.back[0]) {
        fs.unlink(files.back[0].path, () => {});
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to process images.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};