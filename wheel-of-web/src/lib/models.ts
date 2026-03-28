import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  regNumber: string;
  assignedQuestion?: string;
  zipFile?: Buffer; // Only if < 16MB
  fileName?: string;
  uploadedAt?: Date;
}
