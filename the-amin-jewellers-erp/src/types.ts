export interface GoldRate {
  karat: string;
  rate: number;
}

export interface StockItem {
  id: string;
  code: string;
  nameBangla: string;
  nameEnglish: string;
  category: string;
  karat: string;
  weight: number; // in grams
  traditionalWeight: TraditionalWeight;
  count: number;
  minLimit: number;
  makingCharge: number;
  status?: 'available' | 'booked' | 'sold';
  date?: string;
  image?: string;
}

export interface Order {
  id: string;
  customerName: string;
  itemName: string;
  weight: number;
  advanceAmount: number;
  dueAmount: number;
  status: 'active' | 'completed';
  date: string;
}

export interface TraditionalWeight {
  vori: number;
  ana: number;
  roti: number;
  point: number;
}

export interface SalesItem {
  id: string;
  name: string;
  karat: string;
  weight: number; // grams
  traditionalWeight: TraditionalWeight;
  goldValue: number;
  wastageValue: number;
  makingCharge: number;
  ratePerVori?: number;
  vatValue?: number;
  discount?: number;
  total: number;
}

export interface Memo {
  id: string;
  customerName: string;
  customerMobile: string;
  date: string;
  items: SalesItem[];
  subTotal: number;
  vatTotal: number;
  discountTotal: number;
  grandTotal: number;
}

export interface MortgagePayment {
  id: string;
  date: string;
  type: 'interest' | 'principal';
  amount: number;
  note?: string;
}

export interface Mortgage {
  id: string;
  receiptNo: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  itemName: string;
  itemPhoto?: string;
  karat: string;
  weight: number; // grams
  traditionalWeight: TraditionalWeight;
  principalAmount: number; // Current active principal
  originalPrincipal?: number; // Initial principal amount
  paidPrincipal?: number; // Total principal repaid so far
  interestRate: number; // monthly
  collectedInterest?: number;
  monthsCount?: number;
  startDate: string;
  expiryDate: string;
  remarks?: string;
  status: 'active' | 'redeemed' | 'expired';
  payments?: MortgagePayment[];
}

export interface Artisan {
  id: string;
  name: string;
  mobile: string;
  specialty: string;
  goldBalance: number; // gold currently with the artisan in grams
  wageBalance: number; // unpaid wages in BDT
}

export interface ArtisanJob {
  id: string;
  artisanId: string;
  itemName: string;
  karat?: string;
  givenWeight: number; // grams
  returnedWeight?: number; // grams
  wastage?: number; // grams
  wage: number; // agreed wage BDT
  paidWage?: number; // paid wage BDT
  voucherNo?: string;
  date: string;
  completedDate?: string;
  status: 'pending' | 'completed';
  remarks?: string;
}

export interface ArtisanInvoiceItem {
  id: string;
  itemName: string;
  givenWeight: number; // grams
  returnedWeight: number; // grams
  wastage: number; // grams
  wageRate: number; // BDT per gram or per item
  totalWage: number; // BDT
}

export interface ArtisanInvoice {
  invoiceNo: string;
  date: string;
  artisanName: string;
  artisanMobile: string;
  artisanSpecialty: string;
  items: ArtisanInvoiceItem[];
  subtotalWage: number;
  advancePaid: number;
  discount: number;
  netWagePayable: number;
  totalGoldGiven: number;
  totalGoldReturned: number;
  netGoldBalance: number;
  notes: string;
}

export interface OldGoldPurchase {
  id: string;
  voucherNo: string;
  date: string;
  sellerName?: string;
  sellerMobile?: string;
  sellerAddress?: string;
  sellerNid?: string;
  customerName?: string;
  customerMobile?: string;
  customerAddress?: string;
  nidNo?: string;
  karat: string;
  itemName: string;
  grossWeight: number;
  traditionalWeight?: TraditionalWeight;
  traditionalGrossWeight?: TraditionalWeight;
  wasteDeductionPct?: number;
  wastageDeduction?: number;
  netWeight?: number;
  netPureWeight?: number;
  traditionalNetWeight?: TraditionalWeight;
  ratePerVori?: number;
  totalPrice?: number;
  totalAmount?: number;
  paymentMethod?: string;
  notes?: string;
  remarks?: string;
  itemPhoto?: string;
  createdAt?: string;
}
