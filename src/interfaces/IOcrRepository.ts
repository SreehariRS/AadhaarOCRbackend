import { IOcrResult } from "./IOcrResult";

export interface IOcrRepository {
  save(ocrResult: IOcrResult): Promise<void>;
}