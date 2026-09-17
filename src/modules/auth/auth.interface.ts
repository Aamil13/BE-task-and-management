import { Document, Types } from 'mongoose';

export interface IUser {
  userName: string;
  email: string;
  password: string;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IRegisterInput {
  userName: string;
  email: string;
  password: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    userName: string;
    email: string;
  };
  token: string;
}
