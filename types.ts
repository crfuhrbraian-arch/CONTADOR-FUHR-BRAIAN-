
export interface Client {
  id: string;
  name: string;
  cuit: string;
  category: string;
  nextRenewal: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  date: string;
  invoiceType: string;
  invoiceTypeName: string;
  pointOfSale: string;
  number: string;
  description: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  month: number;
  year: number;
  isSale: boolean; // Flag para separación estricta
}

export interface Note {
  id: string;
  clientId: string;
  title: string;
  content: string;
  date: string;
}

export interface CategoryLimit {
  category: string;
  maxBilling: number;
  monthlyQuota: number;
}

export enum TabType {
  ANALYSIS = 'ANALYSIS',
  SALES = 'SALES',
  PURCHASES = 'PURCHASES',
  DEADLINES = 'DEADLINES',
  FINES = 'FINES',
  REPORTS = 'REPORTS',
  NOTES = 'NOTES'
}
