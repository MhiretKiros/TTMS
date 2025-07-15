export interface User {
  id?: number;
  name: string;
  email: string;
  myUsername: string;
  password: string;
  role: 'USER' | 'ADMIN';
  token?: string;
  otp?: string;
  otpGeneratedTime?: string;
  refreshedToken?: string;
}

export interface UserResponse {
  status: number;
  message: string;
  error?: string;
  ourUser?: User;
  ourUserLists?: User[];
  token?: string;
  refreshedToken?: string;
}