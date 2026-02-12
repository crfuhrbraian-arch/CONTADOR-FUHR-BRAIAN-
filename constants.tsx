import { CategoryLimit } from './types';

export const INVOICE_TYPES: Record<string, string> = {
  '001': 'Factura A',
  '002': 'Nota de Débito A',
  '003': 'Nota de Crédito A',
  '006': 'Factura B',
  '007': 'Nota de Débito B',
  '008': 'Nota de Crédito B',
  '011': 'Factura C',
  '012': 'Nota de Débito C',
  '013': 'Nota de Crédito C',
  '015': 'Recibo C',
  '051': 'Factura M',
  '201': 'Factura de Crédito Electrónica MiPyME (FCE) A',
  '211': 'Factura de Crédito Electrónica MiPyME (FCE) C'
};

// Códigos que RESTAN del total
export const CREDIT_NOTE_CODES = ['003', '008', '013', '021', '038', '044', '048', '053', '090', '110', '112', '113', '114', '203', '208', '213'];

// Valores oficiales ARCA - Febrero 2026
export const ARCA_CATEGORIES_2026: CategoryLimit[] = [
  { category: 'A', maxBilling: 10277988, monthlyQuota: 42386 },
  { category: 'B', maxBilling: 15058447, monthlyQuota: 48507 },
  { category: 'C', maxBilling: 21113865, monthlyQuota: 56501 },
  { category: 'D', maxBilling: 26212853, monthlyQuota: 72414 },
  { category: 'E', maxBilling: 30840480, monthlyQuota: 102548 },
  { category: 'F', maxBilling: 38624048, monthlyQuota: 120000 },
  { category: 'G', maxBilling: 46277093, monthlyQuota: 140000 },
  { category: 'H', maxBilling: 70113407, monthlyQuota: 180000 },
  { category: 'I', maxBilling: 78479216, monthlyQuota: 200000 },
  { category: 'J', maxBilling: 89872640, monthlyQuota: 220000 },
  { category: 'K', maxBilling: 108357084, monthlyQuota: 250000 }
];

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];