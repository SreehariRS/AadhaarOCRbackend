export interface IOcrResult {
  id: string;
  name: string;
  aadhaarNumber: string;
  dob: string;
  address?: string;
  gender: string;
  pincode: string;
  createdAt?: Date;
}