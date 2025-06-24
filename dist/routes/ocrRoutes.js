"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ocrController_1 = require("../controllers/ocrController");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/process', upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
]), ocrController_1.processImages);
exports.default = router;
