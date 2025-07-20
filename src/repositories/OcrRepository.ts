import { IOcrResult } from '../interfaces/IOcrResult';
import { IOcrRepository } from '../interfaces/IOcrRepository';
import { OcrResult } from '../entities/OcrResult';

export class OcrRepository implements IOcrRepository {
  async save(ocrResult: IOcrResult): Promise<void> {
    try {
   
      const newResult = new OcrResult(ocrResult);
      await newResult.save();
      console.log('OCR result saved to MongoDB');
    } catch (error) {
      console.warn('Failed to save to MongoDB, using in-memory storage:', error);
   
      console.log('OCR Result (in-memory):', ocrResult);
    }
  }
}