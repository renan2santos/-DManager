export enum UnitType {
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
  UNIT = 'un'
}

export enum QuoteStatus {
  PENDING = 'Pendente',
  APPROVED = 'Aprovado',
  REJECTED = 'Reprovado'
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string; // e.g., 'Filamento', 'Resina', 'Tinta'
  brand: string;
  quantity: number; // Current stock
  unit: UnitType;
  costPrice: number; // Price paid for the full quantity/unit
  unitSize: number; // e.g., 1000 for 1kg spool
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  socialMedia: string;
}

export interface QuoteItem {
  itemId: string;
  itemName: string;
  amountUsed: number; // Amount used in grams/units
  costCalculated: number; // Cost for this specific amount
}

export interface Quote {
  id: number;
  clientId: string;
  clientName: string;
  projectName: string;
  items: QuoteItem[];
  laborHours: number;
  laborCost: number;
  totalMaterialCost: number;
  profitMargin: number; // percentage
  totalPrice: number;
  date: string;
  status: QuoteStatus;
}

export interface AppSettings {
  hourlyRate: number;
  defaultProfitMargin: number;
}

export interface AIResponse {
  estimatedWeightGrams: number;
  estimatedTimeHours: number;
  reasoning: string;
}