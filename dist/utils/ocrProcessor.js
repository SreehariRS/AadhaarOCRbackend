"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImages = void 0;
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const processImages = async (frontImagePath, backImagePath) => {
    try {
        const worker = await tesseract_js_1.default.createWorker('eng');
        const frontResult = await worker.recognize(frontImagePath);
        const backResult = await worker.recognize(backImagePath);
        await worker.terminate();
        // Simplified parsing logic for Aadhaar card (replace with robust regex or ML model for production)
        const parsedResult = {
            name: frontResult.data.text.match(/Name\s*:\s*([A-Za-z\s]+)/i)?.[1]?.trim() || '',
            aadhaarNumber: frontResult.data.text.match(/\d{4}\s*\d{4}\s*\d{4}/)?.[0]?.replace(/\s/g, '') || '',
            dob: frontResult.data.text.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] || '',
            address: backResult.data.text.match(/Address\s*:\s*([\s\S]*?)(?=\n\n|\Z)/i)?.[1]?.trim() || '',
        };
        return parsedResult;
    }
    catch (error) {
        throw new Error(`OCR processing failed: ${error}`);
    }
};
exports.processImages = processImages;
