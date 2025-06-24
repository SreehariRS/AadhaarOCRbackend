"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrRepository = void 0;
const OcrResult_1 = require("../entities/OcrResult");
class OcrRepository {
    async save(ocrResult) {
        try {
            const newResult = new OcrResult_1.OcrResult(ocrResult);
            await newResult.save();
        }
        catch (error) {
            throw new Error(`Failed to save OCR result: ${error}`);
        }
    }
}
exports.OcrRepository = OcrRepository;
