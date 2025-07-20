import { OcrRepository } from './repositories/OcrRepository';
import { IOcrRepository } from './interfaces/IOcrRepository';
import { OcrService } from './services/ocrService';
import { IOcrService } from './interfaces/IOcrService';
import { OcrController } from './controllers/ocrController';


export class DIContainer {
  private static instance: DIContainer;
  private dependencies: Map<string, any> = new Map();

  private constructor() {
    
    this.dependencies.set('IOcrRepository', new OcrRepository());
    this.dependencies.set('IOcrService', new OcrService(this.get<IOcrRepository>('IOcrRepository')));
    this.dependencies.set('IOcrController', new OcrController(this.get<IOcrService>('IOcrService')));
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  get<T>(key: string): T {
    const dependency = this.dependencies.get(key);
    if (!dependency) {
      throw new Error(`Dependency ${key} not found`);
    }
    return dependency as T;
  }
}

export const diContainer = DIContainer.getInstance();