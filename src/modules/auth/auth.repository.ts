import { UserModel } from './auth.model';
import { IRegisterInput } from './auth.interface';

export const findByEmail = (email: string) => UserModel.findOne({ email });

export const findByUserName = (userName: string) => UserModel.findOne({ userName });

export const findById = (id: string) => UserModel.findById(id);

export const create = (input: IRegisterInput) => UserModel.create(input);

export const findByIdWithPassword = (id: string) => UserModel.findById(id).select('+password');
