import Tesseract from 'tesseract.js';
import fs from 'fs';

export interface OcrResult {
  name: string;
  aadhaarNumber: string;
  dob: string;
  address: string;
  gender: string;
  pincode: string;
}

// Helper function to clean and normalize text
const cleanText = (text: string): string => {
  return text
    .replace(/[^\w\s\/:.-]/g, ' ') // Remove special characters except common ones
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

// Helper function to validate Aadhaar number
const isValidAadhaar = (aadhaar: string): boolean => {
  const cleaned = aadhaar.replace(/\D/g, '');
  return cleaned.length === 12 && /^\d{12}$/.test(cleaned);
};

// Helper function to validate pincode
const isValidPincode = (pincode: string): boolean => {
  const cleaned = pincode.replace(/\D/g, '');
  return cleaned.length === 6 && /^\d{6}$/.test(cleaned);
};

// Helper function to extract name with better logic
const extractName = (text: string): string => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for name patterns
  const namePatterns = [
    /(?:Name|नाम)\s*:?\s*([A-Za-z\s]{2,50})/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]*){0,3})$/m, // Allow names with initials (e.g., Rajeev M)
    /\b([A-Z][a-z]+(?:\s+[A-Z]\.?){0,2})\b/m, // Match names like "Rajeev M" or "Rajeev M."
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Validate name (should be 1-4 words, first letter capitalized, optional initial)
      if (/^[A-Z][a-z]*(?:\s+[A-Z][a-z]*){0,3}(?:\s+[A-Z]\.?)?$/.test(name) && name.length <= 50) {
        return name;
      }
    }
  }
  
  // Fallback: Look for the first line that looks like a name, prioritizing early lines
  for (const line of lines) {
    const cleaned = cleanText(line);
    // Skip common header text
    if (cleaned.match(/government|india|aadhaar|unique|identification/i)) {
      continue;
    }
    // Look for proper name format or name with initial
    if ((/^[A-Z][a-z]+(?:\s+[A-Z][a-z]*){0,2}(?:\s+[A-Z]\.?)?$/.test(cleaned) && cleaned.length <= 50) ||
        /^[A-Z][a-z]+\s+[A-Z]\.?$/i.test(cleaned)) { // Specific check for "Rajeev M"
      return cleaned;
    }
  }
  
  return '';
};

// Helper function to extract Aadhaar number with validation
const extractAadhaarNumber = (text: string): string => {
  const aadhaarPatterns = [
    /(\d{4}\s+\d{4}\s+\d{4})/g, // Spaced format
    /(\d{12})/g, // Continuous format
    /(\d{4}[-\s]\d{4}[-\s]\d{4})/g, // Hyphen or space separated
  ];
  
  for (const pattern of aadhaarPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const aadhaar = match[1].replace(/[\s-]/g, '');
      if (isValidAadhaar(aadhaar)) {
        return aadhaar;
      }
    }
  }
  
  return '';
};

// Helper function to extract gender
const extractGender = (text: string): string => {
  const genderPatterns = [
    /(?:Gender|Sex|लिंग)\s*:?\s*(Male|Female|M|F|MALE|FEMALE|पुरुष|महिला)/i,
    /\b(Male|Female|MALE|FEMALE|पुरुष|महिला)\b/i,
  ];
  
  for (const pattern of genderPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const gender = match[1].toLowerCase();
      if (gender.includes('m') || gender.includes('पुरुष')) {
        return 'Male';
      } else if (gender.includes('f') || gender.includes('महिला')) {
        return 'Female';
      }
    }
  }
  
  return '';
};

// Helper function to extract DOB with multiple format support
const extractDOB = (text: string): string => {
  const dobPatterns = [
    /(?:DOB|Date of Birth|जन्म तिथि)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
    /(?:Birth|Born)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g,
  ];
  
  for (const pattern of dobPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const dateStr = match[1];
      // Validate date format
      const dateParts = dateStr.split(/[\/\-\.]/);
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const year = parseInt(dateParts[2]);
        
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2025) {
          return dateStr;
        }
      }
    }
  }
  
  return '';
};

// Helper function to extract address with better logic
const extractAddress = (text: string): string => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for address patterns
  const addressPatterns = [
    /(?:Address|पता)\s*:?\s*([\s\S]*?)(?=\n\s*\n|\Z)/i,
    /(?:S\/O|D\/O|W\/O|C\/O)\s+([^,\n]*(?:,\s*[^,\n]*)*)/i,
  ];
  
  for (const pattern of addressPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let address = match[1].trim();
      // Clean up the address
      address = address.replace(/\s+/g, ' ');
      if (address.length > 10 && address.length < 200) {
        return address;
      }
    }
  }
  
  // Fallback: Extract address from back side by filtering out unwanted lines
  const addressLines = lines.filter(line => {
    const cleaned = cleanText(line);
    return cleaned.length > 5 &&
           !cleaned.match(/\d{12}/) && // Not Aadhaar number
           !cleaned.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}/) && // Not DOB
           !cleaned.match(/^(Male|Female|MALE|FEMALE)$/i) && // Not gender
           !cleaned.match(/government|india|aadhaar|unique/i) && // Not header text
           !cleaned.match(/^\d{6}$/) && // Not just pincode
           cleaned.length < 100; // Not too long
  });
  
  if (addressLines.length > 0) {
    return addressLines.slice(0, 4).join(', ');
  }
  
  return '';
};

// Helper function to extract pincode
const extractPincode = (text: string): string => {
  const pincodePatterns = [
    /(?:PIN|Pincode|Pin Code)\s*:?\s*(\d{6})/gi,
    /\b(\d{6})\b/g, // Any 6-digit number
  ];
  
  for (const pattern of pincodePatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const pincode = match[1];
      if (isValidPincode(pincode)) {
        // Additional validation: Indian pincodes typically start with 1-8
        const firstDigit = parseInt(pincode.charAt(0));
        if (firstDigit >= 1 && firstDigit <= 8) {
          return pincode;
        }
      }
    }
  }
  
  return '';
};

export const processImages = async (frontImagePath: string, backImagePath: string): Promise<OcrResult> => {
  let worker: Tesseract.Worker | null = null;

  try {
    // Check if files exist
    if (!fs.existsSync(frontImagePath)) {
      throw new Error(`Front image file not found: ${frontImagePath}`);
    }
    if (!fs.existsSync(backImagePath)) {
      throw new Error(`Back image file not found: ${backImagePath}`);
    }

    console.log('Creating Tesseract worker...');
    worker = await Tesseract.createWorker();

    console.log('Loading and initializing Tesseract...');
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Set OCR parameters for better accuracy
    await worker.setParameters({
      'tessedit_char_whitelist': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:/()-',
      'tessedit_pageseg_mode': Tesseract.PSM.AUTO,
      'preserve_interword_spaces': '1',
    });

    console.log('Processing front image...');
    const frontResult = await worker.recognize(frontImagePath);

    console.log('Processing back image...');
    const backResult = await worker.recognize(backImagePath);

    console.log('Front OCR Text:', frontResult.data.text);
    console.log('Back OCR Text:', backResult.data.text);

    const frontText = frontResult.data.text;
    const backText = backResult.data.text;
    const combinedText = frontText + '\n' + backText;

    // Extract all fields using improved functions
    const name = extractName(frontText) || extractName(backText);
    const aadhaarNumber = extractAadhaarNumber(combinedText);
    const dob = extractDOB(combinedText);
    const address = extractAddress(backText) || extractAddress(frontText);
    const gender = extractGender(combinedText);
    const pincode = extractPincode(combinedText);

    const parsedResult: OcrResult = {
      name: name || 'Not found',
      aadhaarNumber: aadhaarNumber || 'Not found',
      dob: dob || 'Not found',
      address: address || 'Not found',
      gender: gender || 'Not found',
      pincode: pincode || 'Not found',
    };

    console.log('Parsed result:', parsedResult);
    return parsedResult;

  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error(`OCR processing failed: ${error}`);
  } finally {
    if (worker) {
      try {
        await worker.terminate();
        console.log('Tesseract worker terminated');
      } catch (terminateError) {
        console.error('Error terminating worker:', terminateError);
      }
    }
  }
};