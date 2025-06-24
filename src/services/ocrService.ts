import { IOcrRepository } from '../interfaces/IOcrRepository';
import { IOcrResult } from '../interfaces/IOcrResult';
import { IOcrService } from '../interfaces/IOcrService';
import { processImages } from '../utils/ocrProcessor';

export class OcrService implements IOcrService {
  constructor(private ocrRepository: IOcrRepository) {}

  async processImages(frontImage: Express.Multer.File, backImage: Express.Multer.File): Promise<IOcrResult> {
    try {
      // Pass the file paths to the OCR processor
      const result = await processImages(frontImage.path, backImage.path);

      const ocrResult: IOcrResult = {
        id: new Date().toISOString(),
        name: result.name || '',
        aadhaarNumber: result.aadhaarNumber || '',
        dob: result.dob || '',
        address: result.address || '',
        gender: result.gender || '',
        pincode: result.pincode || '',
      };

      await this.ocrRepository.save(ocrResult);
      return ocrResult;
    } catch (error: any) {
      throw new Error(`OCR service error: ${error.message}`);
    }
  }
}