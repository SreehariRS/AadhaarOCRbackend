import express from "express";
import multer from "multer";
import path from "path";
import { diContainer } from "../diContainer";
import { IOcrController } from "../interfaces/IOcrController";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG and PNG files are allowed"));
        }
    },
});

const ocrController = diContainer.get<IOcrController>("IOcrController");

router.post(
    "/process",
    upload.fields([
        { name: "front", maxCount: 1 },
        { name: "back", maxCount: 1 },
    ]),
    ocrController.processImages.bind(ocrController)
);

export default router;
