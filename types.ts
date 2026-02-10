
export enum UserRole {
  MAIN_ADMIN = 'MAIN_ADMIN',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum PaymentType {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum PaymentStatus {
  PAID = 'PAID',
  DUE = 'DUE',
  LATE = 'LATE',
  PENDING = 'PENDING'
}

export interface PaymentMethod {
  id: string;
  name: string;
  number: string;
  instructions?: string;
}

export interface AdminPost {
  id: string;
  title: string;
  content: string;
  photoUrl?: string;
  createdAt: string;
}

export interface AppSettings {
  appName: string;
  logoUrl: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  enableNotifications: boolean;
}

export interface User {
  id: string;
  memberId: string;
  nameEn: string;
  nameBn: string;
  mobile: string;
  address: string;
  nidUrl?: string;
  photoUrl?: string;
  paymentType: PaymentType;
  fixedAmount: number;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  password?: string;
  joinedDate: string;
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  fineAmount: number;
  totalPaid: number;
  date: string;
  status: PaymentStatus;
  type: PaymentType;
  adminId?: string;
  remarks?: string;
  transactionId?: string;
  senderNumber?: string;
  methodName?: string;
}

export type Language = 'en' | 'bn';
