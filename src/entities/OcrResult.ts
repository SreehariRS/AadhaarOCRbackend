import mongoose, { Schema, Document } from 'mongoose';

export interface IOcrResult extends Document {
  id: string;
  name: string;
  aadhaarNumber: string;
  dob: string;
  address?: string;
  gender: string;
  pincode: string;
  createdAt: Date;
}

const OcrResultSchema: Schema = new Schema({
  name: { type: String, required: true },
  aadhaarNumber: { type: String, required: true },
  dob: { type: String, required: true },
  address: { type: String },
  gender: { type: String, required: true },
  pincode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const OcrResult = mongoose.model<IOcrResult>('OcrResult', OcrResultSchema);