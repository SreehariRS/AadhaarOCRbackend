"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImages = void 0;
const ocrService_1 = require("../services/ocrService");
const OcrRepository_1 = require("../repositories/OcrRepository");
const ocrService = new ocrService_1.OcrService(new OcrRepository_1.OcrRepository());
const processImages = async (req, res) => {
    try {
        const files = req.files;
        if (!files || !files.front || !files.back) {
            return res.status(400).json({ error: 'Please upload both front and back images.' });
        }
        const frontImage = files.front[0];
        const backImage = files.back[0];
        if (!['image/jpeg', 'image/png'].includes(frontImage.mimetype) || !['image/jpeg', 'image/png'].includes(backImage.mimetype)) {
            return res.status(400).json({ error: 'Only JPEG or PNG images are allowed.' });
        }
        const result = await ocrService.processImages(frontImage, backImage);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process images.' });
    }
};
exports.processImages = processImages;
