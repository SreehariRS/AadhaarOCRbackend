"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrService = void 0;
const ocrProcessor_1 = require("../utils/ocrProcessor");
class OcrService {
    constructor(ocrRepository) {
        this.ocrRepository = ocrRepository;
    }
    async processImages(frontImage, backImage) {
        try {
            const result = await (0, ocrProcessor_1.processImages)(frontImage.path, backImage.path);
            const ocrResult = {
                id: new Date().toISOString(),
                name: result.name || '',
                aadhaarNumber: result.aadhaarNumber || '',
                dob: result.dob || '',
                address: result.address || '',
            };
            await this.ocrRepository.save(ocrResult);
            return ocrResult;
        }
        catch (error) {
            throw new Error(`OCR service error: ${error}`);
        }
    }
}
exports.OcrService = OcrService;
